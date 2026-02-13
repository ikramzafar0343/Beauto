import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // For WebRTC connections, we generate an ephemeral key
    // The client will use this to establish a direct WebRTC connection
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "ash",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI Realtime Session Error:', errorData);
      return NextResponse.json({ error: 'Failed to create realtime session' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ client_secret: data.client_secret?.value || data.client_secret });
  } catch (error) {
    console.error('Voice OpenAI error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
