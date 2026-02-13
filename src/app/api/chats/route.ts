import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/chats - Fetch all chats for current user
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if messages should be included (default: false for performance)
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get("includeMessages") === "true";

    // Optimized: Only load messages if explicitly requested
    // For chat list, we only need chat metadata, not all messages
    const selectQuery = includeMessages
      ? `
        id,
        title,
        custom_chat_id,
        created_at,
        updated_at,
        messages (
          id,
          role,
          content,
          connection_url,
          requires_auth,
          tools_used,
          toolkit,
          created_at
        )
      `
      : `
        id,
        title,
        custom_chat_id,
        created_at,
        updated_at
      `;

    const { data: chats, error } = await supabase
      .from("chats")
      .select(selectQuery)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100); // Limit to prevent loading too many chats

    if (error) throw error;

    const responseTime = performance.now() - startTime;
    
    // Log slow queries
    if (responseTime > 500) {
      console.log(`[PERF] ⚠️  /api/chats took ${responseTime.toFixed(2)}ms (messages: ${includeMessages})`);
    }

    return NextResponse.json(
      { chats },
      {
        headers: {
          "X-Response-Time": `${responseTime.toFixed(2)}ms`,
        },
      }
    );
  } catch (error: any) {
    const responseTime = performance.now() - startTime;
    console.error(`[PERF] ❌ /api/chats failed after ${responseTime.toFixed(2)}ms:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chats" },
      { 
        status: 500,
        headers: {
          "X-Response-Time": `${responseTime.toFixed(2)}ms`,
        },
      }
    );
  }
}

// POST /api/chats - Create new chat
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, customChatId } = await request.json();

    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user.id,
        title: title || "New conversation",
        custom_chat_id: customChatId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ chat });
  } catch (error: any) {
    console.error("Failed to create chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chat" },
      { status: 500 }
    );
  }
}

// PUT /api/chats - Update chat title
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, title } = await request.json();

    const { data: chat, error } = await supabase
      .from("chats")
      .update({ title })
      .eq("id", chatId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ chat });
  } catch (error: any) {
    console.error("Failed to update chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update chat" },
      { status: 500 }
    );
  }
}

// DELETE /api/chats - Delete chat
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete chat" },
      { status: 500 }
    );
  }
}
