"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  MessageSquare, 
  Workflow, 
  Store, 
  TrendingUp,
  Zap,
  Activity,
  ArrowRight,
  Plus,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickStats {
  workflows: number;
  executions: number;
  integrations: number;
  messages: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats>({
    workflows: 0,
    executions: 0,
    integrations: 0,
    messages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  // Handle plan query parameter - redirect to checkout
  // Handle upgrade success message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const upgraded = urlParams.get('upgraded');
    
    if (plan && (plan === 'starter' || plan === 'pro')) {
      router.replace(`/checkout?plan=${plan}`);
    }
    
    if (upgraded === 'true') {
      setShowUpgradeSuccess(true);
      // Remove query param from URL
      router.replace('/dashboard', { scroll: false });
      // Hide message after 5 seconds
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;

    const loadData = async () => {
      // Cancel any in-flight request
      if (abortController) {
        abortController.abort();
      }
      
      abortController = new AbortController();
      
      try {
        const startTime = performance.now();
        const res = await fetch("/api/dashboard/stats", {
          signal: abortController.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!isMounted) return;
        
        const data = await res.json();
        const responseTime = performance.now() - startTime;
        
        // Log performance metrics
        const cacheStatus = res.headers.get('X-Cache') || 'UNKNOWN';
        const serverTime = res.headers.get('X-Response-Time') || 'N/A';
        console.log(`[Dashboard] Stats loaded in ${responseTime.toFixed(2)}ms (cache: ${cacheStatus}, server: ${serverTime})`);
        
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.activity) {
          setRecentActivity(data.activity);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        console.error("Failed to load dashboard stats:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    // Refresh data every 60 seconds (increased from 30s to reduce load)
    const interval = setInterval(loadData, 60000);
    
    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
      clearInterval(interval);
    };
  }, []);

  const quickActions = [
    {
      title: "New Chat",
      description: "Start a conversation with AI",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-blue-500",
    },
    {
      title: "Create Workflow",
      description: "Build an automated workflow",
      icon: Workflow,
      href: "/workflows",
      color: "bg-purple-500",
    },
    {
      title: "Browse Marketplace",
      description: "Discover integrations",
      icon: Store,
      href: "/marketplace",
      color: "bg-green-500",
    },
    {
      title: "Open Studio",
      description: "Design and test workflows",
      icon: Zap,
      href: "/studio",
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#343434]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showUpgradeSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Subscription upgraded successfully! Your credits have been updated.</span>
          </div>
          <button
            onClick={() => setShowUpgradeSuccess(false)}
            className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
          >
            ×
          </button>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-[#343434] dark:text-white">Dashboard</h1>
        <p className="text-[#343434]/60 dark:text-white/60 mt-1">
          Welcome back! Here's what's happening with your workflows.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workflows}</div>
            <p className="text-xs text-muted-foreground">Active workflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.executions}</div>
            <p className="text-xs text-muted-foreground">Total runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.integrations}</div>
            <p className="text-xs text-muted-foreground">Connected apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">Chat messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-[#343434] dark:text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardHeader>
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-[#343434] dark:text-white mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-muted/50 transition-colors rounded-lg px-2 py-1 -mx-2 -my-1">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'workflow_execution' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {activity.type === 'workflow_execution' ? <Activity className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {activity.type === 'workflow_execution' ? activity.title : activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {activity.status || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0 ml-4">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-1">Start creating workflows to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
