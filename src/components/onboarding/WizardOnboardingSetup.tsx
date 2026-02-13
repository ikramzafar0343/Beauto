"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ArrowRight, ArrowLeft, Check, Sparkles,
  Loader2, CheckCircle2, Globe, FileText, Upload
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface WizardOnboardingSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: OnboardingData) => void;
}

interface OnboardingData {
  persona: string;
  personaName: string;
  connectedPlatforms: string[];
  websiteUrl?: string;
  crawledContent?: string;
  companyName?: string;
}

interface Persona {
  id: string;
  label: string;
  name: string;
  avatar: string;
  color: string;
  integrations: string[];
  totalAppsCount: number;
  description: string;
}

const PERSONAS: Persona[] = [
  { 
    id: "support", 
    label: "Customer Support",
    name: "Aisha",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_e9qcx4e9qcx4e9qc-1766080063714.png?width=8000&height=8000&resize=contain",
    color: "from-orange-500 to-amber-600",
    integrations: ["gmail", "zendesk", "intercom", "slack", "hubspot", "whatsapp"],
    totalAppsCount: 64,
    description: "Handles tickets, live chat, FAQ responses and customer follow-ups",
  },
  { 
    id: "sales", 
    label: "Sales",
    name: "Marcus",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_2sfngy2sfngy2sfn-1766079943448.png?width=8000&height=8000&resize=contain",
    color: "from-blue-500 to-cyan-600",
    integrations: ["hubspot", "salesforce", "pipedrive", "linkedin", "calendly", "gmail"],
    totalAppsCount: 128,
    description: "Automates lead generation, CRM updates and follow-up sequences",
  },
  { 
    id: "admin", 
    label: "Admin & Office",
    name: "Sofia",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_76krx876krx876kr-1766079960841.png?width=8000&height=8000&resize=contain",
    color: "from-indigo-500 to-purple-600",
    integrations: ["gmail", "googlecalendar", "slack", "notion", "googledrive", "zoom"],
    totalAppsCount: 212,
    description: "Handles scheduling, emails, documents and team communication",
  },
  { 
    id: "accounting", 
    label: "Accounting",
    name: "James",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_xfhe80xfhe80xfhe-1766079983224.png?width=8000&height=8000&resize=contain",
    color: "from-emerald-500 to-green-600",
    integrations: ["quickbooks", "xero", "stripe", "paypal", "googlesheets", "freshbooks"],
    totalAppsCount: 86,
    description: "Manages invoicing, expenses, reports and financial tracking",
    },
    { 
      id: "hr", 
      label: "HR & Recruitment",
      name: "David",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_hswwzghswwzghsww-1766080128781.png?width=8000&height=8000&resize=contain",
      color: "from-violet-500 to-purple-600",
      integrations: ["linkedin", "workday", "bamboohr", "googlecalendar", "slack", "gmail"],
      totalAppsCount: 92,
      description: "Streamlines hiring, onboarding and employee management",
    },
  { 
    id: "marketing", 
    label: "Digital Marketer",
    name: "Emma",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_5y0ncy5y0ncy5y0n-1766080149784.png?width=8000&height=8000&resize=contain",
    color: "from-pink-500 to-rose-600",
    integrations: ["instagram", "facebook", "twitter", "tiktok", "googleanalytics", "mailchimp"],
    totalAppsCount: 154,
    description: "Automates social media campaigns, ad management and performance tracking",
  },
];

