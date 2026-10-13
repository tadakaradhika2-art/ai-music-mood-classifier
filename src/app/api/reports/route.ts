import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { DashboardStats, SongRecord } from "@/types";

export async function GET() {
  try {
    // Fetch all songs for aggregate calculations (default limit 1000 for aggregation)
    const { songs, source } = await db.getSongs({ limit: 1000 });

    const totalSongs = songs.length;

    // Mood distribution
    const moodDistribution: Record<string, number> = {};
    const genreDistribution: Record<string, number> = {};
    let totalEnergy = 0;
    let totalValence = 0;
    let recentCount = 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let userGuessMatches = 0;
    let totalWithGuess = 0;

    for (const s of songs) {
      // Moods
      const mood = s.primary_mood || "Unknown";
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;

      // Genres
      if (s.genre && s.genre.trim()) {
        const genre = s.genre.trim();
        genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
      }

      // Energy & Valence
      totalEnergy += s.energy_level || 5;
      totalValence += s.valence || 5;

      // Recency
      if (new Date(s.created_at).getTime() >= sevenDaysAgo) {
        recentCount++;
      }

      // Guess matching
      if (s.user_mood_guess && s.user_mood_guess.trim()) {
        totalWithGuess++;
        if (s.user_mood_guess.trim().toLowerCase() === s.primary_mood.trim().toLowerCase()) {
          userGuessMatches++;
        }
      }
    }

    // Determine most common mood
    let mostCommonMood = "None";
    let mostCommonMoodCount = 0;
    for (const [m, count] of Object.entries(moodDistribution)) {
      if (count > mostCommonMoodCount) {
        mostCommonMood = m;
        mostCommonMoodCount = count;
      }
    }

    const moodDiversity = Object.keys(moodDistribution).length;
    const averageEnergy = totalSongs > 0 ? Math.round((totalEnergy / totalSongs) * 10) / 10 : 0;
    const averageValence = totalSongs > 0 ? Math.round((totalValence / totalSongs) * 10) / 10 : 0;

    const stats: DashboardStats = {
      totalSongs,
      mostCommonMood,
      mostCommonMoodCount,
      recentCount,
      moodDiversity,
      averageEnergy,
      averageValence,
      moodDistribution,
      genreDistribution,
      userGuessAccuracy: totalWithGuess > 0 ? {
        matches: userGuessMatches,
        totalWithGuess,
        accuracyPercentage: Math.round((userGuessMatches / totalWithGuess) * 100),
      } : undefined,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      recentSongs: songs.slice(0, 5) as SongRecord[],
      source,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error computing reports.";
    console.error("GET /api/reports error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
