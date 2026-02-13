import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const form = await req.formData();
    const audio = form.get("audio");
    const language = form.get("language") as string | null; // Optional language parameter

    if (!audio || !(audio instanceof File)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    // Map language codes to Whisper language codes
    const getWhisperLanguageCode = (lang: string | null): string | undefined => {
      if (!lang) return undefined;
      const langMap: Record<string, string> = {
        'en': 'en',
        'sv': 'sv',
        'da': 'da',
        'no': 'no',
        'ar': 'ar',
      };
      return langMap[lang] || undefined;
    };

    const upstream = new FormData();
    upstream.append("model", "whisper-1");
    const whisperLang = getWhisperLanguageCode(language);
    if (whisperLang) {
      upstream.append("language", whisperLang);
    }
    upstream.append("file", audio, audio.name || "audio.webm");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: upstream,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Transcription failed", details: errorText },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text || "" });
  } catch (e: any) {
    return NextResponse.json(
      { error: "STT route error", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
