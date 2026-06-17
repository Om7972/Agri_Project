'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import Footer from '@/components/footer/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  Warehouse,
  Truck,
  LineChart,
  ShoppingBag,
  Coins,
  PhoneCall,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

// ---- Domain interfaces ----
interface VerificationStatus { status: string; updatedAt: string; aadharNumber?: string; gstNumber?: string; businessCertUrl?: string; }
interface AgriProduct { id: string; title: string; cropType: string; grade: string; unit: string; price: number; stock: number; sellerId: string; seller?: { email?: string }; status?: string; [key: string]: unknown; }
interface Warehouse { id: string; name: string; location: string; availableTons: number; ratePerTonDay: number; [key: string]: unknown; }
interface WarehouseBooking { id: string; quantityTons: number; totalCost: number; startDate: string; endDate: string; status?: string; warehouse?: { name?: string }; }
interface CarrierVehicle { id: string; vehicleNumber: string; vehicleType: string; driverName: string; driverPhone: string; capacityTons: number; ratePerKm: number; }
interface LogisticsBooking { id: string; fromLocation: string; toLocation: string; estimatedKm: number; totalCost: number; status?: string; carrier?: { vehicleNumber?: string; vehicleType?: string }; }
interface ForecastItem { id: string; cropType: string; demandScore: number; demandLevel: string; opportunityDetails: string; [key: string]: unknown; }
interface BulkRequirement { id: string; cropType: string; quantityTons: number; budgetPrice: number; deliveryDate: string; }
interface FinanceApp { id: string; type: string; amount: number; status: string; createdAt: string; collateralDetails?: string; }
interface DirectContact { fullName?: string; phone?: string; email?: string; address?: string; verificationBadge?: string; aadharVerified?: boolean; gstVerified?: boolean; businessCertVerified?: boolean; }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function InnovativeHubPage() {
  const { user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'verification' | 'grading' | 'warehouse' | 'logistics' | 'forecast' | 'bulk' | 'finance' | 'direct' | 'inventory'>('verification');

  // Common notification state
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Verification states
  const [aadhar, setAadhar] = useState('');
  const [gst, setGst] = useState('');
  const [businessCert, setBusinessCert] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  // 2. Quality Grading states
  const [myProducts, setMyProducts] = useState<AgriProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade A');
  const [labReportUrl, setLabReportUrl] = useState('');
  const [certUrl, setCertUrl] = useState('');

  // 3. Warehouse states
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [myWarehouseBookings, setMyWarehouseBookings] = useState<WarehouseBooking[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [storageQty, setStorageQty] = useState<number>(5);
  const [storageStart, setStorageStart] = useState('');
  const [storageEnd, setStorageEnd] = useState('');
  // New Warehouse Listing Form
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [whCapacity, setWhCapacity] = useState<number>(100);
  const [whRate, setWhRate] = useState<number>(12);
  const [whDesc, setWhDesc] = useState('');

  // 4. Logistics states
  const [carriers, setCarriers] = useState<CarrierVehicle[]>([]);
  const [myLogisticsBookings, setMyLogisticsBookings] = useState<LogisticsBooking[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [estimatedKm, setEstimatedKm] = useState<number>(150);
  // Driver registration form
  const [drvName, setDrvName] = useState('');
  const [drvPhone, setDrvPhone] = useState('');
  const [drvPlate, setDrvPlate] = useState('');
  const [drvType, setDrvType] = useState('TRUCK');
  const [drvCapacity, setDrvCapacity] = useState<number>(15);
  const [drvRate, setDrvRate] = useState<number>(35);

  // 5. Demand Forecast states
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);

  // 6 & 7. Bulk Procurement states
  const [bulkReqs, setBulkReqs] = useState<BulkRequirement[]>([]);
  const [targetReqId, setTargetReqId] = useState('');
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteQty, setQuoteQty] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState('');
  // Create procurement request form
  const [reqCrop, setReqCrop] = useState('');
  const [reqQty, setReqQty] = useState<number>(10);
  const [reqBudget, setReqBudget] = useState<number>(0);
  const [reqDate, setReqDate] = useState('');

  // 8. Finance states
  const [financeApps, setFinanceApps] = useState<FinanceApp[]>([]);
  const [financeType, setFinanceType] = useState('INVOICE_FINANCING');
  const [financeAmount, setFinanceAmount] = useState<number>(50000);
  const [financeCollateral, setFinanceCollateral] = useState('');

  // 9. Direct Trading states
  const [directCrops, setDirectCrops] = useState<AgriProduct[]>([]);
  const [activeContact, setActiveContact] = useState<DirectContact | null>(null);

  // 10. Inventory states
  const [inventoryAnalytics, setInventoryAnalytics] = useState<{ inventory: AgriProduct[]; listingsCount: number; totalAvailableStock: number; totalSalesCount: number; totalRevenue: number; } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };

