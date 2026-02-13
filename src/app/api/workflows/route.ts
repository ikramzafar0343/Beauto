import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simple in-memory cache (60s TTL) - exported for cache invalidation
export const workflowsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const cacheKey = `workflows:${user.id}:${status || "all"}`;

    // Check cache
    const cached = workflowsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ workflows: cached.data }, {
        headers: { "X-Cache": "HIT" }
      });
    }

    // Optimized query - select only needed fields
    let query = supabase
      .from("workflows")
      .select("id, name, description, status, steps, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100); // Limit results for performance

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Cache the result
    workflowsCache.set(cacheKey, { data: data || [], timestamp: Date.now() });

    return NextResponse.json({ workflows: data || [] }, {
      headers: { "X-Cache": "MISS" }
    });
  } catch (error: any) {
    console.error("Failed to fetch workflows:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, steps, status = "draft" } = body;

    if (!name || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: "Name and steps are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workflows")
      .insert({
        user_id: user.id,
        name,
        description,
        steps,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name, description, status, steps, created_at, updated_at")
      .single();

    if (error) throw error;

    // Invalidate cache
    const cacheKey = `workflows:${user.id}:all`;
    workflowsCache.delete(cacheKey);
    workflowsCache.delete(`workflows:${user.id}:${status}`);

    return NextResponse.json({ workflow: data });
  } catch (error: any) {
    console.error("Failed to create workflow:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create workflow" },
      { status: 500 }
    );
  }
}
