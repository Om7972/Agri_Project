'use client';

import React, { useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { featuredProductsData, FeaturedProduct } from '@/data/marketData';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Shield, Package, ShoppingBag, X, MessageSquare, AlertCircle } from 'lucide-react';

export default function FeaturedProducts() {
  const { location, currencySymbol, isFetching } = useMarketStore();
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('10');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleOpenDetails = (product: FeaturedProduct) => {
    setSelectedProduct(product);
    setOrderSuccess(false);
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setOrderSuccess(false);
    }, 2500);
  };

  return (
    <section id="marketplace" className="py-20 px-6 bg-slate-950/20 relative">
      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-400">
            <ShoppingBag className="h-3.5 w-3.5" />
            Premium Marketplace
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Featured{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Commodity Contracts
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Source bulk commodities directly from premium verified farms and wholesale exporters. Instant logistics tracking included with every contract.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProductsData.map((product, idx) => {
            const isIndia = location === 'India';
            const title = isIndia ? product.titleIndia : product.titleDubai;
            const price = isIndia ? product.priceIndia : product.priceDubai;
            const unit = isIndia ? product.unitIndia : product.unitDubai;
            const stock = isIndia ? product.stockIndia : product.stockDubai;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl backdrop-blur-md hover:border-white/10 hover:bg-slate-900/60 transition-all duration-300"
              >
                {/* Image Container with Zoom effect */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/20 z-10" />
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-lime-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.crop}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-slate-950/80 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border backdrop-blur-sm ${
                      product.sellerVerification === 'Elite' 
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' 
                        : 'bg-slate-500/10 text-slate-300 border-white/10'
                    }`}>
                      <Shield className="h-3 w-3" />
                      {product.sellerVerification}
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 font-medium">Seller: {product.sellerName}</span>
                    {isFetching ? (
                      <div className="h-6 w-full bg-white/10 rounded animate-pulse" />
                    ) : (
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-teal-400 transition-colors duration-200">
                        {title}
                      </h3>
                    )}
                    <p className="text-xs font-mono text-teal-500">{product.grade}</p>
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <div>
                      {isFetching ? (
                        <div className="h-7 w-28 bg-white/10 rounded animate-pulse" />
                      ) : (
                        <>
                          <span className="text-2xl font-bold font-mono text-white tracking-tight">
                            {currencySymbol}
                            {price.toLocaleString('en-US')}
                          </span>
                          <span className="text-xs text-slate-500"> / {unit}</span>
                        </>
                      )}
                    </div>
                    {isFetching ? (
                      <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {stock.split(' ')[0]} in stock
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleOpenDetails(product)}
                    disabled={isFetching}
                    suppressHydrationWarning
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 py-3 text-sm font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-lime-500 group-hover:text-slate-950 group-hover:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetching ? 'Recalculating Contract...' : 'View Contract Details'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDetails}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl overflow-hidden z-10"
              >
                {/* Close Button */}
                <button
                  title="Close Details"
                  aria-label="Close Details"
                  onClick={handleCloseDetails}
                  className="absolute top-6 right-6 p-2 rounded-full border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {orderSuccess ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                      <Star className="h-8 w-8 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Escrow Bid Placed Successfully!</h3>
                    <p className="text-slate-400 text-sm max-w-sm">
                      Your bid contract has been routed to <strong>{selectedProduct.sellerName}</strong>. Smart contract initialized. Settlement is awaiting verification.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Product Media Spec */}
                    <div className="space-y-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.crop}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">Commodity Grade</span>
                          <span className="text-white font-semibold font-mono">{selectedProduct.grade}</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">Available Stock</span>
                          <span className="text-white font-semibold font-mono">
                            {location === 'India' ? selectedProduct.stockIndia : selectedProduct.stockDubai}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                          <span className="text-slate-400">Escrow Security</span>
                          <span className="text-teal-400 font-semibold flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Fully Protected
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Contract Bid Submission */}
                    <form onSubmit={handlePlaceBid} className="space-y-6">
                       <div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Bid Portal</span>
                        <h3 className="text-xl font-bold text-white mt-1">
                          {location === 'India' ? selectedProduct.titleIndia : selectedProduct.titleDubai}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Contract by: {selectedProduct.sellerName}</p>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="bid-volume" className="block text-xs font-semibold text-slate-400 uppercase">
                          Enter Contract Volume ({location === 'India' ? selectedProduct.unitIndia : selectedProduct.unitDubai})
                        </label>
                        <div className="relative">
                          <input
                            id="bid-volume"
                            type="number"
                            required
                            placeholder="e.g. 10"
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(e.target.value)}
                            min="1"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Base Contract Price</span>
                          <span>
                            {currencySymbol}
                            {(location === 'India' ? selectedProduct.priceIndia : selectedProduct.priceDubai).toLocaleString('en-US')}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Market/Escrow Fee</span>
                          <span>0.25%</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                          <span>Estimated Contract Value</span>
                          <span className="font-mono text-teal-400">
                            {currencySymbol}
                            {(
                              (location === 'India' ? selectedProduct.priceIndia : selectedProduct.priceDubai) *
                              Number(orderQuantity || 0)
                            ).toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCloseDetails}
                          className="flex-1 rounded-xl border border-white/10 py-3 text-center text-xs font-bold text-white hover:bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 py-3 text-center text-xs font-bold text-slate-950 hover:opacity-90 transition-opacity"
                        >
                          Initiate Escrow Bid
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
