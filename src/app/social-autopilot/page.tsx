"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Settings, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Zap,
  Layout,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ScheduledPost {
  id: string;
  date: Date;
  type: "image" | "video";
  status: "scheduled" | "draft" | "posted";
  title: string;
  platform: string[];
  imageUrl?: string;
  imageBase64?: string;
  caption?: string;
}

export default function SocialAutopilotPage() {
  const [step, setStep] = useState<"connect" | "config" | "calendar">("connect");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectedProfiles, setConnectedProfiles] = useState<string[]>([]);
  
  // Config state
  const [frequency, setFrequency] = useState("3");
  const [duration, setDuration] = useState("1");
  const [autoSearch, setAutoSearch] = useState(true);
  const [niche, setNiche] = useState("lifestyle");
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400", description: "Photos, Reels & Stories" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-black", description: "Tweets & threads" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-600", description: "Professional posts" },
    { id: "facebook", name: "Facebook", icon: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, color: "bg-blue-500", description: "Posts & Pages" },
    { id: "tiktok", name: "TikTok", icon: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, color: "bg-black", description: "Short videos" },
    { id: "reddit", name: "Reddit", icon: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>, color: "bg-orange-500", description: "Subreddits & posts" },
  ];

  const handleConnect = (platform: string) => {
    if (connectedProfiles.includes(platform)) {
      setConnectedProfiles(prev => prev.filter(p => p !== platform));
    } else {
      setConnectedProfiles(prev => [...prev, platform]);
    }
  };

  const startAutopilot = async () => {
    setIsGenerating(true);
    
    try {
      const totalWeeks = parseInt(duration) * 4;
      const postsPerWeek = parseInt(frequency);
      const totalPosts = Math.min(totalWeeks * postsPerWeek, 12);
      
      const response = await fetch("/api/social-autopilot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          platform: connectedProfiles[0] || "instagram",
          count: totalPosts,
          generateImages: true,
        }),
      });
      
      const data = await response.json();
      
      if (data.posts && data.posts.length > 0) {
        const newPosts: ScheduledPost[] = [];
        let currentPostDate = new Date();
        
        data.posts.forEach((post: { title: string; caption: string; type: string; imageUrl?: string; imageBase64?: string }, i: number) => {
          currentPostDate = addDays(currentPostDate, Math.floor(7 / postsPerWeek));
          newPosts.push({
            id: Math.random().toString(36).substr(2, 9),
            date: new Date(currentPostDate),
            type: post.type?.toLowerCase() === "video" ? "video" : "image",
            status: "scheduled",
            title: post.title || `AI Generated Content #${i + 1}`,
            caption: post.caption,
            platform: connectedProfiles,
            imageUrl: post.imageUrl,
            imageBase64: post.imageBase64,
          });
        });
        
        setPosts(newPosts);
      }
    } catch (error) {
      console.error("Failed to generate posts:", error);
    }
    
    setIsGenerating(false);
    setStep("calendar");
  };

  const renderConnect = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 text-white shadow-xl mb-4">
          <Share2 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-stone-900">Connect Your Profiles</h1>
        <p className="text-stone-500">Link at least one social media account to start the autopilot.</p>
        
        {connectedProfiles.length === 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Connect at least 1 platform to continue
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {platforms.map(platform => {
          const isConnected = connectedProfiles.includes(platform.id);
          const IconComponent = platform.icon;
          
          return (
            <Card 
              key={platform.id} 
              className={`p-6 transition-all group cursor-pointer ${
                isConnected 
                  ? "border-green-300 bg-green-50/50 shadow-lg shadow-green-100" 
                  : "border-stone-200 hover:border-stone-400 hover:shadow-md"
              }`}
              onClick={() => handleConnect(platform.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center text-white shadow-lg ${isConnected ? "ring-2 ring-green-400 ring-offset-2" : ""}`}>
                      {typeof IconComponent === 'function' ? 
                        React.createElement(IconComponent as any) : 
                        React.createElement(IconComponent as any, { className: "w-6 h-6" })}
                    </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{platform.name}</h3>
                    <p className="text-xs text-stone-400">{platform.description}</p>
                  </div>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </div>
                ) : (
                  <Button 
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(platform.id);
                    }}
                    className="bg-stone-900 hover:bg-stone-800"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 pt-8">
        <Button 
          size="lg" 
          disabled={connectedProfiles.length === 0}
          onClick={() => setStep("config")}
          className="px-12 py-6 rounded-2xl bg-[#343434] hover:bg-stone-800 text-lg font-bold shadow-xl shadow-stone-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Setup <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
        {connectedProfiles.length > 0 && (
          <p className="text-sm text-green-600 font-medium">
            {connectedProfiles.length} platform{connectedProfiles.length > 1 ? 's' : ''} connected
          </p>
        )}
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 text-white shadow-xl mb-4">
          <Settings className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-stone-900">Configure Autopilot</h1>
        <p className="text-stone-500">Tell us how often and for how long you want to post.</p>
      </div>

      <Card className="p-8 border-stone-200 shadow-xl shadow-stone-100 space-y-8">
        <div className="space-y-4">
          <Label className="text-lg font-bold text-stone-900">Your Niche</Label>
          <Select value={niche} onValueChange={setNiche}>
            <SelectTrigger className="h-14 rounded-xl border-stone-200">
              <SelectValue placeholder="Select your niche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lifestyle">Lifestyle & Wellness</SelectItem>
              <SelectItem value="fitness">Fitness & Health</SelectItem>
              <SelectItem value="food">Food & Recipes</SelectItem>
              <SelectItem value="fashion">Fashion & Beauty</SelectItem>
              <SelectItem value="tech">Tech & Gadgets</SelectItem>
              <SelectItem value="travel">Travel & Adventure</SelectItem>
              <SelectItem value="business">Business & Entrepreneurship</SelectItem>
              <SelectItem value="art">Art & Design</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-bold text-stone-900">Posts per week</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-14 rounded-xl border-stone-200">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map(f => (
                <SelectItem key={f} value={f.toString()}>{f} posts per week</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-bold text-stone-900">Duration</Label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(m => (
              <button
                key={m}
                onClick={() => setDuration(m.toString())}
                className={`p-4 rounded-xl border-2 transition-all font-bold ${duration === m.toString() ? "border-stone-900 bg-stone-900 text-white shadow-lg" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200"}`}
              >
                {m} {m === 1 ? 'Month' : 'Months'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-stone-200">
              <Search className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <p className="font-bold text-stone-900">AI Web Search</p>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Powered by Gemini</p>
            </div>
          </div>
          <Switch checked={autoSearch} onCheckedChange={setAutoSearch} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-stone-200">
              <Palette className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <p className="font-bold text-stone-900">Canva Integration</p>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Sync designs automatically</p>
            </div>
          </div>
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600">Active</Badge>
        </div>

        <Button 
          className="w-full h-16 rounded-2xl bg-[#343434] hover:bg-stone-800 text-lg font-bold shadow-xl shadow-stone-200 mt-4 group"
          onClick={startAutopilot}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 animate-pulse text-yellow-400" /> 
              <span className="animate-pulse bg-gradient-to-r from-white via-stone-400 to-white bg-clip-text text-transparent bg-[length:200%_auto]">
                Beauto is thinking...
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Activate Autopilot
            </span>
          )}
        </Button>
      </Card>
    </div>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{format(currentDate, "MMMM yyyy")}</h1>
            <p className="text-stone-500 font-medium">Your social media schedule is ready.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-stone-200 shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="font-bold text-stone-600">Today</Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="rounded-xl">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center py-2 text-xs font-bold text-stone-400 uppercase tracking-widest">{day}</div>
          ))}
          {calendarDays.map((day, idx) => {
            const dayPosts = posts.filter(p => isSameDay(p.date, day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <Card 
                key={idx} 
                className={`min-h-[140px] p-3 border-stone-100 transition-all ${!isCurrentMonth ? "opacity-30 bg-stone-50/50" : "bg-white"} ${isToday ? "ring-2 ring-stone-900 ring-offset-2" : "hover:border-stone-300"}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-sm font-bold ${isToday ? "text-stone-900" : "text-stone-400"}`}>{format(day, "d")}</span>
                  {dayPosts.length > 0 && <Badge className="bg-green-500 text-white border-0 text-[10px] px-1.5 h-4">{dayPosts.length} posts</Badge>}
                </div>
                  <div className="space-y-2">
                    {dayPosts.map(post => (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="rounded-lg bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors cursor-pointer group overflow-hidden"
                      >
                        {(post.imageBase64 || post.imageUrl) && (
                          <div className="w-full h-12 overflow-hidden">
                            <img 
                              src={post.imageBase64 || post.imageUrl} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            {post.type === "video" ? <Video className="w-3 h-3 text-blue-500" /> : <ImageIcon className="w-3 h-3 text-pink-500" />}
                            <div className="flex gap-1">
                              {post.platform.map(p => {
                                const PlatIcon = platforms.find(pl => pl.id === p)?.icon || Share2;
                                return <PlatIcon key={p} className="w-2.5 h-2.5 text-stone-400" />;
                              })}
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-stone-700 truncate">{post.title}</p>
                        </div>
                      </motion.div>
                    ))}
                  {isCurrentMonth && (
                    <button className="w-full py-2 rounded-lg border border-dashed border-stone-200 text-stone-300 hover:border-stone-400 hover:text-stone-400 transition-all flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-stone-200" onClick={() => step === "connect" ? window.history.back() : setStep(step === "calendar" ? "config" : "connect")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${step === "connect" ? "bg-stone-900" : "bg-stone-300"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "config" ? "bg-stone-900" : "bg-stone-300"}`} />
            <div className={`w-2 h-2 rounded-full ${step === "calendar" ? "bg-stone-900" : "bg-stone-300"}`} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === "connect" && renderConnect()}
            {step === "config" && renderConfig()}
            {step === "calendar" && renderCalendar()}
          </motion.div>
        </AnimatePresence>

        {/* Floating Action Bar */}
        {step === "calendar" && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-stone-200/50 p-2 rounded-3xl shadow-2xl flex items-center gap-2 z-50"
          >
            <div className="px-6 py-3 border-r border-stone-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-100">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Autopilot Active</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Optimizing</p>
              </div>
            </div>
            <Button 
              className="rounded-2xl bg-stone-900 px-6 py-6 h-auto font-bold gap-2"
              onClick={() => {
                const today = new Date();
                const newPost: ScheduledPost = {
                  id: Math.random().toString(36).substr(2, 9),
                  date: today,
                  type: "image",
                  status: "draft",
                  title: "New Manual Post",
                  platform: connectedProfiles,
                };
                setPosts(prev => [...prev, newPost]);
              }}
            >
              <PlusCircle className="w-5 h-5" /> Create Manual Post
            </Button>
            <Button 
              variant="ghost" 
              className="rounded-2xl px-6 py-6 h-auto font-bold text-stone-500 gap-2"
              onClick={() => setStep("config")}
            >
              <Settings className="w-5 h-5" /> Config
            </Button>
          </motion.div>
        )}

        {/* Post Preview Modal */}
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => setSelectedPost(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {(selectedPost.imageBase64 || selectedPost.imageUrl) && (
                  <div className="w-full aspect-square overflow-hidden">
                    <img 
                      src={selectedPost.imageBase64 || selectedPost.imageUrl} 
                      alt={selectedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-stone-900">{selectedPost.title}</h3>
                    <Badge className={selectedPost.status === "scheduled" ? "bg-green-500" : "bg-amber-500"}>
                      {selectedPost.status}
                    </Badge>
                  </div>
                  {selectedPost.caption && (
                    <p className="text-sm text-stone-600">{selectedPost.caption}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(selectedPost.date, "PPP")}</span>
                  </div>
                  <div className="flex gap-2">
                    {selectedPost.platform.map(p => {
                      const platform = platforms.find(pl => pl.id === p);
                      return platform ? (
                        <div key={p} className={`px-3 py-1.5 rounded-lg ${platform.color} text-white text-xs font-bold`}>
                          {platform.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-stone-900" onClick={() => setSelectedPost(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    );
}
