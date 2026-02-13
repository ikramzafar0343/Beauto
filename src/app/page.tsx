"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { 
  Play, 
  ChevronDown, 
  ChevronUp,
  Star,
  Mail,
  ArrowUp,
  MessageSquarePlus,
  PanelLeftClose,
  ArrowUpIcon,
  Sparkles,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Link2,
  Check,
  Globe,
  ArrowRightCircle,
  ExternalLink,
  Moon,
  Sun
} from "lucide-react";
import { AuthButton } from "@/components/layout/auth-button";
import { CinematicOnboarding } from "@/components/onboarding/CinematicOnboarding";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Language } from "@/lib/translations";

const NAV_LINKS = (t: any) => [
  { label: t.nav.agents, href: "#agents" },
  { label: t.nav.demo, href: "/demo" },
  { label: t.nav.pricing, href: "#pricing" },
];

const INTEGRATIONS = [
  { name: "Gmail", logo: "https://logos.composio.dev/api/gmail" },
  { name: "Slack", logo: "https://logos.composio.dev/api/slack" },
  { name: "GitHub", logo: "https://logos.composio.dev/api/github" },
  { name: "Calendar", logo: "https://logos.composio.dev/api/googlecalendar" },
  { name: "Drive", logo: "https://logos.composio.dev/api/googledrive" },
  { name: "Sheets", logo: "https://logos.composio.dev/api/googlesheets" },
  { name: "Instagram", logo: "https://logos.composio.dev/api/instagram" },
  { name: "Facebook", logo: "https://logos.composio.dev/api/facebook" },
  { name: "HubSpot", logo: "https://logos.composio.dev/api/hubspot" },
  { name: "Twitter", logo: "https://logos.composio.dev/api/twitter" },
];

const PERSONAS = [
  { 
    id: "support", 
    label: "Customer Support",
    name: "Aisha",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_e9qcx4e9qcx4e9qc-1766080063714.png?width=8000&height=8000&resize=contain",
    color: "from-orange-500 to-amber-600",
    gradient: "from-orange-500 via-amber-600 to-yellow-700",
    integrations: ["gmail", "zendesk", "intercom", "slack", "hubspot", "whatsapp"],
    description: "Handles tickets, live chat, FAQ responses and customer follow-ups"
  },
  { 
    id: "sales", 
    label: "Sales",
    name: "Marcus",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_2sfngy2sfngy2sfn-1766079943448.png?width=8000&height=8000&resize=contain",
    color: "from-blue-500 to-cyan-600",
    gradient: "from-blue-500 via-indigo-600 to-violet-700",
    integrations: ["hubspot", "salesforce", "pipedrive", "linkedin", "calendly", "gmail"],
    description: "Automates lead generation, CRM updates and follow-up sequences"
  },
  { 
    id: "admin", 
    label: "Admin & Office",
    name: "Sofia",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_76krx876krx876kr-1766079960841.png?width=8000&height=8000&resize=contain",
    color: "from-indigo-500 to-purple-600",
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    integrations: ["gmail", "googlecalendar", "slack", "notion", "googledrive", "zoom"],
    description: "Handles scheduling, emails, documents and team communication"
  },
  { 
    id: "accounting", 
    label: "Accounting",
    name: "James",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_xfhe80xfhe80xfhe-1766079983224.png?width=8000&height=8000&resize=contain",
    color: "from-emerald-500 to-green-600",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    integrations: ["quickbooks", "xero", "stripe", "paypal", "googlesheets", "freshbooks"],
    description: "Manages invoicing, expenses, reports and financial tracking"
    },
    { 
      id: "hr", 
      label: "HR & Recruitment",
      name: "David",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_hswwzghswwzghsww-1766080128781.png?width=8000&height=8000&resize=contain",
      color: "from-violet-500 to-purple-600",
      gradient: "from-orange-500 via-red-600 to-rose-700",
      integrations: ["linkedin", "workday", "bamboohr", "googlecalendar", "slack", "gmail"],
      description: "Streamlines hiring, onboarding and employee management"
    },
  { 
    id: "marketing", 
    label: "Digital Marketer",
    name: "Emma",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_5y0ncy5y0ncy5y0n-1766080149784.png?width=8000&height=8000&resize=contain",
    color: "from-pink-500 to-rose-600",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    integrations: ["instagram", "facebook", "twitter", "tiktok", "googleanalytics", "mailchimp"],
    description: "Automates social media campaigns, ad management and performance tracking"
  },
];

