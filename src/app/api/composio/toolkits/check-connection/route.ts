import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const toolkit = searchParams.get("toolkit");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const response = await getComposio().connectedAccounts.list({ 
      userIds: [userId] 
    });

    // If toolkit is provided, check specifically for that toolkit
    if (toolkit) {
      const connected = (response?.items || []).some(
        (a: any) => a.toolkit?.slug?.toLowerCase() === toolkit.toLowerCase() && a.status === "ACTIVE"
      );
      return NextResponse.json({ connected });
    }

    // Otherwise return all connected toolkits
    const connectedToolkits = (response?.items || [])
      .filter((a: any) => a.status === "ACTIVE")
      .map((a: any) => a.toolkit?.slug || a.toolkit?.name)
      .filter(Boolean);

    return NextResponse.json({ connectedToolkits });
  } catch (error: any) {
    console.error("Check connection error:", error);
    return NextResponse.json(
      { error: "Failed to check connection" },
      { status: 500 }
    );
  }
}
