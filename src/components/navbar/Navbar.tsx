'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Landmark, ArrowUpRight, Globe } from 'lucide-react';
import LocationSelector from '../location-selector/LocationSelector';
import { useAuthStore } from '@/store/useAuthStore';
import { useMarketStore } from '@/store/useMarketStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useMarketStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = mounted && user
    ? [
        { name: 'Home', href: '/' },
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Negotiation', href: '/chat' },
        { name: 'My Orders', href: '/orders' },
        { name: 'Auctions', href: '/auctions' },
        { name: 'Export Hub', href: '/export' },
        { name: 'Logistics', href: '/logistics' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'AI Assistant', href: '/ai-assistant' },
        ...(user.role === 'ADMIN' ? [{ name: 'Admin Panel', href: '/admin' }] : []),
      ]
    : [
        { name: 'Home', href: '/#home' },
        { name: 'Markets', href: '/#markets' },
        { name: 'Marketplace', href: '/#marketplace' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'Contact', href: '/#contact' },
      ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

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

        {/* Center: Location & Language Selector (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <LocationSelector />
          <div className="relative flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-semibold cursor-pointer hover:bg-white/10 transition-colors">
            <Globe className="h-3.5 w-3.5 text-teal-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-1 text-xs"
            >
              <option value="en" className="bg-slate-950 text-white">English (EN)</option>
              <option value="hi" className="bg-slate-950 text-white">हिंदी (HI)</option>
              <option value="mr" className="bg-slate-950 text-white">मराठी (MR)</option>
              <option value="ar" className="bg-slate-950 text-white">العربية (AR)</option>
            </select>
          </div>
        </div>

        {/* Right: Desktop Nav Links & CTAs */}
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors duration-200 relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500 to-lime-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>

          {mounted && user ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <div className="text-right">
                <span className="block text-[11px] font-semibold text-slate-300">{user.fullName || user.email}</span>
                <span className="inline-block text-[9px] font-bold text-teal-400 font-mono tracking-wider uppercase bg-teal-500/10 px-1.5 py-0.5 rounded mt-0.5">
                  {user.role}
                </span>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => logout()}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors py-1.5 px-2.5 rounded-lg border border-red-500/10 hover:border-red-500/25 bg-red-500/5 active:scale-95 duration-150"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="relative group overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-lime-500 p-[1px] shadow-lg shadow-teal-500/20 active:scale-95 transition-transform duration-150"
              >
                <span className="relative flex items-center gap-1 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold text-white transition-colors duration-300 group-hover:bg-transparent">
                  Get Started
                  <ArrowUpRight className="h-3.5 w-3.5 text-teal-400 group-hover:text-slate-950 transition-colors duration-300" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-4 lg:hidden">
          {/* Location Selector also visible on mobile but smaller */}
          <div className="md:hidden">
            <LocationSelector />
          </div>
          <button
            suppressHydrationWarning
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
              <div className="flex items-center justify-between border-b border-white/5 pb-4 md:hidden">
                <span className="text-xs text-slate-400 font-semibold">Select Language:</span>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 font-semibold focus:outline-none"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">हिंदी (HI)</option>
                  <option value="mr">मराठी (MR)</option>
                  <option value="ar">العربية (AR)</option>
                </select>
              </div>

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {mounted && user ? (
                <div className="flex flex-col gap-3 pt-6 border-t border-white/5 text-center">
                  <div className="mb-2">
                    <span className="block text-sm font-semibold text-slate-300">{user.fullName || user.email}</span>
                    <span className="inline-block text-xs font-bold text-teal-400 font-mono tracking-wider uppercase bg-teal-500/10 px-2.5 py-0.5 rounded mt-1">
                      {user.role}
                    </span>
                  </div>
                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full rounded-full border border-red-500/20 bg-red-500/5 py-3 text-center text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-full border border-white/10 py-3 text-center text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-full bg-gradient-to-r from-teal-500 to-lime-500 py-3 text-center text-sm font-bold text-slate-950 hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
