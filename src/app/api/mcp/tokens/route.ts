import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sha256Hex, randomToken, tokenPrefix } from "@/lib/crypto/seal";
import { env } from "@/lib/config/env";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("mcp_access_tokens")
    .select("id,client_type,token_prefix,expires_at,last_used_at,created_at,composio_mcp_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tokens: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientType } = await req.json().catch(() => ({}));
  const token = randomToken(32);
  const prefix = tokenPrefix(token);
  const ttlHours = env().MCP_TOKEN_TTL_HOURS || 24 * 7;
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("mcp_access_tokens")
    .insert({
      user_id: user.id,
      client_type: clientType || null,
      token_hash: sha256Hex(token),
      token_prefix: prefix,
      expires_at: expiresAt,
    })
    .select("id,client_type,token_prefix,expires_at,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    token,
    record: data,
    mcp: {
      serverUrl: `${env().NEXT_PUBLIC_APP_URL || ""}/api/mcp`,
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase
    .from("mcp_access_tokens")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

