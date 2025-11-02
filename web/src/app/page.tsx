"use client";

import { useState } from "react";

const DEFAULT_PROMPT = [
  "found footage style",
  "explorers in green hazmat suits",
  "lit by flashlights and headlamps",
  "dark moody cinematic atmosphere",
  "ancient Egyptian underground catacombs",
  "high detail, filmic grain, dramatic lighting",
].join(", ");

export default function Home() {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Request failed");
      }
      setImageUrl(json.dataUrl as string);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Cinematic Image Generator</h1>
        <p className="text-sm text-white/60">Vertical 9:16 composition, optimized for mobile.</p>
      </header>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-white/80">
            Prompt
          </label>
          <textarea
            id="prompt"
            className="h-44 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm outline-none ring-0 placeholder:text-white/30"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Generating?" : "Generate"}
          </button>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="text-xs text-white/60">
            Tip: The default prompt captures &quot;found footage&quot; explorers in green hazmat suits, lit by headlamps in an ancient Egyptian underground with a dark cinematic tone.
          </div>
        </div>

        <div className="flex items-start justify-center">
          <div className="relative w-full max-w-[360px] rounded-lg border border-white/10 bg-white/5 p-3 shadow-2xl">
            <div className="aspect-[9/16] w-full overflow-hidden rounded-md bg-black/60">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Generated" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/40">
                  {isLoading ? "Rendering?" : "Your image will appear here"}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