      if (activeTab === 'verification') {
        const res = await fetch(`${API_BASE_URL}/innovative/verification`, { headers });
        const data = await res.json();
        if (res.ok && data.success) setVerificationStatus(data.data);
      }

      if (activeTab === 'grading') {
        const res = await fetch(`${API_BASE_URL}/products`, { headers });
        const data = await res.json();
        if (res.ok && data.success) {
          // Filter to user's products
          const mine = data.data.filter((p: any) => p.sellerId === user?.id);
          setMyProducts(mine);
          if (mine.length > 0) setSelectedProduct(mine[0].id);
        }
      }

      if (activeTab === 'warehouse') {
        const resWh = await fetch(`${API_BASE_URL}/innovative/warehouse`, { headers });
        const dWh = await resWh.json();
        if (resWh.ok && dWh.success) {
          setWarehouses(dWh.data);
          if (dWh.data.length > 0) setSelectedWarehouse(dWh.data[0].id);
        }
        const resB = await fetch(`${API_BASE_URL}/innovative/warehouse/bookings`, { headers });
        const dB = await resB.json();
        if (resB.ok && dB.success) setMyWarehouseBookings(dB.data);
      }

      if (activeTab === 'logistics') {
        const resCar = await fetch(`${API_BASE_URL}/innovative/logistics`, { headers });
        const dCar = await resCar.json();
        if (resCar.ok && dCar.success) {
          setCarriers(dCar.data);
          if (dCar.data.length > 0) setSelectedCarrier(dCar.data[0].id);
        }
        const resB = await fetch(`${API_BASE_URL}/innovative/logistics/bookings`, { headers });
        const dB = await resB.json();
        if (resB.ok && dB.success) setMyLogisticsBookings(dB.data);
      }

      if (activeTab === 'forecast') {
        const res = await fetch(`${API_BASE_URL}/innovative/forecasts`, { headers });
        const data = await res.json();
        if (res.ok && data.success) setForecasts(data.data);
      }

      if (activeTab === 'bulk') {
        const res = await fetch(`${API_BASE_URL}/innovative/bulk-procurement`, { headers });
        const data = await res.json();
        if (res.ok && data.success) {
          setBulkReqs(data.data);
          if (data.data.length > 0) setTargetReqId(data.data[0].id);
        }
      }

      if (activeTab === 'finance') {
        const res = await fetch(`${API_BASE_URL}/innovative/finance`, { headers });
        const data = await res.json();
        if (res.ok && data.success) setFinanceApps(data.data);
      }

      if (activeTab === 'direct') {
        const res = await fetch(`${API_BASE_URL}/products`, { headers });
        const data = await res.json();
        if (res.ok && data.success) setDirectCrops(data.data);
      }

