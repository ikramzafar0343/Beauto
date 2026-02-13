import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    const customInstructions = body?.instructions || "";

    if (action !== "start-session") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new GoogleGenAI({ apiKey });
    
    // We use the model name provided by the user, or the latest available if that fails
    const modelName = 'gemini-2.5-flash-native-audio-preview-12-2025'; // Using latest for best compatibility

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    
    const systemInstruction = `You are Beauto, a powerful automation assistant integrated with Composio. Your purpose is to help users automate tasks across any app (Slack, GitHub, Google Calendar, etc.). You are proactive, efficient, and always ready to execute tool calls via Composio to get things done. When a user asks you to do something, use your tools. IMPORTANT: Your responses MUST NOT contain characters like # or *. Format the text cleanly without markdown symbols. Respond in English. ${customInstructions}`.trim();

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: expireTime,
        liveConnectConstraints: {
          model: modelName,
          config: {
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
              responseModalities: ['AUDIO' as any],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            }
          }
        },
        httpOptions: {
          apiVersion: 'v1alpha'
        }
      }
    });

    if (!token || !token.name) {
      throw new Error("Failed to generate Gemini ephemeral token");
    }

    return NextResponse.json({
      token: token.name,
      model: modelName,
      systemInstruction
    });
  } catch (error: any) {
    console.error("Gemini Voice Live API error:", error);
    return NextResponse.json(
      { error: error?.message || "Voice Live API error" },
      { status: 500 }
    );
  }
}
