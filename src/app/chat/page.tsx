"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import { VoiceAssistant } from "@/components/chat/VoiceAssistant";
import { TaskIdeas } from "@/components/chat/TaskIdeas";
import { NotificationBell } from "@/components/chat/NotificationBell";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { motion } from "framer-motion";
import { WizardOnboarding } from "@/components/onboarding/WizardOnboarding";
import { WizardOnboardingSetup } from "@/components/onboarding/WizardOnboardingSetup";
import {
  Plus,
  Loader2,
  ExternalLink,
  ArrowUp,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  MessageSquarePlus,
  Link2,
  Sparkles,
  MessageCircle,
  Mic,
  MicOff,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Building,
  Upload,
  Globe,
  Layout,
  FileText,
  Palette,
  Users,
  X,
  Trash2,
  Bot,
  Send,
  HelpCircle,
  Clock,
  Calendar,
  PlayCircle,
  XCircle,
  CheckCircle2,
  Moon,
  Sun,
  Mail,
  Settings,
  File,
  ImageIcon,
  Video,
  MoreHorizontal,
  Heart,
  Share2,
  Headphones,
  Inbox,
  Bookmark,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  connectionUrl?: string;
  requiresAuth?: boolean;
  toolsUsed?: string[];
  toolkit?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  customChatId?: string;
}

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: string;
  connected?: boolean;
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
  prompts: { title: string; prompt: string }[];
}

interface CustomChat {
  id: string;
  name: string;
  logo: string | null;
  websiteUrl: string | null;
  brandVoice: string;
  targetAudience: string;
  colors: string[];
  description: string;
  customKnowledge: string;
  files: { name: string; content: string }[];
  crawledContent: string;
  selectedIntegrations: string[]; // New: selected toolkits for this agent
  agentType: string; // New: agent purpose (support, legal, admin, etc)
  createdAt: Date;
}

interface ScheduledAction {
  id: string;
  action_type: string;
  action_description: string;
  scheduled_time: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  toolkit: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  role: 'owner' | 'admin' | 'member';
  team_members?: TeamMember[];
  created_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id?: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'active';
  invited_at: string;
  joined_at?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
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
    prompts: [
      { title: "Ticket Draft", prompt: "Draft a polite response to my latest Zendesk ticket regarding a refund request" },
      { title: "FAQ Update", prompt: "Based on my recent Slack discussions, update our customer FAQ with a question about [topic]" },
      { title: "Support Summary", prompt: "Summarize the customer feedback from my Intercom chats this week" }
    ]
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
    prompts: [
      { title: "Lead Follow-up", prompt: "Draft a follow-up email to my latest HubSpot leads who haven't responded in 3 days" },
      { title: "LinkedIn Outreach", prompt: "Generate a personalized LinkedIn outreach message for potential clients in [industry]" },
      { title: "Sales Forecast", prompt: "Create a sales forecast based on my current pipeline in Salesforce" }
    ]
  },
  { 
    id: "admin", 
    label: "Admin & Office",
    name: "Sofia",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_76krx876krx876kr-1766079960841.png?width=8000&height=8000&resize=contain",
    color: "from-indigo-500 to-purple-600",
    integrations: ["gmail", "googlecalendar", "slack", "notion", "googledrive", "zoom", "microsoftteams", "outlook", "dropbox", "trello", "asana", "monday"],
    totalAppsCount: 212,
    description: "Handles scheduling, emails, documents and team communication",
    prompts: [
      { title: "Schedule Meeting", prompt: "Check my calendar for tomorrow and find a 30min slot for a team meeting" },
      { title: "Summarize Emails", prompt: "Summarize the last 10 emails from my inbox and highlight any urgent tasks" },
      { title: "Document Draft", prompt: "Draft a meeting agenda for our upcoming board meeting in Notion" }
    ]
  },
  { 
    id: "accounting", 
    label: "Accounting",
    name: "James",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_xfhe80xfhe80xfhe-1766079983224.png?width=8000&height=8000&resize=contain",
    color: "from-emerald-500 to-green-600",
    integrations: ["quickbooks", "xero", "stripe", "paypal", "googlesheets", "freshbooks", "wave", "sage", "bill", "expensify"],
    totalAppsCount: 86,
    description: "Manages invoicing, expenses, reports and financial tracking",
    prompts: [
      { title: "Generate Invoice", prompt: "Create an invoice in QuickBooks for [client] for [service] in the amount of [amount]" },
      { title: "Expense Report", prompt: "Generate an expense report from my last month's Stripe transactions" },
      { title: "Tax Summary", prompt: "Summarize my quarterly earnings and projected tax payments" }
    ]
    },
    { 
      id: "hr", 
      label: "HR & Recruitment",
      name: "David",
      avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_hswwzghswwzghsww-1766080128781.png?width=8000&height=8000&resize=contain",
      color: "from-violet-500 to-purple-600",
      integrations: ["linkedin", "workday", "bamboohr", "googlecalendar", "slack", "gmail", "lever", "greenhouse", "rippling", "hibob"],
      totalAppsCount: 92,
      description: "Streamlines hiring, onboarding and employee management",
      prompts: [
        { title: "Job Description", prompt: "Write a job description for a [role] position highlighting our company culture" },
        { title: "Onboarding Plan", prompt: "Create a 30-day onboarding plan for our new hire starting next week" },
        { title: "Interview Invite", prompt: "Draft an interview invitation email for [candidate] for the [role] position" }
      ]
    },
  { 
    id: "marketing", 
    label: "Digital Marketer",
    name: "Emma",
    avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_5y0ncy5y0ncy5y0n-1766080149784.png?width=8000&height=8000&resize=contain",
    color: "from-pink-500 to-rose-600",
    integrations: ["instagram", "facebook", "twitter", "tiktok", "googleanalytics", "mailchimp", "pinterest", "youtube", "linkedin", "hubspot", "canva", "buffer"],
    totalAppsCount: 154,
    description: "Automates social media campaigns, ad management and performance tracking",
    prompts: [
      { title: "Social Media Post", prompt: "Create a social media post for my new product launch on Instagram and Facebook" },
      { title: "Ad Campaign", prompt: "Draft a Facebook ad campaign for my [product] targeting [audience]" },
      { title: "Email Newsletter", prompt: "Write a weekly newsletter for my customers highlighting our latest updates" }
    ]
  },
];

const PROMPT_THEMES = [
  { id: "marketing", name: "Marketing", icon: "📣", prompts: ["Write a social media post about...", "Create an email campaign for...", "Generate hashtags for..."] },
  { id: "sales", name: "Sales", icon: "💼", prompts: ["Write a sales email to...", "Create a pitch for...", "Follow up with customer about..."] },
  { id: "content", name: "Content", icon: "✍️", prompts: ["Write a blog post about...", "Create a product description for...", "Generate ideas for..."] },
];

