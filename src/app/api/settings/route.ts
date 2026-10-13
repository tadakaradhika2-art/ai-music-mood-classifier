import { NextResponse } from "next/server";
import { isGeminiConfigured, getGeminiModelName } from "@/lib/gemini";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const geminiReady = isGeminiConfigured();
  const supabaseReady = isSupabaseConfigured();
  const modelName = getGeminiModelName();

  return NextResponse.json({
    success: true,
    data: {
      appName: "AI Music Mood Classifier",
      version: "1.0.0",
      ai: {
        provider: "Google Gemini",
        configured: geminiReady,
        model: modelName,
      },
      database: {
        provider: "Supabase PostgreSQL",
        configured: supabaseReady,
        mode: supabaseReady ? "Connected to Supabase" : "In-Memory Demo Fallback Mode",
      },
      environment: process.env.NODE_ENV,
    },
  });
}
