'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Clear success notification after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20 px-6 relative overflow-hidden bg-slate-950/20">
      {/* Glow effect */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Side: Trade Desk Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-400">
                <HelpCircle className="h-3.5 w-3.5" />
                Agri Trade Desk
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Establish Direct{' '}
                <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
                  Trade Inquiries
                </span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Connect with our commodity experts to request bulk quotas, customize smart escrow clauses, or resolve cargo validation matters.
              </p>
            </div>

            {/* Contacts details list */}
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-teal-400 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Secure Email</h4>
                  <a href="mailto:desk@mandiprime.com" className="text-sm font-mono text-white hover:text-teal-400 transition-colors">
                    desk@mandiprime.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-lime-400 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Global Hotline</h4>
                  <span className="text-sm font-mono text-white block">
                    UAE Desk: +971 (4) 283-9428
                  </span>
                  <span className="text-sm font-mono text-white block mt-0.5">
                    IN Desk: +91 (22) 8342-9912
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-teal-400 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">HQ trade hubs</h4>
                  <p className="text-sm text-slate-300">
                    Jebel Ali Free Zone, Building C, Dubai, UAE
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    Bandra Kurla Complex, Trade Tower, Mumbai, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form Card */}
          <div className="lg:col-span-7">
            <motion.div
              layout
              className="relative rounded-3xl border border-white/5 bg-slate-900/40 p-8 md:p-10 shadow-2xl backdrop-blur-md overflow-hidden"
            >
              {/* Top gradient edge */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-teal-500 via-lime-500 to-transparent" />

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                  >
                    <div className="h-14 w-14 rounded-full bg-lime-500/10 flex items-center justify-center text-lime-400 border border-lime-500/20">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Transmission Successful</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                      Your inquiry has been encrypted and routed directly to our commodity desk. An advisor will contact you within 15-30 minutes.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          suppressHydrationWarning
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Baldev Singh"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          suppressHydrationWarning
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. baldev@sukhmanifarms.com"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        suppressHydrationWarning
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +91 98765 43210 / +971 50 123 4567"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Message / Trade Requirement
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        suppressHydrationWarning
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Detail your request (e.g., procurement quota, quality certifications required, domestic vs. export queries)..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      suppressHydrationWarning
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <span className="h-5 w-5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <>
                          Transmit Secure Enquiry
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
