import { GoogleGenAI } from "@google/genai";
import { AnalyzeSongInput, SongAnalysisResult, SongRecord, SmartInsightsData, SongComparison } from "@/types";
import { validateGeminiJsonResponse } from "./validation";

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes("your-gemini-api-key"));
}

export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes("your-gemini-api-key")) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set your Google Gemini API key in .env.local to enable AI analysis."
    );
  }
  return new GoogleGenAI({ apiKey });
}

function cleanJsonResponseText(rawText: string): string {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present (e.g. ```json ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Classifies the mood and emotional characteristics of a song using Google Gemini AI.
 */
export async function analyzeSongWithGemini(
  input: AnalyzeSongInput
): Promise<SongAnalysisResult & { metadataOnly: boolean }> {
  const client = getGeminiClient();
  const modelName = getGeminiModelName();

  const hasLyrics = Boolean(input.lyrics && input.lyrics.trim().length > 0);
  const metadataOnly = !hasLyrics;

  const prompt = `You are an expert musicologist, emotional psychologist, and audio mood analyst.
Analyze the emotional mood, tone, and musical characteristics of the following song:

SONG DETAILS:
- Title: "${input.title}"
${input.artist ? `- Artist: "${input.artist}"` : "- Artist: Not specified"}
${input.album ? `- Album: "${input.album}"` : "- Album: Not specified"}
${input.genre ? `- Genre: "${input.genre}"` : "- Genre: Not specified"}
${input.userMoodGuess ? `- User's Initial Mood Guess: "${input.userMoodGuess}"` : ""}
${
  hasLyrics
    ? `\nFULL / PARTIAL LYRICS:\n"""\n${input.lyrics}\n"""`
    : `\nNOTE ON LYRICS:
Lyrics were NOT provided for this track. You MUST analyze this track based purely on known musical style, artist discography, title semantics, and genre conventions. You must explicitly indicate in the summary that this classification is derived from song metadata and stylistic conventions rather than lyrical text.`
}

INSTRUCTIONS:
1. Classify the single best primary mood category from this list (or provide the most accurate single-word emotion):
   - Happy, Sad, Romantic, Energetic, Calm, Angry, Nostalgic, Motivational, Melancholic, Peaceful, Mysterious
2. Provide 2 to 4 nuanced secondary moods.
3. Estimate confidence score from 0.0 to 1.0 (Note: This is an AI qualitative estimate, not an empirical statistical probability).
4. Estimate Energy Level on an integer scale from 1 (deeply tranquil, ambient) to 10 (explosive, hyper-energetic, high tempo).
5. Estimate Emotional Valence on an integer scale from 1 (profoundly sorrowful, grim, despairing) to 10 (pure euphoria, triumph, optimism).
6. Write a concise, insightful 2-3 sentence emotional summary explaining why the track evokes this mood.
7. Extract 3 to 6 overarching themes (e.g. "heartbreak", "perseverance", "summer romance", "solitude").
8. Extract 4 to 8 vivid emotional keywords (e.g. "uplifting", "bittersweet", "haunting", "euphoric").
9. Suggest a suitable real-world activity for listening to this track (e.g. "Night drives, creative writing, or contemplative walks").

Return STRICTLY valid JSON conforming to this exact schema with NO extra commentary or wrappers:
{
  "primaryMood": "string",
  "secondaryMoods": ["string"],
  "confidence": number,
  "energyLevel": number,
  "valence": number,
  "summary": "string",
  "themes": ["string"],
  "emotionalKeywords": ["string"],
  "recommendedActivity": "string"
}`;

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini returned an empty response. Please try again.");
    }

    const cleanedJson = cleanJsonResponseText(responseText);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${cleanedJson.slice(0, 150)}...`);
    }

    const validation = validateGeminiJsonResponse(parsed);
    if (!validation.success || !validation.data) {
      throw new Error(`Invalid AI response format: ${validation.error}`);
    }

    return {
      ...validation.data,
      metadataOnly,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("rate limit")) {
      throw new Error("Gemini API rate limit exceeded or quota exhausted. Please try again in a few moments.");
    }
    if (errorMsg.includes("403") || errorMsg.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API Key. Please verify your GEMINI_API_KEY environment variable.");
    }
    throw new Error(`AI Analysis failed: ${errorMsg}`);
  }
}

/**
 * Generates Smart AI insights summarizing patterns from saved library records.
 */
