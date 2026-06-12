'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-xl relative">
      {/* Subtle border shine */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Logo & Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-lime-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-slate-950">
                  <Landmark className="h-4.5 w-4.5 text-teal-400" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                Mandi<span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">Prime</span>
              </span>
            </Link>
            
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              MandiPrime is a high-speed, secure digital exchange for physical agricultural commodities, powered by smart escrow contracts, logistics validation, and real-time indices.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow MandiPrime on Twitter"
                aria-label="Follow MandiPrime on Twitter"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Connect with MandiPrime on LinkedIn"
                aria-label="Connect with MandiPrime on LinkedIn"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow MandiPrime on GitHub"
                aria-label="Follow MandiPrime on GitHub"
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Commodity Indices */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Indices</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#markets" className="hover:text-teal-400 transition-colors">Wheat Index</a></li>
              <li><a href="#markets" className="hover:text-teal-400 transition-colors">Basmati Rice Index</a></li>
              <li><a href="#markets" className="hover:text-teal-400 transition-colors">Shankar-6 Cotton</a></li>
              <li><a href="#markets" className="hover:text-teal-400 transition-colors">Raw Sugarcane Index</a></li>
              <li><a href="#markets" className="hover:text-teal-400 transition-colors">Yellow Maize Feed</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">Careers</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">Trade Security</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">Press & Media</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">System Status</Link></li>
            </ul>
          </div>

          {/* Column 4: Platform & Compliance */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-teal-400 transition-colors">Smart Escrow Documentation</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">API References</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">SGS Inspection Guidelines</Link></li>
              <li><Link href="/" className="hover:text-teal-400 transition-colors">Help Desk</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} MandiPrime Exchange Group. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link href="/" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Compliance Logos */}
          <div className="flex items-center gap-4 text-slate-600 text-[10px] uppercase font-mono">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-500/50" />
              <span>SOC2 TYPE II Certified</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-lime-500/50" />
              <span>ISO 27001 Security</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
