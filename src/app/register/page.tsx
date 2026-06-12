'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
import { Landmark, Mail, Lock, User, Phone, Building, MapPin, Globe, Compass, ArrowRight, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error, clearError, user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India'); // Default

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
    return () => {
      clearError();
    };
  }, [user, router, clearError]);

  const handleNextStep = () => {
    setValidationError(null);
    if (step === 1) {
      if (!fullName || !email || !password) {
        setValidationError('Please fill out all basic details.');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters long.');
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!phone || !city || !country) {
      setValidationError('Phone number, City, and Country are required.');
      return;
    }

    const payload = {
      email,
      password,
      role,
      fullName,
      phone,
      companyName: companyName || undefined,
      address: address || undefined,
      city,
      country,
    };

    const success = await register(payload);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-white overflow-hidden">
      {/* Decorative Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-lime-500/5 blur-[120px] pointer-events-none" />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
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
          <h1 className="text-xl font-bold tracking-tight text-slate-200">Register Exchange Account</h1>
          <p className="text-slate-400 text-xs mt-1">Join the premier double-sided digital trade corridor</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="relative rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
          {/* Top subtle gradient highlight line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`h-1.5 rounded-full transition-all duration-350 ${step === 1 ? 'w-8 bg-teal-400' : 'w-2 bg-slate-800'}`} />
            <span className={`h-1.5 rounded-full transition-all duration-350 ${step === 2 ? 'w-8 bg-teal-400' : 'w-2 bg-slate-800'}`} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Errors */}
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

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="E.g. Baldev Singh"
                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Email */}
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

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Password (min 6 characters)
                    </label>
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

                  {/* Role Selector Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Select Your Trade Role
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['FARMER', 'BUYER', 'EXPORTER'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${
                            role === r
                              ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-bold shadow-md shadow-teal-500/5'
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                          }`}
                        >
                          <span className="text-xs tracking-wider uppercase font-semibold">{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next Action Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all"
                  >
                    <span>Next: Business Details</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Phone & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Company (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Building className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Agro Corp Ltd"
                          className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Street Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="12 GT Road"
                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* City & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        City
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Compass className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Amritsar"
                          className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="country-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Country
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Globe className="h-4 w-4" />
                        </div>
                        <select
                          id="country-select"
                          title="Select Country"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all font-sans appearance-none"
                        >
                          <option value="India">India 🇮🇳</option>
                          <option value="Dubai">United Arab Emirates 🇦🇪</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-3.5 text-xs font-bold text-white transition-all active:scale-[0.98]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Node...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Exchange Account</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Prompt Login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an exchange account?{' '}
            <Link href="/login" className="font-semibold text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
