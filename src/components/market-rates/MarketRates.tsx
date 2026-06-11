'use client';

import React, { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { marketRatesData } from '@/data/marketData';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Compass, Flame } from 'lucide-react';

// Client-only sparkline wrapper to avoid hydration mismatches
function MiniSparkline({ data, isPositive }: { data: { value: number }[]; isPositive: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-12 w-full bg-slate-900/10 animate-pulse rounded" />;
  }

  const strokeColor = isPositive ? '#14b8a6' : '#ef4444';
  const fillColor = isPositive ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${isPositive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#gradient-${isPositive ? 'pos' : 'neg'})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MarketRates() {
  const { location, currencySymbol, isFetching } = useMarketStore();

  return (
    <section id="markets" className="py-20 px-6 relative">
      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/5 px-3 py-1 text-xs font-semibold text-lime-400">
              <Flame className="h-3.5 w-3.5" />
              Live Commodity Exchange Rates
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real-Time{' '}
              <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
                Market Indices
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Streaming directly from verified agricultural boards. Switch your country pill to update regional commodity prices and trade channels.
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0 text-xs text-slate-400 font-mono bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span>{isFetching ? 'Recalculating rates...' : 'Live feed updating...'}</span>
          </div>
        </div>

        {/* Commodity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketRatesData.map((rate, idx) => {
            const isIndia = location === 'India';
            const price = isIndia ? rate.priceIndia : rate.priceDubai;
            const change = isIndia ? rate.changeIndia : rate.changeDubai;
            const locationTag = isIndia ? rate.locationIndia : rate.locationDubai;
            const unit = isIndia ? rate.unitIndia : rate.unitDubai;
            const isPositive = change >= 0;

            // Sparkline normalization/offset to visually represent changes
            const sparklineData = rate.sparkline.map((item, index) => {
              // Scale graph values dynamically to show appropriate ups and downs
              const factor = price / (isIndia ? 2750 : 1450);
              return { value: item.value * factor };
            });

            return (
              <motion.div
                key={rate.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10"
              >
                {/* Visual Glow Highlights on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Card Title + Location */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-teal-400 transition-colors duration-200">
                      {rate.crop}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                      <Compass className="h-3 w-3 text-slate-600" />
                      {isFetching ? (
                        <span className="inline-block h-3.5 w-28 bg-white/5 rounded animate-pulse" />
                      ) : (
                        <span>{locationTag}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                    {rate.id}
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    {isFetching ? (
                      <span className="inline-block h-8 w-24 bg-white/10 rounded animate-pulse" />
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
                    <span className="inline-block h-6 w-14 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-bold font-mono ${
                        isPositive
                          ? 'bg-teal-500/10 text-teal-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {isPositive ? '+' : ''}
                      {change}%
                    </span>
                  )}
                </div>

                {/* Sparkline Graph */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold block mb-2">
                    7d Trend
                  </span>
                  {isFetching ? (
                    <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
                  ) : (
                    <MiniSparkline data={sparklineData} isPositive={isPositive} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