const FAQS = [
  { question: "Does Beauto use Ai?", answer: "Yes! Beauto is powered by advanced AI that helps automate your marketing and business tasks intelligently." },
  { question: "Is Beauto safe to use in my business?", answer: "Short answer: of course it is! Beauto is built specifically for the small and medium businesses that need to optimize and scale." },
  { question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription at any time with no questions asked." },
  { question: "Can Beauto help me with xxxxxx", answer: "Beauto can help with a wide range of marketing and automation tasks. Contact us to discuss your specific needs." },
  { question: "Is there support included?", answer: "Yes, all plans include access to our support team and comprehensive documentation." },
  { question: "What if I have more questions?", answer: "Feel free to reach out to our team through the contact form or email us directly." },
];

const FOOTER_LINKS = {
  main: ["About", "Home", "Features", "Pricing", "Blog"],
  secondary: ["Solutions", "How it works", "About", "Programs", "Blog"],
};

const DEMO_SCENARIOS = {
  social: {
    title: "Social media campaign",
    messages: [
      { role: "user", content: "Create a social media post for my new product" },
      { role: "assistant", content: "Of course! Here's a suggestion for your product launch:\n\n🚀 New! We are so excited to present our latest innovation...", hasImage: true, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
      { role: "user", content: "Can you schedule it to Instagram?" },
      { role: "assistant", content: "Absolutely! I've connected to your Instagram account and scheduled the post for tomorrow at 10:00 AM for optimal engagement. ✅" },
    ]
  },
  email: {
    title: "Email automation",
    messages: [
      { role: "user", content: "Summarize my latest emails from high-priority clients" },
      { role: "assistant", content: "I've scanned your Gmail inbox. Here is a summary of the most important threads:\n\n• Project Update from Acme Corp (Urgent)\n• New partnership inquiry from Zenith Labs\n• Feedback on latest proposal" },
      { role: "user", content: "Draft a reply to Acme Corp using my professional brand voice" },
      { role: "assistant", content: "Draft created in your Gmail. I've kept it professional and addressed the urgency. You can review and sent it from your drafts folder now. 📧" },
    ]
  },
  seo: {
    title: "SEO analysis",
    messages: [
      { role: "user", content: "Analyze my website SEO performance for this month" },
      { role: "assistant", content: "Audit complete! Your organic traffic is up 18%.\n\n• Top keyword: 'Business AI'\n• Page speed improved by 0.4s\n• 5 new backlinks detected 📈" },
      { role: "user", content: "What should I focus on next?" },
      { role: "assistant", content: "Based on the data, I recommend:\n1. Optimizing meta tags for your 'Contact' page\n2. Creating more content around 'Automation'\n3. Fixing 2 crawl errors found 🛠️" },
    ]
  }
};

const PRICING_PLANS = (t: any) => [
  {
    name: t.pricing.starter,
    price: "$50",
    yearlyPrice: "$500",
    description: "Perfect for small businesses getting started with automation.",
    features: [
      "3 integrations (apps)",
      "Onboarding support",
      "Up to 3 licenses",
      "Monthly credit card payment",
      "Add-on: Video support ($10/mo)",
      "License Add-on: $10 / license"
    ],
    cta: t.pricing.cta.starter,
    highlight: false
  },
  {
    name: t.pricing.pro,
    price: "$125",
    yearlyPrice: "$1250",
    description: "Ideal for growing teams needing advanced support and more apps.",
    features: [
      "10 integrations (apps)",
      "Onboarding + Chatagent + Human support",
      "Up to 10 licenses",
      "Monthly credit card payment",
      "Add-on: Video support ($10/mo)",
      "License Add-on: $5 / license"
    ],
    cta: t.pricing.cta.pro,
    highlight: true
  },
  {
    name: t.pricing.enterprise,
    price: t.pricing.custom,
    yearlyPrice: t.pricing.custom,
    description: "Full power automation for large scale operations.",
    features: [
      "908+ integrations (apps)",
      "24/7 Priority human support",
      "Unlimited licenses",
      "Custom payment terms",
      "Video support included",
      "Unlimited scaling"
    ],
    cta: t.pricing.cta.enterprise,
    highlight: false
  }
];

const TOP_10_APPS = [
  { name: "Gmail", id: "gmail", logo: "https://logos.composio.dev/api/gmail", description: "Email automation & smart sorting" },
  { name: "Slack", id: "slack", logo: "https://logos.composio.dev/api/slack", description: "Team communication & notifications" },
  { name: "Instagram", id: "instagram", logo: "https://logos.composio.dev/api/instagram", description: "Social media posting & engagement" },
  { name: "Calendar", id: "googlecalendar", logo: "https://logos.composio.dev/api/googlecalendar", description: "Scheduling & meeting management" },
  { name: "HubSpot", id: "hubspot", logo: "https://logos.composio.dev/api/hubspot", description: "CRM & lead management" },
  { name: "GitHub", id: "github", logo: "https://logos.composio.dev/api/github", description: "Code & repository automation" },
  { name: "Facebook", id: "facebook", logo: "https://logos.composio.dev/api/facebook", description: "Social outreach & marketing" },
  { name: "Sheets", id: "googlesheets", logo: "https://logos.composio.dev/api/googlesheets", description: "Data tracking & reporting" },
  { name: "Stripe", id: "stripe", logo: "https://logos.composio.dev/api/stripe", description: "Payment & billing automation" },
  { name: "Notion", id: "notion", logo: "https://logos.composio.dev/api/notion", description: "Knowledge base & documentation" },
];

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState("marketing");
  const [activeDemo, setActiveDemo] = useState<keyof typeof DEMO_SCENARIOS>("social");
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isCinematicOpen, setIsCinematicOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Handle anchor links (e.g., #pricing)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const currentScenario = DEMO_SCENARIOS[activeDemo];
    if (visibleMessages < currentScenario.messages.length) {
      const timer = setTimeout(() => {
        if (currentScenario.messages[visibleMessages].role === "assistant") {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setVisibleMessages(prev => prev + 1);
          }, 1200);
        } else {
          setVisibleMessages(prev => prev + 1);
        }
      }, visibleMessages === 0 ? 1000 : 2000);
      return () => clearTimeout(timer);
    } else {
      // Demo finished, switch to next one after a delay
      const switchTimer = setTimeout(() => {
        setVisibleMessages(0);
        setActiveDemo(prev => {
          if (prev === "social") return "email";
          if (prev === "email") return "seo";
          return "social";
        });
      }, 5000);
      return () => clearTimeout(switchTimer);
    }
  }, [visibleMessages, activeDemo]);

  const currentPersona = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];
  const currentDemoScenario = DEMO_SCENARIOS[activeDemo];
  const pricingPlans = useMemo(() => PRICING_PLANS(t), [t]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/beauto-logo.png";
  };

  return (
    <main className={`relative min-h-screen bg-white dark:bg-[#0a0a0a] overflow-hidden ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Animated light effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '20s' }} />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s', animationDuration: '25s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-cyan-400/20 via-blue-400/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '22s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-[#343434] dark:text-white tracking-tight">
          Beauto
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS(t).map((link) => (
            <Link 
              key={link.label}
              href={link.href} 
              className="text-[15px] text-[#343434]/70 dark:text-white/70 hover:text-[#343434] dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Language Switcher */}
          <div className="relative group z-[9999]">
            <button className="flex items-center gap-2 text-[15px] text-[#343434]/70 dark:text-white/70 hover:text-[#343434] dark:hover:text-white transition-colors">
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className={`absolute top-full ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-32 bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[99999] overflow-hidden`}>
              {[
                { code: 'en', label: 'English' },
                { code: 'sv', label: 'Svenska' },
                { code: 'da', label: 'Dansk' },
                { code: 'no', label: 'Norsk' },
                { code: 'ar', label: 'العربية' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors ${language === lang.code ? 'text-[#343434] font-bold' : 'text-[#343434]/60 dark:text-white/60'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#343434]/70 dark:text-white/70 hover:text-[#343434] dark:hover:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-all"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        <AuthButton />
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 pt-20 pb-28 max-w-7xl mx-auto">
        <div className="relative">
          {/* Center Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-[52px] md:text-[64px] font-normal text-[#343434] dark:text-white leading-[1.1] tracking-tight animate-fade-in-up">
              {t.hero.title}
            </h1>
            <p className="mt-8 text-lg text-[#343434]/60 dark:text-white/60 leading-relaxed max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t.hero.subtitle}
            </p>
            <div className="flex items-center justify-center gap-4 mt-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={() => {
                  if (user) {
                    router.push("/dashboard");
                  } else {
                    router.push("/auth/sign-in");
                  }
                }}
                className="px-6 py-3 rounded-full bg-[#343434] text-white text-[15px] hover:bg-[#343434]/90 transition-colors"
              >
                {t.hero.cta}
              </button>
              <button 
                onClick={() => setIsCinematicOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white text-[15px] hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a] transition-colors"
              >
                <Play className="w-4 h-4" />
                {t.hero.watch}
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                ].map((face, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-[#d6dfe8] dark:bg-[#27272a]">
                    <Image src={face} alt="Client" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#343434]/60 dark:text-white/60 ml-2">{t.hero.trusted}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Interface - Live Chat Infographic */}
      <section className="px-8 pb-24 max-w-6xl mx-auto">
        <div className="rounded-2xl bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] overflow-hidden shadow-xl">
          <div className="flex h-[650px]">
            {/* Sidebar */}
            <div className={`w-64 bg-white dark:bg-[#0a0a0a] border-r border-[#dae0e2] dark:border-[#27272a] flex flex-col ${language === 'ar' ? 'order-2' : ''}`}>
              <div className="p-4 border-b border-[#dae0e2] dark:border-[#27272a]">
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]">
                  <MessageSquarePlus className="w-4 h-4" />
                  <span className="text-sm font-medium">New chat</span>
                </div>
              </div>
              <div className="flex-1 p-3">
                <div className="space-y-2">
                  <button 
                    onClick={() => { setActiveDemo("social"); setVisibleMessages(0); }}
                    className={`w-full px-3 py-2 rounded-lg transition-colors text-left ${activeDemo === "social" ? "bg-[#d6dfe8] dark:bg-[#27272a]" : "hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50"}`}
                  >
                    <p className="text-sm text-[#343434] dark:text-white truncate">Social media campaign</p>
                    <p className="text-xs text-[#343434]/40 dark:text-white/40">Today</p>
                  </button>
                  <button 
                    onClick={() => { setActiveDemo("email"); setVisibleMessages(0); }}
                    className={`w-full px-3 py-2 rounded-lg transition-colors text-left ${activeDemo === "email" ? "bg-[#d6dfe8] dark:bg-[#27272a]" : "hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50"}`}
                  >
                    <p className="text-sm text-[#343434] dark:text-white truncate">Email automation</p>
                    <p className="text-xs text-[#343434]/40 dark:text-white/40">Yesterday</p>
                  </button>
                  <button 
                    onClick={() => { setActiveDemo("seo"); setVisibleMessages(0); }}
                    className={`w-full px-3 py-2 rounded-lg transition-colors text-left ${activeDemo === "seo" ? "bg-[#d6dfe8] dark:bg-[#27272a]" : "hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50"}`}
                  >
                    <p className="text-sm text-[#343434] dark:text-white truncate">SEO analysis</p>
                    <p className="text-xs text-[#343434]/40 dark:text-white/40">3 days ago</p>
                  </button>
                </div>
              </div>
              <div className="p-3 border-t border-[#dae0e2] dark:border-[#27272a]">
                <p className="text-xs text-[#343434]/40 dark:text-white/40 mb-2">Connected apps</p>
                <div className="flex gap-1">
                  {["gmail", "slack", "facebook"].map(app => (
                    <div key={app} className="w-6 h-6 rounded bg-[#d6dfe8] dark:bg-[#27272a] flex items-center justify-center">
                      <Image 
                        src={`https://logos.composio.dev/api/${app}`} 
                        alt={app} 
                        width={14} 
                        height={14} 
                        unoptimized 
                        onError={handleImageError}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chat */}
            <div className={`flex-1 flex flex-col ${language === 'ar' ? 'order-1' : ''}`}>
              <div className="px-4 py-3 border-b border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] flex items-center gap-3">
                <PanelLeftClose className="w-4 h-4 text-[#343434]/40 dark:text-white/40" />
                <span className="text-sm font-medium text-[#343434] dark:text-white">{currentDemoScenario.title}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-[#0a0a0a]">
                {currentDemoScenario.messages.slice(0, visibleMessages).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    {msg.role === "user" ? (
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl bg-[#d6dfe8] dark:bg-[#27272a] text-[#343434] dark:text-white">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="max-w-[80%] text-[#343434] dark:text-white">
                        <p className="text-sm whitespace-pre-line">{msg.content}</p>
                        {(msg as any).hasImage && (msg as any).imageUrl && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-[#dae0e2] dark:border-[#27272a] max-w-[200px]">
                            <Image 
                              src={(msg as any).imageUrl!}
                              alt="Demo visual"
                              width={200}
                              height={200}
                              className="w-full h-auto object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 text-[#343434]/40 dark:text-white/40">
                      <div className="w-2 h-2 rounded-full bg-[#343434]/40 dark:bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[#343434]/40 dark:bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[#343434]/40 dark:bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a]">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a]">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent text-sm text-[#343434] dark:text-white placeholder:text-[#343434]/40 dark:placeholder:text-white/40 focus:outline-none"
                    readOnly
                  />
                  <div className="p-2 rounded-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]">
                    <ArrowUpIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Smarter Section (Agents) */}
      <section id="agents" className="px-8 py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434]/60 dark:text-white/60 mb-6">
              {t.nav.agents}
            </span>
            <h2 className="text-4xl md:text-5xl font-normal text-[#343434] dark:text-white mb-4">
              {t.agents.title}<br />
              <span className="text-[#343434]/50 dark:text-white/50">{t.agents.subtitle}</span>
            </h2>
            <p className="text-[#343434]/60 dark:text-white/60 max-w-2xl mx-auto">
              {t.agents.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Sales on autopilot */}
            <div className="p-8 rounded-2xl bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:border-[#343434]/20 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#343434] dark:text-white mb-3">{t.agents.sales.title}</h3>
              <p className="text-[#343434]/60 dark:text-white/60 text-sm leading-relaxed">
                {t.agents.sales.description}
              </p>
            </div>

            {/* Creative on autopilot */}
            <div className="row-span-2 p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-[#dae0e2] dark:border-[#27272a] hover:border-[#343434]/20 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#343434] dark:text-white mb-3">{t.agents.creative.title}</h3>
              <p className="text-[#343434]/60 dark:text-white/60 text-sm leading-relaxed mb-6">
                {t.agents.creative.description}
              </p>
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#343434]/60 dark:text-white/60">Content generation</span>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
                  </div>
                  <div className="h-1.5 bg-[#dae0e2] dark:bg-[#27272a] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 w-[85%]" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#343434]/60 dark:text-white/60">Image optimization</span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Processing</span>
                  </div>
                  <div className="h-1.5 bg-[#dae0e2] dark:bg-[#27272a] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 w-[62%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy on autopilot */}
            <div className="p-8 rounded-2xl bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:border-[#343434]/20 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#343434] dark:text-white mb-3">{t.agents.strategy.title}</h3>
              <p className="text-[#343434]/60 dark:text-white/60 text-sm leading-relaxed">
                {t.agents.strategy.description}
              </p>
            </div>

            {/* Analytics on autopilot */}
            <div className="p-8 rounded-2xl bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:border-[#343434]/20 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#343434] dark:text-white mb-3">{t.agents.analytics.title}</h3>
              <p className="text-[#343434]/60 dark:text-white/60 text-sm leading-relaxed">
                {t.agents.analytics.description}
              </p>
            </div>

            {/* Admin on autopilot */}
            <div className="p-8 rounded-2xl bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:border-[#343434]/20 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#343434] dark:text-white mb-3">{t.agents.admin.title}</h3>
              <p className="text-[#343434]/60 dark:text-white/60 text-sm leading-relaxed">
                {t.agents.admin.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Moved to Middle) */}
      <section id="pricing" className="px-8 py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434]/60 dark:text-white/60 mb-6">
              {t.pricing.title}
            </span>
            <h2 className="text-4xl md:text-5xl font-normal text-[#343434] dark:text-white mb-4">
              {t.pricing.subtitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative p-8 rounded-[40px] border ${plan.highlight ? 'border-[#343434] dark:border-white shadow-2xl scale-105 z-10 bg-[#f8f9fa] dark:bg-[#1a1a1a]' : 'border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a]'} transition-all`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider">
                    {t.pricing.mostPopular}
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-[#343434] dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#343434] dark:text-white">{plan.price}</span>
                    {plan.price !== t.pricing.custom && <span className="text-[#343434]/40 dark:text-white/40 text-sm">{t.pricing.mo}</span>}
                  </div>
                  {plan.price !== t.pricing.custom && (
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-1">
                      {plan.yearlyPrice} {t.pricing.yr}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-[#343434]/60 dark:text-white/60">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-[#343434]/70 dark:text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (plan.name === "Enterprise") {
                      // Handle enterprise contact
                      return;
                    }
                    router.push(`/pricing`);
                  }}
                  className={`block w-full py-4 rounded-2xl text-center text-sm font-bold transition-all ${plan.highlight ? 'bg-[#343434] text-white hover:bg-[#343434]/90' : 'border border-[#dae0e2] text-[#343434] hover:bg-[#f8f9fa]'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is Beauto for you Section - Industry Carousel */}
      <section className="px-8 py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#343434] dark:text-white mb-6">
              {t.industries.title}
            </h2>
            <p className="text-[#343434]/60 dark:text-white/60 max-w-2xl mx-auto text-lg">
              {t.industries.subtitle}
            </p>
          </div>

          {/* Industry Carousel */}
          <div className="relative overflow-hidden carousel-fade-edges">
            <div className={`flex gap-6 ${language === 'ar' ? 'animate-scroll-right' : 'animate-scroll-left'}`} style={{ width: "fit-content" }}>
              {[
                { name: "Hospitality", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop" },
                { name: "Restaurant", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=800&fit=crop" },
                { name: "Real Estate", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=800&fit=crop" },
                { name: "Fitness & Wellness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=800&fit=crop" },
                { name: "Retail", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop" },
                { name: "Construction", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=800&fit=crop" },
                { name: "Automotive", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=800&fit=crop" },
                { name: "Healthcare", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=800&fit=crop" },
                { name: "Law Firms", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=800&fit=crop" },
                { name: "SaaS & Software", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=800&fit=crop" },
                { name: "E-commerce", image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=800&fit=crop" },
                { name: "Creative Studio", image: "https://images.unsplash.com/photo-1452784444945-3f422708fe5e?w=600&h=800&fit=crop" },
                { name: "Logistics", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=800&fit=crop" },
                { name: "Non-profits", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=800&fit=crop" },
                { name: "Financial Services", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=800&fit=crop" },
              ].map((industry, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 w-[320px] group cursor-pointer"
                >
                  <div className="relative h-[450px] rounded-[40px] overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
                    <Image 
                      src={industry.image}
                      alt={industry.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="text-white text-2xl font-bold">{industry.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Tags - Continuous Scrolling Carousel */}
          <div className="relative overflow-hidden mt-16">
            <div className="flex gap-4 animate-scroll-continuous" style={{ width: "fit-content" }}>
              {/* Duplicate array for seamless loop */}
              {[
                "Hospitality", "Restaurant", "Real Estate", "Fitness & Wellness", "Retail", "Construction", "Automotive", "Healthcare", "Law Firms", "SaaS", "E-commerce", "Photography", "Logistics", "Non-profits", "Finance"
              ].concat([
                "Hospitality", "Restaurant", "Real Estate", "Fitness & Wellness", "Retail", "Construction", "Automotive", "Healthcare", "Law Firms", "SaaS", "E-commerce", "Photography", "Logistics", "Non-profits", "Finance"
              ]).map((industry, idx) => (
                <span 
                  key={idx}
                  className="flex-shrink-0 px-6 py-3 rounded-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-[15px] font-medium whitespace-nowrap"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Team Section */}
      <section className="px-8 py-24 bg-white dark:bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-[#343434]/5 dark:bg-white/5 border border-[#343434]/10 dark:border-white/10 text-sm text-[#343434]/60 dark:text-white/60 mb-6 backdrop-blur-xl">
              {t.agents.meetTeam}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#343434] dark:text-white mb-4 tracking-tight">
              {t.agents.workforce}<br />
              <span className="text-[#343434]/40 dark:text-white/40">{t.agents.readyScale}</span>
            </h2>
            <p className="text-[#343434]/50 dark:text-white/50 max-w-2xl mx-auto text-lg">
              {t.agents.specialized}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PERSONAS.map((persona, index) => (
              <div 
                key={persona.id}
                className="group relative"
              >
                <div className="relative p-8 rounded-[40px] bg-white dark:bg-white/5 border border-[#dae0e2] dark:border-white/10 hover:border-[#343434]/20 dark:hover:border-white/20 transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-2xl hover:scale-[1.02] overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-[#343434]/5 dark:to-white/5 rounded-bl-[100px]" />
                  
                  <div className="relative mb-8 w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                    <Image 
                      src={persona.avatar} 
                      alt={t.personas[persona.id as keyof typeof t.personas]?.name || persona.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-[#343434] dark:text-white">
                        {t.personas[persona.id as keyof typeof t.personas]?.name || persona.name}
                      </h3>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${persona.color} text-white text-[10px] font-bold uppercase tracking-wider`}>
                        {t.personas[persona.id as keyof typeof t.personas]?.role || persona.label}
                      </div>
                    </div>
                    
                    <p className="text-[#343434]/60 dark:text-white/50 text-sm leading-relaxed mb-6">
                      {t.personas[persona.id as keyof typeof t.personas]?.description || persona.description}
                    </p>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {persona.integrations.map(app => (
                          <div key={app} className="w-9 h-9 rounded-xl bg-[#f8f9fa] dark:bg-white/5 border border-[#dae0e2] dark:border-white/10 flex items-center justify-center hover:scale-110 transition-transform">
                            <Image 
                              src={`https://logos.composio.dev/api/${app}`} 
                              alt={app} 
                              width={20} 
                              height={20} 
                              unoptimized 
                              onError={handleImageError}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Link 
                        href="/chat"
                        className="w-full py-4 rounded-2xl bg-[#343434] dark:bg-white text-white dark:text-black font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-[#343434]/90 dark:group-hover:bg-white/90 transition-all"
                      >
                        {t.agents.startWorking} {persona.name}
                        <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => {
                if (user) {
                  router.push("/dashboard");
                } else {
                  router.push("/auth/sign-in");
                }
              }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[#343434] dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition-all shadow-xl hover:shadow-[#343434]/20 dark:hover:shadow-white/10"
            >
              {t.agents.startFree}
              <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Top 10 Apps Section (Replacing Marketplace) */}
      <section className="px-8 py-24 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434]/60 dark:text-white/60 mb-6">
              Most popular
            </span>
            <h2 className="text-4xl md:text-5xl font-normal text-[#343434] dark:text-white mb-4">
              {t.top10.title}
            </h2>
            <p className="text-[#343434]/60 dark:text-white/60 max-w-2xl mx-auto">
              {t.top10.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-12">
            {TOP_10_APPS.map((app) => (
              <div 
                key={app.name}
                className="group p-6 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center p-3">
                  <Image 
                    src={app.logo} 
                    alt={app.name} 
                    width={40} 
                    height={40} 
                    unoptimized 
                    onError={handleImageError}
                  />
                </div>
                <h3 className="text-sm font-bold text-[#343434] dark:text-white text-center mb-1">{app.name}</h3>
                <p className="text-[10px] text-[#343434]/40 dark:text-white/40 text-center line-clamp-2">{app.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-[15px] hover:bg-[#343434]/90 dark:hover:bg-white/90 transition-colors shadow-lg"
            >
              {t.top10.seeAll}
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="px-8 py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#343434] dark:text-white mb-4">
              {t.trusted.title.split('Business')[0]}Business<br />
              {t.trusted.title.split('Business')[1]}
            </h2>
            <p className="text-[#343434]/60 dark:text-white/60 max-w-2xl mx-auto">
              {t.trusted.subtitle}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Row 1 */}
            <div className="col-span-1 p-8 rounded-3xl bg-[#d6dfe8]/60 dark:bg-[#1a1a1a] flex flex-col justify-end min-h-[200px]">
              <div className="text-5xl font-semibold text-[#343434] dark:text-white mb-1">$289m</div>
              <div className="text-[#343434]/60 dark:text-white/60">{t.trusted.savedValue}</div>
            </div>
            <div className="col-span-1 p-6 rounded-3xl bg-[#d6dfe8]/60 dark:bg-[#1a1a1a] flex flex-col justify-end">
                <div className="font-medium text-[#343434] dark:text-white">John Doe</div>
                <div className="text-sm text-[#343434]/60 dark:text-white/60">CEO at Tech Solutions</div>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-[#343434]/30 dark:text-white/30" />)}
              </div>
            </div>
            <div className="col-span-1 p-8 rounded-3xl bg-[#d6dfe8]/60 dark:bg-[#1a1a1a] flex flex-col justify-center items-center">
              <div className="text-5xl font-semibold text-[#343434] dark:text-white mb-1">4.8</div>
              <div className="text-[#343434]/60 dark:text-white/60">{t.trusted.trustpilot}</div>
            </div>

            {/* Row 2 */}
            <div className="col-span-1 p-8 rounded-3xl bg-[#d6dfe8]/60 dark:bg-[#1a1a1a] flex flex-col justify-center items-center">
              <div className="text-5xl font-semibold text-[#343434] dark:text-white mb-1">42</div>
              <div className="text-[#343434]/60 dark:text-white/60">{t.trusted.countries}</div>
            </div>
            <div className="col-span-1 p-6 rounded-3xl bg-[#d6dfe8]/60 dark:bg-[#1a1a1a] flex flex-col justify-end">
                <div className="font-medium text-[#343434] dark:text-white">Sarah Smith</div>
                <div className="text-sm text-[#343434]/60 dark:text-white/60">Founder at GlowUp</div>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-[#343434]/30 dark:text-white/30" />)}
              </div>
            </div>
            <div className="col-span-1 p-6 rounded-3xl bg-[#d6dfe8]/60 dark:bg-[#1a1a1a] flex flex-col justify-end">
                <div className="font-medium text-[#343434] dark:text-white">Alex Chen</div>
                <div className="text-sm text-[#343434]/60 dark:text-white/60">COO at ScaleX</div>
              <div className="flex gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-[#343434]/30 dark:text-white/30" />)}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-2.5 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white text-sm hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a] transition-colors">
              {t.trusted.testimonials}
            </button>
          </div>
        </div>
      </section>

      {/* Plug n Play Section */}
      <section className="px-8 py-24 max-w-7xl mx-auto text-center bg-white dark:bg-[#0a0a0a]">
        <h2 className="text-4xl md:text-5xl font-semibold text-[#343434] dark:text-white mb-12 italic">
          {t.promise.title.split(',')[0]},<br />
          {t.promise.title.split(',')[1]}
        </h2>
        
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#dae0e2] dark:border-[#27272a]">
          <Image 
            src="https://beauto-radiant-site.lovable.app/assets/brand-promise-images-CxWMxERY.png"
            alt="Beauto brand promise"
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
            unoptimized
          />
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <Link 
            href="/demo"
            className="inline-flex px-8 py-4 rounded-full bg-[#343434] text-white text-lg font-medium hover:bg-[#343434]/90 transition-all hover:scale-105"
          >
            {t.hero.cta}
          </Link>
        </div>
        </section>
  
        {/* Working should be fun Section */}
        <section className="px-8 py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-normal tracking-tight text-[#343434] dark:text-white mb-6">
                {t.promise.workingFun.split('be')[0]} <span className="italic italic-serif">{t.promise.workingFun.split('be')[1]}</span>
              </h2>
              <p className="text-lg text-[#343434]/60 dark:text-white/60 max-w-2xl mx-auto">
                {t.promise.description}
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Skarmavbild-2025-11-19-kl.-20.28.46-1766378646568.png?width=8000&height=8000&resize=contain",
                "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Skarmavbild-2025-11-19-kl.-20.36.14-1766378646564.png?width=8000&height=8000&resize=contain",
                "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Skarmavbild-2025-11-19-kl.-20.36.41-1766378646662.png?width=8000&height=8000&resize=contain",
                "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Skarmavbild-2025-11-19-kl.-20.40.30-1766378670367.png?width=8000&height=8000&resize=contain",
                "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Skarmavbild-2025-11-19-kl.-20.40.52-1766378670089.png?width=8000&height=8000&resize=contain",
                "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Skarmavbild-2025-11-19-kl.-20.41.30-1766378670122.png?width=8000&height=8000&resize=contain"
              ].map((src, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-square rounded-[48px] overflow-hidden shadow-xl group border border-[#dae0e2]/50 dark:border-white/5"
                >
                  <Image 
                    src={src}
                    alt={`Working should be fun ${idx + 1}`}
                    fill
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    unoptimized
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      {/* AI Consultant Banner (Redesigned as Fashion Banner) */}
      <section className="px-8 py-12 relative overflow-hidden group">
        <div className="max-w-6xl mx-auto relative h-[350px] md:h-[450px] rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-slate-900">
          {/* Background Image - High end fashion aesthetic */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=900&fit=crop" 
              alt="Fashion luxury background" 
              fill 
              className="object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-1000"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center px-12 md:px-20 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4 backdrop-blur-md">
                Precision & Style
              </span>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-[0.9] tracking-tighter">
                {t.consultant.title.split('plan')[0]}<br />
                <span className="text-blue-500 italic">perfect</span> fit.
              </h2>
              <p className="text-white/60 text-base md:text-lg mb-8 leading-relaxed max-w-md">
                {t.consultant.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    window.location.href = `/consultant?lang=${language}`;
                  }}
                  className="group/btn relative px-8 py-4 bg-white text-black font-bold text-base rounded-full overflow-hidden transition-all hover:pr-12"
                >
                  <span className="relative z-10">{t.consultant.cta}</span>
                  <ArrowRightCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 translate-x-4 group-hover/btn:translate-x-0 text-blue-600" />
                </button>
                
                <button className="px-8 py-4 border border-white/20 text-white font-bold text-base rounded-full backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  Learn how it works
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Floating elements for fashion feel */}
          <div className="absolute top-10 right-10 w-40 h-40 border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
          <div className="absolute bottom-1/4 right-20 w-32 h-[1px] bg-white/20 rotate-45 pointer-events-none" />
          <div className="absolute bottom-1/4 right-20 w-32 h-[1px] bg-white/20 -rotate-45 pointer-events-none" />
        </div>
      </section>
  
        {/* FAQ Section */}
      <section className="px-8 py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-start gap-24 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="shrink-0">
              <h2 className="text-4xl font-semibold text-[#343434] dark:text-white">
                {t.faqs.title}
              </h2>
            </div>

            <div className="flex-1 divide-y divide-[#dae0e2] dark:divide-[#27272a]">
              {[
                { q: t.faqs.q1, a: t.faqs.a1 },
                { q: t.faqs.q2, a: t.faqs.a2 },
                { q: t.faqs.q3, a: t.faqs.a3 },
                { q: t.faqs.q4, a: t.faqs.a4 },
                { q: t.faqs.q5, a: t.faqs.a5 },
                { q: t.faqs.q6, a: t.faqs.a6 },
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="py-4"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-[#343434] dark:text-white font-medium">{faq.q}</span>
                    <div className="w-8 h-8 rounded-full border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center ml-4 shrink-0">
                      <ArrowRight className={`w-4 h-4 text-[#343434]/50 dark:text-white/50 transition-transform ${openFaq === index ? "rotate-90" : language === 'ar' ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {openFaq === index && (
                    <div className="mt-3">
                      <p className="text-[#343434]/60 dark:text-white/60 text-sm">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-16 bg-[#d6dfe8]/30 dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-[#343434] dark:text-white mb-6">Beauto</div>
              <h3 className="text-xl font-medium text-[#343434] dark:text-white mb-2">Stay connected</h3>
              <p className="text-[#343434]/60 dark:text-white/60 text-sm mb-4">Newsletter</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white placeholder:text-[#343434]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                />
                <button className="p-2.5 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90 transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <ul className="space-y-3">
                {FOOTER_LINKS.main.map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-[#343434]/60 dark:text-white/60 hover:text-[#343434] dark:hover:text-white transition-colors text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ul className="space-y-3">
                {FOOTER_LINKS.secondary.map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-[#343434]/60 dark:text-white/60 hover:text-[#343434] dark:hover:text-white transition-colors text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-[#dae0e2] dark:border-[#27272a]">
            <p className="text-[#343434]/50 dark:text-white/50 text-sm">Copyright © Beauto 2025</p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-[#343434]/60 dark:text-white/60 hover:text-[#343434] dark:hover:text-white transition-colors text-sm"
            >
              Back to top
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      <CinematicOnboarding 
        isOpen={isCinematicOpen} 
        onClose={() => setIsCinematicOpen(false)} 
      />
    </main>
  );
}
