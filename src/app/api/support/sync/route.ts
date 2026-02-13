import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
}) as any;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client for operations that need service role
    const adminSupabase = createAdminClient();

    // 1. Get active channels for user
    const { data: channels, error: channelsError } = await adminSupabase
      .from("support_channels")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (channelsError) throw channelsError;

    const syncResults = [];

    for (const channel of channels) {
      if (channel.channel_type === "gmail") {
        try {
          // List messages from Gmail
            const listResponse = await (composio as any).actions.execute(user.id, {
              appName: "gmail",
              actionName: "gmail_list_messages",
              input: { max_results: 5 }
            });

          const messages = listResponse?.messages || [];
          
          for (const msg of messages) {
            // Get full message content
              const fullMsg = await (composio as any).actions.execute(user.id, {
                appName: "gmail",
                actionName: "gmail_get_message",
                input: { id: msg.id }
              });

            if (fullMsg) {
              // Extract data
              const headers = fullMsg.payload?.headers || [];
              const subject = headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)";
              const from = headers.find((h: any) => h.name === "From")?.value || "Unknown";
              const fromEmail = from.match(/<(.+)>|(\S+@\S+)/)?.[1] || from;
              const body = fullMsg.snippet || fullMsg.payload?.body?.data || "No content";

              // Upsert conversation
              const { data: conversation, error: convError } = await adminSupabase
                .from("support_conversations")
                .upsert({
                  user_id: user.id,
                  channel_type: "gmail",
                  customer_name: from.split("<")[0].trim(),
                  customer_email: fromEmail,
                  subject: subject,
                  status: "open",
                  last_message_at: new Date().toISOString(),
                  channel_id: channel.id,
                  external_id: fullMsg.threadId || fullMsg.id,
                }, { onConflict: 'external_id' })
                .select()
                .single();

              if (!convError && conversation) {
                // Insert message
                await adminSupabase
                  .from("support_messages")
                  .upsert({
                    conversation_id: conversation.id,
                    sender_type: "customer",
                    sender_name: from.split("<")[0].trim(),
                    content: body,
                    external_id: fullMsg.id,
                    created_at: new Date().toISOString(),
                  }, { onConflict: 'external_id' });
              }
            }
          }
            syncResults.push({ channel: channel.channel_name, status: "success" });
          } catch (err: any) {
            console.error(`Sync error for ${channel.channel_name}:`, err);
            syncResults.push({ channel: channel.channel_name, status: "error", error: err.message });
          }
        } else if (channel.channel_type === "instagram") {
          try {
            // 1. List conversations
            const convResponse = await (composio as any).actions.execute(user.id, {
              appName: "instagram",
              actionName: "instagram_list_conversations",
              input: { limit: 5 }
            });

            const conversations = convResponse?.data || [];
            
            for (const conv of conversations) {
              // 2. List messages for each conversation
              const msgResponse = await (composio as any).actions.execute(user.id, {
                appName: "instagram",
                actionName: "instagram_list_messages",
                input: { conversation_id: conv.id, limit: 5 }
              });

              const messages = msgResponse?.data || [];
              const lastMsg = messages[0];

              if (lastMsg) {
                // Upsert conversation
                const { data: conversation, error: convError } = await adminSupabase
                  .from("support_conversations")
                  .upsert({
                    user_id: user.id,
                    channel_type: "instagram",
                    customer_name: conv.participants?.data?.[0]?.name || "Instagram User",
                    customer_handle: conv.participants?.data?.[0]?.username,
                    status: "open",
                    last_message_at: lastMsg.created_time || new Date().toISOString(),
                    channel_id: channel.id,
                    external_id: conv.id,
                  }, { onConflict: 'external_id' })
                  .select()
                  .single();

                if (!convError && conversation) {
                  // Insert latest messages
                  for (const msg of messages) {
                    await adminSupabase
                      .from("support_messages")
                      .upsert({
                        conversation_id: conversation.id,
                        sender_type: msg.from?.id === conv.id ? "customer" : "agent",
                        sender_name: msg.from?.username || msg.from?.name,
                        content: msg.message || "Media message",
                        external_id: msg.id,
                        created_at: msg.created_time || new Date().toISOString(),
                      }, { onConflict: 'external_id' });
                  }
                }
              }
            }
            syncResults.push({ channel: channel.channel_name, status: "success" });
          } catch (err: any) {
            console.error(`Sync error for ${channel.channel_name}:`, err);
            syncResults.push({ channel: channel.channel_name, status: "error", error: err.message });
          }
        }
      }

    return NextResponse.json({ success: true, results: syncResults });
  } catch (error: any) {
    console.error("Global sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
