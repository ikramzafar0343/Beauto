import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch all scheduled actions for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: actions, error } = await supabase
      .from("scheduled_actions")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_time", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ actions: actions || [] });
  } catch (error) {
    console.error("Failed to fetch scheduled actions:", error);
    if (String(error).includes("relation \"scheduled_actions\" does not exist")) {
      return NextResponse.json({ actions: [] });
    }
    return NextResponse.json(
      { error: "Failed to fetch scheduled actions" },
      { status: 500 }
    );
  }
}

// POST - Create new scheduled action
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      chatId,
      actionType,
      actionDescription,
      scheduledTime,
      toolkit,
      actionParams,
    } = body;

    if (!actionType || !actionDescription || !scheduledTime || !toolkit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: action, error } = await supabase
      .from("scheduled_actions")
      .insert({
        user_id: user.id,
        chat_id: chatId || null,
        action_type: actionType,
        action_description: actionDescription,
        scheduled_time: scheduledTime,
        toolkit,
        action_params: actionParams || {},
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ action });
  } catch (error) {
    console.error("Failed to create scheduled action:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled action" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a scheduled action
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const actionId = searchParams.get("actionId");

    if (!actionId) {
      return NextResponse.json(
        { error: "Action ID required" },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of deleting
    const { error } = await supabase
      .from("scheduled_actions")
      .update({ status: "cancelled" })
      .eq("id", actionId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel scheduled action:", error);
    return NextResponse.json(
      { error: "Failed to cancel scheduled action" },
      { status: 500 }
    );
  }
}
