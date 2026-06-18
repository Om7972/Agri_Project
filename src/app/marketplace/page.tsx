'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useMarketStore } from '@/store/useMarketStore';
import { getTranslation, TransKeys } from '@/utils/translations';
import {
  Search,
  Sparkles,
  Shield,
  Calendar,
  MessageSquare,
  X,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

// ---- Domain interfaces ----
interface Product {
  id: string;
  title: string;
  cropType: string;
  grade: string;
  unit: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  harvestDate?: string;
  sellerVerification?: string;
  seller?: { trustScore?: number; email?: string };
  [key: string]: unknown;
}
interface Category { id: string; name: string; }
interface SavedSearch { id: string; query: string; createdAt: string; }
interface PriceAlert { id: string; cropType: string; targetPrice: number; condition: string; }
interface ParsedBadges { cropType?: string; maxPrice?: number; location?: string; [key: string]: unknown; }

import { API_BASE_URL } from '@/lib/config';

export default function MarketplacePage() {
  const { user, accessToken } = useAuthStore();
  const { language, currencySymbol } = useMarketStore();

  // Translations helper
  const t = (key: TransKeys) => getTranslation(language, key);

  const router = useRouter();

  // Core State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [aiParsedBadges, setAiParsedBadges] = useState<ParsedBadges | null>(null);
  const [filters, setFilters] = useState({
    cropType: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    categoryId: '',
  });

  // Modals & Panels State
  const [showListModal, setShowListModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'alerts' | 'compare'>('listings');

  // Order/Bid Modal State
  const [bidModalProduct, setBidModalProduct] = useState<Product | null>(null);
  const [bidQuantity, setBidQuantity] = useState<number>(1);
  const [bidSuccess, setBidSuccess] = useState(false);

  // New Listing Form State (for Farmers)
  const [newCrop, setNewCrop] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'Ton',
    stock: '',
    cropType: '',
    grade: 'Grade A+',
    categoryId: '',
    harvestDate: '',
    certificateUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  });

  // Price Alert Form State
  const [newPriceAlert, setNewPriceAlert] = useState({
    cropType: '',
    targetPrice: '',
    condition: 'GREATER_THAN',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.cropType) queryParams.append('cropType', filters.cropType);
      if (filters.grade) queryParams.append('grade', filters.grade);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);

      const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      const result = await response.json();
      if (response.ok) {
        setProducts(result.data || []);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSavedSearches = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agri/saved-searches`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (response.ok) {
        setSavedSearches(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  const fetchPriceAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agri/price-alerts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (response.ok) {
        setPriceAlerts(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Initial Data Fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (user && accessToken) {
      fetchSavedSearches();
      fetchPriceAlerts();
    }
  }, [accessToken, filters, user, fetchProducts, fetchCategories, fetchSavedSearches, fetchPriceAlerts]);

  // AI Smart Search
  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agri/search?q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();
      if (response.ok) {
        setProducts(result.data.products || []);
        if (result.data.parsed) {
          setAiParsedBadges(result.data.parsed);
        }
      } else {
        alert(result.message || 'AI Search failed.');
      }
    } catch (err) {
      console.error(err);
      alert('AI Search system is currently offline.');
    } finally {
      setLoading(false);
    }
  };

  const clearAiSearch = () => {
    setSearchQuery('');
    setAiParsedBadges(null);
    fetchProducts();
  };

  // Save Search Query
  const handleSaveSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/agri/saved-searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: aiParsedBadges || {},
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Search saved successfully! You will receive notifications when new matches arrive.');
        fetchSavedSearches();
      } else {
        alert(result.message || 'Failed to save search.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agri/saved-searches/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        fetchSavedSearches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Price Alert Logic
  const handleCreatePriceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/agri/price-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newPriceAlert),
      });
      const result = await response.json();
      if (response.ok) {
        setShowPriceAlertModal(false);
        setNewPriceAlert({ cropType: '', targetPrice: '', condition: 'GREATER_THAN' });
        fetchPriceAlerts();
        alert('Price alert activated! In-app and email notifications are active.');
      } else {
        alert(result.message || 'Failed to create price alert.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePriceAlert = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agri/price-alerts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        fetchPriceAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Crop Listing
  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newCrop),
      });
      const result = await response.json();
      if (response.ok) {
        setShowListModal(false);
        fetchProducts();
        alert('Crop listed successfully! AI match engines are processing alerts.');
      } else {
        alert(result.message || 'Failed to list crop.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Escrow Bid (Ordering) Logic
  const handlePlaceEscrowBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModalProduct) return;
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: bidModalProduct.id,
          quantity: bidQuantity,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setBidSuccess(true);
        setTimeout(() => {
          setBidModalProduct(null);
          setBidSuccess(false);
          fetchProducts();
        }, 2000);
      } else {
        alert(result.message || 'Failed to place escrow bid.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initialize Negotiation Chat
  const handleStartNegotiation = async (product: Product) => {
    if (!user) {
      alert('Please log in to negotiate prices.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/agri/negotiations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          targetPrice: product.price,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        router.push(`/chat?id=${result.data.id}`);
      } else {
        alert(result.message || 'Negotiation details initialized.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comparison logic
  const toggleCompare = (product: Product) => {
    if (compareList.find((p) => p.id === product.id)) {
      setCompareList(compareList.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 products.');
        return;
      }
      setCompareList([...compareList, product]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
              <Activity className="h-3.5 w-3.5" /> MandiPrime Global Trading Floor
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Smart{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-lime-400 bg-clip-text text-transparent">
                Agri Commodity Exchange
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Procure verified agricultural inventory, execute digital contracts with escrow payment security, negotiate direct bargains, and track verified grower trust metrics.
            </p>

            {/* AI Search Bar */}
            <form onSubmit={handleAiSearch} className="flex flex-col sm:flex-row gap-3 pt-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-teal-500 text-white placeholder-slate-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 font-bold text-sm hover:opacity-90 transition-opacity active:scale-95 duration-100"
              >
                <Sparkles className="h-4 w-4" />
                {t('aiSearchBtn')}
              </button>
            </form>

            {/* AI Search Parsed Criteria & Save Buttons */}
            {aiParsedBadges && (
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <span className="text-xs text-teal-400 font-bold font-mono">Parsed Filters:</span>
                {aiParsedBadges.cropType && (
                  <span className="text-xs bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1 text-slate-300">
                    Crop: <strong>{aiParsedBadges.cropType}</strong>
                  </span>
                )}
                {aiParsedBadges.maxPrice && (
                  <span className="text-xs bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1 text-slate-300">
                    Max Price: <strong>{currencySymbol}{aiParsedBadges.maxPrice}</strong>
                  </span>
                )}
                {aiParsedBadges.location && (
                  <span className="text-xs bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1 text-slate-300">
                    Near: <strong>{aiParsedBadges.location}</strong>
                  </span>
                )}
                <button
                  onClick={clearAiSearch}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
                {user && (
                  <button
                    onClick={handleSaveSearch}
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-semibold flex items-center gap-1 ml-auto"
                  >
                    <Check className="h-3 w-3" /> Save this Alert Query
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/5 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'listings' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t('marketplace')} ({products.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('alerts')}
              className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'alerts' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Saved Queries & Alerts
            </button>
          )}
          {compareList.length > 0 && (
            <button
              onClick={() => setActiveTab('compare')}
              className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'compare' ? 'border-teal-400 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Compare Hub ({compareList.length})
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {user?.role === 'FARMER' && (
              <button
                onClick={() => setShowListModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-xs rounded-xl hover:bg-teal-500/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('listCropBtn')}
              </button>
            )}
            {user && (
              <button
                onClick={() => setShowPriceAlertModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-lime-500/10 border border-lime-500/20 text-lime-400 font-bold text-xs rounded-xl hover:bg-lime-500/20 transition-colors"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t('priceAlertBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Panels */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Search Filters</h3>

                {/* Crop Type Filter */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Crop Type</label>
                  <input
                    type="text"
                    value={filters.cropType}
                    onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
                    placeholder="e.g. Wheat, Onions"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-white"
                  />
                </div>

                {/* Quality Grade Filter */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Quality Grade</label>
                  <select
                    value={filters.grade}
                    onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                    aria-label="Quality grade filter"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-white"
                  >
                    <option value="">All Grades</option>
                    <option value="Grade A+">Grade A+ (Export)</option>
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                  </select>
                </div>

                {/* Min / Max Price Filter */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Price Range ({currencySymbol})</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-white"
                    />
                  </div>
                </div>

                {/* Clear Filter Button */}
                <button
                  onClick={() => setFilters({ cropType: '', grade: '', minPrice: '', maxPrice: '', categoryId: '' })}
                  className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 font-bold rounded-xl transition-colors active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <RefreshCw className="h-8 w-8 animate-spin mb-4 text-teal-500" />
                  <span>Loading live commodity exchange contracts...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
                  <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="font-bold text-white text-lg mb-1">No Listings Found</h3>
                  <p className="text-slate-400 text-sm">No commodity listings match your active filters or AI criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, idx) => {
                    const trustScore = product.seller?.trustScore || 80;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
                        className="flex flex-col rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden hover:border-teal-500/20 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="h-40 relative overflow-hidden bg-slate-950">
                          <img
                            src={product.imageUrl || newCrop.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-teal-400 uppercase">
                            {product.cropType}
                          </div>
                          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-lime-400">
                            {product.grade}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-white text-sm line-clamp-1">{product.title}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-b border-white/5 py-2">
                            <div className="text-slate-500">
                              STOCK: <span className="text-white font-bold">{product.stock} {product.unit}s</span>
                            </div>
                            <div className="text-slate-500 text-right">
                              PRICE: <span className="text-teal-400 font-bold">{currencySymbol}{product.price}/{product.unit}</span>
                            </div>
                            {product.harvestDate && (
                              <div className="text-slate-500 col-span-2 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                HARVEST: <span className="text-slate-300 font-bold">{new Date(product.harvestDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Seller & Trust Score */}
                          <div className="flex items-center justify-between">
                            <div className="text-[10px]">
                              <span className="block text-slate-500 font-bold">SELLER TRUST:</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-2 w-16 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-lime-500"
                                    style={{ width: `${trustScore}%` }}
                                  />
                                </div>
                                <span className="text-teal-400 font-bold font-mono">{trustScore}%</span>
                              </div>
                            </div>
                            {product.sellerVerification === 'Elite' && (
                              <span className="text-[9px] font-extrabold text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20 flex items-center gap-0.5">
                                <Shield className="h-2.5 w-2.5" /> ELITE
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            {/* Checkbox for Compare */}
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400 hover:text-white">
                              <input
                                type="checkbox"
                                checked={!!compareList.find((p) => p.id === product.id)}
                                onChange={() => toggleCompare(product)}
                                className="rounded bg-slate-950 border-white/10 text-teal-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                              />
                              Compare
                            </label>

                            {user?.role === 'BUYER' && (
                              <>
                                <button
                                  onClick={() => handleStartNegotiation(product)}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-950 border border-white/10 hover:border-teal-500/30 text-[10px] font-bold rounded-lg transition-colors"
                                >
                                  <MessageSquare className="h-3 w-3 text-teal-400" />
                                  Negotiate
                                </button>
                                <button
                                  onClick={() => {
                                    setBidModalProduct(product);
                                    setBidQuantity(1);
                                  }}
                                  className="flex-1 py-1.5 bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 text-[10px] font-bold rounded-lg hover:opacity-90 transition-all"
                                >
                                  Escrow Bid
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Saved Queries & Alerts Panel */}
        {activeTab === 'alerts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Saved Searches */}
            <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/30 p-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-white/5 pb-3">
                <Search className="h-5 w-5 text-teal-400" />
                Saved Search Matches
              </h3>
              {savedSearches.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No active saved search queries.</p>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-slate-950 border border-white/5 rounded-xl">
                      <div>
                        <strong className="text-sm text-white block">&quot;{item.query}&quot;</strong>
                        <span className="text-[10px] text-slate-500 font-mono block mt-1">
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedSearch(item.id)}
                        title="Delete saved search"
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Alerts */}
            <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/30 p-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-white/5 pb-3">
                <TrendingUp className="h-5 w-5 text-lime-400" />
                Target Price Alerts
              </h3>
              {priceAlerts.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No price alerts configured.</p>
              ) : (
                <div className="space-y-3">
                  {priceAlerts.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-slate-950 border border-white/5 rounded-xl">
                      <div>
                        <span className="text-xs text-slate-400">Crop: <strong>{item.cropType}</strong></span>
                        <strong className="text-sm text-white block mt-1">
                          Notify when Price {item.condition === 'GREATER_THAN' ? '>' : '<'} {currencySymbol}{item.targetPrice}
                        </strong>
                      </div>
                      <button
                        onClick={() => handleDeletePriceAlert(item.id)}
                        title="Delete price alert"
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Comparison Panel */}
        {activeTab === 'compare' && compareList.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 pr-4">Feature</th>
                  {compareList.map((p) => (
                    <th key={p.id} className="py-4 px-4 font-bold text-white text-sm">{p.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300 font-mono">
                <tr className="border-b border-white/5">
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">CROP TYPE</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4">{p.cropType}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">PRICE</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4 text-teal-400 font-bold">{currencySymbol}{p.price} / {p.unit}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">QUALITY GRADE</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4 text-lime-400 font-bold">{p.grade}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">AVAILABLE STOCK</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4">{p.stock} {p.unit}s</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">HARVEST DATE</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4">{p.harvestDate ? new Date(p.harvestDate).toLocaleDateString() : 'N/A'}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">SELLER TRUST</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4 text-teal-400 font-bold">{p.seller?.trustScore || 80}%</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-sans font-bold text-slate-400">ACTIONS</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartNegotiation(p)}
                          className="px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[10px] font-bold text-teal-400"
                        >
                          Negotiate
                        </button>
                        <button
                          onClick={() => setCompareList(compareList.filter((x) => x.id !== p.id))}
                          className="px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* Escrow Bid modal */}
      {bidModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
          >
            {bidSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="h-16 w-16 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 mx-auto">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Escrow Deposit Initialized</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Funds have been allocated from your buyer wallet into the MandiPrime Escrow Account. Digital contract generated.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePlaceEscrowBid} className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <h3 className="font-bold text-lg">Initialize Escrow Procurement</h3>
                  <button type="button" onClick={() => setBidModalProduct(null)} className="text-slate-400 hover:text-white" title="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Commodity: <strong className="text-white">{bidModalProduct.title}</strong></div>
                  <div>Seller Grade: <strong className="text-lime-400">{bidModalProduct.grade}</strong></div>
                  <div>Base Price: <strong className="text-teal-400">{currencySymbol}{bidModalProduct.price} / {bidModalProduct.unit}</strong></div>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Procurement Quantity ({bidModalProduct.unit}s)</label>
                  <input
                    type="number"
                    aria-label="Procurement quantity"
                    placeholder="e.g. 5"
                    min={1}
                    max={bidModalProduct.stock}
                    value={bidQuantity}
                    onChange={(e) => setBidQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Available Stock: {bidModalProduct.stock} {bidModalProduct.unit}s</span>
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Base Value:</span>
                    <span>{currencySymbol}{bidModalProduct.price * bidQuantity}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Escrow Commission (1%):</span>
                    <span>{currencySymbol}{(bidModalProduct.price * bidQuantity * 0.01).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-teal-400 font-bold border-t border-white/5 pt-2 text-sm">
                    <span>Total Escrow Lockup:</span>
                    <span>{currencySymbol}{(bidModalProduct.price * bidQuantity * 1.01).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 font-bold text-sm rounded-xl active:scale-95 transition-transform"
                >
                  Deposit Funds & Secure Contract
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* List Crop Modal (for Farmers) */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 relative my-8"
          >
            <form onSubmit={handleCreateCrop} className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="font-bold text-lg">List Agricultural Crop</h3>
                <button type="button" onClick={() => setShowListModal(false)} className="text-slate-400 hover:text-white" title="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Listing Title</label>
                  <input
                    type="text"
                    required
                    value={newCrop.title}
                    onChange={(e) => setNewCrop({ ...newCrop, title: e.target.value })}
                    placeholder="e.g. Export Basmati Rice Batch #2"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Crop Category ID (UUID)</label>
                  <select
                    required
                    aria-label="Crop category"
                    value={newCrop.categoryId}
                    onChange={(e) => setNewCrop({ ...newCrop, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold">Crop Description</label>
                <textarea
                  required
                  rows={2}
                  value={newCrop.description}
                  onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })}
                  placeholder="Details regarding pesticide usage, moisture content, etc."
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Expected Price ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={newCrop.price}
                    onChange={(e) => setNewCrop({ ...newCrop, price: e.target.value })}
                    placeholder="e.g. 2400"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Unit</label>
                  <select
                    value={newCrop.unit}
                    onChange={(e) => setNewCrop({ ...newCrop, unit: e.target.value })}
                    aria-label="Unit of measurement"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Ton">Ton</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Bale">Bale</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Total Stock</label>
                  <input
                    type="number"
                    required
                    value={newCrop.stock}
                    onChange={(e) => setNewCrop({ ...newCrop, stock: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Crop Type & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Crop Type</label>
                  <input
                    type="text"
                    required
                    value={newCrop.cropType}
                    onChange={(e) => setNewCrop({ ...newCrop, cropType: e.target.value })}
                    placeholder="e.g. Rice, Wheat"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Quality Grade</label>
                  <select
                    value={newCrop.grade}
                    onChange={(e) => setNewCrop({ ...newCrop, grade: e.target.value })}
                    aria-label="Quality grade"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Grade A+">Grade A+ (Export Quality)</option>
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                  </select>
                </div>
              </div>

              {/* Harvest Date & Quality Certificate URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Harvest Date</label>
                  <input
                    type="date"
                    required
                    aria-label="Harvest date"
                    value={newCrop.harvestDate}
                    onChange={(e) => setNewCrop({ ...newCrop, harvestDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">SGS Quality Certificate Link</label>
                  <input
                    type="text"
                    value={newCrop.certificateUrl}
                    onChange={(e) => setNewCrop({ ...newCrop, certificateUrl: e.target.value })}
                    placeholder="e.g. http://sgs.com/certs/102.pdf"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 font-bold text-sm rounded-xl active:scale-95 transition-all"
              >
                List Crop Listing
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Set Price Alert Modal */}
      {showPriceAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 relative"
          >
            <form onSubmit={handleCreatePriceAlert} className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="font-bold text-lg">Create Price Alert</h3>
                <button type="button" onClick={() => setShowPriceAlertModal(false)} className="text-slate-400 hover:text-white" title="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Crop Type */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold font-sans">Crop Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wheat"
                  value={newPriceAlert.cropType}
                  onChange={(e) => setNewPriceAlert({ ...newPriceAlert, cropType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Target Price */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold font-sans">Target Price ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2800"
                  value={newPriceAlert.targetPrice}
                  onChange={(e) => setNewPriceAlert({ ...newPriceAlert, targetPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold font-sans">Trigger Condition</label>
                <select
                  value={newPriceAlert.condition}
                  onChange={(e) => setNewPriceAlert({ ...newPriceAlert, condition: e.target.value })}
                  aria-label="Price alert trigger condition"
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:outline-none"
                >
                  <option value="GREATER_THAN">Notify when Price rises above (&gt;)</option>
                  <option value="LESS_THAN">Notify when Price drops below (&lt;)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 font-bold text-sm rounded-xl active:scale-95 transition-all"
              >
                Activate Price Alert
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
