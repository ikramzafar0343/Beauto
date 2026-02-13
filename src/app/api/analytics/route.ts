import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period") || "7d";

  let startDate = new Date();
  if (period === "7d") startDate.setDate(startDate.getDate() - 7);
  else if (period === "30d") startDate.setDate(startDate.getDate() - 30);
  else if (period === "90d") startDate.setDate(startDate.getDate() - 90);

  try {
    const { data: analytics, error } = await supabase
      .from("user_analytics")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    const totalActions = analytics?.length || 0;
    const fetchCount = analytics?.filter(a => a.action_type === "fetch").length || 0;
    const executeCount = analytics?.filter(a => a.action_type === "execute").length || 0;
    const chatCount = analytics?.filter(a => a.action_type === "chat").length || 0;

    const toolkitUsage: Record<string, number> = {};
    const actionHistory: Record<string, { name: string; count: number }[]> = {};
    const dailyActivity: Record<string, number> = {};

    analytics?.forEach(item => {
      if (item.toolkit) {
        toolkitUsage[item.toolkit] = (toolkitUsage[item.toolkit] || 0) + 1;
        
        if (!actionHistory[item.toolkit]) actionHistory[item.toolkit] = [];
        const existing = actionHistory[item.toolkit].find(a => a.name === item.action_name);
        if (existing) existing.count++;
        else if (item.action_name) actionHistory[item.toolkit].push({ name: item.action_name, count: 1 });
      }

      const day = new Date(item.created_at).toISOString().split("T")[0];
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const recentActions = analytics?.slice(0, 20).map(a => ({
      id: a.id,
      type: a.action_type,
      toolkit: a.toolkit,
      action: a.action_name,
      timestamp: a.created_at,
      metadata: a.metadata
    })) || [];

    return NextResponse.json({
      summary: {
        totalActions,
        fetchCount,
        executeCount,
        chatCount,
      },
      toolkitUsage,
      actionHistory,
      dailyActivity,
      recentActions,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action_type, toolkit, action_name, metadata } = body;

    const { error } = await supabase.from("user_analytics").insert({
      user_id: user.id,
      action_type,
      toolkit,
      action_name,
      metadata: metadata || {},
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