function ChatContent() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isToolUseExpected, setIsToolUseExpected] = useState(false);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const [showConnectedSection, setShowConnectedSection] = useState(true);
  const lastScrollTop = useRef(0);
  const [userPlan, setUserPlan] = useState("starter");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [credits, setCredits] = useState({ available: 200, used: 0, daily: 200 });
  const [checkingCredits, setCheckingCredits] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"chats" | "integrations" | "prompts" | "custom" | "scheduled">("chats");
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWizardSetup, setShowWizardSetup] = useState(false);

  // Quick Actions state
  const [showQuickActions, setShowQuickActions] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuickActions]);

  // Scroll detection for Connected section
  useEffect(() => {
    if (connectedApps.length === 0) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || !target.classList.contains('overflow-y-auto')) return;
      
      const currentScrollTop = target.scrollTop;
      
      // Show when scrolling up, hide when scrolling down
      if (currentScrollTop > lastScrollTop.current && currentScrollTop > 50) {
        // Scrolling down - hide
        setShowConnectedSection(false);
      } else if (currentScrollTop < lastScrollTop.current) {
        // Scrolling up - show
        setShowConnectedSection(true);
      }
      
      lastScrollTop.current = currentScrollTop;
    };

    // Add scroll listener to all scrollable elements in sidebar
    const scrollableElements = document.querySelectorAll('aside .overflow-y-auto');
    scrollableElements.forEach(el => {
      el.addEventListener("scroll", handleScroll);
    });

    return () => {
      scrollableElements.forEach(el => {
        el.removeEventListener("scroll", handleScroll);
      });
    };
  }, [connectedApps.length, activeSection]);

  // Integration state
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [integrationSearch, setIntegrationSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [totalIntegrations, setTotalIntegrations] = useState(0);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());

  // Custom chat state
  const [customChats, setCustomChats] = useState<CustomChat[]>([]);
  const [activeCustomChat, setActiveCustomChat] = useState<CustomChat | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [newCustomChat, setNewCustomChat] = useState<Partial<CustomChat>>({
    name: "",
    websiteUrl: "",
    brandVoice: "",
    targetAudience: "",
    colors: [],
    description: "",
    customKnowledge: "",
    files: [],
    logo: null,
    crawledContent: "",
    selectedIntegrations: [],
    agentType: "general",
  });

  // User preferences state
  const [defaultPrompts, setDefaultPrompts] = useState<string[]>([]);

  // AI Assistant state
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<{ role: "user" | "assistant", content: string }[]>([
    { role: "assistant", content: "Hi! I'm your automation assistant. Tell me what you want to do and I'll create a prompt that performs the task automatically.\n\nExamples of things I can help you with:\n• Fetch and summarize emails from Gmail\n• Create and schedule social media posts\n• Sync data between different apps\n• Send automatic notifications\n\nDescribe your task and I'll generate a prompt you can run directly!" }
  ]);

  // Scheduled Actions state
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [scheduledViewMode, setScheduledViewMode] = useState<"calendar" | "list">("list");

  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayTTS = async (text: string, messageId: string) => {
    if (playingMessageId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingMessageId(null);
      return;
    }

    try {
      setPlayingMessageId(messageId);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };
      audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setPlayingMessageId(null);
    }
  };

  // Feedback state
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "thumbs_up" | "thumbs_down" | null>>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Selected Persona state
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadChatFileRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const assistantEndRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const supabase = useMemo(() => createClient(), []);

  // Load user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        router.push("/auth/sign-in");
      }
    };
    getUser();
  }, [router, supabase.auth]);

  // Load data when userId is available
  useEffect(() => {
    if (currentUserId) {
      loadChatSessions();
      loadIntegrations();
      loadCustomChats();
      loadScheduledActions();
      loadTeams();
      checkCredits();
      // Refresh credits every 30 seconds
      const creditsInterval = setInterval(checkCredits, 30000);
      
      // Refresh credits when window regains focus (e.g., returning from pricing/checkout)
      const handleFocus = () => checkCredits();
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearInterval(creditsInterval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [currentUserId]);

  // Check user credits
  const checkCredits = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/credits/check");
      if (res.ok) {
        const data = await res.json();
        const newCredits = {
          available: data.available_credits || 0,
          used: data.used_credits || 0,
          daily: data.daily_credits || 200,
        };
        console.log("Credits checked:", newCredits);
        setCredits(newCredits);
      } else {
        console.error("Failed to check credits, status:", res.status);
        const errorData = await res.json().catch(() => ({}));
        console.error("Error data:", errorData);
      }
    } catch (error) {
      console.error("Failed to check credits:", error);
    }
  };

  // Deduct credits before action
  const deductCredits = async (amount: number = 25): Promise<boolean> => {
    if (!currentUserId) return false;
    try {
      const res = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (res.status === 402) {
        // Payment Required - insufficient credits
        const data = await res.json();
        alert(data.message || "Insufficient credits. Please upgrade your plan.");
        router.push("/pricing");
        return false;
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Credit deduction response:", data);
        // Update credits state immediately
        const newAvailable = data.available_credits !== undefined ? data.available_credits : (credits.available - amount);
        setCredits(prev => ({
          ...prev,
          available: newAvailable,
          used: prev.used + amount,
        }));
        console.log("Credits updated in state:", { available: newAvailable, used: credits.used + amount });
        // Also refresh from server to ensure accuracy
        setTimeout(() => {
          console.log("Refreshing credits from server...");
          checkCredits();
        }, 500);
        return true;
      } else {
        // If deduction failed, log the error
        const errorData = await res.json().catch(() => ({}));
        console.error("Credit deduction failed, status:", res.status, "error:", errorData);
        // Still refresh credits to get accurate state
        await checkCredits();
        return false;
      }
    } catch (error) {
      console.error("Failed to deduct credits:", error);
      // Refresh credits on error to get accurate state
      await checkCredits();
      return false;
    }
  };

  const loadChatSessions = async () => {
    if (!currentUserId) return;
    setLoadingChats(true);
    try {
      const res = await fetch(`/api/chats?userId=${currentUserId}`);
      const data = await res.json();
      if (data.chats) {
        const formattedSessions: ChatSession[] = data.chats.map((c: any) => ({
          id: c.id,
          title: c.title,
          messages: c.messages || [],
          createdAt: new Date(c.created_at),
          customChatId: c.custom_chat_id,
        }));
        setChatSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      // First check connected apps from our DB via Composio
      const connectRes = await fetch(`/api/composio/toolkits/check-connection?userId=${currentUserId}`);
      const connectData = await connectRes.json();
      const connectedSet = new Set<string>((connectData.connectedToolkits || []).map((t: string) => t.toLowerCase()));
      setConnectedIntegrations(connectedSet);
      setConnectedApps(Array.from(connectedSet));

      // Then load all toolkits from Composio
      const res = await fetch("/api/composio/toolkits");
      const data = await res.json();
      if (data.toolkits) {
        const formatted: Integration[] = data.toolkits.map((t: any) => ({
          id: t.name,
          name: t.title || t.name.charAt(0).toUpperCase() + t.name.slice(1),
          logo: t.logo || `https://logos.composio.dev/api/${t.name.toLowerCase()}`,
          category: t.category || "General",
          connected: connectedSet.has(t.name.toLowerCase()),
        }));
        setIntegrations(formatted);
        setTotalIntegrations(data.toolkits.length);
        const cats = Array.from(new Set(formatted.map(i => i.category))).filter(Boolean);
        setCategories(cats);
      }
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const loadCustomChats = async () => {
    try {
      const res = await fetch(`/api/builder?userId=${currentUserId}`);
      const data = await res.json();
      if (data.agents) {
        const formatted: CustomChat[] = data.agents.map((a: any) => ({
          id: a.id,
          name: a.name,
          logo: a.logo,
          websiteUrl: a.website_url,
          brandVoice: a.brand_voice,
          targetAudience: a.target_audience,
          colors: a.colors || [],
          description: a.description,
          customKnowledge: a.custom_knowledge,
          files: a.files || [],
          crawledContent: a.crawled_content,
          selectedIntegrations: a.selected_integrations || [],
          agentType: a.agent_type || "general",
          createdAt: new Date(a.created_at),
        }));
        setCustomChats(formatted);
      }
    } catch (error) {
      console.error("Failed to load custom chats:", error);
    }
  };

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await fetch(`/api/teams?userId=${currentUserId}`);
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
        if (data.teams.length > 0 && !selectedTeam) {
          setSelectedTeam(data.teams[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            url: data.url,
            size: file.size,
            uploadedAt: new Date(),
          });
        } else {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
          const errorMessage = errorData.error || "Failed to upload file";
          console.error(`Upload failed for ${file.name}:`, errorMessage);
          
          // Show more specific error messages
          if (errorMessage.includes("bucket") || errorMessage.includes("Storage bucket")) {
            alert(`Storage bucket not configured. Please create a "beauto" bucket in Supabase Storage or set SUPABASE_STORAGE_BUCKET environment variable.`);
          } else if (errorMessage.includes("Permission") || errorMessage.includes("RLS")) {
            alert(`Permission denied. Please check your storage bucket policies.`);
          } else {
            alert(`Failed to upload "${file.name}": ${errorMessage}`);
          }
        }
      }
      
      if (newFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...newFiles]);
        // Show success feedback
        console.log(`Successfully uploaded ${newFiles.length} file(s)`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please check your connection and try again.");
    } finally {
      setUploadingFile(false);
      // Reset file input to allow uploading the same file again
      if (uploadChatFileRef.current) {
        uploadChatFileRef.current.value = "";
      }
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (langParam && ['en', 'sv', 'da', 'no', 'ar'].includes(langParam)) {
      setLanguage(langParam as any);
    }
  }, [langParam]);

  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
  };

  const startConsultantChat = async () => {
    setIsLoading(true);
    const consultantPrompt = t.consultant.subtitle;
    
    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: t.consultant.title + "\n\n" + t.consultant.subtitle,
    };
    
    setMessages([assistantMessage]);
    setIsLoading(false);
  };

  // AI Consultant handling
  useEffect(() => {
    const isConsultant = searchParams.get("consultant") === "true";
    if (isConsultant && currentUserId && messages.length === 0) {
      startConsultantChat();
    }
  }, [searchParams, currentUserId, messages.length]);

  // Integration limit check
  const canConnectMore = useMemo(() => {
    const limit = userPlan === "starter" ? 3 : userPlan === "pro" ? 10 : 999;
    return connectedApps.length < limit;
  }, [connectedApps.length, userPlan]);

    const connectIntegration = async (toolkit: string) => {
      if (!currentUserId) {
        alert("Please sign in to connect apps.");
        return;
      }

      // Check credits before connecting
      if (credits.available < 25) {
        const confirmed = confirm(`Insufficient credits. You have ${credits.available} credits but need 25. Would you like to upgrade your plan?`);
        if (confirmed) {
          router.push("/pricing");
        }
        return;
      }
      
      const info = getToolkitInfo(toolkit);
      const normalizedToolkit = toolkit.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      // Check if already connected
      if (connectedIntegrations.has(normalizedToolkit)) {
        alert(`${info?.name || toolkit} is already connected!`);
        return;
      }
      
      if (!canConnectMore) {
        alert(`You've reached the integration limit for your ${userPlan} plan (${userPlan === "starter" ? "3" : "10"} apps). Please upgrade to connect more!`);
        return;
      }
      
      try {
        const res = await fetch("/api/composio/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, toolkit }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Failed to connect" }));
          throw new Error(errorData.error || `HTTP ${res.status}: Failed to connect`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          alert(`Failed to connect ${info?.name || toolkit}: ${data.error}`);
          return;
        }
        
        if (data.alreadyConnected) {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `✅ ${info?.name || toolkit} is already connected!`,
          }]);
          setConnectedIntegrations(prev => new Set([...prev, normalizedToolkit]));
          setConnectedApps(prev => [...prev, toolkit]);
          // Deduct credits for connection attempt
          await deductCredits(25);
          return;
        }
  
        if (data.connectionUrl || data.redirectUrl) {
          // Deduct credits when connection URL is provided (connection initiated)
          await deductCredits(25);
          const connectionUrl = data.connectionUrl || data.redirectUrl;
          
          // Post a message to the chat with the connection link
          const authMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Click the link below to connect ${info?.name || toolkit}.`,
            connectionUrl: connectionUrl,
            requiresAuth: true,
            toolkit: toolkit
          };
        
          setMessages(prev => [...prev, authMessage]);
          
          // Switch to chat view to show the card
          setActiveSection("chats");
          
          // Save to DB if we have a session
          if (currentSessionId) {
            await saveMessageToDB(currentSessionId, authMessage);
          }
        } else {
          alert(`Unexpected response from server. Please try again.`);
        }
      } catch (error: any) {
        console.error("Failed to connect:", error);
        alert(`Failed to connect ${info?.name || toolkit}: ${error.message || "Unknown error"}`);
      }
    };

  const usePrompt = (prompt: string) => {
    let filledPrompt = prompt;
    
    // If we have active custom chat with crawled data, auto-fill placeholders
    if (activeCustomChat) {
      // Replace common placeholders with data from custom chat
      const replacements: Record<string, string> = {
        '[product]': activeCustomChat.description.split(' ').slice(0, 3).join(' ') || 'product',
        '[product category]': activeCustomChat.targetAudience || 'category',
        '[product type]': activeCustomChat.description.split(' ').slice(0, 2).join(' ') || 'product',
        '[service]': activeCustomChat.description.split(' ').slice(0, 3).join(' ') || 'service',
        '[service type]': activeCustomChat.description || 'service',
        '[company name]': activeCustomChat.name,
        '[company]': activeCustomChat.name,
        '[brand]': activeCustomChat.name,
        '[business]': activeCustomChat.name,
        '[audience]': activeCustomChat.targetAudience || 'audience',
        '[target audience]': activeCustomChat.targetAudience || 'audience',
        '[demographic]': activeCustomChat.targetAudience || 'demographic',
        '[voice]': activeCustomChat.brandVoice || 'professional',
        '[tone]': activeCustomChat.brandVoice || 'professional',
        '[industry]': activeCustomChat.targetAudience || 'industry',
      };
      
      // Replace all placeholders
      for (const [placeholder, value] of Object.entries(replacements)) {
        const regex = new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'gi');
        filledPrompt = filledPrompt.replace(regex, value);
      }
    }
    
    setInputValue(filledPrompt);
    textareaRef.current?.focus();
  };

  const connectApp = async (toolkit: string) => {
    if (!currentUserId) return;

    // Check credits before connecting
    if (credits.available < 25) {
      alert(`Insufficient credits. You have ${credits.available} credits but need 25. Please upgrade your plan.`);
      router.push("/pricing");
      return;
    }
    
    try {
      const res = await fetch("/api/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, toolkit }),
      });
        const data = await res.json();
        
        // Deduct credits after successful connection
        if (res.ok && (data.connectionUrl || data.redirectUrl || data.alreadyConnected)) {
          await deductCredits(25);
        }
        
        if (data.alreadyConnected) {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `✅ Already connected!`,
          }]);
          setConnectedIntegrations(prev => new Set([...prev, toolkit.toLowerCase().replace(/[^a-z0-9]/g, "")]));
          return;
        }

        if (data.error) {
        // Show error message to user
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.error,
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Connection failed. Please try again or contact support.",
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/beauto-logo.png";
  };

  const detectToolkit = (text: string): string[] => {
    const keywords: Record<string, string[]> = {
      gmail: ["gmail", "email", "mail"],
      slack: ["slack", "message", "channel"],
      github: ["github", "repo", "repository", "issue", "pull request"],
      googlecalendar: ["calendar", "meeting", "schedule", "event"],
      googlesheets: ["sheets", "spreadsheet", "excel"],
      instagram: ["instagram", "post", "ig"],
      hubspot: ["hubspot", "crm", "contact"],
      notion: ["notion", "page", "database"],
      stripe: ["stripe", "payment", "invoice", "billing"],
    };
    
    const detected: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const [toolkit, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerText.includes(term))) {
        detected.push(toolkit);
      }
    }
    
    return detected;
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setActiveCustomChat(null);
    setSelectedPersona(null);
    setInputValue("");
    setActiveSection("chats");
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setActiveSection("chats");
    if (session.customChatId) {
      const customChat = customChats.find(c => c.id === session.customChatId);
      if (customChat) setActiveCustomChat(customChat);
    }
  };

  const saveMessageToDB = async (chatId: string, message: Message) => {
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          role: message.role,
          content: message.content,
          connectionUrl: message.connectionUrl,
          requiresAuth: message.requiresAuth,
          toolsUsed: message.toolsUsed,
          toolkit: message.toolkit,
        }),
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const loadScheduledActions = async () => {
    if (!currentUserId) return;
    setLoadingScheduled(true);
    try {
      const res = await fetch(`/api/scheduled-actions?userId=${currentUserId}`);
      const data = await res.json();
      setScheduledActions(data.actions || []);
    } catch (error) {
      console.error("Failed to load scheduled actions:", error);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats?chatId=${chatId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setChatSessions(prev => prev.filter(s => s.id !== chatId));
        if (currentSessionId === chatId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const createTeam = async () => {
    if (!newTeam.name.trim() || !currentUserId) return;
    setLoadingTeams(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeam.name,
          description: newTeam.description,
          ownerId: currentUserId,
        }),
      });
      const data = await res.json();
      if (data.team) {
        setTeams(prev => [data.team, ...prev]);
        setSelectedTeam(data.team);
        setShowCreateTeam(false);
        setNewTeam({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const inviteToTeam = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      if (res.ok) {
        alert("Invitation sent!");
        setShowInviteModal(false);
        setInviteEmail("");
      }
    } catch (error) {
      console.error("Failed to invite to team:", error);
    }
  };

  const cancelScheduledAction = async (actionId: string) => {
    try {
      const res = await fetch(`/api/scheduled-actions?actionId=${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setScheduledActions(prev => prev.map(a => 
          a.id === actionId ? { ...a, status: "cancelled" as any } : a
        ));
      }
    } catch (error) {
      console.error("Failed to cancel action:", error);
    }
  };

  const sendMessage = async (content: string, silent: boolean = false) => {
    if (!content.trim() || (isLoading && !silent) || !currentUserId) return;

    // Check credits before sending (only for non-silent messages)
    if (!silent) {
      if (credits.available < 25) {
        const confirmed = confirm(`Insufficient credits. You have ${credits.available} credits but need 25. Would you like to upgrade your plan?`);
        if (confirmed) {
          router.push("/pricing");
        }
        router.push("/pricing");
        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInputValue("");
    
    if (!silent) {
      setIsLoading(true);
      // Determine if tool use is likely based on keywords before API call
      const likelyToolUse = detectToolkit(content).length > 0;
      setIsToolUseExpected(likelyToolUse);
    }

    // Create new chat if needed
    let chatId = currentSessionId;
    if (!chatId) {
      try {
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
            customChatId: activeCustomChat?.id || null,
          }),
        });
        const data = await res.json();
        if (data.chat) {
          chatId = data.chat.id;
          setCurrentSessionId(chatId);
          const newSession: ChatSession = {
            id: data.chat.id,
            title: data.chat.title,
            messages: allMessages,
            createdAt: new Date(data.chat.created_at),
            customChatId: data.chat.custom_chat_id,
          };
          setChatSessions(prev => [newSession, ...prev]);
        }
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    }

    // Save user message to DB
    if (chatId) {
      await saveMessageToDB(chatId, userMessage);
    }

    // Update chat title if first message
    if (chatId && messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      setChatSessions(prev => prev.map(s =>
        s.id === chatId ? { ...s, title, messages: allMessages } : s
      ));
      
      try {
        await fetch("/api/chats", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, title }),
        });
      } catch (error) {
        console.error("Failed to update title:", error);
      }
    }

    if (silent) return;

    try {
      const conversationHistory = allMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const customContext = activeCustomChat ? {
          companyName: activeCustomChat.name,
          brandVoice: activeCustomChat.brandVoice,
          targetAudience: activeCustomChat.targetAudience,
          colors: activeCustomChat.colors,
          description: activeCustomChat.description,
          customKnowledge: activeCustomChat.customKnowledge,
          crawledContent: activeCustomChat.crawledContent,
          files: activeCustomChat.files.map(f => f.content).join("\n\n"),
          logo: activeCustomChat.logo,
        } : null;

        const personaContext = selectedPersona ? {
          role: selectedPersona.label,
          name: selectedPersona.name,
          description: selectedPersona.description,
          integrations: selectedPersona.integrations,
        } : null;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            messages: conversationHistory,
            userId: currentUserId,
            customContext,
            personaContext,
            selectedIntegrations: selectedPersona?.integrations || activeCustomChat?.selectedIntegrations || [],
            uploadedFiles: uploadedFiles.map(f => ({
              name: f.name,
              type: f.type,
              url: f.url,
            })),
          }),
        });

      const data = await res.json();

      // Deduct credits after API call completes (whether success or error response)
      // This ensures credits are deducted for any search/chat attempt
      try {
        console.log("Deducting 25 credits for search...");
        const deducted = await deductCredits(25);
        if (deducted) {
          console.log("Credits deducted successfully");
          // Refresh credits to ensure UI is up to date
          await checkCredits();
        } else {
          console.warn("Credit deduction failed, but continuing with response");
        }
      } catch (creditError) {
        console.error("Error deducting credits:", creditError);
        // Still continue with the response even if credit deduction fails
      }

      if (data.connectedApps) {
        setConnectedApps(data.connectedApps);
      }

      // If action was scheduled, refresh scheduled actions list
      if (data.scheduled) {
        await loadScheduledActions();
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || data.error || "Something went wrong",
        connectionUrl: data.connectionUrl,
        requiresAuth: data.requiresAuth,
        toolsUsed: data.toolsUsed,
        toolkit: data.toolkit,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to DB
      if (chatId) {
        await saveMessageToDB(chatId, assistantMessage);
      }
      
      // Clear uploaded files after successful send
      setUploadedFiles([]);
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Failed to connect. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message too
      if (chatId) {
        await saveMessageToDB(chatId, errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addAssistantMessage = async (content: string) => {
    if (!content.trim() || !currentUserId) return;
    
    // Ignore generic greetings from Voice Assistant to avoid cluttering chat history
    const isGreeting = content.toLowerCase().includes("how can i assist") || 
                      content.toLowerCase().includes("how can i help") ||
                      content.toLowerCase().includes("hi there");
    
    if (isGreeting && messages.length > 0) return;

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
    };

    setMessages(prev => [...prev, assistantMessage]);
    
    if (currentSessionId) {
      await saveMessageToDB(currentSessionId, assistantMessage);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Credits are checked inside sendMessage, but we can prevent if clearly insufficient
      if (credits.available < 25) {
        const confirmed = confirm(`Insufficient credits. You have ${credits.available} credits but need 25. Would you like to upgrade your plan?`);
        if (confirmed) {
          router.push("/pricing");
        }
        router.push("/pricing");
        return;
      }
      sendMessage(inputValue);
    }
  };

    const formatMessageContent = (content: string) => {
      const lines = content.split('\n');
      return lines.map((line, idx) => {
        const trimmedLine = line.trim();
        
        // Handle markdown images: ![alt](url)
        const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const [fullMatch, alt, url] = imageMatch;
          const beforeImage = line.substring(0, line.indexOf(fullMatch));
          const afterImage = line.substring(line.indexOf(fullMatch) + fullMatch.length);
          return (
            <div key={idx} className="my-3">
              {beforeImage && <p className="mb-2 whitespace-pre-wrap">{beforeImage}</p>}
              <div className="rounded-xl overflow-hidden border border-[#dae0e2] dark:border-[#27272a] max-w-md bg-white dark:bg-black shadow-lg">
                <img
                  src={url}
                  alt={alt || "Generated image"}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {alt && <p className="text-xs text-[#343434]/60 dark:text-white/60 p-2 bg-[#f8f9fa] dark:bg-[#27272a]">{alt}</p>}
              </div>
              {afterImage && <p className="mt-2 whitespace-pre-wrap">{afterImage}</p>}
            </div>
          );
        }

        // Handle direct image URLs (common image extensions)
        const directImageMatch = line.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?)/i);
        if (directImageMatch) {
          const imageUrl = directImageMatch[1];
          const beforeUrl = line.substring(0, line.indexOf(imageUrl));
          const afterUrl = line.substring(line.indexOf(imageUrl) + imageUrl.length);
          return (
            <div key={idx} className="my-3">
              {beforeUrl && <p className="mb-2">{beforeUrl}</p>}
              <div className="rounded-xl overflow-hidden border border-[#dae0e2] dark:border-[#27272a] max-w-md bg-white dark:bg-black shadow-lg">
                <img
                  src={imageUrl}
                  alt="Image"
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              {afterUrl && <p className="mt-2">{afterUrl}</p>}
            </div>
          );
        }

        // Handle Google/Gemini generated content URLs (often don't have extensions)
        const geminiImageMatch = line.match(/(https?:\/\/[^\s]*(generativelanguage|googleapis|googleusercontent)[^\s]*)/i);
        if (geminiImageMatch && !line.includes('.mp4') && !line.includes('.webm')) {
          const imageUrl = geminiImageMatch[1];
          // Simple heuristic: if it's a long URL from Google, it's likely an image
          return (
            <div key={idx} className="my-3">
              <div className="rounded-xl overflow-hidden border border-[#dae0e2] dark:border-[#27272a] max-w-md bg-white dark:bg-black shadow-lg">
                <img
                  src={imageUrl}
                  alt="AI Generated"
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    // If it fails to load as an image, maybe it's just a link
                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                  }}
                />
              </div>
            </div>
          );
        }

        // Now strip other markdown symbols for the remaining text
        const cleanLine = line
          .replace(/#{1,6}\s?/g, '') // remove headers
          .replace(/\*\*/g, '')      // remove bold
          .replace(/\*/g, '')        // remove single asterisks
          .replace(/_{1,2}/g, '')    // remove underscores
          .replace(/`{1,3}/g, '')    // remove code blocks
          .replace(/>/g, '')         // remove blockquotes
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // remove links but keep text

        const isListItem = cleanLine.trim().startsWith('•') || cleanLine.trim().startsWith('-') || /^\d+\./.test(cleanLine.trim());

        return (
          <div 
            key={idx} 
            className={`${isListItem ? 'pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-blue-500' : ''} ${cleanLine.trim() === '' ? 'h-4' : 'min-h-[1.5em]'}`}
          >
            <span className="whitespace-pre-wrap">
              {isListItem ? cleanLine.trim().replace(/^[•\-\d\.]+\s*/, '') : cleanLine}
            </span>
          </div>
        );
      });
    };


    const inferToolkitFromTextOrUrl = (text?: string, url?: string): string | undefined => {
      const lowerText = (text || "").toLowerCase();

      // Fast path: try to infer from URL query params / path
      if (url) {
        try {
          const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
          const u = new URL(url, base);

          for (const key of ["toolkit", "tool", "integration", "provider", "app", "slug"]) {
            const v = u.searchParams.get(key);
            if (v) return v.toLowerCase();
          }

          const parts = u.pathname.split("/").filter(Boolean).map(p => p.toLowerCase());
          for (const part of parts) {
            const normalized = part.replace(/[^a-z0-9]/g, "");
            if (normalized) {
              // If we have the integrations list loaded, use it as a reference.
              const match = integrations.find(i => i.id.toLowerCase() === normalized);
              if (match) return match.id;
            }
          }
        } catch {
          // ignore
        }
      }

      // Text hints for common toolkits
      const hints: Array<{ id: string; patterns: string[] }> = [
        { id: "gmail", patterns: ["gmail"] },
        { id: "github", patterns: ["github"] },
        { id: "slack", patterns: ["slack"] },
        { id: "googlecalendar", patterns: ["google calendar", "calendar"] },
        { id: "googlesheets", patterns: ["google sheets", "sheets", "spreadsheet"] },
        { id: "instagram", patterns: ["instagram"] },
        { id: "hubspot", patterns: ["hubspot"] },
        { id: "notion", patterns: ["notion"] },
        { id: "shopify", patterns: ["shopify"] },
        { id: "googledrive", patterns: ["google drive", "drive"] },
        { id: "jira", patterns: ["jira"] },
        { id: "zendesk", patterns: ["zendesk"] },
      ];

      for (const hint of hints) {
        if (hint.patterns.some(p => lowerText.includes(p))) return hint.id;
      }

      // If the integrations list is loaded, try to match by name/id.
      if (integrations.length > 0) {
        const match = integrations.find(i =>
          lowerText.includes(i.id.toLowerCase()) || lowerText.includes(i.name.toLowerCase())
        );
        if (match) return match.id;
      }

      return undefined;
    };

    const getToolkitInfo = (toolkit: string | undefined) => {
      if (!toolkit) return null;
      const found = integrations.find(i => i.id.toLowerCase() === toolkit.toLowerCase());
      if (found) return found;
      return {
        id: toolkit.toLowerCase(),
        name: toolkit.charAt(0).toUpperCase() + toolkit.slice(1),
        logo: `https://logos.composio.dev/api/${toolkit.toLowerCase()}`,
        connected: false
      };
    };


  // Function to use prompt from assistant - sends it to main chat automatically
  const useAssistantPrompt = async (prompt: string) => {
    setAssistantOpen(false);
    setInputValue(prompt);
    // Wait a tick then send the message
    setTimeout(() => {
      sendMessage(prompt);
    }, 100);
  };

  const handleAssistantSend = async () => {
    if (!assistantInput.trim() || !currentUserId) return;

    const userMsg = assistantInput.trim();
    setAssistantMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAssistantInput("");
    setAssistantLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You are a helpful AI assistant that helps users automate tasks. You have access to Gmail, GitHub, Slack, Instagram, Google Calendar, Google Sheets, HubSpot, and 900+ other apps via Composio.

The user wants: "${userMsg}"

IMPORTANT: You should generate ONE exact prompt that the user can use directly in the chat to perform the automation. 

Format the response EXACTLY like this:

Prompt: "[the exact prompt to be sent to the chat]"

Explanation: [Brief explanation of what will happen when the prompt runs]

Example:
If the user says "get my emails", respond:
Prompt: "Fetch my 10 latest emails from Gmail and give me a summary of the most important ones"

Explanation: This prompt will connect to your Gmail and fetch the latest emails.

Be specific and give ONE clear prompt that actually performs the task - not just describes it.`,
          messages: [],
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      const responseContent = data.response || "I couldn't generate a suggestion right now. Please try again!";
      
      setAssistantMessages(prev => [...prev, {
        role: "assistant",
        content: responseContent
      }]);
    } catch {
      setAssistantMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again!"
      }]);
    } finally {
      setAssistantLoading(false);
      setTimeout(() => {
        assistantEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Show loading while getting userId
  if (!currentUserId) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#343434]/40" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-96" : "w-0"} transition-all duration-300 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border-r border-[#dae0e2] dark:border-[#27272a] flex flex-col overflow-hidden z-20 shadow-2xl relative`}>
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[#dae0e2] dark:via-[#27272a] to-transparent opacity-50" />
        <div className="p-4 border-b border-[#dae0e2] dark:border-[#27272a] space-y-3 relative">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-all active:scale-[0.98] group whitespace-nowrap"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium truncate">Back to Dashboard</span>
          </button>
          
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span className="text-sm font-medium">New chat</span>
          </button>
          
          <button
            onClick={() => setShowWizardSetup(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(147,51,234,0.3)] hover:shadow-[0_8px_20px_rgba(147,51,234,0.4)]"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Wizard Onboarding</span>
          </button>
          
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-all active:scale-[0.98]"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Guide</span>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-[#dae0e2] dark:border-[#27272a]">
          <button
            onClick={() => setActiveSection("chats")}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeSection === "chats" ? "text-[#343434] border-b-2 border-[#343434]" : "text-[#343434]/50 hover:text-[#343434] dark:text-white"}`}
          >
            <MessageCircle className="w-3.5 h-3.5 mx-auto mb-1" />
            Chats
          </button>
          <button
            onClick={() => setActiveSection("integrations")}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeSection === "integrations" ? "text-[#343434] border-b-2 border-[#343434]" : "text-[#343434]/50 hover:text-[#343434] dark:text-white"}`}
          >
            <Link2 className="w-3.5 h-3.5 mx-auto mb-1" />
            Apps
          </button>
            <button
              onClick={() => setActiveSection("prompts")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeSection === "prompts" ? "text-[#343434] border-b-2 border-[#343434]" : "text-[#343434]/50 hover:text-[#343434] dark:text-white"}`}
            >
              <Users className="w-3.5 h-3.5 mx-auto mb-1" />
              Personas
            </button>
          <button
            onClick={() => setActiveSection("custom")}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeSection === "custom" ? "text-[#343434] border-b-2 border-[#343434]" : "text-[#343434]/50 hover:text-[#343434] dark:text-white"}`}
          >
            <Palette className="w-3.5 h-3.5 mx-auto mb-1" />
            Custom
          </button>
          <button
            onClick={() => setActiveSection("scheduled")}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeSection === "scheduled" ? "text-[#343434] border-b-2 border-[#343434]" : "text-[#343434]/50 hover:text-[#343434] dark:text-white"}`}
          >
            <Clock className="w-3.5 h-3.5 mx-auto mb-1" />
            Scheduled
          </button>
        </div>

        {/* Section content */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeSection === "chats" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
              {loadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 animate-spin text-[#343434]/40 dark:text-white/40" />
                </div>
              ) : chatSessions.length === 0 ? (
                <p className="text-[#343434]/40 dark:text-white/40 text-xs text-center py-8">No chats yet</p>
              ) : (
                chatSessions.map(session => (
                  <div key={session.id} className="chat-session-item group relative">
                    <button
                      onClick={() => loadSession(session)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-smooth ${currentSessionId === session.id ? "bg-[#d6dfe8] dark:bg-[#27272a]" : "hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50"}`}
                    >
                      <p className="text-[#343434] dark:text-white truncate pr-6 text-xs">{session.title}</p>
                      <p className="text-[#343434]/40 dark:text-white/40 text-xs mt-0.5">
                        {session.createdAt.toLocaleDateString("en-US")}
                      </p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this chat?")) {
                          deleteChat(session.id);
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSection === "integrations" && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Search and filter */}
              <div className="p-3 space-y-2 border-b border-[#dae0e2] dark:border-[#27272a] flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#343434]/40 dark:text-white/40" />
                  <input
                    type="text"
                    placeholder="Search among 908 apps..."
                    value={integrationSearch}
                    onChange={(e) => setIntegrationSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#dae0e2] dark:border-[#27272a] text-xs focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30 bg-white dark:bg-[#1a1a1a] text-[#343434] dark:text-white placeholder:text-[#343434]/40 dark:placeholder:text-white/40"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#dae0e2] dark:border-[#27272a] text-xs text-[#343434] dark:text-white focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30 bg-white dark:bg-[#1a1a1a]"
                >
                  <option value="">All categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-xs text-[#343434]/40 dark:text-white/40 px-1">
                  {totalIntegrations} integrations available
                </p>
              </div>

              {/* Integration list */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 min-h-0 thin-scrollbar">
                {loadingIntegrations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin text-[#343434]/40 dark:text-white/40" />
                  </div>
                ) : integrations.length === 0 ? (
                  <p className="text-[#343434]/40 dark:text-white/40 text-xs text-center py-8">No apps found</p>
                ) : (
                  integrations.map(integration => (
                    <div
                      key={integration.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#27272a] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center overflow-hidden">
                        <Image
                          src={integration.logo}
                          alt={integration.name}
                          width={18}
                          height={18}
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-xs text-[#343434] dark:text-white block">{integration.name}</span>
                        <span className="text-xs text-[#343434]/40 dark:text-white/40">{integration.category}</span>
                      </div>
                      {connectedIntegrations.has(integration.id.toLowerCase().replace(/[^a-z0-9]/g, "")) ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <button
                          onClick={() => connectIntegration(integration.id)}
                          disabled={credits.available < 25}
                          className="px-2.5 py-1 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-xs font-medium hover:bg-[#343434]/90 dark:hover:bg-white/90 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          title={credits.available < 25 ? `Insufficient credits. You need 25 credits but only have ${credits.available}. Please upgrade.` : "Connect app"}
                        >
                          <Link2 className="w-3 h-3" />
                          Connect
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

            {activeSection === "prompts" && (
              <div className="p-3 space-y-2">
                <p className="text-[#343434]/60 dark:text-white/60 text-xs px-2 mb-3">Select an AI assistant for your chat</p>
                {selectedPersona && (
                  <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                          <Image src={selectedPersona.avatar} alt={selectedPersona.name} fill className="object-cover" unoptimized />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#343434] dark:text-white">{selectedPersona.name}</p>
                          <p className="text-[10px] text-[#343434]/60 dark:text-white/60">{selectedPersona.label}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPersona(null)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {PERSONAS.map(persona => (
                  <div key={persona.id} className={`rounded-xl border overflow-hidden bg-white dark:bg-[#1a1a1a] transition-all ${selectedPersona?.id === persona.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#dae0e2] dark:border-[#27272a]'}`}>
                      <button
                        onClick={() => setExpandedTheme(expandedTheme === persona.id ? null : persona.id)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <Image 
                            src={persona.avatar}
                            alt={t.personas[persona.id as keyof typeof t.personas]?.role || persona.label}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {selectedPersona?.id === persona.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs text-[#343434] dark:text-white font-bold">
                              {t.personas[persona.id as keyof typeof t.personas]?.name || persona.name}
                            </span>
                            <span className="text-[10px] text-[#343434]/40 dark:text-white/40">
                              ({t.personas[persona.id as keyof typeof t.personas]?.role || persona.label})
                            </span>
                          </div>
                          <span className="text-[10px] text-[#343434]/50 dark:text-white/40 line-clamp-1">
                            {t.personas[persona.id as keyof typeof t.personas]?.description || persona.description}
                          </span>
                        </div>

                      {expandedTheme === persona.id ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[#343434]/40 dark:text-white/40" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#343434]/40 dark:text-white/40" />
                      )}
                    </button>
                    {expandedTheme === persona.id && (
                      <div className="px-3 pb-3 space-y-3 border-t border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa]/50 dark:bg-[#0a0a0a]/50">
                        {/* Select Button */}
                        <div className="pt-3">
                          <button
                            onClick={() => {
                              setSelectedPersona(persona);
                              setActiveSection("chats");
                            }}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                              selectedPersona?.id === persona.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:scale-[1.02]'
                            }`}
                          >
                            {selectedPersona?.id === persona.id ? (
                              <span className="flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" />
                                Selected
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                <Users className="w-4 h-4" />
                                Use {persona.name}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Integrations */}
                        <div className="pt-2">
                          <p className="text-[10px] font-medium text-[#343434]/60 dark:text-white/60 mb-2 uppercase tracking-wider">Integrations</p>
                            <div className="flex flex-wrap gap-1.5">
                              {persona.integrations.slice(0, 8).map((app) => (
                                <div 
                                  key={app} 
                                  className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center shadow-sm"
                                  title={app}
                                >
                                  <Image 
                                    src={`https://logos.composio.dev/api/${app}`}
                                    alt={app}
                                    width={16}
                                    height={16}
                                    unoptimized
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ))}
                              {persona.totalAppsCount > 8 && (
                                <div className="px-2 h-7 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center shadow-sm">
                                  <span className="text-[10px] font-bold text-[#343434]/60 dark:text-white/60">+{persona.totalAppsCount - 8} apps</span>
                                </div>
                              )}
                            </div>
                        </div>

                        {/* Prompts section */}
                        <div className="pt-2 border-t border-[#dae0e2] dark:border-[#27272a]">
                          <p className="text-[10px] font-medium text-[#343434]/60 dark:text-white/60 mb-2 uppercase tracking-wider">Suggested Prompts</p>
                          <div className="space-y-1">
                            {persona.prompts.map((prompt, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedPersona(persona);
                                  usePrompt(prompt.prompt);
                                  setActiveSection("chats");
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-white dark:hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-[#dae0e2] dark:hover:border-[#27272a] group"
                              >
                                <span className="text-[#343434] dark:text-white font-medium block text-[11px] mb-0.5">{prompt.title}</span>
                                <span className="text-[#343434]/50 dark:text-white/50 line-clamp-2 text-[10px] leading-relaxed">{prompt.prompt}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          {activeSection === "custom" && (
            <div className="p-3 space-y-2">
              <p className="text-[#343434]/60 dark:text-white/60 text-xs px-2 mb-3">Custom chat templates with brand voice and audience</p>
              {customChats.length === 0 ? (
                <p className="text-[#343434]/40 dark:text-white/40 text-xs text-center py-8">No custom chats yet</p>
              ) : (
                customChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveCustomChat(chat);
                      setActiveSection("chats");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeCustomChat?.id === chat.id ? "bg-[#d6dfe8] dark:bg-[#27272a]" : "hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50"}`}
                  >
                    <p className="text-[#343434] dark:text-white truncate text-xs">{chat.name}</p>
                    <p className="text-[#343434]/40 dark:text-white/40 text-xs mt-0.5">
                      {chat.targetAudience}
                    </p>
                  </button>
                ))
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[#343434] dark:text-white text-xs">Create new custom chat</span>
                </div>
              </button>
            </div>
          )}

          {activeSection === "scheduled" && (
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between px-2">
                <p className="text-[#343434]/60 dark:text-white/60 text-xs">Scheduled actions</p>
                <div className="flex items-center gap-1 bg-[#f8f9fa] dark:bg-[#0a0a0a] rounded-lg p-1">
                  <button
                    onClick={() => setScheduledViewMode("list")}
                    className={`px-2 py-1 rounded text-xs transition-colors ${scheduledViewMode === "list" ? "bg-white dark:bg-[#27272a] text-[#343434] dark:text-white" : "text-[#343434]/60 dark:text-white/60"}`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      List
                    </div>
                  </button>
                  <button
                    onClick={() => setScheduledViewMode("calendar")}
                    className={`px-2 py-1 rounded text-xs transition-colors ${scheduledViewMode === "calendar" ? "bg-white dark:bg-[#27272a] text-[#343434] dark:text-white" : "text-[#343434]/60 dark:text-white/60"}`}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Calendar
                    </div>
                  </button>
                </div>
              </div>
              
              {loadingScheduled ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#343434]/40 dark:text-white/40" />
                </div>
              ) : scheduledActions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-[#343434]/20 mb-3" />
                  <p className="text-[#343434]/40 dark:text-white/40 text-sm">No scheduled actions yet</p>
                  <p className="text-[#343434]/30 dark:text-white/30 text-xs mt-1">Try: "Send email tomorrow at 9am"</p>
                </div>
              ) : (
                <>
                  {scheduledViewMode === "calendar" ? (
                    <>
                      {/* Calendar mini-view showing upcoming actions */}
                      <div className="grid grid-cols-7 gap-1 mb-4 px-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium text-[#343434]/40 dark:text-white/40 py-1">
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: 35 }, (_, i) => {
                          const today = new Date();
                          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                          const startOffset = firstDay.getDay();
                          const dayNumber = i - startOffset + 1;
                          const currentDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
                          
                          const dayActions = scheduledActions.filter(action => {
                            const actionDate = new Date(action.scheduled_time);
                            return actionDate.getDate() === dayNumber && 
                                   actionDate.getMonth() === today.getMonth() &&
                                   actionDate.getFullYear() === today.getFullYear();
                          });
                          
                          const isToday = dayNumber === today.getDate() && 
                                         currentDate.getMonth() === today.getMonth();
                          const hasActions = dayActions.length > 0;
                          const isValidDay = dayNumber > 0 && dayNumber <= new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                          
                          return (
                            <div
                              key={i}
                              className={`aspect-square flex items-center justify-center text-xs rounded-lg relative
                                ${isToday ? 'bg-blue-500 text-white font-medium' : ''}
                                ${hasActions && !isToday ? 'bg-green-50 text-green-700 font-medium' : ''}
                                ${!isValidDay ? 'text-[#343434]/20 dark:text-white/20' : 'text-[#343434] dark:text-white'}
                              `}
                            >
                              {isValidDay ? dayNumber : ''}
                              {hasActions && (
                                <div className="absolute bottom-0.5 flex gap-0.5">
                                  {dayActions.slice(0, 3).map((action, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-1 h-1 rounded-full ${
                                        action.status === 'completed' ? 'bg-green-500' :
                                        action.status === 'pending' ? 'bg-yellow-500' :
                                        action.status === 'running' ? 'bg-blue-500' :
                                        action.status === 'failed' ? 'bg-red-500' :
                                        'bg-gray-400'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                  
                  {/* Actions list */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#343434]/60 dark:text-white/60 px-2">
                      {scheduledViewMode === "calendar" ? "Today's Actions" : "Upcoming Actions"}
                    </p>
                    {scheduledActions.map(action => {
                      const scheduledDate = new Date(action.scheduled_time);
                      const isPast = scheduledDate < new Date();
                      const isToday = scheduledDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div key={action.id} className={`p-3 rounded-lg border transition-colors ${
                          action.status === 'completed' ? 'bg-green-50 border-green-200' :
                          action.status === 'failed' ? 'bg-red-50 border-red-200' :
                          action.status === 'running' ? 'bg-blue-50 border-blue-200' :
                          isPast ? 'bg-yellow-50 border-yellow-200' :
                          'bg-white dark:bg-[#1a1a1a] border-[#dae0e2] dark:border-[#27272a]'
                        }`}>
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#343434] dark:text-white line-clamp-2">{action.action_description}</p>
                              <p className="text-xs text-[#343434]/40 dark:text-white/40 mt-1">
                                {action.toolkit} • {action.action_type}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              {action.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              {action.status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                              {action.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                              {action.status === 'pending' && (
                                <button
                                  onClick={() => cancelScheduledAction(action.id)}
                                  className="p-1 rounded hover:bg-red-100 text-red-500"
                                  title="Cancel action"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-[#343434]/40 dark:text-white/40" />
                            <span className="text-[#343434]/60 dark:text-white/60">
                                {isToday ? 'Today' : scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' '}at{' '}
                                {scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                              action.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              action.status === 'running' ? 'bg-blue-100 text-blue-800' :
                              action.status === 'completed' ? 'bg-green-100 text-green-800' :
                              action.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {action.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {connectedApps.length > 0 && showConnectedSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 border-t border-[#dae0e2] dark:border-[#27272a] overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                <p className="text-xs font-medium text-[#343434] dark:text-white">Connected</p>
              </div>
              <button
                onClick={() => setShowConnectedSection(false)}
                className="p-0.5 hover:bg-[#d6dfe8] dark:hover:bg-[#27272a] rounded transition-colors"
                aria-label="Hide connected section"
              >
                <X className="w-3.5 h-3.5 text-[#343434] dark:text-white" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {connectedApps.map(app => {
                const appName = app.charAt(0).toUpperCase() + app.slice(1).toLowerCase();
                return (
                  <div
                    key={app}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d6dfe8] dark:bg-[#27272a] border border-[#dae0e2] dark:border-[#3f3f46] text-xs text-[#343434] dark:text-white"
                  >
                    <Image
                      src={`https://logos.composio.dev/api/${app.toLowerCase()}`}
                      alt={appName}
                      width={14}
                      height={14}
                      className="rounded-sm"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{appName}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
        
        {connectedApps.length > 0 && !showConnectedSection && (
          <div className="p-2 border-t border-[#dae0e2] dark:border-[#27272a]">
            <button
              onClick={() => setShowConnectedSection(true)}
              className="flex items-center gap-2 w-full text-xs text-[#343434] dark:text-white hover:bg-[#d6dfe8] dark:hover:bg-[#27272a] rounded p-1.5 transition-colors"
              aria-label="Show connected section"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
              <span className="font-medium">{connectedApps.length} Connected</span>
            </button>
          </div>
        )}

          {/* AI Task Ideas Section */}
          <TaskIdeas onRunAction={sendMessage} />

          {/* AI Assistant Popup Button - at bottom left of sidebar */}
          <div className="p-3 border-t border-[#dae0e2] dark:border-[#27272a]">
          <button
            onClick={() => setAssistantOpen(!assistantOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:bg-[#343434]/90 dark:hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">AI Assistant</span>
            {assistantMessages.length > 1 && (
              <span className="ml-auto w-4 h-4 rounded-full bg-white/20 text-xs flex items-center justify-center">
                {assistantMessages.length - 1}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* AI Assistant Popup */}
      {assistantOpen && (
        <div className="fixed bottom-4 left-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-[#dae0e2] flex flex-col z-50">
          <div className="p-4 border-b border-[#dae0e2] flex items-center justify-between">
            <div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-[#343434] dark:bg-white flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white dark:text-[#0a0a0a]" />
                </div>
              <div>
                <p className="text-sm font-medium text-[#343434] dark:text-white">AI Assistant</p>
                <p className="text-xs text-[#343434]/50">Helps you with prompts</p>
              </div>
            </div>
            <button onClick={() => setAssistantOpen(false)} className="p-1.5 rounded-lg hover:bg-[#f8f9fa]">
              <X className="w-4 h-4 text-[#343434] dark:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {assistantMessages.map((msg, idx) => (
              <div key={idx} className={`${msg.role === "user" ? "ml-4" : "mr-4"}`}>
                <div className={`p-3 rounded-xl text-sm ${msg.role === "user"
                  ? "bg-[#343434] text-white"
                  : "bg-[#f8f9fa] border border-[#dae0e2] text-[#343434] dark:text-white"
                  }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => {
                        // Extract prompt from response
                        const promptMatch = msg.content.match(/Prompt:\s*"([^"]+)"/i);
                        if (promptMatch) {
                          // Send directly to chat and execute
                          useAssistantPrompt(promptMatch[1]);
                        } else {
                          // Fallback: try to extract any quoted text
                          const quotedMatch = msg.content.match(/"([^"]{10,})"/);
                          if (quotedMatch) {
                            useAssistantPrompt(quotedMatch[1]);
                          }
                        }
                      }}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-xs hover:shadow-lg transition-all flex items-center gap-1"
                    >
<Zap className="w-3 h-3" />
                        Run automation
                      </button>
                  )}
              </div>
            ))}
            {assistantLoading && (
              <div className="mr-4">
                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#dae0e2] dark:border-[#27272a]">
                  <div className="flex items-center gap-2 text-[#343434]/50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={assistantEndRef} />
          </div>

          <div className="p-3 border-t border-[#dae0e2] dark:border-[#27272a]">
            <div className="flex gap-2">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAssistantSend();
                  }
                }}
                placeholder="Describe what you want to do..."
                className="flex-1 px-3 py-2 rounded-lg border border-[#dae0e2] text-sm text-[#343434] focus:outline-none focus:border-[#343434]/30"
              />
              <button
                onClick={handleAssistantSend}
                disabled={!assistantInput.trim() || assistantLoading}
                className="p-2 rounded-lg bg-[#343434] text-white hover:bg-[#343434]/90 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 space-y-1">
              <p className="text-xs text-[#343434]/40 dark:text-white/40 mb-1">Quick questions:</p>
              {[
                "How do I write a good social media post?",
                "Help me create an abandoned cart email"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAssistantInput(q);
                    handleAssistantSend();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-[#343434]/60 hover:bg-[#f8f9fa] hover:text-[#343434] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10 [perspective:1000px]">
        <header className="px-6 py-4 border-b border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] sticky top-0 z-30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-[#d6dfe8]/50 dark:hover:bg-[#27272a] transition-colors text-[#343434] dark:text-white"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Credits Display */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                credits.available < 25 
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                  : 'border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#0a0a0a]'
              }`}>
                <Zap className={`w-4 h-4 ${credits.available < 25 ? 'text-red-500' : 'text-green-500'}`} />
                <span className={`text-sm font-medium ${
                  credits.available < 25 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-[#343434] dark:text-white'
                }`}>
                  {credits.available} / {credits.daily} credits
                </span>
                {credits.available < 25 && (
                  <button
                    onClick={() => router.push("/pricing")}
                    className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Upgrade
                  </button>
                )}
              </div>
              <NotificationBell onRunAction={sendMessage} />
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="p-2.5 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a] transition-colors cursor-pointer"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            {selectedPersona && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                <div className="relative w-6 h-6 rounded-md overflow-hidden">
                  <Image src={selectedPersona.avatar} alt={selectedPersona.name} fill className="object-cover" unoptimized />
                </div>
                <span className="text-sm font-medium text-[#343434] dark:text-white">{selectedPersona.name}</span>
                <span className="text-xs text-[#343434]/50 dark:text-white/50">({selectedPersona.label})</span>
                <button
                  onClick={() => setSelectedPersona(null)}
                  className="ml-1 text-[#343434]/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {activeCustomChat && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#d6dfe8]/50 border border-[#dae0e2] dark:border-[#27272a]">
                {activeCustomChat.logo ? (
                  <Image src={activeCustomChat.logo} alt={activeCustomChat.name} width={20} height={20} className="rounded" unoptimized />
                ) : (
                  <Building className="w-4 h-4 text-[#343434]/60 dark:text-white/60" />
                )}
                <span className="text-sm font-medium text-[#343434] dark:text-white">{activeCustomChat.name}</span>
                <button
                  onClick={() => setActiveCustomChat(null)}
                  className="ml-1 text-[#343434]/40 hover:text-[#343434] dark:text-white/40 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <h1 className={`text-base font-semibold text-[#343434] dark:text-white ${messages.length === 0 && !selectedPersona && !activeCustomChat ? 'absolute left-1/2 transform -translate-x-1/2' : ''}`}>
              {messages.length === 0 ? "New conversation" : messages[0]?.content.slice(0, 40) + (messages[0]?.content.length > 40 ? "..." : "")}
            </h1>
            {activeCustomChat && activeCustomChat.colors.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                {activeCustomChat.colors.slice(0, 4).map((color, idx) => (
                  <div key={idx} className="w-3.5 h-3.5 rounded-full border border-white shadow-md ring-1 ring-black/5" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
          </div>
        </header>

          <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0a] relative scroll-smooth">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {messages.length === 0 ? (
                  <div className="max-w-4xl mx-auto pt-12 px-6">
                    <div className="text-center mb-12">
                      <div className="w-20 h-20 bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-[#dae0e2] dark:border-[#27272a] flex items-center justify-center mx-auto mb-6 shadow-xl relative group">
                        <Sparkles className="w-10 h-10 text-[#343434] dark:text-white group-hover:scale-110 transition-transform" />
                        <div className="absolute -inset-4 bg-blue-500/5 rounded-full blur-2xl -z-10" />
                      </div>
                      <h1 className="text-4xl font-bold text-[#343434] dark:text-white mb-4 tracking-tight">
                        {t.hero.title.split('with')[0]}
                      </h1>
                      <p className="text-lg text-[#343434]/50 dark:text-white/50 max-w-xl mx-auto">
                        {t.hero.subtitle}
                      </p>
                    </div>

                    {/* Top 10 Apps Section In-App */}
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#343434] dark:text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-500" />
                          {t.top10.title}
                        </h2>
                        <Link href="/marketplace" className="text-xs font-medium text-blue-500 hover:underline">
                          {t.top10.seeAll}
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          { id: "gmail", name: "Gmail" },
                          { id: "slack", name: "Slack" },
                          { id: "instagram", name: "Instagram" },
                          { id: "googlecalendar", name: "Calendar" },
                          { id: "hubspot", name: "HubSpot" },
                          { id: "github", name: "GitHub" },
                          { id: "facebook", name: "Facebook" },
                          { id: "googlesheets", name: "Sheets" },
                          { id: "stripe", name: "Stripe" },
                          { id: "notion", name: "Notion" },
                        ].map((app) => (
                          <button
                            key={app.id}
                            onClick={() => connectIntegration(app.id)}
                            className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:shadow-lg hover:-translate-y-1 transition-all group text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
                              <Image 
                                src={`https://logos.composio.dev/api/${app.id}`} 
                                alt={app.name} 
                                width={24} 
                                height={24} 
                                unoptimized 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/logo.png";
                                }}
                              />
                            </div>
                            <p className="text-xs font-bold text-[#343434] dark:text-white mb-1">{app.name}</p>
                            <div className="flex items-center gap-1 text-[9px] text-[#343434]/40 dark:text-white/40">
                              {connectedIntegrations.has(app.id) ? (
                                <span className="text-green-500 font-medium flex items-center gap-0.5">
                                  <Check className="w-2 h-2" /> Connected
                                </span>
                              ) : (
                                <span>Click to connect</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Suggested Prompts Grid */}
                      {(activeCustomChat?.brandVoice || selectedPersona?.prompts) ? (
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          {(selectedPersona?.prompts || [
                            { title: "Summarize Emails", prompt: "Summarize my latest emails from Gmail" },
                            { title: "Search Web", prompt: "Search the web for the latest news about AI" },
                            { title: "Create Image", prompt: "Create a professional business illustration for a presentation" }
                          ]).map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => usePrompt(item.prompt)}
                              className="p-5 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                            >
                              <div className="w-10 h-10 rounded-2xl bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-5 h-5 text-[#343434]/20 dark:text-white/20" />
                              </div>
                              <h3 className="text-sm font-bold text-[#343434] dark:text-white mb-2">{item.title}</h3>
                              <p className="text-xs text-[#343434]/40 dark:text-white/40 line-clamp-2">{item.prompt}</p>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => usePrompt("Summarize my latest emails from Gmail and highlight any urgent tasks")}
                            className="p-6 rounded-[32px] bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Mail className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[#343434] dark:text-white mb-2">Summarize Emails</h3>
                            <p className="text-sm text-[#343434]/40 dark:text-white/40 leading-relaxed">
                              Get a quick overview of your Gmail inbox and stay on top of important messages.
                            </p>
                          </button>

                          <button
                            onClick={() => usePrompt("Create a social media post for my new product and suggest 5 relevant hashtags")}
                            className="p-6 rounded-[32px] bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[#343434] dark:text-white mb-2">Social Media Content</h3>
                            <p className="text-sm text-[#343434]/40 dark:text-white/40 leading-relaxed">
                              Generate engaging posts and hashtags for your Instagram, Facebook, and Twitter.
                            </p>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                <div className="space-y-8">
                  {messages.map((message, idx) => (
                    <div
                      key={message.id}
                      className={`flex flex-col animate-in fade-in duration-500 ${message.role === "user" ? "items-end" : "items-start"}`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className={`max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                        {message.role === "user" ? (
                          <>
                            <div className="flex items-center gap-2 mb-1 opacity-40 text-[10px] uppercase font-bold tracking-widest justify-end">
                              <span>You</span>
                            </div>
                            <div className="bg-[#f0f2f5] dark:bg-[#1a1a1a] px-4 py-2.5 rounded-2xl rounded-tr-none text-[#343434] dark:text-white shadow-sm">
                              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </>
                          ) : (message.requiresAuth || message.connectionUrl || (message.role === "assistant" && (message.content.includes("https://") || message.content.includes("http://")) && (message.content.toLowerCase().includes("connect") || message.content.toLowerCase().includes("auth") || message.content.toLowerCase().includes("link")))) ? (() => {
                            const urlInContent = message.content.match(/(https?:\/\/[^\s]+)/)?.[1];
                            const connectionUrl = message.connectionUrl || urlInContent;
                              const toolkitForCard = message.toolkit || inferToolkitFromTextOrUrl(message.content, connectionUrl);
                              const normalizedToolkitForCard = toolkitForCard?.toLowerCase().replace(/[^a-z0-9]/g, "");
                              
                              // If already connected, just show as a normal message
                              if (normalizedToolkitForCard && connectedIntegrations.has(normalizedToolkitForCard)) {
                                return (
                                <>
                                  <div className="flex items-center gap-2 mb-1 opacity-40 text-[10px] uppercase font-bold tracking-widest justify-start">
                                    <span>Beauto</span>
                                  </div>
                                  <div className="text-[#343434] dark:text-white">
                                    <div className="text-[15px] leading-relaxed">
                                      {formatMessageContent(message.content)}
                                    </div>
                                    
                                    {/* Feedback buttons */}
                                    <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#dae0e2]/50 dark:border-[#27272a]/50">
                                      <button
                                        onClick={() => handlePlayTTS(message.content, message.id)}
                                        className={`p-1.5 rounded-lg transition-all ${playingMessageId === message.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-blue-500'}`}
                                        title="Read aloud"
                                      >
                                        {playingMessageId === message.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                      </button>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(message.content);
                                          setCopiedMessageId(message.id);
                                          setTimeout(() => setCopiedMessageId(null), 2000);
                                        }}
                                        className={`p-1.5 rounded-lg transition-all ${copiedMessageId === message.id ? 'bg-green-100 text-green-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-[#343434] dark:hover:text-white'}`}
                                        title="Copy message"
                                      >
                                        {copiedMessageId === message.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const prevQuery = messages.findLast((m, i) => m.role === "user" && i < idx)?.content;
                                          setMessageFeedback(prev => ({ ...prev, [message.id]: "thumbs_up" }));
                                          await fetch("/api/feedback", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              messageId: message.id,
                                              chatId: currentSessionId,
                                              messageContent: message.content,
                                              userQuery: prevQuery,
                                              feedbackType: "thumbs_up",
                                            }),
                                          });
                                        }}
                                        className={`p-1.5 rounded-lg transition-all ${messageFeedback[message.id] === "thumbs_up" ? 'bg-green-100 text-green-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-green-500'}`}
                                        title="Good response"
                                      >
                                        <ThumbsUp className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const prevQuery = messages.findLast((m, i) => m.role === "user" && i < idx)?.content;
                                          setMessageFeedback(prev => ({ ...prev, [message.id]: "thumbs_down" }));
                                          await fetch("/api/feedback", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              messageId: message.id,
                                              chatId: currentSessionId,
                                              messageContent: message.content,
                                              userQuery: prevQuery,
                                              feedbackType: "thumbs_down",
                                            }),
                                          });
                                        }}
                                        className={`p-1.5 rounded-lg transition-all ${messageFeedback[message.id] === "thumbs_down" ? 'bg-red-100 text-red-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-red-500'}`}
                                        title="Bad response"
                                      >
                                        <ThumbsDown className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              );
                            }

                            const info = getToolkitInfo(toolkitForCard);

                          const canConnect = Boolean(connectionUrl || toolkitForCard);
                          const cleanContent = message.content.replace(/(https?:\/\/[^\s]+)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();

                          return (
                            <div className="mt-2 w-full max-w-[500px] bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-[#e5e7eb] dark:border-[#27272a] shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center shadow-md overflow-hidden">
                                    <Image src="/beauto-logo.png" alt="Beauto" width={28} height={28} className="object-contain" />
                                  </div>
                                  <div>
                                    <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-white leading-tight">Beauto Assistant</p>
                                    <p className="text-[13px] text-[#65676b] dark:text-[#a0a0a0]">@beauto_ai · just now</p>
                                  </div>
                                </div>
                                <button className="text-[#65676b] hover:bg-gray-100 dark:hover:bg-white/5 p-1.5 rounded-full transition-colors">
                                  <MoreHorizontal className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Text */}
                              <p className="text-[15px] text-[#1a1a1a] dark:text-white leading-normal">
                                {cleanContent || `Complete authentication to connect to ${info?.name || toolkitForCard || "the app"} and let me help you with your tasks. 🚀`}
                              </p>

                              {/* Link Card (The Action) */}
                              <button
                                  onClick={() => {
                                    if (connectedIntegrations.has(toolkitForCard?.toLowerCase() || "")) return;
                                    if (connectionUrl) {
                                      window.location.href = connectionUrl;
                                      return;
                                    }
                                    if (toolkitForCard) {
                                      connectApp(toolkitForCard);
                                    }
                                  }}
                                  disabled={!canConnect || connectedIntegrations.has(toolkitForCard?.toLowerCase() || "")}
                                  className={`w-full text-left bg-[#f0f2f5] dark:bg-[#27272a] rounded-[20px] border border-[#e5e7eb] dark:border-[#3f3f46] p-4 flex items-center gap-4 group/link transition-all hover:bg-[#e4e6e9] dark:hover:bg-[#323238] active:scale-[0.98] disabled:opacity-80 ${connectedIntegrations.has(toolkitForCard?.toLowerCase() || "") ? "hidden" : ""}`}
                                >
                                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-sm group-hover/link:scale-105 transition-transform">
                                    {info?.logo ? (
                                      <Image src={info.logo} alt={info.name} width={24} height={24} unoptimized className="object-contain" />
                                    ) : (
                                      <Link2 className="w-5 h-5 text-blue-500" />
                                    )}
                                  </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-[15px] font-bold text-[#1a1a1a] dark:text-white truncate">
                                          {info?.name || toolkitForCard || "Complete connection"}
                                        </p>
                                        {connectedIntegrations.has(toolkitForCard?.toLowerCase() || "") && (
                                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                      </div>
                                      <p className={`text-[13px] truncate ${connectedIntegrations.has(toolkitForCard?.toLowerCase() || "") ? "text-green-600 font-medium" : "text-[#65676b] dark:text-[#a0a0a0]"}`}>
                                        {connectedIntegrations.has(toolkitForCard?.toLowerCase() || "") 
                                          ? "Account is successfully connected" 
                                          : "Click here to securely connect your account"}
                                      </p>
                                    </div>
                                  </button>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#f0f2f5] dark:border-[#27272a]">
                                <div className="flex items-center gap-6">
                                  <button
                                    onClick={() => handlePlayTTS(cleanContent || `Please connect to ${info?.name || toolkitForCard}`, message.id)}
                                    className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${playingMessageId === message.id ? 'bg-blue-100 text-blue-600' : 'text-[#65676b] hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                  >
                                    {playingMessageId === message.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                                  </button>
                                  <div className="flex items-center gap-2 text-[#65676b] text-[13px]">
                                    <Heart className="w-5 h-5" />
                                    <span>12</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[#65676b] text-[13px]">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>4</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[#65676b] text-[13px]">
                                    <Share2 className="w-5 h-5" />
                                    <span>24</span>
                                  </div>
                                </div>
                                <Bookmark className="w-5 h-5 text-[#65676b]" />
                              </div>
                            </div>
                          );
                        })() : (
                          <>
                              <div className="flex items-center gap-2 mb-1 opacity-40 text-[10px] uppercase font-bold tracking-widest justify-start">
                                <span>Beauto</span>
                              </div>
                              <div className="text-[#343434] dark:text-white">
                                <div className="text-[15px] leading-relaxed">
                                  {formatMessageContent(message.content)}
                                </div>

                                {message.toolsUsed && message.toolsUsed.length > 0 && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 w-fit mt-4">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                      Tools: {message.toolsUsed.join(", ")}
                                    </p>
                                  </div>
                                )}

                                {/* Feedback buttons */}
                                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#dae0e2]/50 dark:border-[#27272a]/50">
                                  <button
                                    onClick={() => handlePlayTTS(message.content, message.id)}
                                    className={`p-1.5 rounded-lg transition-all ${playingMessageId === message.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-blue-500'}`}
                                    title="Read aloud"
                                  >
                                    {playingMessageId === message.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(message.content);
                                      setCopiedMessageId(message.id);
                                      setTimeout(() => setCopiedMessageId(null), 2000);
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${copiedMessageId === message.id ? 'bg-green-100 text-green-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-[#343434] dark:hover:text-white'}`}
                                    title="Copy message"
                                  >
                                    {copiedMessageId === message.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const prevQuery = messages.findLast((m, i) => m.role === "user" && i < idx)?.content;
                                      setMessageFeedback(prev => ({ ...prev, [message.id]: "thumbs_up" }));
                                      await fetch("/api/feedback", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          messageId: message.id,
                                          chatId: currentSessionId,
                                          messageContent: message.content,
                                          userQuery: prevQuery,
                                          feedbackType: "thumbs_up",
                                        }),
                                      });
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${messageFeedback[message.id] === "thumbs_up" ? 'bg-green-100 text-green-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-green-500'}`}
                                    title="Good response"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const prevQuery = messages.findLast((m, i) => m.role === "user" && i < idx)?.content;
                                      setMessageFeedback(prev => ({ ...prev, [message.id]: "thumbs_down" }));
                                      await fetch("/api/feedback", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          messageId: message.id,
                                          chatId: currentSessionId,
                                          messageContent: message.content,
                                          userQuery: prevQuery,
                                          feedbackType: "thumbs_down",
                                        }),
                                      });
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${messageFeedback[message.id] === "thumbs_down" ? 'bg-red-100 text-red-600' : 'hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] text-[#343434]/40 dark:text-white/40 hover:text-red-500'}`}
                                    title="Bad response"
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                  ))}
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isLoading && (
                          <div className="flex flex-col gap-2">
                            {isToolUseExpected ? (
                              <ThinkingIndicator query={messages[messages.length - 1]?.content || ""} visible={isLoading} />
                            ) : (
                              <div className="flex flex-col items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 mb-1 opacity-40 text-[10px] uppercase font-bold tracking-widest">
                                  <span>Beauto</span>
                                </div>
                                <div className="bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
                                  <div className="flex gap-1">
                                    <motion.div 
                                      className="w-1.5 h-1.5 rounded-full bg-[#343434]/40 dark:bg-white/40"
                                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                    />
                                    <motion.div 
                                      className="w-1.5 h-1.5 rounded-full bg-[#343434]/40 dark:bg-white/40"
                                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    />
                                    <motion.div 
                                      className="w-1.5 h-1.5 rounded-full bg-[#343434]/40 dark:bg-white/40"
                                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                    />
                                  </div>
                                  <span className="text-sm text-[#343434]/60 dark:text-white/60 font-medium italic">Thinking...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>
          </main>

        <div className="bg-white dark:bg-[#0a0a0a]">
          <div className="max-w-3xl mx-auto px-6 py-4">
            {/* File upload preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f8f9fa] dark:bg-[#27272a] border border-[#dae0e2] dark:border-[#27272a]">
                    <div className="flex items-center gap-2 flex-1">
                      {file.type.startsWith("image/") ? <ImageIcon className="w-4 h-4 text-[#343434]/60 dark:text-white/60" /> :
                       file.type.startsWith("video/") ? <Video className="w-4 h-4 text-[#343434]/60 dark:text-white/60" /> :
                       <File className="w-4 h-4 text-[#343434]/60 dark:text-white/60" />}
                      <span className="text-sm text-[#343434] dark:text-white truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-[#343434]/40 dark:text-white/40">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeUploadedFile(file.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3 px-4 py-3 rounded-[24px] border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a] shadow-sm transition-all focus-within:shadow-md relative group/input">
              <div className="flex items-center gap-1.5 mb-0.5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowQuickActions(!showQuickActions);
                  }}
                  className={`p-2 transition-all rounded-xl ${
                    showQuickActions 
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'text-[#343434]/40 dark:text-white/40 hover:text-[#343434] dark:hover:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]'
                  }`}
                  title="Quick Actions"
                  aria-label="Quick Actions"
                >
                  <Zap className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowVoiceAssistant(!showVoiceAssistant);
                  }}
                  className={`p-2 transition-all rounded-xl ${
                    showVoiceAssistant 
                      ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-[#343434]/40 dark:text-white/40 hover:text-[#343434] dark:hover:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]'
                  }`}
                  title="Live Voice Mode"
                  aria-label="Voice Assistant"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    uploadChatFileRef.current?.click();
                  }}
                  disabled={uploadingFile}
                  className={`p-2 transition-all rounded-xl ${
                    uploadingFile 
                      ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-[#343434]/40 dark:text-white/40 hover:text-[#343434] dark:hover:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Upload File"
                  aria-label="Upload File"
                >
                  {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={credits.available < 25 ? "Insufficient credits. Please upgrade to continue." : "Type a message..."}
                disabled={credits.available < 25}
                rows={1}
                className={`flex-1 bg-transparent text-[#343434] dark:text-white placeholder:text-[#343434]/40 dark:placeholder:text-white/40 resize-none focus:outline-none text-[15px] py-2.5 min-h-[44px] max-h-[120px] ${
                  credits.available < 25 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />

              <button
                onClick={() => sendMessage(inputValue)}
                disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading || credits.available < 25}
                className="mb-1 p-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 shadow-lg"
                title={credits.available < 25 ? `Insufficient credits. You need 25 credits but only have ${credits.available}. Please upgrade.` : "Send message"}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
              </button>

              {showQuickActions && (
                <div 
                  ref={quickActionsRef}
                  className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-[#dae0e2] dark:border-[#27272a] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2"
                  role="menu"
                  aria-label="Quick Actions"
                >
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { icon: <Mail className="w-4 h-4 text-blue-500" />, label: "Summarize emails", prompt: "Summarize my latest emails from Gmail" },
                        { icon: <Search className="w-4 h-4 text-purple-500" />, label: "Search the web", prompt: "Search the web for..." },
                        { icon: <ImageIcon className="w-4 h-4 text-pink-500" />, label: "Generate image", prompt: "Create an image of..." },
                        { icon: <MessageSquarePlus className="w-4 h-4 text-green-500" />, label: "Write response", prompt: "Help me write a response to..." },
                        { icon: <Globe className="w-4 h-4 text-cyan-500" />, label: "Create a website", prompt: "WEB_BUILDER", isWebBuilder: true },
                        { icon: <Layout className="w-4 h-4 text-orange-500" />, label: "Playground", prompt: "PLAYGROUND", isPlayground: true },
                        { icon: <Calendar className="w-4 h-4 text-indigo-500" />, label: "Social Media Autopilot", prompt: "SOCIAL_AUTOPILOT", isSocialAutopilot: true },
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if ((action as any).isPlayground) {
                              setShowQuickActions(false);
                              router.push("/playground");
                            } else if ((action as any).isWebBuilder) {
                              setShowQuickActions(false);
                              router.push("/builder");
                            } else if ((action as any).isSocialAutopilot) {
                              setShowQuickActions(false);
                              router.push("/social-autopilot");
                            } else {
                              setInputValue(action.prompt);
                              setShowQuickActions(false);
                              textareaRef.current?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setShowQuickActions(false);
                            }
                          }}
                          className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors text-left group/item focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          role="menuitem"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#f8f9fa] dark:bg-[#27272a] flex items-center justify-center group-hover/item:scale-110 transition-transform">
                            {action.icon}
                          </div>
                          <span className="text-sm font-medium text-[#343434] dark:text-white">{action.label}</span>
                        </button>
                      ))}
                    </div>
                </div>
              )}
            </div>
            
            <input
              ref={uploadChatFileRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Create Custom Chat Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#dae0e2] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#343434] dark:text-white">Create Custom Chat</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[#f8f9fa] rounded-lg">
                <X className="w-5 h-5 text-[#343434] dark:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">Company/Chat Name *</label>
                <input
                  type="text"
                  value={newCustomChat.name || ""}
                  onChange={(e) => setNewCustomChat(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30"
                />
              </div>

              {/* Website URL with Crawl */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website URL (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newCustomChat.websiteUrl || ""}
                    onChange={(e) => setNewCustomChat(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30"
                  />
                  <button
                    onClick={async () => {
                      if (!newCustomChat.websiteUrl) return;
                      setCrawling(true);
                      try {
                        const res = await fetch("/api/crawl", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url: newCustomChat.websiteUrl }),
                        });
                        const data = await res.json();
                        if (data.companyName) {
                          setNewCustomChat(prev => ({
                            ...prev,
                            name: prev.name || data.companyName,
                            description: data.description,
                            brandVoice: data.brandVoice,
                            targetAudience: data.targetAudience,
                            colors: data.colors,
                            logo: data.logo,
                            crawledContent: data.pages.map((p: { title: string; content: string }) => `${p.title}\n${p.content}`).join("\n\n"),
                          }));
                        }
                      } catch (error) {
                        console.error("Crawl failed:", error);
                      } finally {
                        setCrawling(false);
                      }
                    }}
                    disabled={!newCustomChat.websiteUrl || crawling}
                    className="px-4 py-2.5 rounded-xl bg-[#343434] text-white text-sm font-medium hover:bg-[#343434]/90 disabled:opacity-40 flex items-center gap-2"
                  >
                    {crawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {crawling ? "Crawling..." : "Crawl"}
                  </button>
                </div>
                <p className="text-xs text-[#343434]/50 mt-1">We'll extract brand info, colors, logo and content</p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {newCustomChat.logo && (
                    <div className="w-16 h-16 rounded-xl border border-[#dae0e2] overflow-hidden">
                      <Image src={newCustomChat.logo} alt="Logo" width={64} height={64} className="w-full h-full object-contain" unoptimized />
                    </div>
                  )}
                  <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setNewCustomChat(prev => ({ ...prev, logo: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 rounded-xl border border-[#dae0e2] text-[#343434] text-sm hover:bg-[#f8f9fa]">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Logo
                  </button>
                </div>
              </div>

              {/* Brand Voice */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Brand Voice
                </label>
                <input
                  type="text"
                  value={newCustomChat.brandVoice || ""}
                  onChange={(e) => setNewCustomChat(prev => ({ ...prev, brandVoice: e.target.value }))}
                  placeholder="e.g., Professional, Friendly, Tech-focused"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Target Audience
                </label>
                <input
                  type="text"
                  value={newCustomChat.targetAudience || ""}
                  onChange={(e) => setNewCustomChat(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., Small Business Owners, Developers"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30"
                />
              </div>

              {/* Brand Colors */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Brand Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  {(newCustomChat.colors || []).map((color, idx) => (
                    <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f8f9fa] border border-[#dae0e2] dark:border-[#27272a]">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                      <span className="text-xs text-[#343434] dark:text-white">{color}</span>
                      <button onClick={() => setNewCustomChat(prev => ({ ...prev, colors: prev.colors?.filter((_, i) => i !== idx) }))} className="text-[#343434]/40 hover:text-[#343434] dark:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="color"
                    onChange={(e) => setNewCustomChat(prev => ({ ...prev, colors: [...(prev.colors || []), e.target.value] }))}
                    className="w-8 h-8 rounded cursor-pointer"
                    title="Add color"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">Company Description</label>
                <textarea
                  value={newCustomChat.description || ""}
                  onChange={(e) => setNewCustomChat(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your company..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30 resize-none"
                />
              </div>

              {/* Custom Knowledge */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Custom Knowledge
                </label>
                <textarea
                  value={newCustomChat.customKnowledge || ""}
                  onChange={(e) => setNewCustomChat(prev => ({ ...prev, customKnowledge: e.target.value }))}
                  placeholder="Add any additional information the AI should know about your company: products, services, FAQs, guidelines..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload Files
                </label>
                <input type="file" ref={fileInputRef} multiple accept=".txt,.pdf,.doc,.docx,.md" className="hidden" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNewCustomChat(prev => ({
                        ...prev,
                        files: [...(prev.files || []), { name: file.name, content: reader.result as string }]
                      }));
                    };
                    reader.readAsText(file);
                  });
                }} />
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl border border-[#dae0e2] text-[#343434] text-sm hover:bg-[#f8f9fa]">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Add Files
                </button>
                {(newCustomChat.files || []).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {newCustomChat.files!.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f8f9fa]">
                        <span className="text-sm text-[#343434] dark:text-white">{file.name}</span>
                        <button onClick={() => setNewCustomChat(prev => ({ ...prev, files: prev.files?.filter((_, i) => i !== idx) }))} className="text-[#343434]/40 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agent Type */}
              <div>
                <label className="text-sm font-medium text-[#343434] block mb-2">
                  <Bot className="w-4 h-4 inline mr-1" />
                  Agent Type
                </label>
                <select
                  value={newCustomChat.agentType || "general"}
                  onChange={(e) => setNewCustomChat(prev => ({ ...prev, agentType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] focus:outline-none focus:border-[#343434]/30 bg-white dark:bg-[#1a1a1a]"
                >
                    <option value="general">General Assistant</option>
                    <option value="customer_support">Customer Support</option>
                    <option value="legal">Legal</option>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                  </select>
                  <p className="text-xs text-[#343434]/50 mt-1">Specialize the agent for specific tasks</p>
                </div>

                {/* Integrations Selector */}
                <div>
                  <label className="text-sm font-medium text-[#343434] block mb-2">
                    <Link2 className="w-4 h-4 inline mr-1" />
                    Integrations
                  </label>
                  <p className="text-xs text-[#343434]/50 mb-2">Choose which integrations the agent should have access to</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Gmail', 'GitHub', 'Slack', 'Instagram', 'Calendar', 'Sheets', 'HubSpot', 'Gemini'].map(toolkit => (
                    <button
                      key={toolkit}
                      onClick={() => {
                        const lowerToolkit = toolkit.toLowerCase().replace(/\s/g, '');
                        setNewCustomChat(prev => ({
                          ...prev,
                          selectedIntegrations: (prev.selectedIntegrations || []).includes(lowerToolkit)
                            ? (prev.selectedIntegrations || []).filter(t => t !== lowerToolkit)
                            : [...(prev.selectedIntegrations || []), lowerToolkit]
                        }));
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (newCustomChat.selectedIntegrations || []).includes(toolkit.toLowerCase().replace(/\s/g, ''))
                          ? 'bg-blue-500 text-white'
                          : 'bg-[#f8f9fa] text-[#343434] border border-[#dae0e2] hover:bg-[#d6dfe8]'
                      }`}
                    >
                      {toolkit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#dae0e2] px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 rounded-xl border border-[#dae0e2] text-[#343434] text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustomChat.name) return;
                  const chat: CustomChat = {
                    id: crypto.randomUUID(),
                    name: newCustomChat.name,
                    logo: newCustomChat.logo || null,
                    websiteUrl: newCustomChat.websiteUrl || null,
                    brandVoice: newCustomChat.brandVoice || "",
                    targetAudience: newCustomChat.targetAudience || "",
                    colors: newCustomChat.colors || [],
                    description: newCustomChat.description || "",
                    customKnowledge: newCustomChat.customKnowledge || "",
                    files: newCustomChat.files || [],
                    crawledContent: newCustomChat.crawledContent || "",
                    selectedIntegrations: newCustomChat.selectedIntegrations || [],
                    agentType: newCustomChat.agentType || "general",
                    createdAt: new Date(),
                  };
                  setCustomChats(prev => [chat, ...prev]);
                  setActiveCustomChat(chat);
                  setShowCreateModal(false);
                  setNewCustomChat({
                    name: "", websiteUrl: "", brandVoice: "", targetAudience: "",
                    colors: [], description: "", customKnowledge: "", files: [], logo: null, crawledContent: "",
                    selectedIntegrations: [], agentType: "general"
                  });
                }}
                disabled={!newCustomChat.name}
                className="px-6 py-2.5 rounded-xl bg-[#343434] text-white text-sm font-medium hover:bg-[#343434]/90 disabled:opacity-40"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Onboarding Setup (Fullscreen Cinematic) */}
      <WizardOnboardingSetup 
        isOpen={showWizardSetup} 
        onClose={() => setShowWizardSetup(false)}
        onComplete={(data) => {
          console.log("Onboarding complete:", data);
          if (data.connectedPlatforms.length > 0) {
            setConnectedApps(prev => [...prev, ...data.connectedPlatforms]);
            data.connectedPlatforms.forEach(p => {
              setConnectedIntegrations(prev => new Set([...prev, p]));
            });
          }
          
          // Create custom chat from onboarding data
          const newChat: CustomChat = {
            id: crypto.randomUUID(),
            name: data.companyName || `${data.personaName}'s Assistant`,
            logo: data.persona === "sales" ? "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_2sfngy2sfngy2sfn-1766079943448.png?width=8000&height=8000&resize=contain" : 
                  data.persona === "admin" ? "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_76krx876krx876kr-1766079960841.png?width=8000&height=8000&resize=contain" :
                  data.persona === "accounting" ? "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_xfhe80xfhe80xfhe-1766079983224.png?width=8000&height=8000&resize=contain" :
                  data.persona === "support" ? "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_e9qcx4e9qcx4e9qc-1766080063714.png?width=8000&height=8000&resize=contain" :
                  data.persona === "hr" ? "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_hswwzghswwzghsww-1766080128781.png?width=8000&height=8000&resize=contain" :
                  data.persona === "marketing" ? "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Gemini_Generated_Image_5y0ncy5y0ncy5y0n-1766080149784.png?width=8000&height=8000&resize=contain" : null,
            websiteUrl: data.websiteUrl || null,
            brandVoice: "Professional and helpful",
            targetAudience: "Customers",
            colors: [],
            description: `Assistant for ${data.companyName || "my business"}`,
            customKnowledge: data.crawledContent || "",
            files: [],
            crawledContent: data.crawledContent || "",
            selectedIntegrations: data.connectedPlatforms,
            agentType: data.persona,
            createdAt: new Date(),
          };
          
          setCustomChats(prev => [newChat, ...prev]);
          setActiveCustomChat(newChat);
          setActiveSection("chats");
          
          // Optionally start a new chat session immediately
          startNewChat();
        }}
      />

      {/* Guide Modal (Previously Wizard Onboarding) */}
      <WizardOnboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#343434] dark:text-white">Create Team</h2>
              <button onClick={() => setShowCreateTeam(false)} className="p-2 hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] rounded-lg">
                <X className="w-5 h-5 text-[#343434] dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Team Name *</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Marketing Team"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this team for?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateTeam(false)}
                className="px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
              >
                Cancel
              </button>
              <button
                onClick={createTeam}
                disabled={!newTeam.name.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium hover:bg-[#343434]/90 dark:hover:bg-white/90 disabled:opacity-40"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#343434] dark:text-white">Invite to {selectedTeam.name}</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] rounded-lg">
                <X className="w-5 h-5 text-[#343434] dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-[#343434]/50 dark:text-white/50 mt-1">
                  Admins can invite new members and manage team settings
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white text-sm font-medium hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
              >
                Cancel
              </button>
              <button
                onClick={inviteToTeam}
                disabled={!inviteEmail.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium hover:bg-[#343434]/90 dark:hover:bg-white/90 disabled:opacity-40"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      <VoiceAssistant 
        isOpen={showVoiceAssistant} 
        onClose={() => setShowVoiceAssistant(false)}
        language={language}
        initialPrompt={`${inputValue}\n\nRecent chat history:\n${messages.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n")}`}
        onTranscript={(text) => {
          // Only log it locally if needed, but don't send to main chat 
          // yet unless it's a confirmed command (handled by onSubmitPrompt)
          console.log("Voice transcript:", text);
        }}
        onSubmitPrompt={(text) => {
          // This is triggered by a voice tool call (e.g. submit_to_chat)
          // We want to actually send this and trigger the response
          sendMessage(text, false);
        }}
        onAssistantResponse={(text) => {
          // Only log locally if needed, don't add to main chat history
          // as per user request to keep chat clean
          console.log("Assistant response:", text);
        }}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-white items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#343434]/40" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
