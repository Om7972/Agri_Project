import React from 'react';
import Navbar from '@/components/navbar/Navbar';
import Hero from '@/components/hero/Hero';
import MarketRates from '@/components/market-rates/MarketRates';
import FeaturedProducts from '@/components/products/FeaturedProducts';
import MarketplacePreview from '@/components/marketplace/MarketplacePreview';
import SubscriptionPlans from '@/components/pricing/SubscriptionPlans';
import Testimonials from '@/components/testimonials/Testimonials';
import ContactForm from '@/components/contact/ContactForm';
import Footer from '@/components/footer/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Page() {
  return (
    <>
      {/* Premium Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1 w-full max-w-7xl mx-auto relative">
        {/* Hero Section */}
        <Hero />

        {/* Live Market Commodity Rates */}
        <MarketRates />

        {/* Premium Products & Escrow Bid Portal */}
        <FeaturedProducts />

        {/* Double-Sided Marketplace Dashboard Preview */}
        <MarketplacePreview />

        {/* Glassmorphic Subscription Plans */}
        <SubscriptionPlans />

        {/* Testimonials Carousel */}
        <Testimonials />

        {/* Direct Contact Form */}
        <ContactForm />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
