import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIAgentsProvider(),
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get("connectedAccountId") || searchParams.get("connected_account_id");
    const status = searchParams.get("connectionStatus") || searchParams.get("status");
    const redirectAfter = searchParams.get("redirectAfter");

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    
    // Robust origin detection: Prioritize production URL if on production host
    let origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || "");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      origin = `https://${host}`;
    }
    
    const redirectUrl = new URL(redirectAfter || "/chat", origin);
    
    if ((status === "ACTIVE" || status === "success") && connectionId) {
    try {
      // Get connected account details to find out which integration it is
      const account = await composio.connectedAccounts.get(connectionId);
      const integrationName = account.toolkit?.slug || "Unknown";
      
      redirectUrl.searchParams.set("connected", "true");
      redirectUrl.searchParams.set("integration", integrationName);
      redirectUrl.searchParams.set("accountId", connectionId);
    } catch (error) {
      console.error("Failed to get account details:", error);
      redirectUrl.searchParams.set("connected", "true");
      redirectUrl.searchParams.set("accountId", connectionId);
    }
  } else {
    redirectUrl.searchParams.set("error", "connection_failed");
  }

  return NextResponse.redirect(redirectUrl);
}