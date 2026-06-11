'use client';

import React, { useState } from 'react';
import { testimonialsData } from '@/data/marketData';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, MessageSquare } from 'lucide-react';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: 'easeIn',
      },
    }),
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  const currentTestimonial = testimonialsData[currentIndex];

  return (
    <section className="py-20 px-6 relative overflow-hidden bg-slate-950/10">
      <div className="mx-auto max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-400">
            <MessageSquare className="h-3.5 w-3.5" />
            Global Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted By{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Market Leaders
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Read how farm cooperatives, bulk distributors, and multinational import firms leverage MandiPrime for risk-free commodity trading.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex flex-col items-center justify-center min-h-[360px] md:min-h-[320px]">
          
          {/* Slide Window */}
          <div className="w-full max-w-3xl overflow-hidden relative px-4 md:px-12 py-6">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentTestimonial.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="rounded-3xl border border-white/5 bg-slate-900/40 p-8 md:p-12 shadow-2xl backdrop-blur-md flex flex-col md:flex-row gap-8 items-center text-left"
              >
                {/* Quote symbol */}
                <div className="absolute top-6 right-8 text-white/5 pointer-events-none">
                  <Quote className="h-24 w-24 stroke-[1]" />
                </div>

                {/* Left: User Avatar Info */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4 min-w-[160px]">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden p-[1px] bg-gradient-to-tr from-teal-500 to-lime-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="h-full w-full object-cover rounded-[15px]"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-snug">{currentTestimonial.name}</h4>
                    <p className="text-xs text-teal-400 mt-0.5">{currentTestimonial.role}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
                      {currentTestimonial.company}
                    </p>
                  </div>
                </div>

                {/* Right: Quotation & Stars */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
                    &ldquo;{currentTestimonial.quote}&rdquo;
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-slate-500 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded">
                    📍 Verified Trade Desk Location: {currentTestimonial.location}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              suppressHydrationWarning
              onClick={handlePrev}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-teal-500/30 transition-all active:scale-90"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Indicators */}
            <div className="flex gap-2">
              {testimonialsData.map((_, idx) => (
                <button
                  suppressHydrationWarning
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-350 ${
                    idx === currentIndex ? 'w-6 bg-teal-400' : 'w-2 bg-slate-700'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              suppressHydrationWarning
              onClick={handleNext}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-teal-500/30 transition-all active:scale-90"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
