import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";
import { env } from "@/lib/config/env";

let composioInstance: any = null;

function getComposio() {
  if (composioInstance) return composioInstance;
  
  if (!process.env.COMPOSIO_API_KEY) {
    throw new Error("COMPOSIO_API_KEY is missing");
  }

  composioInstance = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
  });
  
  return composioInstance;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, toolkit, redirectAfter } = await request.json();

    if (!userId || !toolkit) {
      return NextResponse.json(
        { error: "userId and toolkit are required" },
        { status: 400 }
      );
    }

    // Use Tool Router to handle connection - this is the recommended V3 way
    // It automatically selects the best auth configuration for the toolkit
    
    // Safely get MCP config ID (optional)
    let mcpConfigId: string | undefined;
    try {
      mcpConfigId = env().COMPOSIO_MCP_CONFIG_ID;
    } catch (e) {
      // env() might throw if validation fails, but MCP config is optional
      mcpConfigId = process.env.COMPOSIO_MCP_CONFIG_ID;
    }
    
    const sessionConfig: any = {
      toolkits: [toolkit.toLowerCase()],
    };
    
    // Only add mcpConfigId if it's set
    if (mcpConfigId) {
      sessionConfig.mcpConfigId = mcpConfigId;
    }
    
    const session = await getComposio().toolRouter.create(userId, sessionConfig);

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    
    // Robust origin detection: Prioritize production URL if on production host
    let origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || "");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      origin = `https://${host}`;
    }
    
    const callbackUrl = new URL(`${origin}/api/composio/callback`);
    if (redirectAfter) {
      callbackUrl.searchParams.set("redirectAfter", redirectAfter);
    }

    // Special case for Gemini/Veo - usually doesn't need connection request if API key is set
    if (toolkit.toLowerCase() === "gemini" || toolkit.toLowerCase() === "veo") {
      const redirectUrl = new URL(redirectAfter || "/chat", origin);
      redirectUrl.searchParams.set("connected", "true");
      redirectUrl.searchParams.set("integration", toolkit.charAt(0).toUpperCase() + toolkit.slice(1));
      return NextResponse.json({
        redirectUrl: redirectUrl.toString(),
        alreadyConnected: true
      });
    }

    // Check if account already exists
    const existingAccounts = await getComposio().connectedAccounts.list({ 
      userIds: [userId] 
    });
    
    const existingAccount = existingAccounts.items.find(
      (a: any) => a.toolkit?.slug?.toLowerCase() === toolkit.toLowerCase() && a.status === "ACTIVE"
    );

    if (existingAccount) {
      const redirectUrl = new URL(redirectAfter || "/chat", origin);
      redirectUrl.searchParams.set("connected", "true");
      redirectUrl.searchParams.set("integration", toolkit);
      redirectUrl.searchParams.set("already_connected", "true");
      
      return NextResponse.json({
        redirectUrl: redirectUrl.toString(),
        alreadyConnected: true
      });
    }

    const connectionRequest = await session.authorize(toolkit.toLowerCase(), {
      callbackUrl: callbackUrl.toString(),
    });

    return NextResponse.json({
      redirectUrl: connectionRequest.redirectUrl,
      connectionId: connectionRequest.connectedAccountId,
    });
  } catch (error: any) {
    console.error("Connect API error:", error);
    return NextResponse.json(
      { error: `Failed to connect: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
