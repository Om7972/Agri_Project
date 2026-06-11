'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Landmark, Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError, user } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
    return () => {
      clearError();
    };
  }, [user, router, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950 text-white overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-lime-500/5 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-lime-500 p-[1px] shadow-lg shadow-teal-500/10">
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-950">
                <Landmark className="h-6 w-6 text-teal-400 group-hover:text-lime-400 transition-colors duration-300" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Mandi<span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">Prime</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-200">Welcome back</h1>
          <p className="text-slate-400 text-xs mt-1">Access the institutional commodities exchange node</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="relative rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
          {/* Card Hover Border Highlight Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-30 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Display Errors */}
            {(error || validationError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/5 p-3.5 text-xs text-red-400"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{validationError || error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <a href="#" className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Prompt Register */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an exchange account?{' '}
            <Link href="/register" className="font-semibold text-teal-400 hover:text-teal-300">
              Create one now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
