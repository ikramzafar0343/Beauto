"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side: Content with Gradient */}
      <div className="flex-1 bg-gradient-to-br from-beauto-navy via-beauto-dark to-beauto-coral flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-4 mb-8 lg:mb-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <Image 
                  src="/beauto-logo.png" 
                  alt="Beauto" 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Beauto</span>
            </Link>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal text-white leading-tight mb-4 sm:mb-6">
              See how Beauto can transform your business
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
              Get a personalized demo and discover how our AI agents can automate your marketing, save you time, and help you grow faster than ever before.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side: Form with Cream Background */}
      <div className="flex-1 bg-beauto-cream flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 sm:mb-8">
            <div className="w-14 h-14 bg-beauto-coral rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-beauto-dark mb-3">
              Book Your Demo
            </h2>
            <p className="text-beauto-dark/70 text-base sm:text-lg">
              Let's start your journey to effortless entrepreneurship
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-beauto-dark">Your name *</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-beauto-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-beauto-coral/50 transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-beauto-dark">Email address *</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-beauto-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-beauto-coral/50 transition-all"
                placeholder="john@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-beauto-dark">Company</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-beauto-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-beauto-coral/50 transition-all"
                placeholder="Your Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-beauto-dark">Tell us about your business</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-beauto-dark/10 bg-white focus:outline-none focus:ring-2 focus:ring-beauto-coral/50 transition-all min-h-[100px] resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/" className="flex-1">
                <button className="w-full py-3 rounded-xl border border-beauto-dark/10 text-beauto-dark hover:bg-beauto-dark/5 transition-all">
                  Back to home
                </button>
              </Link>
              <button className="flex-1 py-3 rounded-xl bg-beauto-dark text-white font-semibold hover:bg-beauto-navy transition-all shadow-lg shadow-beauto-dark/10">
                Book demo
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
