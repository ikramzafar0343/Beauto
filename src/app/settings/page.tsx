"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  MessageSquare,
  Users,
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Mail,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
  Clock,
  LayoutDashboard,
  Cpu,
  KeyRound
} from "lucide-react";

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

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "instructions" | "teams">("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
    const [language, setLanguage] = useState("English");
    const [timezone, setTimezone] = useState("UTC");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Chat instructions state
  const [chatInstructions, setChatInstructions] = useState("");
  const [defaultPrompts, setDefaultPrompts] = useState<string[]>([]);
  const [newPrompt, setNewPrompt] = useState("");

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

  useEffect(() => {
    loadUserData();
    loadTeams();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
        
        // Load user preferences from database
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (prefs) {
          setChatInstructions(prefs.chat_instructions || "");
          setDefaultPrompts(prefs.default_prompts || []);
            setLanguage(prefs.language || "English");
            setTimezone(prefs.timezone || "UTC");
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/invite?teamId=${teamId}`);
      const data = await res.json();
      if (data.members) {
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error("Failed to load team members:", error);
    }
  };

  const createTeam = async () => {
    if (!newTeam.name.trim()) return;
    
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      });
      
      const data = await res.json();
      if (data.team) {
        setTeams(prev => [data.team, ...prev]);
        setNewTeam({ name: "", description: "" });
        setShowCreateTeam(false);
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const inviteToTeam = async () => {
    if (!selectedTeam || !inviteEmail.trim()) return;
    
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
      
      const data = await res.json();
      if (data.invitation) {
        await loadTeamMembers(selectedTeam.id);
        setInviteEmail("");
        setShowInviteModal(false);
        alert(`Invitation sent! Share this link:\n\n${data.invitationLink}`);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update auth metadata
        await supabase.auth.updateUser({
          data: { full_name: fullName }
        });
        
        // Update user preferences with language and timezone
        await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            language,
            timezone,
            updated_at: new Date().toISOString()
          });
        
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        alert(error.message);
      } else {
        alert("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const saveInstructions = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("user_preferences")
          .upsert({
            user_id: user.id,
            chat_instructions: chatInstructions,
            default_prompts: defaultPrompts,
            language,
            timezone,
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
        alert("Instructions saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save instructions:", error);
      alert("Failed to save instructions");
    } finally {
      setSaving(false);
    }
  };

  const addPrompt = () => {
    if (newPrompt.trim()) {
      setDefaultPrompts([...defaultPrompts, newPrompt.trim()]);
      setNewPrompt("");
    }
  };

  const removePrompt = (index: number) => {
    setDefaultPrompts(defaultPrompts.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-[#343434]/40 dark:text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/chat")}
            className="p-2 rounded-lg hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#343434] dark:text-white" />
          </button>
          <h1 className="text-xl font-semibold text-[#343434] dark:text-white">Settings</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
{/* Sidebar */}
            <aside className="col-span-3">
              <nav className="space-y-1">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 mb-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/settings/models")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                >
                  <Cpu className="w-5 h-5" />
                  Models
                </button>
                <button
                  onClick={() => router.push("/settings/mcp")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                >
                  <KeyRound className="w-5 h-5" />
                  MCP
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]"
                    : "text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "password"
                    ? "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]"
                    : "text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                }`}
              >
                <Lock className="w-5 h-5" />
                Password
              </button>
              <button
                onClick={() => setActiveTab("instructions")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "instructions"
                    ? "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]"
                    : "text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Chat Instructions
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "teams"
                    ? "bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a]"
                    : "text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                }`}
              >
                <Users className="w-5 h-5" />
                Teams
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="col-span-9">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#343434] dark:text-white mb-4">Profile Information</h2>
                    <p className="text-sm text-[#343434]/60 dark:text-white/60 mb-6">
                      Update your account profile information
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-[#f8f9fa] dark:bg-[#0a0a0a] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#343434]/50 dark:text-white/50 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4" />
                      Language
                    </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                      >
                        <option value="English">🇬🇧 English</option>
                        <option value="Swedish">🇸🇪 Swedish</option>
                        <option value="Danish">🇩🇰 Danish</option>
                      </select>
                      <p className="text-xs text-[#343434]/50 dark:text-white/50 mt-1">
                        AI will respond in your chosen language
                      </p>
                    </div>
  
                    <div>
                      <label className="text-sm font-medium text-[#343434] dark:text-white flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                      >
                        <option value="UTC">Universal Time (UTC)</option>
                        <option value="Europe/Stockholm">🇸🇪 Stockholm (CET)</option>
                        <option value="Europe/Copenhagen">🇩🇰 Copenhagen (CET)</option>
                        <option value="Europe/London">🇬🇧 London (GMT)</option>
                        <option value="America/New_York">🇺🇸 New York (EST)</option>
                        <option value="America/Los_Angeles">🇺🇸 Los Angeles (PST)</option>
                        <option value="Asia/Tokyo">🇯🇵 Tokyo (JST)</option>
                        <option value="Australia/Sydney">🇦🇺 Sydney (AEDT)</option>
                      </select>
                      <p className="text-xs text-[#343434]/50 dark:text-white/50 mt-1">
                        Scheduled actions run based on your timezone
                      </p>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {activeTab === "password" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#343434] dark:text-white mb-4">Change Password</h2>
                    <p className="text-sm text-[#343434]/60 dark:text-white/60 mb-6">
                      Update your password to keep your account secure
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                    />
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {saving ? "Changing..." : "Change Password"}
                  </button>
                </div>
              )}

              {activeTab === "instructions" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#343434] dark:text-white mb-4">Chat Instructions</h2>
                    <p className="text-sm text-[#343434]/60 dark:text-white/60 mb-6">
                      Set default instructions for the AI assistant. These will be included in every chat.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Default Instructions</label>
                    <textarea
                      value={chatInstructions}
                      onChange={(e) => setChatInstructions(e.target.value)}
                      placeholder="e.g., Always respond in a professional tone, use bullet points when listing items, include sources when providing facts..."
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30 resize-none"
                    />
                    <p className="text-xs text-[#343434]/50 dark:text-white/50 mt-1">
                      These instructions will be added to every chat conversation automatically
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#343434] dark:text-white block mb-2">Quick Prompts</label>
                    <p className="text-xs text-[#343434]/50 dark:text-white/50 mb-3">
                      Add frequently used prompts for quick access
                    </p>
                    
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newPrompt}
                        onChange={(e) => setNewPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addPrompt()}
                        placeholder="Type a prompt and press Enter"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white bg-white dark:bg-[#0a0a0a] focus:outline-none focus:border-[#343434]/30 dark:focus:border-white/30"
                      />
                      <button
                        onClick={addPrompt}
                        className="px-4 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] hover:opacity-90"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {defaultPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#f8f9fa] dark:bg-[#0a0a0a] border border-[#dae0e2] dark:border-[#27272a]">
                          <span className="text-sm text-[#343434] dark:text-white">{prompt}</span>
                          <button
                            onClick={() => removePrompt(index)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveInstructions}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Instructions"}
                  </button>
                </div>
              )}

              {activeTab === "teams" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#343434] dark:text-white mb-2">Teams</h2>
                      <p className="text-sm text-[#343434]/60 dark:text-white/60">
                        Manage your teams and invite members to collaborate
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateTeam(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" />
                      New Team
                    </button>
                  </div>

                  {loadingTeams ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#343434]/40 dark:text-white/40" />
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="text-center py-12 border border-[#dae0e2] dark:border-[#27272a] rounded-xl">
                      <Users className="w-16 h-16 mx-auto text-[#343434]/20 dark:text-white/20 mb-4" />
                      <h3 className="text-lg font-medium text-[#343434] dark:text-white mb-2">No teams yet</h3>
                      <p className="text-sm text-[#343434]/60 dark:text-white/60 mb-4">
                        Create your first team to start collaborating
                      </p>
                      <button
                        onClick={() => setShowCreateTeam(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium hover:opacity-90"
                      >
                        <Plus className="w-4 h-4" />
                        Create Team
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teams.map(team => (
                        <div key={team.id} className="border border-[#dae0e2] dark:border-[#27272a] rounded-xl overflow-hidden">
                          <button
                            onClick={() => {
                              setSelectedTeam(selectedTeam?.id === team.id ? null : team);
                              if (selectedTeam?.id !== team.id) {
                                loadTeamMembers(team.id);
                              }
                            }}
                            className="w-full p-4 hover:bg-[#f8f9fa] dark:hover:bg-[#0a0a0a] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-base font-medium text-[#343434] dark:text-white">{team.name}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    team.role === 'owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                    team.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                  }`}>
                                    {team.role}
                                  </span>
                                </div>
                                {team.description && (
                                  <p className="text-sm text-[#343434]/60 dark:text-white/60 mt-1">{team.description}</p>
                                )}
                              </div>
                              {selectedTeam?.id === team.id ? (
                                <ChevronUp className="w-5 h-5 text-[#343434]/60 dark:text-white/60" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#343434]/60 dark:text-white/60" />
                              )}
                            </div>
                          </button>

                          {selectedTeam?.id === team.id && (
                            <div className="border-t border-[#dae0e2] dark:border-[#27272a] p-4 bg-[#f8f9fa]/50 dark:bg-[#0a0a0a]/50 space-y-4">
                              {(team.role === 'owner' || team.role === 'admin') && (
                                <button
                                  onClick={() => setShowInviteModal(true)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a]"
                                >
                                  <Mail className="w-4 h-4" />
                                  Invite Member
                                </button>
                              )}

                              <div>
                                <h4 className="text-sm font-medium text-[#343434]/70 dark:text-white/70 mb-3">Members</h4>
                                {teamMembers.length === 0 ? (
                                  <p className="text-sm text-[#343434]/50 dark:text-white/50 text-center py-4">No members yet</p>
                                ) : (
                                  <div className="space-y-2">
                                    {teamMembers.map(member => (
                                      <div key={member.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#1a1a1a]">
                                        <div className="flex-1">
                                          <p className="text-sm text-[#343434] dark:text-white">{member.email}</p>
                                          <p className="text-xs text-[#343434]/50 dark:text-white/50">
                                            {member.status === 'pending' ? 'Pending' : 'Active'} • {member.role}
                                          </p>
                                        </div>
                                        {member.status === 'pending' && (
                                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Invited</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

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
                className="px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium hover:opacity-90 disabled:opacity-50"
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
                className="px-6 py-2.5 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
