'use client';

import React from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Flame, Cpu } from 'lucide-react';

export default function SubscriptionPlans() {
  const { location, currencySymbol, isFetching } = useMarketStore();

  const isIndia = location === 'India';

  const pricingTiers = [
    {
      name: 'Starter',
      priceIndia: '₹999',
      priceDubai: 'AED 99',
      frequency: 'month',
      desc: 'Essential features for progressive individual farmers and retail buyers.',
      features: [
        'Access to local market rates',
        'Up to 3 active trade listings',
        'Standard logistics partner support',
        'Basic secure escrow (0.5% fee)',
        'Standard email support',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      priceIndia: '₹4,999',
      priceDubai: 'AED 449',
      frequency: 'month',
      desc: 'Advanced tools for wholesale distributors, farming cooperatives, and exporters.',
      features: [
        'Real-time global market indices',
        'Unlimited domestic & export listings',
        'Preferred shipping & freight routing',
        'Discounted escrow billing (0.2% fee)',
        'Pre-approved SGS quality inspections',
        '24/7 priority trade desk access',
        'Custom API price feeds',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      priceIndia: 'Custom',
      priceDubai: 'Custom',
      frequency: 'tailored',
      desc: 'Bespoke logistics, compliance, and smart escrow solutions for global corporations.',
      features: [
        'Custom international shipping lanes',
        'Dedicated multi-sig corporate escrow',
        'Unlimited API data integration',
        'Dedicated logistics account officer',
        'On-site third-party quality audits',
        'SLA guaranteed settlement times',
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6 relative overflow-hidden">
      {/* Background neon orb */}
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-lime-500/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/5 px-3 py-1 text-xs font-semibold text-lime-400">
            <Cpu className="h-3.5 w-3.5" />
            Pricing Packages
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plans for{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Every Scale of Trade
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Select a plan to access verified trade corridors, real-time analytics, and guaranteed smart escrow protection.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier, idx) => {
            const price = isIndia ? tier.priceIndia : tier.priceDubai;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between rounded-3xl p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlighted
                    ? 'bg-slate-900/80 border-2 border-teal-500/50 shadow-2xl shadow-teal-500/10'
                    : 'bg-white/[0.02] border border-white/5 shadow-xl hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                {/* Highlight Badge */}
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500 to-lime-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1 shadow-lg">
                    <Flame className="h-3.5 w-3.5 animate-pulse" />
                    Most Popular
                  </div>
                )}

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                      {tier.desc}
                    </p>
                  </div>

                  {/* Pricing Rate */}
                  <div className="flex items-baseline py-4 border-y border-white/5 font-mono">
                    {isFetching && price !== 'Custom' ? (
                      <span className="inline-block h-10 w-24 bg-white/10 rounded animate-pulse" />
                    ) : price === 'Custom' ? (
                      <span className="text-3xl font-extrabold text-white tracking-tight font-sans">Custom Rates</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {price}
                        </span>
                        <span className="text-sm text-slate-500 ml-2">/ {tier.frequency}</span>
                      </>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 text-xs text-slate-300">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <span className="mt-0.5 rounded bg-teal-500/10 p-0.5 text-teal-400">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call To Action button */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <button
                    suppressHydrationWarning
                    onClick={() => alert(`Subscribed to ${tier.name} mock account!`)}
                    className={`w-full rounded-xl py-3 text-xs font-bold transition-all duration-300 active:scale-95 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 shadow-lg hover:shadow-teal-500/20 hover:opacity-95'
                        : 'bg-white/[0.04] border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Corporate Sales' : `Get Started with ${tier.name}`}
                  </button>
                  <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                    <span>30-Day Money Back Guarantee</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
