import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SongRecord, SaveSongInput, UpdateSongInput, SongQueryParams } from "@/types";

// Public Supabase client for client-side queries
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("https://") &&
    (supabaseAnonKey || supabaseServiceRoleKey) &&
    !supabaseUrl.includes("your-project")
  );
}

let publicClient: SupabaseClient | null = null;
let serverPrivilegedClient: SupabaseClient | null = null;

export function getPublicSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicClient && supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey)) {
    publicClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey!);
  }
  return publicClient;
}

export function getServerSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!serverPrivilegedClient && supabaseUrl) {
    const key = supabaseServiceRoleKey || supabaseAnonKey;
    if (key) {
      serverPrivilegedClient = createClient(supabaseUrl, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }
  return serverPrivilegedClient;
}

// In-memory fallback repository for demo/offline development before Supabase keys are configured
class MemorySongRepository {
  private songs: SongRecord[] = [];

  constructor() {
    // Seed with 3 initial songs to illustrate empty vs populated states
    this.songs = [
      {
        id: "d3b07384-d113-4c91-9c17-4836696bcf01",
        title: "Walking on Sunshine",
        artist: "Katrina and the Waves",
        album: "Walking on Sunshine",
        genre: "Pop / Rock",
        lyrics: "I used to think maybe you loved me, now baby I'm sure. And I just can't wait till the day when you knock on my door!",
        user_mood_guess: "Happy",
        primary_mood: "Happy",
        secondary_moods: ["Energetic", "Euphoric", "Carefree"],
        confidence: 0.95,
        energy_level: 9,
        valence: 10,
        summary: "An unapologetic anthem of pure romantic joy, buoyed by explosive horn flourishes and an infectious driving beat.",
        themes: ["celebration", "optimism", "infatuation", "sunshine"],
        emotional_keywords: ["jubilant", "ecstatic", "bouncy", "radiant"],
        recommended_activity: "Perfect for morning workouts, road trip sing-alongs, or celebration parties.",
        metadata_only: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "e4c18495-e224-4d02-ad28-5947707cdf02",
        title: "Someone Like You",
        artist: "Adele",
        album: "21",
        genre: "Soul / Pop",
        lyrics: "Never mind, I'll find someone like you. I wish nothing but the best for you, too. Don't forget me, I beg, I remember you said...",
        user_mood_guess: "Sad",
        primary_mood: "Melancholic",
        secondary_moods: ["Sad", "Heartbroken", "Nostalgic"],
        confidence: 0.92,
        energy_level: 4,
        valence: 2,
        summary: "A raw, piano-driven ballad confronting heartbreak with poignant acceptance and lingering grief.",
        themes: ["heartbreak", "acceptance", "loss", "reminiscence"],
        emotional_keywords: ["sorrowful", "poignant", "vulnerable", "wistful"],
        recommended_activity: "Best for quiet late-night reflection, emotional catharsis, or solitary journaling.",
        metadata_only: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "f5d29506-f335-4e13-be39-6058818def03",
        title: "Weightless",
        artist: "Marconi Union",
        album: "Weightless",
        genre: "Ambient",
        lyrics: null,
        user_mood_guess: "Calm",
        primary_mood: "Peaceful",
        secondary_moods: ["Calm", "Meditative", "Serene"],
        confidence: 0.98,
        energy_level: 2,
        valence: 8,
        summary: "Carefully calibrated ambient soundscapes featuring soft droning harmonies, gentle chimes, and breathing rhythms.",
        themes: ["mindfulness", "serenity", "restoration", "stillness"],
        emotional_keywords: ["tranquil", "soothing", "ethereal", "hypnotic"],
        recommended_activity: "Ideal for deep meditation, restorative yoga, bedtime unwind, or focused study.",
        metadata_only: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  async getAll(params: SongQueryParams = {}): Promise<{ songs: SongRecord[]; total: number }> {
    let result = [...this.songs];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.artist && s.artist.toLowerCase().includes(q)) ||
          (s.genre && s.genre.toLowerCase().includes(q))
      );
    }

    if (params.mood && params.mood !== "All") {
      result = result.filter(
        (s) => s.primary_mood.toLowerCase() === params.mood!.toLowerCase()
      );
    }

    if (params.genre && params.genre !== "All") {
      result = result.filter(
        (s) => s.genre && s.genre.toLowerCase() === params.genre!.toLowerCase()
      );
    }

    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "desc";

    result.sort((a, b) => {
      let valA: unknown = a[sortBy as keyof SongRecord];
      let valB: unknown = b[sortBy as keyof SongRecord];

      if (sortBy === "created_at") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (sortOrder === "asc") {
        return valA < valB ? -1 : 1;
      } else {
        return valA > valB ? -1 : 1;
      }
    });

    const total = result.length;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return { songs: paginated, total };
  }

  async getById(id: string): Promise<SongRecord | null> {
    return this.songs.find((s) => s.id === id) || null;
  }

  async create(data: SaveSongInput): Promise<SongRecord> {
    const newRecord: SongRecord = {
      id: crypto.randomUUID(),
      title: data.title,
      artist: data.artist || null,
      album: data.album || null,
      genre: data.genre || null,
      lyrics: data.lyrics || null,
      user_mood_guess: data.userMoodGuess || null,
      primary_mood: data.primaryMood,
      secondary_moods: data.secondaryMoods,
      confidence: data.confidence,
      energy_level: data.energyLevel,
      valence: data.valence,
      summary: data.summary,
      themes: data.themes,
      emotional_keywords: data.emotionalKeywords,
      recommended_activity: data.recommendedActivity,
      metadata_only: Boolean(data.metadataOnly),
      created_at: new Date().toISOString(),
    };
    this.songs.unshift(newRecord);
    return newRecord;
  }

  async update(id: string, updates: UpdateSongInput): Promise<SongRecord | null> {
    const idx = this.songs.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const existing = this.songs[idx];
    const updated: SongRecord = {
      ...existing,
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.artist !== undefined ? { artist: updates.artist || null } : {}),
      ...(updates.album !== undefined ? { album: updates.album || null } : {}),
      ...(updates.genre !== undefined ? { genre: updates.genre || null } : {}),
      ...(updates.userMoodGuess !== undefined ? { user_mood_guess: updates.userMoodGuess || null } : {}),
    };

    this.songs[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = this.songs.length;
    this.songs = this.songs.filter((s) => s.id !== id);
    return this.songs.length < initialLen;
  }
}

// Global singleton for memory fallback
const globalMemoryStore = new MemorySongRepository();

// Unified Database Service that dynamically routes to Supabase when configured, or Memory Store when keys are unset
export const db = {
  isConfigured: isSupabaseConfigured,

  async getSongs(params: SongQueryParams = {}): Promise<{ songs: SongRecord[]; total: number; source: "supabase" | "memory" }> {
    const client = getServerSupabaseClient();
    if (!client) {
      const res = await globalMemoryStore.getAll(params);
      return { ...res, source: "memory" };
    }

    let query = client.from("songs").select("*", { count: "exact" });

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,artist.ilike.%${params.search}%,genre.ilike.%${params.search}%`);
    }

    if (params.mood && params.mood !== "All") {
      query = query.eq("primary_mood", params.mood);
    }

    if (params.genre && params.genre !== "All") {
      query = query.eq("genre", params.genre);
    }

    const sortBy = params.sortBy || "created_at";
    const ascending = params.sortOrder === "asc";
    query = query.order(sortBy, { ascending });

    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Supabase getSongs error:", error);
      // Fallback to memory store if database table does not exist or connection fails
      const fallbackRes = await globalMemoryStore.getAll(params);
      return { ...fallbackRes, source: "memory" };
    }

    return {
      songs: (data as SongRecord[]) || [],
      total: count ?? data?.length ?? 0,
      source: "supabase",
    };
  },

  async getSongById(id: string): Promise<{ song: SongRecord | null; source: "supabase" | "memory" }> {
    const client = getServerSupabaseClient();
    if (!client) {
      const song = await globalMemoryStore.getById(id);
      return { song, source: "memory" };
    }

    const { data, error } = await client.from("songs").select("*").eq("id", id).single();
    if (error || !data) {
      const fallback = await globalMemoryStore.getById(id);
      return { song: fallback, source: "memory" };
    }

    return { song: data as SongRecord, source: "supabase" };
  },

  async createSong(input: SaveSongInput): Promise<{ song: SongRecord; source: "supabase" | "memory" }> {
    const client = getServerSupabaseClient();
    if (!client) {
      const song = await globalMemoryStore.create(input);
      return { song, source: "memory" };
    }

    const insertPayload = {
      title: input.title,
      artist: input.artist || null,
      album: input.album || null,
      genre: input.genre || null,
      lyrics: input.lyrics || null,
      user_mood_guess: input.userMoodGuess || null,
      primary_mood: input.primaryMood,
      secondary_moods: input.secondaryMoods,
      confidence: input.confidence,
      energy_level: input.energyLevel,
      valence: input.valence,
      summary: input.summary,
      themes: input.themes,
      emotional_keywords: input.emotionalKeywords,
      recommended_activity: input.recommendedActivity,
      metadata_only: Boolean(input.metadataOnly),
    };

    const { data, error } = await client.from("songs").insert(insertPayload).select().single();

    if (error || !data) {
      console.error("Supabase insert error, falling back to memory:", error);
      const fallbackSong = await globalMemoryStore.create(input);
      return { song: fallbackSong, source: "memory" };
    }

    return { song: data as SongRecord, source: "supabase" };
  },

  async updateSong(id: string, input: UpdateSongInput): Promise<{ song: SongRecord | null; source: "supabase" | "memory" }> {
    const client = getServerSupabaseClient();
    if (!client) {
      const song = await globalMemoryStore.update(id, input);
      return { song, source: "memory" };
    }

    const updatePayload: Record<string, unknown> = {};
    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.artist !== undefined) updatePayload.artist = input.artist || null;
    if (input.album !== undefined) updatePayload.album = input.album || null;
    if (input.genre !== undefined) updatePayload.genre = input.genre || null;
    if (input.userMoodGuess !== undefined) updatePayload.user_mood_guess = input.userMoodGuess || null;

    const { data, error } = await client.from("songs").update(updatePayload).eq("id", id).select().single();

    if (error || !data) {
      const fallbackSong = await globalMemoryStore.update(id, input);
      return { song: fallbackSong, source: "memory" };
    }

    return { song: data as SongRecord, source: "supabase" };
  },

  async deleteSong(id: string): Promise<{ success: boolean; source: "supabase" | "memory" }> {
    const client = getServerSupabaseClient();
    if (!client) {
      const success = await globalMemoryStore.delete(id);
      return { success, source: "memory" };
    }

    const { error } = await client.from("songs").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
      const fallbackSuccess = await globalMemoryStore.delete(id);
      return { success: fallbackSuccess, source: "memory" };
    }

    return { success: true, source: "supabase" };
  },
};
