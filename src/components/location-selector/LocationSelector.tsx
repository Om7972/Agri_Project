'use client';

import React from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LocationSelector() {
  const { location, setLocation, isFetching } = useMarketStore();

  const handleSelect = (target: 'India' | 'Dubai') => {
    // If already selected or currently fetching, do nothing
    if (isFetching) return;
    setLocation(target);
  };

  return (
    <div className="flex justify-center items-center py-2">
      <div className="relative flex p-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl shadow-black/40">
        {/* Sliding active indicator background */}
        <motion.div
          layoutId="activeLocation"
          className="absolute inset-y-1 rounded-full bg-gradient-to-r from-teal-500/20 to-lime-500/20 border border-teal-500/30"
          initial={false}
          animate={{
            left: location === 'India' && !isFetching ? 4 : '50%',
            right: location === 'India' && !isFetching ? '50%' : 4,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />

        {/* India Option (Opens directly) */}
        <button
          suppressHydrationWarning
          onClick={() => handleSelect('India')}
          disabled={isFetching}
          className={`relative z-10 px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 ${
            location === 'India' && !isFetching
              ? 'text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]'
              : 'text-gray-400 hover:text-gray-200'
          } ${isFetching ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <span className="text-base leading-none">🇮🇳</span>
          <span>India</span>
        </button>

        {/* Dubai Option (Shows loader / fetches prices) */}
        <button
          suppressHydrationWarning
          onClick={() => handleSelect('Dubai')}
          disabled={isFetching}
          className={`relative z-10 px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 ${
            location === 'Dubai' || isFetching
              ? 'text-white drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]'
              : 'text-gray-400 hover:text-gray-200'
          } ${isFetching ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-lime-400" />
          ) : (
            <span className="text-base leading-none">🇦🇪</span>
          )}
          <span>{isFetching ? 'Fetching...' : 'Dubai'}</span>
        </button>
      </div>
    </div>
  );
}
