import { NextRequest, NextResponse } from "next/server";
import { validateAnalyzeInput } from "@/lib/validation";
import { analyzeSongWithGemini, isGeminiConfigured } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateAnalyzeInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid song input." },
        { status: 400 }
      );
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Google Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable in your .env.local file or Vercel dashboard.",
          code: "GEMINI_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const analysis = await analyzeSongWithGemini(validation.data);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error during analysis.";
    console.error("API /api/analyze error:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
