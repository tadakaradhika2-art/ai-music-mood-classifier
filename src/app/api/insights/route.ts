import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { generateSmartInsights, compareSongsWithGemini } from "@/lib/gemini";

export async function GET() {
  try {
    const { songs } = await db.getSongs({ limit: 100 });
    const insights = await generateSmartInsights(songs);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate insights.";
    console.error("GET /api/insights error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { songIdA, songIdB } = body || {};

    if (!songIdA || !songIdB) {
      return NextResponse.json(
        { success: false, error: "Both songIdA and songIdB are required for mood comparison." },
        { status: 400 }
      );
    }

    const { song: songA } = await db.getSongById(songIdA);
    const { song: songB } = await db.getSongById(songIdB);

    if (!songA || !songB) {
      return NextResponse.json(
        { success: false, error: "One or both songs could not be found." },
        { status: 404 }
      );
    }

    const comparison = await compareSongsWithGemini(songA, songB);

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to compare songs.";
    console.error("POST /api/insights error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
