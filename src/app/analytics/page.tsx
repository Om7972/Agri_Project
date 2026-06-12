'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, LineChart, PieChart, Landmark, ShoppingBag, ArrowUpRight, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface AnalyticsData {
  revenueData: { month: string; amount: number }[];
  marketVolumeData: { commodity: string; demand: number; supply: number }[];
  priceTrendData: { day: string; basmati: number; wheat: number }[];
}

export default function AnalyticsPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers: any = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const res = await fetch(`${API_BASE_URL}/analytics/intelligence`, { headers });
        const result = await res.json();
        if (res.ok && result.success) {
          setData(result.data);
        } else {
          setData(fallbackAnalytics);
        }
      } catch (err) {
        setData(fallbackAnalytics);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [accessToken]);

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="min-h-screen py-12 px-6 max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-400">
            <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
            Market Intelligence Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Analytics &{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Trade Performance
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Institutional aggregates on demand, supply bottlenecks, and regional commodity pricing corridors.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Highlights cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-xl backdrop-blur-md hover:border-white/10 transition-all"
              >
                <span className="text-[10px] text-slate-500 block mb-1">TOTAL PLATFORM ESCROW VOLUME</span>
                <span className="text-3xl font-black text-white">₹14.8 Crores</span>
                <span className="text-[10px] text-teal-400 block mt-2 font-sans font-bold">↑ 22% Month-over-Month</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-xl backdrop-blur-md hover:border-white/10 transition-all"
              >
                <span className="text-[10px] text-slate-500 block mb-1">COMPLETED CARRIERS DISPATCH</span>
                <span className="text-3xl font-black text-white">324 Shipments</span>
                <span className="text-[10px] text-lime-400 block mt-2 font-sans font-bold">98.4% On-Time Delivery</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-xl backdrop-blur-md hover:border-white/10 transition-all"
              >
                <span className="text-[10px] text-slate-500 block mb-1">GLOBAL EXPORT CAPACITY</span>
                <span className="text-3xl font-black text-white">12.5 KiloTons</span>
                <span className="text-[10px] text-teal-400 block mt-2 font-sans font-bold">Direct Corridors: India-Dubai</span>
              </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Revenue area chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md"
              >
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal-400" />
                  Monthly Transaction Clearing Trend (INR)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Demand vs Supply Bar chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md"
              >
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-lime-400" />
                  Regional Demand vs Supply Balances (Tons)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.marketVolumeData}>
                      <XAxis dataKey="commodity" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="demand" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="supply" fill="#84cc16" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>
          </div>
        )}
      </main>
    </>
  );
}

const fallbackAnalytics: AnalyticsData = {
  revenueData: [
    { month: 'Jan', amount: 1200000 },
    { month: 'Feb', amount: 1900000 },
    { month: 'Mar', amount: 3200000 },
    { month: 'Apr', amount: 5000000 },
    { month: 'May', amount: 4800000 },
    { month: 'Jun', amount: 8400000 },
  ],
  marketVolumeData: [
    { commodity: 'Wheat', demand: 1200, supply: 1000 },
    { commodity: 'Basmati Rice', demand: 800, supply: 950 },
    { commodity: 'Sugar', demand: 1500, supply: 1200 },
    { commodity: 'Cotton', demand: 500, supply: 600 },
  ],
  priceTrendData: [
    { day: 'Mon', basmati: 85, wheat: 22 },
    { day: 'Tue', basmati: 86, wheat: 22.5 },
    { day: 'Wed', basmati: 85.5, wheat: 23 },
    { day: 'Thu', basmati: 87, wheat: 22.8 },
    { day: 'Fri', basmati: 88, wheat: 23.5 },
  ],
};
