import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

// Simple in-memory cache for teams (User ID -> { teams: any[], timestamp: number })
const teamsCache: Record<string, { teams: any[], timestamp: number }> = {};
const CACHE_TTL = 30 * 1000; // 30 seconds

// GET - Fetch all teams for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check cache first
    const cached = teamsCache[user.id];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json({ teams: cached.teams }, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': '0ms',
        },
      });
    }

    // Parallelize DB queries for performance
    const [ownedResult, memberResult] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name, description, owner_id, created_at, updated_at")
        .eq("owner_id", user.id),
      supabase
        .from("team_members")
        .select("role, teams(id, name, description, owner_id, created_at, updated_at)")
        .eq("user_id", user.id)
        .eq("status", "active")
    ]);

    const { data: ownedTeams, error: ownedError } = ownedResult;
    const { data: memberTeams, error: memberError } = memberResult;

    if (ownedError) {
      console.error("Error fetching owned teams:", ownedError);
    }

    if (memberError) {
      console.error("Error fetching member teams:", memberError);
    }

    const allTeams = [
      ...(ownedTeams || []).map(t => ({ ...t, role: "owner" })),
      ...(memberTeams || []).map(m => ({ ...m.teams, role: m.role }))
    ];

    // Update cache
    teamsCache[user.id] = {
      teams: allTeams,
      timestamp: Date.now(),
    };

    return NextResponse.json({ teams: allTeams }, {
      headers: {
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    // If table doesn't exist, return empty
    if (String(error).includes("relation \"teams\" does not exist")) {
      return NextResponse.json({ teams: [] });
    }
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST - Create a new team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name,
        description: description || "",
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add owner as admin member
    await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        email: user.email!,
        role: "admin",
        status: "active",
        joined_at: new Date().toISOString(),
      });

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a team
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID required" },
        { status: 400 }
      );
    }

    // Check if user is owner
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", teamId)
      .single();

    if (teamError) throw teamError;

    if (team.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Only team owner can delete the team" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
