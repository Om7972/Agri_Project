'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Landmark, ArrowUpRight } from 'lucide-react';
import LocationSelector from '../location-selector/LocationSelector';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Markets', href: '#markets' },
    { name: 'Marketplace', href: '#marketplace' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-20">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-lime-500 p-[1px] shadow-lg shadow-teal-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
              <Landmark className="h-5 w-5 text-teal-400 group-hover:text-lime-400 transition-colors duration-300" />
            </div>
            {/* Ambient glow behind logo */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-teal-500 to-lime-500 opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-300" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Mandi<span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">Prime</span>
          </span>
        </Link>

        {/* Center: Location Selector (Desktop) */}
        <div className="hidden md:block">
          <LocationSelector />
        </div>

        {/* Right: Desktop Nav Links & CTAs */}
        <div className="hidden lg:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500 to-lime-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200">
              Log in
            </button>
            <button className="relative group overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-lime-500 p-[1px] shadow-lg shadow-teal-500/20 active:scale-95 transition-transform duration-150">
              <span className="relative flex items-center gap-1 rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white transition-colors duration-300 group-hover:bg-transparent">
                Get Started
                <ArrowUpRight className="h-4 w-4 text-teal-400 group-hover:text-slate-950 transition-colors duration-300" />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-4 lg:hidden">
          {/* Location Selector also visible on mobile but smaller */}
          <div className="md:hidden">
            <LocationSelector />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-b border-white/5 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-6 px-6 py-8">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full border border-white/10 py-3 text-center text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full bg-gradient-to-r from-teal-500 to-lime-500 py-3 text-center text-sm font-bold text-slate-950 hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
