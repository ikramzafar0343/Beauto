import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";
import { env } from "@/lib/config/env";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
}) as any;

const ALL_TOOLKITS = [
  "gmail",
  "github",
  "slack",
  "googlecalendar",
  "googlesheets",
  "notion",
  "instagram",
  "hubspot",
  "shopify",
  "googledrive",
  "supabase",
  "airtable",
  "trello",
  "asana",
  "dropbox",
];

export async function POST(request: NextRequest) {
  try {
    const { userId, toolkits } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const session = await composio.toolRouter.create(userId, {
      toolkits: (toolkits && toolkits.length > 0) ? toolkits : ALL_TOOLKITS,
      mcpConfigId: env().COMPOSIO_MCP_CONFIG_ID,
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      mcpServerUrl: session.mcp.url,
      mcpHeaders: session.mcp.headers,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
