import { AnalyzeSongInput, SaveSongInput, SongAnalysisResult, UpdateSongInput } from "@/types";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateAnalyzeInput(input: unknown): ValidationResult<AnalyzeSongInput> {
  if (!input || typeof input !== "object") {
    return { success: false, error: "Invalid request payload. Expected an object." };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.title || typeof raw.title !== "string" || raw.title.trim().length === 0) {
    return { success: false, error: "Song title is required." };
  }

  const title = raw.title.trim();
  if (title.length > 255) {
    return { success: false, error: "Song title must be 255 characters or fewer." };
  }

  const artist = typeof raw.artist === "string" ? raw.artist.trim().slice(0, 255) : undefined;
  const album = typeof raw.album === "string" ? raw.album.trim().slice(0, 255) : undefined;
  const genre = typeof raw.genre === "string" ? raw.genre.trim().slice(0, 100) : undefined;
  const userMoodGuess = typeof raw.userMoodGuess === "string" ? raw.userMoodGuess.trim().slice(0, 100) : undefined;

  let lyrics: string | undefined = undefined;
  if (typeof raw.lyrics === "string") {
    const trimmedLyrics = raw.lyrics.trim();
    if (trimmedLyrics.length > 30000) {
      return { success: false, error: "Lyrics must be 30,000 characters or fewer." };
    }
    lyrics = trimmedLyrics.length > 0 ? trimmedLyrics : undefined;
  }

  return {
    success: true,
    data: {
      title,
      artist: artist || undefined,
      album: album || undefined,
      genre: genre || undefined,
      lyrics: lyrics || undefined,
      userMoodGuess: userMoodGuess || undefined,
    },
  };
}

export function validateUpdateInput(input: unknown): ValidationResult<UpdateSongInput> {
  if (!input || typeof input !== "object") {
    return { success: false, error: "Invalid update payload." };
  }

  const raw = input as Record<string, unknown>;
  const result: UpdateSongInput = {};

  if (raw.title !== undefined) {
    if (typeof raw.title !== "string" || raw.title.trim().length === 0) {
      return { success: false, error: "Song title cannot be empty." };
    }
    result.title = raw.title.trim().slice(0, 255);
  }

  if (raw.artist !== undefined) {
    result.artist = typeof raw.artist === "string" ? raw.artist.trim().slice(0, 255) : undefined;
  }

  if (raw.album !== undefined) {
    result.album = typeof raw.album === "string" ? raw.album.trim().slice(0, 255) : undefined;
  }

  if (raw.genre !== undefined) {
    result.genre = typeof raw.genre === "string" ? raw.genre.trim().slice(0, 100) : undefined;
  }

  if (raw.userMoodGuess !== undefined) {
    result.userMoodGuess = typeof raw.userMoodGuess === "string" ? raw.userMoodGuess.trim().slice(0, 100) : undefined;
  }

  return { success: true, data: result };
}

export function validateSaveInput(input: unknown): ValidationResult<SaveSongInput> {
  const baseValidation = validateAnalyzeInput(input);
  if (!baseValidation.success || !baseValidation.data) {
    return { success: false, error: baseValidation.error };
  }

  const raw = input as Record<string, unknown>;

  if (!raw.primaryMood || typeof raw.primaryMood !== "string" || raw.primaryMood.trim().length === 0) {
    return { success: false, error: "primaryMood is required." };
  }

  const primaryMood = raw.primaryMood.trim();
  const secondaryMoods = Array.isArray(raw.secondaryMoods)
    ? raw.secondaryMoods.map((m) => String(m).trim()).filter(Boolean)
    : [];

  const confidenceNum = Number(raw.confidence);
  if (isNaN(confidenceNum) || confidenceNum < 0 || confidenceNum > 1) {
    return { success: false, error: "confidence must be a number between 0 and 1." };
  }

  const energyNum = parseInt(String(raw.energyLevel), 10);
  if (isNaN(energyNum) || energyNum < 1 || energyNum > 10) {
    return { success: false, error: "energyLevel must be an integer between 1 and 10." };
  }

  const valenceNum = parseInt(String(raw.valence), 10);
  if (isNaN(valenceNum) || valenceNum < 1 || valenceNum > 10) {
    return { success: false, error: "valence must be an integer between 1 and 10." };
  }

  if (!raw.summary || typeof raw.summary !== "string") {
    return { success: false, error: "summary text is required." };
  }

  const themes = Array.isArray(raw.themes)
    ? raw.themes.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const emotionalKeywords = Array.isArray(raw.emotionalKeywords)
    ? raw.emotionalKeywords.map((k) => String(k).trim()).filter(Boolean)
    : [];

  if (!raw.recommendedActivity || typeof raw.recommendedActivity !== "string") {
    return { success: false, error: "recommendedActivity is required." };
  }

  return {
    success: true,
    data: {
      ...baseValidation.data,
      primaryMood,
      secondaryMoods,
      confidence: Math.round(confidenceNum * 1000) / 1000,
      energyLevel: energyNum,
      valence: valenceNum,
      summary: raw.summary.trim(),
      themes,
      emotionalKeywords,
      recommendedActivity: raw.recommendedActivity.trim(),
      metadataOnly: Boolean(raw.metadataOnly),
    },
  };
}

export function validateGeminiJsonResponse(parsed: unknown): ValidationResult<SongAnalysisResult> {
  if (!parsed || typeof parsed !== "object") {
    return { success: false, error: "Gemini response is not a valid JSON object." };
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.primaryMood !== "string" || obj.primaryMood.trim().length === 0) {
    return { success: false, error: "Missing or invalid primaryMood in AI response." };
  }

  const primaryMood = obj.primaryMood.trim();

  let secondaryMoods: string[] = [];
  if (Array.isArray(obj.secondaryMoods)) {
    secondaryMoods = obj.secondaryMoods
      .map((m) => (typeof m === "string" ? m.trim() : ""))
      .filter((m) => m.length > 0)
      .slice(0, 5);
  }

  let confidence = Number(obj.confidence);
  if (isNaN(confidence) || confidence < 0) confidence = 0.75;
  if (confidence > 1) confidence = 1.0;
  confidence = Math.round(confidence * 100) / 100;

  let energyLevel = parseInt(String(obj.energyLevel), 10);
  if (isNaN(energyLevel) || energyLevel < 1) energyLevel = 5;
  if (energyLevel > 10) energyLevel = 10;

  let valence = parseInt(String(obj.valence), 10);
  if (isNaN(valence) || valence < 1) valence = 5;
  if (valence > 10) valence = 10;

  const summary = typeof obj.summary === "string" && obj.summary.trim().length > 0
    ? obj.summary.trim()
    : `A captivating track expressing a ${primaryMood} emotional state.`;

  let themes: string[] = [];
  if (Array.isArray(obj.themes)) {
    themes = obj.themes
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter((t) => t.length > 0)
      .slice(0, 6);
  }

  let emotionalKeywords: string[] = [];
  if (Array.isArray(obj.emotionalKeywords)) {
    emotionalKeywords = obj.emotionalKeywords
      .map((k) => (typeof k === "string" ? k.trim() : ""))
      .filter((k) => k.length > 0)
      .slice(0, 8);
  }

  const recommendedActivity = typeof obj.recommendedActivity === "string" && obj.recommendedActivity.trim().length > 0
    ? obj.recommendedActivity.trim()
    : "Suitable for focused listening or relaxing.";

  return {
    success: true,
    data: {
      primaryMood,
      secondaryMoods,
      confidence,
      energyLevel,
      valence,
      summary,
      themes,
      emotionalKeywords,
      recommendedActivity,
    },
  };
}
