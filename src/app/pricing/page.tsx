"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Moon, Sun } from "lucide-react";
import { AuthButton } from "@/components/layout/auth-button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const plans = [
  {
    name: "Starter",
    price: "$50",
    period: "/mo",
    yearlyPrice: "$500",
    yearlyPeriod: "/yr (billed annually)",
    description: "Perfect for small businesses getting started with automation.",
    features: [
      "3 integrations (apps)",
      "Onboarding support",
      "Up to 3 licenses",
      "Monthly credit card payment",
      "Add-on: Video support ($10/mo)",
      "License Add-on: $10 / license"
    ],
    cta: "Start Starter",
    popular: false,
  },
  {
    name: "Pro",
    price: "$125",
    period: "/mo",
    yearlyPrice: "$1250",
    yearlyPeriod: "/yr (billed annually)",
    description: "Ideal for growing teams needing advanced support and more apps.",
    features: [
      "10 integrations (apps)",
      "Onboarding + Chatagent + Human support",
      "Up to 10 licenses",
      "Monthly credit card payment",
      "Add-on: Video support ($10/mo)",
      "License Add-on: $5 / license"
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    yearlyPrice: "",
    yearlyPeriod: "",
    description: "Full power automation for large scale operations.",
    features: [
      "908+ integrations (apps)",
      "24/7 Priority human support",
      "Unlimited licenses",
      "Custom payment terms",
      "Video support included",
      "Unlimited scaling"
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isYearly, setIsYearly] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handlePlanClick = (planName: string) => {
    if (planName === "Enterprise") {
      setShowContactModal(true);
      return;
    }

    // For Starter and Pro, redirect to checkout
    if (isAuthenticated) {
      router.push(`/checkout?plan=${planName.toLowerCase()}`);
    } else {
      router.push(`/auth/sign-up?plan=${planName.toLowerCase()}`);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just log it and show success
      console.log("Contact form submitted:", contactForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setContactForm({ name: "", email: "", company: "", message: "" });
      setShowContactModal(false);
      
      // Show success message (you can add a toast notification here)
      alert("Thank you for your interest! Our sales team will contact you shortly.");
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback translations if context fails
  const pricingTitle = t?.pricing?.title || "Simple, Transparent Pricing";
  const pricingSubtitle = t?.pricing?.subtitle || "Choose the plan that's right for you. All plans include our core features with no hidden fees.";
  const mostPopular = t?.pricing?.mostPopular || "Most Popular";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-[#dae0e2] dark:border-[#27272a] sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#343434] dark:text-white">
            Beauto
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-[#343434] dark:text-white" />
              ) : (
                <Moon className="w-5 h-5 text-[#343434] dark:text-white" />
              )}
            </button>
            <Link href="/marketplace" className="text-[#343434]/70 dark:text-white/70 hover:text-[#343434] dark:hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/auth/sign-in" className="text-[#343434]/70 dark:text-white/70 hover:text-[#343434] dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          {/* Pricing Plans Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white/70 text-sm font-medium">
              Pricing plans
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#343434] dark:text-white mb-4">
            Choose your automation power.
          </h1>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-[#343434] dark:text-white font-medium' : 'text-[#343434]/60 dark:text-white/60'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? 'bg-[#343434] dark:bg-white' : 'bg-[#dae0e2] dark:bg-[#27272a]'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-[#0a0a0a] transition-transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-[#343434] dark:text-white font-medium' : 'text-[#343434]/60 dark:text-white/60'}`}>
              Yearly
              <span className="ml-1 text-green-500 text-xs">(Save 17%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-[#343434] dark:border-white/20 bg-white dark:bg-[#1a1a1a] shadow-md"
                  : "border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] px-4 py-1 rounded-full text-xs font-bold uppercase">
                    {mostPopular}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#343434] dark:text-white mb-3">
                  {plan.name}
                </h3>
                <div className="mb-3">
                  {plan.price === "Custom" ? (
                    <span className="text-4xl font-bold text-[#343434] dark:text-white">
                      {plan.price}
                    </span>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[#343434] dark:text-white">
                          {isYearly ? plan.yearlyPrice : plan.price}
                        </span>
                        <span className="text-[#343434]/60 dark:text-white/60 text-lg ml-1">
                          {isYearly ? "/yr" : plan.period}
                        </span>
                      </div>
                      {isYearly && (
                        <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                          {plan.price} {plan.period}
                        </p>
                      )}
                      {!isYearly && (
                        <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                          {plan.yearlyPrice} {plan.yearlyPeriod}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[#343434]/60 dark:text-white/60 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#343434] dark:text-white text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full transition-all h-11 ${
                  plan.popular
                    ? "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90 font-medium"
                    : plan.name === "Enterprise"
                    ? "bg-white dark:bg-[#1a1a1a] text-[#343434] dark:text-white border-2 border-[#343434] dark:border-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] font-medium"
                    : "bg-[#f8f9fa] dark:bg-[#1a1a1a] text-[#343434] dark:text-white border border-[#dae0e2] dark:border-[#27272a] hover:bg-[#dae0e2] dark:hover:bg-[#27272a] font-medium"
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#343434] dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#343434] dark:text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-[#343434]/60 dark:text-white/60">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#343434] dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-[#343434]/60 dark:text-white/60">
                We accept all major credit cards and process payments securely through Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#343434] dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-[#343434]/60 dark:text-white/60">
                Yes! All plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#343434] dark:text-white mb-2">
                What happens if I exceed my plan limits?
              </h3>
              <p className="text-[#343434]/60 dark:text-white/60">
                We'll notify you before you reach your limits. You can upgrade your plan or purchase add-ons to continue using the service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Sales Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#343434] dark:text-white">
              Contact Sales
            </DialogTitle>
            <DialogDescription className="text-[#343434]/60 dark:text-white/60">
              Get in touch with our sales team to discuss Enterprise pricing and custom solutions for your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#343434] dark:text-white">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#343434] dark:text-white">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="john@company.com"
                  required
                  className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-[#343434] dark:text-white">
                  Company Name
                </Label>
                <Input
                  id="company"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-[#343434] dark:text-white">
                  Message *
                </Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell us about your automation needs..."
                  required
                  rows={4}
                  className="bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContactModal(false)}
                className="border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
