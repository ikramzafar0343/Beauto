import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId, toolkit } = await request.json();

    if (!userId || !toolkit) {
      return NextResponse.json(
        { error: "userId and toolkit are required" },
        { status: 400 }
      );
    }

    // List connected accounts for the user
    const response = await (composio as any).connectedAccounts.list({
      userIds: [userId],
    });

    if (toolkit === "all") {
      const connectedToolkits = (response.items || []).map(
        (account: any) => account.toolkit?.slug?.toLowerCase()
      ).filter(Boolean);
      return NextResponse.json({ connectedToolkits: Array.from(new Set(connectedToolkits)) });
    }

    // Check if any of the connected accounts match the toolkit
    const isConnected = (response.items || []).some(
      (account: any) => account.toolkit?.slug?.toLowerCase() === toolkit.toLowerCase()
    );

    return NextResponse.json({ isConnected });
  } catch (error: any) {
    console.error("Check connection API error:", error);
    return NextResponse.json(
      { error: `Failed to check connection: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