export function WizardOnboardingSetup({ isOpen, onClose, onComplete }: WizardOnboardingSetupProps) {
  const [step, setStep] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [wantsCrawl, setWantsCrawl] = useState<boolean | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [crawling, setCrawling] = useState(false);
  const [crawledData, setCrawledData] = useState<{
    companyName?: string;
    description?: string;
    brandVoice?: string;
    targetAudience?: string;
    colors?: string[];
    logo?: string;
    crawledContent?: string;
  } | null>(null);

  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    const data: OnboardingData = {
      persona: selectedPersona?.id || "",
      personaName: selectedPersona?.name || "",
      connectedPlatforms,
      websiteUrl: wantsCrawl ? websiteUrl : undefined,
      crawledContent: crawledData?.crawledContent,
      companyName: crawledData?.companyName,
    };
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onComplete) {
      onComplete(data);
    }
    setIsCompleting(false);
    onClose();
  };

  const connectPlatform = async (platformId: string) => {
    setConnectingPlatform(platformId);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const res = await fetch("/api/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user?.id,
          toolkit: platformId 
        }),
      });
      const data = await res.json();
      
      if (data.redirectUrl) {
        window.open(data.redirectUrl, "_blank", "width=600,height=700");
        
        // Start polling for connection status
        const pollInterval = setInterval(async () => {
          if (!user?.id) return;
          try {
            const checkRes = await fetch(`/api/composio/toolkits/check-connection?userId=${user.id}&toolkit=${platformId}`);
            const checkData = await checkRes.json();
            if (checkData.connected) {
              setConnectedPlatforms(prev => [...prev, platformId]);
              clearInterval(pollInterval);
            }
          } catch (e) {
            console.error("Polling error:", e);
          }
        }, 3000);
        
        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
      }
    } catch (error) {
      console.error("Failed to connect platform:", error);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleCrawl = async () => {
    if (!websiteUrl) return;
    setCrawling(true);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const data = await res.json();
      if (data.companyName) {
        setCrawledData({
          companyName: data.companyName,
          description: data.description,
          brandVoice: data.brandVoice,
          targetAudience: data.targetAudience,
          colors: data.colors,
          logo: data.logo,
          crawledContent: data.pages?.map((p: { title: string; content: string }) => `${p.title}\n${p.content}`).join("\n\n") || "",
        });
      }
    } catch (error) {
      console.error("Crawl failed:", error);
    } finally {
      setCrawling(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selectedPersona !== null;
      case 1: return true;
      case 2: return wantsCrawl !== null && (wantsCrawl === false || (websiteUrl !== "" && crawledData !== null));
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#343434] dark:text-white mb-3">Choose your AI Assistant</h2>
              <p className="text-base text-[#343434]/60 dark:text-white/60">Every assistant has unique specialized knowledge and integrations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PERSONAS.map((persona, idx) => {
                const isSelected = selectedPersona?.id === persona.id;
                return (
                  <motion.button
                    key={persona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedPersona(persona)}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                      isSelected
                        ? "border-[#343434] dark:border-white bg-[#343434]/5 dark:bg-white/10 scale-[1.02]"
                        : "border-[#343434]/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#343434]/30 dark:hover:border-white/30 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <Image 
                          src={persona.avatar}
                          alt={persona.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-[#343434] dark:text-white">{persona.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${persona.color} text-white`}>
                            {persona.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#343434]/60 dark:text-white/60 line-clamp-2 mb-3">
                          {persona.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {persona.integrations.slice(0, 4).map((app) => (
                            <div 
                              key={app} 
                              className="w-6 h-6 rounded-md bg-[#f8f9fa] dark:bg-[#27272a] border border-[#dae0e2] dark:border-[#3f3f46] flex items-center justify-center"
                              title={app}
                            >
                              <Image 
                                src={`https://logos.composio.dev/api/${app}`}
                                alt={app}
                                width={14}
                                height={14}
                                unoptimized
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                          {persona.integrations.length > 4 && (
                            <div className="px-1.5 h-6 rounded-md bg-[#f8f9fa] dark:bg-[#27272a] border border-[#dae0e2] dark:border-[#3f3f46] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-[#343434]/60 dark:text-white/60">+{persona.totalAppsCount - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                {selectedPersona && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                    <Image src={selectedPersona.avatar} alt={selectedPersona.name} fill className="object-cover" unoptimized />
                  </div>
                )}
                  <h2 className="text-2xl font-bold text-[#343434] dark:text-white">Connect {selectedPersona?.name}'s apps</h2>
                </div>
                <p className="text-base text-[#343434]/60 dark:text-white/60">Connect the platforms {selectedPersona?.name} needs to help you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPersona?.integrations.map((platformId, idx) => {
                  const isConnected = connectedPlatforms.includes(platformId);
                  const isConnecting = connectingPlatform === platformId;

                  return (
                    <motion.div
                      key={platformId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
                        isConnected
                          ? "border-green-500/50 bg-green-500/10"
                          : "border-[#343434]/10 dark:border-white/10 bg-white dark:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#343434]/5 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                            <Image
                              src={`https://logos.composio.dev/api/${platformId}`}
                              alt={platformId}
                              width={24}
                              height={24}
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="text-[#343434] dark:text-white font-semibold text-sm capitalize">{platformId}</p>
                            <p className="text-[#343434]/50 dark:text-white/50 text-xs">
                              {isConnected ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        
                        {isConnected ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium text-xs">Connected</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => connectPlatform(platformId)}
                            disabled={isConnecting}
                            className="px-4 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-black font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-xs"
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              "Connect"
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-[#343434]/5 dark:bg-white/5 border border-[#343434]/10 dark:border-white/10">
                <p className="text-[#343434]/60 dark:text-white/60 text-center text-xs">
                  <span className="text-[#343434] dark:text-white font-medium">Tip:</span> You can skip this step and connect apps later from the chat.
                </p>
              </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#343434] dark:text-white mb-3">Train on your own data</h2>
              <p className="text-base text-[#343434]/60 dark:text-white/60">
                Do you want {selectedPersona?.name} to learn about your company by crawling your website?
              </p>
            </div>

            {wantsCrawl === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setWantsCrawl(true)}
                  className="p-6 rounded-2xl border-2 border-[#343434]/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#343434]/30 dark:hover:border-white/30 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#343434] dark:text-white mb-2">Yes, crawl my website</h3>
                  <p className="text-sm text-[#343434]/60 dark:text-white/60">
                    We extract information about your company, products, and services to personalize the assistant.
                  </p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setWantsCrawl(false)}
                  className="p-6 rounded-2xl border-2 border-[#343434]/10 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#343434]/30 dark:hover:border-white/30 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#343434] dark:text-white mb-2">No, skip this</h3>
                  <p className="text-sm text-[#343434]/60 dark:text-white/60">
                    You can add your own data later via Custom Chats in the sidebar.
                  </p>
                </motion.button>
              </div>
            ) : wantsCrawl === true ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl border-2 border-[#343434]/10 dark:border-white/10 bg-white dark:bg-white/5">
                  <label className="text-sm font-medium text-[#343434] dark:text-white block mb-3">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Your website URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="flex-1 px-4 py-3 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                    />
                    <button
                      onClick={handleCrawl}
                      disabled={!websiteUrl || crawling}
                      className="px-6 py-3 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-black font-bold hover:shadow-lg disabled:opacity-40 flex items-center gap-2 transition-all"
                    >
                      {crawling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Crawling...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" />
                          Crawl
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {crawledData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl border-2 border-green-500/30 bg-green-500/10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-bold text-[#343434] dark:text-white">Data collected!</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {crawledData.companyName && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#343434]/60 dark:text-white/60">Company:</span>
                          <span className="text-sm font-medium text-[#343434] dark:text-white">{crawledData.companyName}</span>
                        </div>
                      )}
                      {crawledData.description && (
                        <div>
                          <span className="text-sm text-[#343434]/60 dark:text-white/60 block mb-1">Description:</span>
                          <p className="text-sm text-[#343434] dark:text-white line-clamp-2">{crawledData.description}</p>
                        </div>
                      )}
                      {crawledData.colors && crawledData.colors.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#343434]/60 dark:text-white/60">Colors:</span>
                          <div className="flex gap-1">
                            {crawledData.colors.slice(0, 5).map((color, idx) => (
                              <div key={idx} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={() => setWantsCrawl(null)}
                  className="text-sm text-[#343434]/50 dark:text-white/50 hover:text-[#343434] dark:hover:text-white transition-colors"
                >
                  ← Change choice
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl border-2 border-[#343434]/10 dark:border-white/10 bg-white dark:bg-white/5 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#343434] dark:text-white mb-2">Perfect!</h3>
                <p className="text-sm text-[#343434]/60 dark:text-white/60 mb-4">
                  You can always add your own data later via the Custom Chats tab.
                </p>
                <button
                  onClick={() => setWantsCrawl(null)}
                  className="text-sm text-[#343434]/50 dark:text-white/50 hover:text-[#343434] dark:hover:text-white transition-colors"
                >
                  ← Change choice
                </button>
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#f8f9fa] dark:bg-[#0a0a0a]"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] dark:opacity-20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-400/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-400/5 dark:bg-pink-500/10 rounded-full blur-[150px]" />
      </motion.div>

      <div className="relative h-full flex flex-col">
        <header className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#343434] dark:text-white">Beauto Setup</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#343434]/5 dark:bg-white/10 hover:bg-[#343434]/10 dark:hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-[#343434] dark:text-white" />
          </button>
        </header>

        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    idx < step
                      ? "bg-green-500 text-white"
                      : idx === step
                      ? "bg-[#343434] dark:bg-white text-white dark:text-black scale-110 shadow-xl"
                      : "bg-[#343434]/10 dark:bg-white/20 text-[#343434]/40 dark:text-white/50"
                  }`}
                >
                  {idx < step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < totalSteps - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 rounded-full transition-all duration-300 ${
                      idx < step ? "bg-green-500" : "bg-[#343434]/10 dark:bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-6 pb-24">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa]/80 to-transparent dark:from-black/80 dark:to-transparent">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="px-4 py-2 rounded-full border border-[#dae0e2] dark:border-white/20 text-[#343434] dark:text-white font-medium hover:bg-[#343434]/5 dark:hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-[#343434]/40 dark:text-white/50 text-xs font-medium">
                Step {step + 1} of {totalSteps}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed() || isCompleting}
                className="px-6 py-2 rounded-full bg-[#343434] dark:bg-white text-white dark:text-black font-bold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : step === totalSteps - 1 ? (
                  <>
                    Finish
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
