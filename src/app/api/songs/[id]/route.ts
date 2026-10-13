import { NextRequest, NextResponse } from "next/server";
import { validateUpdateInput } from "@/lib/validation";
import { db } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Song ID required" }, { status: 400 });
    }

    const { song, source } = await db.getSongById(id);
    if (!song) {
      return NextResponse.json({ success: false, error: "Song not found" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: song, source });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error retrieving song";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Song ID required" }, { status: 400 });
    }

    const body = await req.json();
    const validation = validateUpdateInput(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json({ success: false, error: validation.error || "Invalid update data" }, { status: 400 });
    }

    const { song, source } = await db.updateSong(id, validation.data);
    if (!song) {
      return NextResponse.json({ success: false, error: "Song not found to update" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: song, source });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error updating song";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Song ID required" }, { status: 400 });
    }

    const { success, source } = await db.deleteSong(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Song could not be deleted or not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Song successfully deleted", source });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error deleting song";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
