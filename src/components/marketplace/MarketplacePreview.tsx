'use client';

import React, { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ShoppingBag, Landmark, ArrowUpRight, TrendingUp, CheckCircle, RefreshCcw, Package, Layers } from 'lucide-react';

const buyerChartData = [
  { month: 'Jan', volume: 45 },
  { month: 'Feb', volume: 60 },
  { month: 'Mar', volume: 55 },
  { month: 'Apr', volume: 80 },
  { month: 'May', volume: 95 },
  { month: 'Jun', volume: 120 },
];

const farmerChartData = [
  { month: 'Jan', yield: 80 },
  { month: 'Feb', yield: 85 },
  { month: 'Mar', yield: 92 },
  { month: 'Apr', yield: 88 },
  { month: 'May', yield: 95 },
  { month: 'Jun', yield: 110 },
];

export default function MarketplacePreview() {
  const { location, currencySymbol, isFetching } = useMarketStore();
  const [mounted, setMounted] = useState(false);
  const [buyerLogs, setBuyerLogs] = useState([
    { id: 1, text: 'Order #2094 matching with Gujarat growers', status: 'Verifying' },
    { id: 2, text: 'Escrow funded: AED 140K for organic rice', status: 'Funded' },
  ]);
  const [farmerInventory, setFarmerInventory] = useState([
    { crop: 'Basmati Rice', qty: '400 Quintals', quality: 'Grade A+' },
    { crop: 'Premium Cotton', qty: '120 Bales', quality: 'Grade SLM' },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerBuyerLogRefresh = () => {
    setBuyerLogs([
      { id: Date.now(), text: 'SGS Quality inspection passed for Punjab Wheat', status: 'Passed' },
      ...buyerLogs.slice(0, 1),
    ]);
  };

  const handleHarvestInput = () => {
    setFarmerInventory([
      { crop: 'New Sugarcane Batch', qty: '1,500 Quintals', quality: 'Raw Sweet' },
      ...farmerInventory.slice(0, 1),
    ]);
  };

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/5 px-3 py-1 text-xs font-semibold text-lime-400">
            <Layers className="h-3.5 w-3.5" />
            Double-Sided Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Integrated{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Trader & Producer Dashboards
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Whether you are buying bulk agricultural commodities or managing farm yields, MandiPrime provides bespoke, institutional-grade tooling.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          
          {/* Left Panel: Buyer Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-none">Buyer Procurement Portal</h3>
                  <span className="text-[10px] text-slate-500 font-mono">ROLE: INSTITUTIONAL BUYER</span>
                </div>
              </div>
              
              <button
                suppressHydrationWarning
                onClick={triggerBuyerLogRefresh}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 hover:border-teal-500/30 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <RefreshCcw className="h-3 w-3 animate-spin-slow" />
                Refresh Logs
              </button>
            </div>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6 font-mono">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-sans block mb-1">Total Sourced</span>
                <span className="text-xl font-bold text-white">4,820 Tons</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-sans block mb-1">Active Escrow</span>
                <span className="text-xl font-bold text-teal-400">
                  {isFetching ? (
                    <span className="inline-block h-6 w-16 bg-white/10 rounded animate-pulse" />
                  ) : (
                    location === 'India' ? '₹8.4 Cr' : 'AED 4.1M'
                  )}
                </span>
              </div>
            </div>

            {/* Procurement Chart (LineChart) */}
            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 flex-1 min-h-[200px] flex flex-col justify-between mb-6">
              <span className="text-xs text-slate-400 font-semibold mb-4 block">Procurement Volume Trend (Kilo-Tons)</span>
              {mounted ? (
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={buyerChartData}>
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={20} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <Line type="monotone" dataKey="volume" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: '#14b8a6', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-36 w-full bg-slate-900/10 animate-pulse rounded" />
              )}
            </div>

            {/* Trade Activity feed */}
            <div className="space-y-3">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">Live Logistics Feed</span>
              <div className="space-y-2">
                {buyerLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                    <span className="line-clamp-1">{log.text}</span>
                    <span className="font-mono text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-bold">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Farmer Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300"
          >
            <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-none">Farmer Yield & Sale Portal</h3>
                  <span className="text-[10px] text-slate-500 font-mono">ROLE: SOVEREIGN PRODUCER</span>
                </div>
              </div>
              
              <button
                suppressHydrationWarning
                onClick={handleHarvestInput}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 hover:border-lime-500/30 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <PlusIcon className="h-3.5 w-3.5 text-lime-400" />
                Log Harvest
              </button>
            </div>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6 font-mono">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-sans block mb-1">Total Harvested</span>
                <span className="text-xl font-bold text-white">8,250 Tons</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-sans block mb-1">Sales Realized</span>
                <span className="text-xl font-bold text-lime-400">
                  {isFetching ? (
                    <span className="inline-block h-6 w-16 bg-white/10 rounded animate-pulse" />
                  ) : (
                    location === 'India' ? '₹1.8 Crore' : 'AED 820K'
                  )}
                </span>
              </div>
            </div>

            {/* Yield Analytics (BarChart) */}
            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 flex-1 min-h-[200px] flex flex-col justify-between mb-6">
              <span className="text-xs text-slate-400 font-semibold mb-4 block">Sales Performance (index units)</span>
              {mounted ? (
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={farmerChartData}>
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={20} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <Bar dataKey="yield" fill="#84cc16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-36 w-full bg-slate-900/10 animate-pulse rounded" />
              )}
            </div>

            {/* Inventory Status List */}
            <div className="space-y-3">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">Commodity Inventory</span>
              <div className="space-y-2">
                {farmerInventory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                    <span className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-lime-400" />
                      <strong>{item.crop}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {item.qty} ({item.quality})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
