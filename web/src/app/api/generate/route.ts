import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type GenerateRequest = {
  prompt?: string;
  seed?: number;
};

const DEFAULT_PROMPT = [
  "found footage style",
  "explorers in green hazmat suits",
  "lit by flashlights and headlamps",
  "dark moody cinematic atmosphere",
  "ancient Egyptian underground catacombs",
  "high detail, filmic grain, dramatic lighting"
].join(", ");

const IMAGE_SIZE = "1024x1792"; // 9:16 portrait

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as GenerateRequest;
  const prompt = (body?.prompt && String(body.prompt).trim()) || DEFAULT_PROMPT;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `${prompt}. Vertical 9:16 composition.`,
        size: IMAGE_SIZE,
        quality: "high",
        n: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "Image generation failed", details: err },
        { status: response.status }
      );
    }

    const json = (await response.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };

    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No image returned from API" },
        { status: 502 }
      );
    }

    const dataUrl = `data:image/png;base64,${b64}`;

    return NextResponse.json({ dataUrl, size: IMAGE_SIZE });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 }
    );
  }
}