      if (activeTab === 'inventory') {
        const res = await fetch(`${API_BASE_URL}/innovative/inventory/analytics`, { headers });
        const data = await res.json();
        if (res.ok && data.success) setInventoryAnalytics(data.data);
      }

    } catch (_err) {
      console.error('Error loading tab content');
    }
  }, [accessToken, activeTab, user?.id]);

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken, activeTab, loadData]);

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Submits
  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ aadharNumber: aadhar, gstNumber: gst, businessCertUrl: businessCert }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', 'Aadhar, GST, and Business credentials submitted for MandiPrime Verification Badge!');
        loadData();
      } else {
        triggerAlert('error', data.message || 'Verification submission failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error submitting verification.');
    }
  };

  const handleGradeCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return triggerAlert('error', 'Select a product to grade.');
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/grading/${selectedProduct}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ grade: selectedGrade, labReportUrl, certificateUrl: certUrl, imagesUrl: '' }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', `Quality Grading of '${selectedGrade}' applied with laboratory attachments.`);
        loadData();
      } else {
        triggerAlert('error', data.message || 'Grading update failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleListWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/warehouse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: whName, location: whLocation, capacityTons: Number(whCapacity), ratePerTonDay: Number(whRate), description: whDesc }),
      });
      if (res.ok) {
        triggerAlert('success', 'Warehouse space listed on the Marketplace.');
        setWhName('');
        setWhLocation('');
        loadData();
      } else {
        triggerAlert('error', 'Listing creation failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleBookWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return triggerAlert('error', 'Select a warehouse.');
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/warehouse/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ warehouseId: selectedWarehouse, quantityTons: Number(storageQty), startDate: new Date(storageStart), endDate: new Date(storageEnd) }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', 'Warehouse space booked! Storage allocation initialized.');
        loadData();
      } else {
        triggerAlert('error', data.message || 'Booking failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleRegisterCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/logistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ driverName: drvName, driverPhone: drvPhone, vehicleNumber: drvPlate, vehicleType: drvType, capacityTons: Number(drvCapacity), ratePerKm: Number(drvRate) }),
      });
      if (res.ok) {
        triggerAlert('success', 'Carrier truck registered in Logistics Fleet Marketplace.');
        setDrvName('');
        setDrvPhone('');
        setDrvPlate('');
        loadData();
      } else {
        triggerAlert('error', 'Carrier registration failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleBookTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarrier) return triggerAlert('error', 'Select a carrier.');
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/logistics/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ carrierId: selectedCarrier, fromLocation: fromLoc, toLocation: toLoc, estimatedKm: Number(estimatedKm) }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', 'Logistics booking confirmed! Route tracking active.');
        loadData();
      } else {
        triggerAlert('error', data.message || 'Transport booking failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/bulk-procurement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ cropType: reqCrop, quantityTons: Number(reqQty), budgetPrice: Number(reqBudget), deliveryDate: new Date(reqDate) }),
      });
      if (res.ok) {
        triggerAlert('success', 'Procurement request published to farmers.');
        setReqCrop('');
        setReqQty(10);
        setReqBudget(0);
        loadData();
      } else {
        triggerAlert('error', 'Failed to publish requirement.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReqId) return triggerAlert('error', 'Select a procurement requirement.');
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/bulk-procurement/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ requirementId: targetReqId, offeredPrice: Number(quotePrice), quantityTons: Number(quoteQty), notes: quoteNotes }),
      });
      if (res.ok) {
        triggerAlert('success', 'Your quotation bid was successfully submitted to the buyer!');
        setQuoteNotes('');
        loadData();
      } else {
        triggerAlert('error', 'Failed to submit quotation bid.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleApplyFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/finance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ type: financeType, amount: Number(financeAmount), collateralDetails: financeCollateral }),
      });
      if (res.ok) {
        triggerAlert('success', 'Financing application received. Reviewing details.');
        setFinanceCollateral('');
        loadData();
      } else {
        triggerAlert('error', 'Application submission failed.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  const handleFetchDirectContact = async (productId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/direct-contact/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveContact(data.data);
      } else {
        triggerAlert('error', 'Failed to retrieve direct contact data.');
      }
    } catch (_err) {
      triggerAlert('error', 'Network error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow py-12 px-6 max-w-7xl mx-auto relative z-10 w-full space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/5 px-3 py-1 text-xs font-semibold text-lime-400">
            <Coins className="h-3.5 w-3.5 text-lime-400" />
            Empowerment Hub & Income Accelerators
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Farmer Income &{' '}
            <span className="bg-gradient-to-r from-lime-400 to-teal-400 bg-clip-text text-transparent">
              Buyer Efficiency
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Verify seller badges, request quality grading certifications, book warehouse space, compare logistics, check market demands, and apply for capital.
          </p>
        </div>

        {/* Global Notifications */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-lime-500/15 border border-lime-500/30 p-4 rounded-2xl text-lime-400 text-sm flex items-center gap-2 max-w-md mx-auto"
            >
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/15 border border-red-500/30 p-4 rounded-2xl text-red-400 text-sm flex items-center gap-2 max-w-md mx-auto"
            >
              <Info className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-white/5 pb-6">
          {[
            { id: 'verification', label: 'Verified Seller Badge', icon: ShieldCheck },
            { id: 'grading', label: 'Quality Grading', icon: FileText },
            { id: 'warehouse', label: 'Warehouse Storage', icon: Warehouse },
            { id: 'logistics', label: 'Logistics Fleet', icon: Truck },
            { id: 'forecast', label: 'Demand Forecast', icon: LineChart },
            { id: 'bulk', label: 'Bulk & Procurement', icon: ShoppingBag },
            { id: 'finance', label: 'Trade Financing', icon: Coins },
            { id: 'direct', label: 'Direct Trading', icon: PhoneCall },
            { id: 'inventory', label: 'Inventory Dashboard', icon: BarChart3 },
          ].map((tab) => {
            const IconComp = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'verification' | 'grading' | 'warehouse' | 'logistics' | 'forecast' | 'bulk' | 'finance' | 'direct' | 'inventory');
                  setActiveContact(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  active
                    ? 'border-lime-500/40 bg-lime-500/10 text-lime-400'
                    : 'border-white/5 bg-slate-900/30 text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <IconComp className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Screen */}
        <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          
          {/* TAB 1: Verification Flow */}
          {activeTab === 'verification' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">MandiPrime Verified Seller Badge</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Increases trust, leads to 2.4x higher bid conversion rates.</p>
                  </div>
                </div>

                <form onSubmit={handleRequestVerification} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">AADHAR CARD NUMBER</label>
                    <input
                      type="text"
                      placeholder="12-digit Aadhar Code"
                      value={aadhar}
                      onChange={(e) => setAadhar(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:border-lime-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">GST REGISTRATION ID (GSTIN)</label>
                    <input
                      type="text"
                      placeholder="e.g. 27AAAAA1111A1Z1"
                      value={gst}
                      onChange={(e) => setGst(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:border-lime-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">BUSINESS REGISTRATION / LAND RECORD CERTIFICATE URL</label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/cert-pdf"
                      value={businessCert}
                      onChange={(e) => setBusinessCert(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:border-lime-500/50 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 active:scale-95 transition-all text-xs"
                  >
                    Submit Verification Credentials
                  </button>
                </form>
              </div>

              {/* Status display */}
              <div className="border border-white/5 rounded-2xl bg-white/[0.01] p-6 space-y-4">
                <h4 className="font-bold text-white text-sm">Active Verification Status</h4>
                {verificationStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase font-bold">
                        {verificationStatus.status}
                      </div>
                      <span className="text-slate-400 text-xs">Last request updated {new Date(verificationStatus.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono space-y-2 border-t border-white/5 pt-4">
                      <div><span className="text-slate-500">AADHAR REF:</span> {verificationStatus.aadharNumber || 'Pending'}</div>
                      <div><span className="text-slate-500">GSTIN REF:</span> {verificationStatus.gstNumber || 'Pending'}</div>
                      <div>
                        <span className="text-slate-500">CERTIFICATE:</span>{' '}
                        {verificationStatus.businessCertUrl ? (
                          <a href={verificationStatus.businessCertUrl} target="_blank" className="text-teal-400 underline">View Document</a>
                        ) : 'None Uploaded'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No verification claims found. Complete the form to apply for the elite verification badge.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Quality Grading System */}
          {activeTab === 'grading' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Crop Quality Grading & Audits</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Certify listings with Premium, Grade A, B, or C ratings.</p>
                  </div>
                </div>

                <form onSubmit={handleGradeCrop} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">SELECT PRODUCT LISTING</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      aria-label="Select product listing"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    >
                      <option value="">-- Choose Listing --</option>
                      {myProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.title} - {p.cropType} ({p.grade})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">CERTIFIED QUALITY GRADE</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      aria-label="Certified quality grade"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    >
                      <option value="Premium">Premium Quality</option>
                      <option value="Grade A">Grade A Quality</option>
                      <option value="Grade B">Grade B Quality</option>
                      <option value="Grade C">Grade C Quality</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">LAB REPORT URL (PDF/DOC)</label>
                    <input
                      type="text"
                      placeholder="https://lab.org/report-109"
                      value={labReportUrl}
                      onChange={(e) => setLabReportUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">QUALITY CERTIFICATE URL</label>
                    <input
                      type="text"
                      placeholder="https://sgs.com/cert-verify"
                      value={certUrl}
                      onChange={(e) => setCertUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 active:scale-95 transition-all text-xs"
                  >
                    Apply Grade Certification
                  </button>
                </form>
              </div>

              <div className="border border-white/5 rounded-2xl bg-white/[0.01] p-6 space-y-4">
                <h4 className="font-bold text-white text-sm">Selected Grading Preview</h4>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Quality Rank:</span>
                    <span className="text-lime-400 font-bold">{selectedGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Certified Lab Check:</span>
                    <span className="text-white">{labReportUrl ? 'ATTACHED' : 'NOT LINKED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Issuer verification:</span>
                    <span className="text-teal-400 font-bold">MandiPrime Audited</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Warehouse Storage */}
          {activeTab === 'warehouse' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Register warehouse space & active list */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Warehouse Listings</h3>
                    <p className="text-slate-400 text-xs mt-0.5">List available warehouse space or search options below.</p>
                  </div>
                </div>

                {/* Listing Form */}
                <form onSubmit={handleListWarehouse} className="space-y-4 font-mono text-xs border border-white/5 p-4 rounded-2xl bg-white/[0.01]">
                  <h4 className="font-bold text-white font-sans text-sm">Register Storage Space</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">WAREHOUSE NAME</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune Agri Storage"
                        value={whName}
                        onChange={(e) => setWhName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">LOCATION</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune, MH"
                        value={whLocation}
                        onChange={(e) => setWhLocation(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">CAPACITY (TONS)</label>
                      <input
                        type="number"
                        aria-label="Warehouse capacity in tons"
                        placeholder="e.g. 500"
                        value={whCapacity}
                        onChange={(e) => setWhCapacity(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">DAILY RATE (₹/TON)</label>
                      <input
                        type="number"
                        aria-label="Daily rate per ton in rupees"
                        placeholder="e.g. 12"
                        value={whRate}
                        onChange={(e) => setWhRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-lime-500 text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                  >
                    List Storage Space
                  </button>
                </form>

                {/* Warehouse space cards */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Available Warehouse Listings</h4>
                  {warehouses.map((wh) => (
                    <div key={wh.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-white font-sans text-sm block">{wh.name}</span>
                        <span className="text-slate-400 block mt-1">📍 {wh.location}</span>
                        <span className="text-slate-500 block text-[10px] mt-1">Rate: ₹{wh.ratePerTonDay}/Ton | Available: {wh.availableTons} Tons</span>
                      </div>
                      <button
                        onClick={() => setSelectedWarehouse(wh.id)}
                        className="px-3 py-1.5 rounded-lg border border-lime-500/30 text-lime-400 font-bold hover:bg-lime-500/10"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Book Storage Space & Booking List */}
              <div className="space-y-6 border-l border-white/5 pl-0 lg:pl-8">
                <form onSubmit={handleBookWarehouse} className="space-y-4 font-mono text-xs">
                  <h4 className="font-bold text-white font-sans text-sm">Book Storage Space</h4>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">SELECTED WAREHOUSE ID</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedWarehouse}
                      className="w-full rounded-xl border border-white/5 bg-slate-900/60 py-3 px-4 text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">QUANTITY (TONS)</label>
                    <input
                      type="number"
                      aria-label="Storage quantity in tons"
                      placeholder="e.g. 50"
                      value={storageQty}
                      onChange={(e) => setStorageQty(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">START DATE</label>
                      <input
                        type="date"
                        aria-label="Storage start date"
                        value={storageStart}
                        onChange={(e) => setStorageStart(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">END DATE</label>
                      <input
                        type="date"
                        aria-label="Storage end date"
                        value={storageEnd}
                        onChange={(e) => setStorageEnd(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                  >
                    Confirm Storage Booking
                  </button>
                </form>

                {/* My storage bookings */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <h4 className="font-bold text-white text-sm">My Booked Storage Periods</h4>
                  {myWarehouseBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between text-white font-bold font-sans">
                        <span>{b.warehouse?.name || 'Agri Warehouse'}</span>
                        <span className="text-lime-400">₹{b.totalCost}</span>
                      </div>
                      <div className="text-slate-400">Qty: {b.quantityTons} Tons</div>
                      <div className="text-slate-500 text-[10px]">
                        Period: {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {myWarehouseBookings.length === 0 && (
                    <div className="text-center py-6 text-slate-600 text-xs">No storage spaces booked yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Logistics Fleet */}
          {activeTab === 'logistics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Register carrier truck */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Logistics Fleet</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Transporters register trucks; buyers compare shipping rates.</p>
                  </div>
                </div>

                <form onSubmit={handleRegisterCarrier} className="space-y-3 font-mono text-xs border border-white/5 p-4 rounded-2xl bg-white/[0.01]">
                  <h4 className="font-bold text-white font-sans text-sm">Register Transport Carrier</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">DRIVER NAME</label>
                      <input
                        type="text"
                        placeholder="e.g. Balwinder Singh"
                        value={drvName}
                        onChange={(e) => setDrvName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">DRIVER PHONE</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98888 77777"
                        value={drvPhone}
                        onChange={(e) => setDrvPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">PLATE NUMBER</label>
                      <input
                        type="text"
                        placeholder="e.g. PB-02-K-9988"
                        value={drvPlate}
                        onChange={(e) => setDrvPlate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">VEHICLE TYPE</label>
                      <select
                        value={drvType}
                        onChange={(e) => setDrvType(e.target.value)}
                        aria-label="Vehicle type"
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      >
                        <option value="TRUCK">Heavy Truck</option>
                        <option value="CONTAINER">Reefer Container</option>
                        <option value="TEMPO">Small Tempo</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">CAPACITY (TONS)</label>
                      <input
                        type="number"
                        aria-label="Carrier capacity in tons"
                        placeholder="e.g. 20"
                        value={drvCapacity}
                        onChange={(e) => setDrvCapacity(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">RATE (₹/KM)</label>
                      <input
                        type="number"
                        aria-label="Rate per kilometre in rupees"
                        placeholder="e.g. 45"
                        value={drvRate}
                        onChange={(e) => setDrvRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-lime-500 text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                  >
                    Register Fleet Carrier
                  </button>
                </form>

                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Available Transport Fleets</h4>
                  {carriers.map((car) => (
                    <div key={car.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-white font-sans text-sm block">{car.vehicleNumber} ({car.vehicleType})</span>
                        <span className="text-slate-400 block mt-1">Driver: {car.driverName} ({car.driverPhone})</span>
                        <span className="text-slate-500 block text-[10px] mt-1">Rate: ₹{car.ratePerKm}/km | Capacity: {car.capacityTons} Tons</span>
                      </div>
                      <button
                        onClick={() => setSelectedCarrier(car.id)}
                        className="px-3 py-1.5 rounded-lg border border-lime-500/30 text-lime-400 font-bold hover:bg-lime-500/10"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Book transport route */}
              <div className="space-y-6 border-l border-white/5 pl-0 lg:pl-8">
                <form onSubmit={handleBookTransport} className="space-y-4 font-mono text-xs">
                  <h4 className="font-bold text-white font-sans text-sm">Book Fleet Transport</h4>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">SELECTED CARRIER ID</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedCarrier}
                      aria-label="Selected carrier ID"
                      className="w-full rounded-xl border border-white/5 bg-slate-900/60 py-3 px-4 text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">FROM LOCATION</label>
                      <input
                        type="text"
                        placeholder="e.g. Ludhiana, Punjab"
                        value={fromLoc}
                        onChange={(e) => setFromLoc(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">TO LOCATION</label>
                      <input
                        type="text"
                        placeholder="e.g. Kandla Port, Gujarat"
                        value={toLoc}
                        onChange={(e) => setToLoc(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">ESTIMATED ROUTE DISTANCE (KM)</label>
                    <input
                      type="number"
                      aria-label="Estimated route distance in kilometres"
                      placeholder="e.g. 350"
                      value={estimatedKm}
                      onChange={(e) => setEstimatedKm(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                  >
                    Confirm Transport Booking
                  </button>
                </form>

                {/* Logistics Bookings list */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <h4 className="font-bold text-white text-sm">Active Logistics Bookings</h4>
                  {myLogisticsBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between text-white font-bold font-sans">
                        <span>{b.carrier?.vehicleNumber} ({b.carrier?.vehicleType})</span>
                        <span className="text-lime-400">₹{b.totalCost}</span>
                      </div>
                      <div className="text-slate-400">Route: {b.fromLocation} ➔ {b.toLocation}</div>
                      <span className="inline-block text-[9px] uppercase font-bold bg-teal-500/15 text-teal-400 px-2 py-0.5 rounded">
                        {b.status}
                      </span>
                    </div>
                  ))}
                  {myLogisticsBookings.length === 0 && (
                    <div className="text-center py-6 text-slate-600 text-xs">No transport vehicles booked yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Demand Forecast Dashboard */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                  <LineChart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Demand Forecast Dashboard</h3>
                  <p className="text-slate-400 text-xs mt-0.5">High vs low demand indicators and price trend signals.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
                {forecasts.map((f) => (
                  <div
                    key={f.id}
                    className="p-6 rounded-2xl border border-white/5 bg-slate-955/40 hover:border-white/10 transition-all space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-lg font-bold text-white font-sans">{f.cropType}</span>
                      <div className="flex items-center gap-1.5">
                        {f.expectedPriceTrend === 'UP' ? (
                          <span className="flex items-center gap-0.5 text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded text-[10px] font-bold">
                            <TrendingUp className="h-3 w-3" /> UP
                          </span>
                        ) : f.expectedPriceTrend === 'DOWN' ? (
                          <span className="flex items-center gap-0.5 text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[10px] font-bold">
                            <TrendingDown className="h-3 w-3" /> DOWN
                          </span>
                        ) : (
                          <span className="text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded text-[10px] font-bold">
                            STABLE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Demand Score:</span>
                        <span className="text-white font-bold">{f.demandScore}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${f.demandLevel === 'HIGH' ? 'bg-lime-500' : f.demandLevel === 'LOW' ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${f.demandScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-sans border-t border-white/5 pt-3 leading-relaxed">
                      💡 {f.opportunityDetails}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Bulk & Procurement Marketplace */}
          {activeTab === 'bulk' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Create procurement requests */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Procurement Requests</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Retailers/Hotels post crop volume demands; farmers quote prices.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateProcurement} className="space-y-4 font-mono text-xs border border-white/5 p-5 rounded-2xl bg-white/[0.01]">
                  <h4 className="font-bold text-white font-sans text-sm">Post Procurement Requirement</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">REQUIRED CROP TYPE</label>
                      <input
                        type="text"
                        placeholder="e.g. Wheat, Basmati Rice"
                        value={reqCrop}
                        onChange={(e) => setReqCrop(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">QUANTITY (TONS)</label>
                      <input
                        type="number"
                        aria-label="Required quantity in tons"
                        placeholder="e.g. 50"
                        value={reqQty}
                        onChange={(e) => setReqQty(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">TARGET BUDGET PRICE (₹/TON)</label>
                      <input
                        type="number"
                        aria-label="Target budget price per ton in rupees"
                        placeholder="e.g. 2500"
                        value={reqBudget}
                        onChange={(e) => setReqBudget(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">DELIVERY BY DATE</label>
                      <input
                        type="date"
                        aria-label="Delivery by date"
                        value={reqDate}
                        onChange={(e) => setReqDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-lime-500 text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                  >
                    Publish Procurement Bid
                  </button>
                </form>

                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Active Buyer Requirements</h4>
                  {bulkReqs.map((req) => (
                    <div key={req.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-white font-sans text-sm block">Req: {req.cropType}</span>
                        <span className="text-slate-400 block mt-1">Quantity: {req.quantityTons} Tons | Budget: ₹{req.budgetPrice}/Ton</span>
                        <span className="text-slate-500 block text-[10px] mt-1">Delivery: {new Date(req.deliveryDate).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => setTargetReqId(req.id)}
                        className="px-3 py-1.5 rounded-lg border border-lime-500/30 text-lime-400 font-bold hover:bg-lime-500/10"
                      >
                        Bid Quotation
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Submit quote bid */}
              <div className="space-y-6 border-l border-white/5 pl-0 lg:pl-8">
                <form onSubmit={handleSubmitQuotation} className="space-y-4 font-mono text-xs">
                  <h4 className="font-bold text-white font-sans text-sm">Submit Quotation Bid (Farmer)</h4>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">SELECTED REQUIREMENT ID</label>
                    <input
                      type="text"
                      readOnly
                      value={targetReqId}
                      aria-label="Selected requirement ID"
                      className="w-full rounded-xl border border-white/5 bg-slate-900/60 py-3 px-4 text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">OFFERED PRICE (₹/TON)</label>
                      <input
                        type="number"
                        aria-label="Offered price per ton in rupees"
                        placeholder="e.g. 2400"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">QUANTITY TO OFFER (TONS)</label>
                      <input
                        type="number"
                        aria-label="Quantity to offer in tons"
                        placeholder="e.g. 30"
                        value={quoteQty}
                        onChange={(e) => setQuoteQty(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">PROPOSAL NOTES / CERTIFICATION DETAILS</label>
                    <textarea
                      placeholder="Enter quality verification or delivery details..."
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 transition-all text-xs"
                  >
                    Submit Quotation proposal
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 7: Trade Financing Module */}
          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Trade Financing Module</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Apply for Working Capital, Purchase Loans, or Invoice Financing.</p>
                  </div>
                </div>

                <form onSubmit={handleApplyFinance} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">FINANCING TYPE</label>
                    <select
                      value={financeType}
                      onChange={(e) => setFinanceType(e.target.value)}
                      aria-label="Financing type"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    >
                      <option value="INVOICE_FINANCING">Invoice Financing (Get paid on shipment)</option>
                      <option value="WORKING_CAPITAL">Working Capital Loan (Seed/Harvest funds)</option>
                      <option value="PURCHASE_LOAN">Buyer Purchase Loan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">FINANCING CAPITAL REQUEST (₹)</label>
                    <input
                      type="number"
                      aria-label="Financing capital request in rupees"
                      placeholder="e.g. 500000"
                      value={financeAmount}
                      onChange={(e) => setFinanceAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block">COLLATERAL / SECURITY DETAILS</label>
                    <input
                      type="text"
                      placeholder="e.g. Warehoused Wheat Receipt #1042"
                      value={financeCollateral}
                      onChange={(e) => setFinanceCollateral(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/40 py-3 px-4 text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-teal-500 text-slate-950 font-bold hover:opacity-90 active:scale-95 transition-all text-xs"
                  >
                    Submit Finance Application
                  </button>
                </form>
              </div>

              {/* Status List */}
              <div className="border border-white/5 rounded-2xl bg-white/[0.01] p-6 space-y-4">
                <h4 className="font-bold text-white text-sm">Active Finance Applications</h4>
                <div className="space-y-3 font-mono text-xs">
                  {financeApps.map((app) => (
                    <div key={app.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/40 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white font-sans text-xs block">{app.type.replace('_', ' ')}</span>
                        <span className="text-slate-400 block mt-1">Collateral: {app.collateralDetails || 'None'}</span>
                        <span className="text-slate-500 block text-[10px] mt-1">Requested: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">₹{app.amount}</span>
                        <span className="inline-block text-[9px] uppercase font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded mt-1.5">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {financeApps.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No active finance applications. Submit the form above to request working capital credit.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: Commission-Free Direct Contacts */}
          {activeTab === 'direct' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Direct Commission-Free Contacts</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Bypass fees! Connect directly with the buyer or seller via phone and email.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Available Crops on Marketplace</h4>
                  {directCrops.map((crop) => (
                    <div key={crop.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/30 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-white font-sans text-sm block">{crop.title}</span>
                        <span className="text-slate-400 block mt-1">Crop: {crop.cropType} | Price: ₹{crop.price}/{crop.unit}</span>
                      </div>
                      <button
                        onClick={() => handleFetchDirectContact(crop.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-lime-500 text-slate-950 font-bold hover:opacity-95 text-xs font-sans"
                      >
                        Reveal Contact
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reveal details */}
              <div className="border border-white/5 rounded-2xl bg-white/[0.01] p-6 space-y-4">
                <h4 className="font-bold text-white text-sm">Direct Contact Decryption Ledger</h4>
                {activeContact ? (
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 font-mono text-xs space-y-3">
                    <div className="flex items-center gap-2 text-lime-400 font-bold font-sans text-sm">
                      <ShieldCheck className="h-4 w-4" />
                      <span>DIRECT DEAL SECURED</span>
                    </div>

                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <div><span className="text-slate-500">GROWER NAME:</span> <span className="text-white font-bold">{activeContact.fullName}</span></div>
                      <div><span className="text-slate-500">PHONE LINE:</span> <span className="text-white font-bold">{activeContact.phone}</span></div>
                      <div><span className="text-slate-500">EMAIL BOX:</span> <span className="text-white font-bold">{activeContact.email}</span></div>
                      <div><span className="text-slate-500">GROWER HUB:</span> <span className="text-white">{activeContact.address}</span></div>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-relaxed pt-3 font-sans">
                      ⚠️ MandiPrime does not charge platform trading commissions on direct deals. Connect directly to organize escrow locks.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Choose a crop listing on the left to reveal the grower&apos;s direct verification contacts.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 9: Crop Inventory Analytics */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Crop Inventory & Performance Analytics</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Analyze farmer yield sales performance metrics and remaining stock levels.</p>
                </div>
              </div>

              {inventoryAnalytics ? (
                <div className="space-y-8 font-mono text-xs">
                  
                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40">
                      <span className="text-slate-500 block text-[10px]">ACTIVE CROP LISTINGS</span>
                      <span className="text-2xl font-bold text-white mt-1 block">{inventoryAnalytics.listingsCount} Listings</span>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-955/40">
                      <span className="text-slate-500 block text-[10px]">TOTAL REMAINING STOCK</span>
                      <span className="text-2xl font-bold text-white mt-1 block">{inventoryAnalytics.totalAvailableStock} Units</span>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-955/40">
                      <span className="text-slate-500 block text-[10px]">COMPLETED TRADES</span>
                      <span className="text-2xl font-bold text-white mt-1 block">{inventoryAnalytics.totalSalesCount} Deliveries</span>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-955/40">
                      <span className="text-slate-500 block text-[10px]">TOTAL REVENUE CLEARED</span>
                      <span className="text-2xl font-bold text-lime-400 mt-1 block">₹{inventoryAnalytics.totalRevenue}</span>
                    </div>
                  </div>

                  {/* Listings table */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-white font-sans text-sm">Inventory Ledger</h4>
                    <div className="overflow-x-auto border border-white/5 rounded-2xl bg-white/[0.01]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400">
                            <th className="p-4 font-bold">Crop Commodity</th>
                            <th className="p-4 font-bold">Category</th>
                            <th className="p-4 font-bold">Grade Rating</th>
                            <th className="p-4 font-bold">Available Stock</th>
                            <th className="p-4 font-bold">Unit Price</th>
                            <th className="p-4 font-bold">Listing Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryAnalytics.inventory.map((inv: AgriProduct) => (
                            <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="p-4 font-bold text-white font-sans text-xs">{inv.title}</td>
                              <td className="p-4 text-slate-300">{inv.cropType}</td>
                              <td className="p-4"><span className="px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 font-bold">{inv.grade}</span></td>
                              <td className="p-4 text-slate-300">{inv.stock} {inv.unit}</td>
                              <td className="p-4 text-slate-300">₹{inv.price}/{inv.unit}</td>
                              <td className="p-4">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${inv.status === 'ACTIVE' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-700/20 text-slate-500'}`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Yield data loading... Connect credentials to fetch inventory logs.
                </div>
              )}
            </div>
          )}

        </div>

      </main>
      <Footer />
    </div>
  );
}