export async function generateSmartInsights(songs: SongRecord[]): Promise<SmartInsightsData> {
  const highEnergySongs = songs.filter((s) => s.energy_level >= 7);
  const calmSongs = songs.filter((s) => s.energy_level <= 3);

  // Calculate top themes
  const themeCounts: Record<string, number> = {};
  for (const s of songs) {
    if (Array.isArray(s.themes)) {
      for (const t of s.themes) {
        const norm = t.toLowerCase().trim();
        themeCounts[norm] = (themeCounts[norm] || 0) + 1;
      }
    }
  }
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([theme, count]) => ({ theme, count }));

  // Check user guess comparison
  let guessComparisonInsight: string | null = null;
  const songsWithGuesses = songs.filter((s) => s.user_mood_guess);
  if (songsWithGuesses.length > 0) {
    const matched = songsWithGuesses.filter(
      (s) => s.user_mood_guess?.toLowerCase() === s.primary_mood.toLowerCase()
    );
    const pct = Math.round((matched.length / songsWithGuesses.length) * 100);
    guessComparisonInsight = `User mood intuition matches AI classification in ${pct}% of evaluated tracks (${matched.length} of ${songsWithGuesses.length}).`;
  }

  // If Gemini is available, query for high-level musical personality overview
  let aiOverview = `Your library contains ${songs.length} song analyses reflecting diverse emotional dynamics. High energy tracks make up ${highEnergySongs.length} songs, while calm/introspective selections account for ${calmSongs.length}.`;

  if (isGeminiConfigured() && songs.length >= 2) {
    try {
      const client = getGeminiClient();
      const modelName = getGeminiModelName();
      const summaryList = songs
        .slice(0, 15)
        .map((s) => `- "${s.title}" by ${s.artist || "Unknown"}: ${s.primary_mood} (Energy ${s.energy_level}/10, Valence ${s.valence}/10)`)
        .join("\n");

      const prompt = `Based on the following collection of analyzed songs, write a 2-3 sentence personalized music mood psychological overview highlighting the user's emotional taste in music:\n\n${summaryList}`;

      const res = await client.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = res.text;
      if (text && text.trim().length > 0) {
        aiOverview = text.trim();
      }
    } catch {
      // Fallback to statistical overview if AI call fails
    }
  }

  return {
    highEnergySongs,
    calmSongs,
    topThemes,
    aiOverview,
    guessComparisonInsight,
  };
}

/**
 * Compares two songs and produces an AI-powered comparison verdict.
 */
export async function compareSongsWithGemini(
  songA: SongRecord,
  songB: SongRecord
): Promise<SongComparison> {
  const energyDifference = Math.abs(songA.energy_level - songB.energy_level);
  const valenceDifference = Math.abs(songA.valence - songB.valence);

  const setThemesB = new Set((songB.themes || []).map((t) => t.toLowerCase()));
  const sharedThemes = (songA.themes || []).filter((t) => setThemesB.has(t.toLowerCase()));

  const setKeywordsB = new Set((songB.emotional_keywords || []).map((k) => k.toLowerCase()));
  const sharedKeywords = (songA.emotional_keywords || []).filter((k) => setKeywordsB.has(k.toLowerCase()));

  let verdict = `"${songA.title}" conveys a ${songA.primary_mood} state with energy ${songA.energy_level}/10, whereas "${songB.title}" exhibits a ${songB.primary_mood} mood with energy ${songB.energy_level}/10.`;

  if (isGeminiConfigured()) {
    try {
      const client = getGeminiClient();
      const modelName = getGeminiModelName();
      const prompt = `Compare the emotional and acoustic atmosphere of these two tracks:
TRACK 1: "${songA.title}" by ${songA.artist || "Unknown"}
- Mood: ${songA.primary_mood} (Energy: ${songA.energy_level}/10, Valence: ${songA.valence}/10)
- Summary: ${songA.summary}

TRACK 2: "${songB.title}" by ${songB.artist || "Unknown"}
- Mood: ${songB.primary_mood} (Energy: ${songB.energy_level}/10, Valence: ${songB.valence}/10)
- Summary: ${songB.summary}

Provide a concise 2-sentence comparative verdict contrasting their emotional impact, energy dynamic, and ideal transition context.`;

      const res = await client.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = res.text;
      if (text && text.trim().length > 0) {
        verdict = text.trim();
      }
    } catch {
      // Keep calculated verdict
    }
  }

  return {
    songA,
    songB,
    energyDifference,
    valenceDifference,
    sharedThemes,
    sharedKeywords,
    verdict,
  };
}
