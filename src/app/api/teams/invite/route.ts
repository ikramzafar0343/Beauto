import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

// POST - Send team invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, email, role = "member" } = body;

    if (!teamId || !email) {
      return NextResponse.json(
        { error: "Team ID and email are required" },
        { status: 400 }
      );
    }

    // Check if user has permission to invite (owner or admin)
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("owner_id, name")
      .eq("id", teamId)
      .single();

    if (teamError) throw teamError;

    const isOwner = team.owner_id === user.id;
    const isAdmin = membership?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only team owner or admins can invite members" },
        { status: 403 }
      );
    }

    // Check if email is already invited or member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id, status")
      .eq("team_id", teamId)
      .eq("email", email)
      .single();

    if (existingMember) {
      if (existingMember.status === "active") {
        return NextResponse.json(
          { error: "User is already a team member" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Invitation already sent to this email" },
          { status: 400 }
        );
      }
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        email,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Add to team_members with pending status
    await supabase
      .from("team_members")
      .insert({
        team_id: teamId,
        email,
        role,
        status: "pending",
        invited_by: user.id,
      });

    // In a real app, you would send an email here with the invitation link
    // const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/teams/accept/${token}`;
    // await sendInvitationEmail(email, team.name, invitationLink);

      const origin = request.nextUrl.origin;
      return NextResponse.json({
        invitation,
        invitationLink: `${origin}/teams/accept/${token}`,
      });
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// GET - Get invitations for a team
export async function GET(request: NextRequest) {
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

    // Get all team_members for this team
    const { data: members, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
