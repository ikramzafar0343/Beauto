import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sha256Hex, sealString, unsealString } from "@/lib/crypto/seal";
import { env } from "@/lib/config/env";
import { Composio } from "@composio/core";

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY }) as any;

const DEFAULT_TOOLKITS = [
  "gmail",
  "slack",
  "github",
  "notion",
  "googlesheets",
  "googlecalendar",
  "googledrive",
  "figma",
  "stripe",
];

function getBearerToken(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });

  const supabase = await createClient();
  const tokenHash = sha256Hex(token);

  const { data: tokenRow, error: tokenError } = await supabase
    .from("mcp_access_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError || !tokenRow) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  const userId = tokenRow.user_id as string;

  let mcpUrl = tokenRow.composio_mcp_url as string | null;
  let mcpHeaders = tokenRow.composio_mcp_headers as any;
  const encryptedHeaders = tokenRow.composio_mcp_headers_encrypted as string | null;

  if (encryptedHeaders) {
    try {
      mcpHeaders = JSON.parse(unsealString(encryptedHeaders));
    } catch {
      mcpHeaders = tokenRow.composio_mcp_headers as any;
    }
  }

  if (!mcpUrl || !mcpHeaders) {
    const session = await composio.toolRouter.create(userId, {
      toolkits: DEFAULT_TOOLKITS,
      mcpConfigId: env().COMPOSIO_MCP_CONFIG_ID,
    });

    mcpUrl = session.mcp.url;
    mcpHeaders = session.mcp.headers;

    await supabase
      .from("mcp_access_tokens")
      .update({
        composio_session_id: session.sessionId || null,
        composio_mcp_url: mcpUrl,
        composio_mcp_headers: mcpHeaders,
        composio_mcp_headers_encrypted: env().ENCRYPTION_KEY ? sealString(JSON.stringify(mcpHeaders || {})) : null,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", tokenRow.id);
  } else {
    await supabase
      .from("mcp_access_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", tokenRow.id);
  }

  const body = await req.text();

  if (!mcpUrl) return NextResponse.json({ error: "Missing upstream MCP url" }, { status: 500 });

  const upstream = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      ...(mcpHeaders || {}),
      "content-type": req.headers.get("content-type") || "application/json",
      "x-api-key": env().COMPOSIO_API_KEY || "",
    } as any,
    body,
  });

  const upstreamText = await upstream.text();
  return new NextResponse(upstreamText, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}

