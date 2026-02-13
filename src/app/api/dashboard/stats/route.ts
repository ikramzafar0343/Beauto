import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Composio } from "@composio/core";
import { createTracker, measure, parallel, cache } from "@/lib/performance";

let composioInstance: any = null;

function getComposio() {
  if (composioInstance) return composioInstance;
  
  if (!process.env.COMPOSIO_API_KEY) {
    return null;
  }

  composioInstance = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
  });
  
  return composioInstance;
}

// Simple in-memory cache for connected accounts
const connectedAccountsCache: Record<string, { count: number, timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  const tracker = createTracker();
  const startTime = performance.now();

  try {
    const supabase = await measure("create_supabase_client", async () => {
      return await createClient();
    }, tracker);

    const { data: { user }, error: authError } = await measure("auth_get_user", async () => {
      return await supabase.auth.getUser();
    }, tracker);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check cache first (60 second TTL)
    const cacheKey = `dashboard_stats_${user.id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      tracker.logSummary("/api/dashboard/stats (cached)");
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "X-Response-Time": `${(performance.now() - startTime).toFixed(2)}ms`,
        },
      });
    }

    // Parallelize ALL queries including integrations and messages
    const {
      workflowsCount,
      executionsCount,
      messagesCount,
      recentExecutions,
      recentActions,
      integrationsCount
    } = await parallel({
      // 1. Workflows Count
      workflowsCount: measure("db_workflows_count", async () => {
        const { count } = await supabase
          .from("workflows")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        return count || 0;
      }, tracker),

      // 2. Executions Count
      executionsCount: measure("db_executions_count", async () => {
        const { count } = await supabase
          .from("workflow_executions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        return count || 0;
      }, tracker),

      // 3. Messages Count (Leveraging RLS or simple join)
      messagesCount: measure("db_messages_count", async () => {
        // Fetch chats first to avoid slow RLS count on messages table if it's huge
        // But for parallel efficiency, we'll do a two-step optimized query here
        const { data: chats } = await supabase.from("chats").select("id").eq("user_id", user.id);
        const chatIds = chats?.map(c => c.id) || [];
        
        if (chatIds.length === 0) return 0;
        
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("chat_id", chatIds);
        return count || 0;
      }, tracker),

      // 4. Recent Executions with workflow names
      recentExecutions: measure("db_recent_executions", async () => {
        const { data: executions } = await supabase
          .from("workflow_executions")
          .select("id, status, created_at, workflow_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (!executions || executions.length === 0) return [];
        
        // Fetch workflow names separately for better reliability
        const workflowIds = executions
          .map(e => e.workflow_id)
          .filter(Boolean) as string[];
        
        let workflowNames: Record<string, string> = {};
        if (workflowIds.length > 0) {
          const { data: workflows } = await supabase
            .from("workflows")
            .select("id, name")
            .in("id", workflowIds)
            .eq("user_id", user.id);
          
          if (workflows) {
            workflowNames = workflows.reduce((acc, w) => {
              acc[w.id] = w.name || 'Untitled Workflow';
              return acc;
            }, {} as Record<string, string>);
          }
        }
        
        // Combine executions with workflow names
        return executions.map(e => ({
          ...e,
          workflow_name: e.workflow_id ? (workflowNames[e.workflow_id] || 'Untitled Workflow') : 'Untitled Workflow'
        }));
      }, tracker),

      // 5. Recent Actions
      recentActions: measure("db_recent_actions", async () => {
        const { data } = await supabase
          .from("scheduled_actions")
          .select("id, action_type, status, scheduled_time, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        return data || [];
      }, tracker),

      // 6. Integrations Count (Cached & Parallel)
      integrationsCount: measure("composio_integrations", async () => {
        // Check local memory cache first
        const cached = connectedAccountsCache[user.id];
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
          return cached.count;
        }

        try {
          const composio = getComposio();
          if (!composio) return 0;

          // Timeout after 3 seconds
          const timeoutPromise = new Promise<number>((resolve) => {
            setTimeout(() => resolve(0), 3000);
          });

          const composioPromise = composio.connectedAccounts
            .list({ userIds: [user.id] })
            .then((response: any) => {
              const uniqueToolkits = new Set(
                (response?.items || [])
                  .filter((a: any) => a.status === "ACTIVE")
                  .map((a: any) => a.toolkit?.slug || a.toolkit?.name)
                  .filter(Boolean)
              );
              const count = uniqueToolkits.size;
              
              // Update cache
              connectedAccountsCache[user.id] = {
                count,
                timestamp: Date.now()
              };
              
              return count;
            })
            .catch((e: any) => {
              console.warn("Composio fetch error:", e);
              return 0;
            });

          return await Promise.race([composioPromise, timeoutPromise]);
        } catch (e) {
          console.warn("Failed to fetch integrations count:", e);
          return 0;
        }
      }, tracker),
    }, tracker);

    // Combine activity with proper formatting
    const activity = [
      ...(recentExecutions || []).map((e: any) => {
        const workflowName = e.workflow_name || 'Untitled Workflow';
        return {
          id: e.id,
          type: 'workflow_execution',
          title: workflowName,
          status: e.status || 'unknown',
          timestamp: e.created_at,
          workflowId: e.workflow_id
        };
      }),
      ...(recentActions || []).map((a: any) => {
        // Format action type nicely
        const actionTypeFormatted = a.action_type
          ? a.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : 'Scheduled Action';
        return {
          id: a.id,
          type: 'scheduled_action',
          title: actionTypeFormatted,
          status: a.status,
          timestamp: a.created_at || a.scheduled_time
        };
      })
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const response = {
      stats: {
        workflows: workflowsCount,
        executions: executionsCount,
        integrations: integrationsCount,
        messages: messagesCount
      },
      activity
    };

    // Cache the response for 60 seconds
    cache.set(cacheKey, response, 60);

    const totalTime = performance.now() - startTime;
    tracker.logSummary("/api/dashboard/stats");

    return NextResponse.json(response, {
      headers: {
        "X-Cache": "MISS",
        "X-Response-Time": `${totalTime.toFixed(2)}ms`,
        "X-Performance-Timings": JSON.stringify(tracker.getTimings()),
      },
    });

  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`[PERF] ❌ Dashboard stats error after ${totalTime.toFixed(2)}ms:`, error);
    tracker.logSummary("/api/dashboard/stats (error)");
    
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { 
        status: 500,
        headers: {
          "X-Response-Time": `${totalTime.toFixed(2)}ms`,
        },
      }
    );
  }
}
