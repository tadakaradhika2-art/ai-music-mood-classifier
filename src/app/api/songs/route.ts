import { NextRequest, NextResponse } from "next/server";
import { validateSaveInput } from "@/lib/validation";
import { db } from "@/lib/supabase";
import { SongQueryParams } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const params: SongQueryParams = {
      search: searchParams.get("search") || undefined,
      mood: searchParams.get("mood") || undefined,
      genre: searchParams.get("genre") || undefined,
      sortBy: (searchParams.get("sortBy") as SongQueryParams["sortBy"]) || "created_at",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "20", 10),
    };

    const result = await db.getSongs(params);

    return NextResponse.json({
      success: true,
      data: result.songs,
      total: result.total,
      page: params.page,
      limit: params.limit,
      source: result.source,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch songs.";
    console.error("GET /api/songs error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateSaveInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid song payload to save." },
        { status: 400 }
      );
    }

    const { song, source } = await db.createSong(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: song,
        source,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save song analysis.";
    console.error("POST /api/songs error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
