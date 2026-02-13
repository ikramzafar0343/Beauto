import { NextResponse } from "next/server";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
}) as any;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toolkit = searchParams.get("toolkit");
  const userId = searchParams.get("userId");

  if (!toolkit) {
    return NextResponse.json({ error: "Toolkit is required" }, { status: 400 });
  }

  try {
    // We can use toolRouter or tools.list
    // But since the user wants to see all tools for a toolkit:
    const tools = await composio.tools.list({ toolkits: [toolkit] });
    
    // Also fetch auth configs and connected accounts for this toolkit if userId provided
    let authConfigs = [];
    let connectedAccounts = [];

    if (userId) {
      const authConfigsRes = await composio.authConfigs.list({ toolkit });
      authConfigs = authConfigsRes.items || [];

      const connectedAccountsRes = await composio.connectedAccounts.list({ 
        userIds: [userId] 
      });
      connectedAccounts = (connectedAccountsRes.items || [])
        .filter((a: any) => a.toolkit?.slug?.toLowerCase() === toolkit.toLowerCase());
    }

    return NextResponse.json({ 
      tools: tools.map((t: any) => ({
        name: t.name,
        description: t.description,
        logo: `https://logos.composio.dev/api/${toolkit}`,
        inputSchema: t.inputSchema || t.input_schema || t.parametersSchema || null
      })),
      authConfigs,
      connectedAccounts
    });
  } catch (error: any) {
    console.error("Failed to fetch tools:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
