import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/messages - Save a message to a chat
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      chatId, 
      role, 
      content, 
      connectionUrl, 
      requiresAuth, 
      toolsUsed, 
      toolkit 
    } = await request.json();

    // Verify chat belongs to user
    const { data: chat } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single();

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Insert message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        role,
        content,
        connection_url: connectionUrl || null,
        requires_auth: requiresAuth || false,
        tools_used: toolsUsed || [],
        toolkit: toolkit || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update chat's updated_at timestamp
    await supabase
      .from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatId);

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("Failed to save message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save message" },
      { status: 500 }
    );
  }
}
