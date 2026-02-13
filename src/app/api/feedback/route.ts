import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, chatId, messageContent, userQuery, feedbackType } = await req.json();

    if (!messageId || !messageContent || !feedbackType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["thumbs_up", "thumbs_down"].includes(feedbackType)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    // Check if feedback already exists for this message
    const { data: existing } = await supabase
      .from("message_feedback")
      .select("id, feedback_type")
      .eq("user_id", user.id)
      .eq("message_id", messageId)
      .single();

    if (existing) {
      // Update existing feedback
      const { error } = await supabase
        .from("message_feedback")
        .update({ feedback_type: feedbackType })
        .eq("id", existing.id);

      if (error) throw error;
      return NextResponse.json({ success: true, updated: true });
    }

    // Insert new feedback
    const { error } = await supabase.from("message_feedback").insert({
      user_id: user.id,
      message_id: messageId,
      chat_id: chatId,
      message_content: messageContent,
      user_query: userQuery,
      feedback_type: feedbackType,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

// Get positive feedback examples for learning
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");

    // Get recent positive feedback for learning
    const { data: positiveFeedback } = await supabase
      .from("message_feedback")
      .select("user_query, message_content")
      .eq("user_id", user.id)
      .eq("feedback_type", "thumbs_up")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Get negative feedback to avoid
    const { data: negativeFeedback } = await supabase
      .from("message_feedback")
      .select("user_query, message_content")
      .eq("user_id", user.id)
      .eq("feedback_type", "thumbs_down")
      .order("created_at", { ascending: false })
      .limit(limit);

    return NextResponse.json({
      positive: positiveFeedback || [],
      negative: negativeFeedback || [],
    });
  } catch (error) {
    console.error("Get feedback error:", error);
    return NextResponse.json({ error: "Failed to get feedback" }, { status: 500 });
  }
}
