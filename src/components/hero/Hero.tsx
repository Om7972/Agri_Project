'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMarketStore } from '@/store/useMarketStore';
import { heroMetrics } from '@/data/marketData';
import { ArrowRight, Play, TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function Hero() {
  const { location, currencySymbol, isFetching } = useMarketStore();

  // Find corresponding metrics based on location
  const currentMetrics = heroMetrics.map((m) => {
    const isIndia = location === 'India';
    return {
      title: m.title,
      value: isIndia ? m.indiaValue : m.dubaiValue,
      change: m.change,
      changeType: m.changeType,
    };
  });

  return (
    <section id="home" className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center px-6 py-12 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Left Side: Headlines & Buttons */}
        <div className="lg:col-span-7 flex flex-col space-y-8 text-left">
          
          {/* Tagline / Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/5 px-4 py-1.5 text-xs font-semibold text-teal-400 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            Next-Gen Agri Commodity Exchange
          </motion.div>

          {/* Main Headline */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Trade Agriculture Like a{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-lime-400 bg-clip-text text-transparent drop-shadow-sm">
                Global Commodity
              </span>{' '}
              Market
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-slate-400 max-w-xl leading-relaxed"
            >
              Connect farmers, wholesalers, exporters and buyers through a premium digital marketplace. Trade with instant settlement, transparency, and verified logistics.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <a
              href="#markets"
              className="group relative flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-lime-500 px-7 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Explore Markets
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>

            <button
              onClick={() => alert('Demo video loading...')}
              className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white group-hover:scale-110 transition-transform duration-200">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </span>
              Watch Demo
            </button>
          </motion.div>

          {/* Core Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center gap-6 pt-4 text-slate-500 text-xs font-semibold uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              Escrow Protection
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-lime-400" />
              Real-time Settlement
            </div>
          </motion.div>
        </div>

        {/* Right Side: 3D animated dashboard preview */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-teal-500/20 blur-[80px]" />
          <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-lime-500/15 blur-[60px]" />

          {/* Perspective Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: -15, rotateX: 12 }}
            whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/80 backdrop-blur-md"
          >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />

            {/* Dashboard Header Mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-slate-500 font-mono ml-2">MANDIPRIME-TERMINAL v2.1</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-400">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                LIVE CONNECTED
              </span>
            </div>

            {/* Mock Trade Order Block */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Target Contract</span>
                  <span className="font-mono text-white font-semibold">BASMATI-1121-OCT26</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Escrow Bid Price</span>
                    <span className="text-xl font-bold font-mono text-white flex items-baseline">
                      {isFetching ? (
                        <span className="inline-block h-5 w-20 bg-white/10 rounded animate-pulse mt-1" />
                      ) : (
                        <>
                          {location === 'India' ? '₹9,800' : 'AED 4,950'}
                          <span className="text-xs text-slate-400 font-normal ml-1">/ Ton</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-lime-400 bg-lime-500/10 px-2 py-1 rounded">
                    +4.2% Up
                  </span>
                </div>
              </div>

              {/* Transaction Progress Simulation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider">
                  <span>Logistics Validation</span>
                  <span className="text-teal-400 font-semibold font-mono">92% Verified</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: ['20%', '92%', '92%', '40%', '92%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-teal-500 to-lime-500 rounded-full"
                  />
                </div>
              </div>

              {/* Activity log */}
              <div className="pt-2 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Terminal Feed</span>
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-teal-400" />
                      Bid matched (200 Tons)
                    </span>
                    <span className="text-slate-500">12s ago</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-lime-400" />
                      SGS Quality Certificate Approved
                    </span>
                    <span className="text-slate-500">1m ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hanging Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-6 bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-xl flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Volume Trend</span>
                <span className="text-sm font-bold text-white font-mono">Bullish Breakout</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Hero Metrics section grid below */}
      <div className="mx-auto max-w-7xl w-full mt-16 lg:mt-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {currentMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] group overflow-hidden"
            >
              {/* Card top edge light */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {metric.title}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {isFetching ? (
                    <span className="inline-block h-6 w-20 bg-white/10 rounded animate-pulse" />
                  ) : (
                    metric.value
                  )}
                </span>
                <span className="text-xs font-bold text-lime-400 flex items-center gap-0.5 bg-lime-500/10 px-1.5 py-0.5 rounded">
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
