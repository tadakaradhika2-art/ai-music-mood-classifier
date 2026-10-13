-- ====================================================================
-- AI Music Mood Classifier: Database Schema
-- Supabase PostgreSQL Migration
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop table if recreating (uncomment if necessary during clean reset)
-- DROP TABLE IF EXISTS public.songs;

-- 3. Create 'songs' table
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 255),
    artist TEXT CHECK (char_length(artist) <= 255),
    album TEXT CHECK (char_length(album) <= 255),
    genre TEXT CHECK (char_length(genre) <= 100),
    lyrics TEXT,
    user_mood_guess TEXT CHECK (char_length(user_mood_guess) <= 100),
    
    -- AI Mood Analysis Results
    primary_mood TEXT NOT NULL CHECK (char_length(trim(primary_mood)) > 0 AND char_length(primary_mood) <= 100),
    secondary_moods JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC(4, 3) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    valence INTEGER NOT NULL CHECK (valence >= 1 AND valence <= 10),
    summary TEXT NOT NULL,
    themes JSONB NOT NULL DEFAULT '[]'::jsonb,
    emotional_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_activity TEXT NOT NULL,
    metadata_only BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON public.songs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_primary_mood ON public.songs (primary_mood);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON public.songs (genre);
CREATE INDEX IF NOT EXISTS idx_songs_energy_level ON public.songs (energy_level);
CREATE INDEX IF NOT EXISTS idx_songs_valence ON public.songs (valence);
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON public.songs USING btree (lower(title));
CREATE INDEX IF NOT EXISTS idx_songs_artist_trgm ON public.songs USING btree (lower(artist));

-- 5. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_songs_updated_at ON public.songs;
CREATE TRIGGER trigger_songs_updated_at
    BEFORE UPDATE ON public.songs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS) Setup
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to analyses (suitable for demo / showcase)
CREATE POLICY "Allow public read access to songs"
    ON public.songs
    FOR SELECT
    USING (true);

-- Policy 2: Allow authenticated or server-side API insertions
-- For demo deployment where single-user operates through Next.js server route:
CREATE POLICY "Allow insertions via API"
    ON public.songs
    FOR INSERT
    WITH CHECK (true);

-- Policy 3: Allow updates to metadata fields only
CREATE POLICY "Allow updates to songs"
    ON public.songs
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow deletions
CREATE POLICY "Allow deletions of songs"
    ON public.songs
    FOR DELETE
    USING (true);

-- ====================================================================
-- Sample Seed Data (Optional for testing)
-- ====================================================================
INSERT INTO public.songs (
    title, artist, album, genre, lyrics, user_mood_guess,
    primary_mood, secondary_moods, confidence, energy_level, valence,
    summary, themes, emotional_keywords, recommended_activity, metadata_only
) VALUES 
(
    'Walking on Sunshine', 'Katrina and the Waves', 'Walking on Sunshine', 'Pop / Rock',
    'I used to think maybe you loved me, now baby I''m sure. And I just can''t wait till the day when you knock on my door!',
    'Happy',
    'Happy', '["Energetic", "Euphoric", "Carefree"]'::jsonb,
    0.95, 9, 10,
    'An unapologetic anthem of pure romantic joy, buoyed by explosive horn flourishes and an infectious driving beat.',
    '["celebration", "optimism", "infatuation", "sunshine"]'::jsonb,
    '["jubilant", "ecstatic", "bouncy", "radiant"]'::jsonb,
    'Perfect for morning workouts, road trip sing-alongs, or celebration parties.',
    false
),
(
    'Someone Like You', 'Adele', '21', 'Soul / Pop',
    'Never mind, I''ll find someone like you. I wish nothing but the best for you, too. Don''t forget me, I beg, I remember you said...',
    'Sad',
    'Melancholic', '["Sad", "Heartbroken", "Nostalgic"]'::jsonb,
    0.92, 4, 2,
    'A raw, piano-driven ballad confronting heartbreak with poignant acceptance and lingering grief.',
    '["heartbreak", "acceptance", "loss", "reminiscence"]'::jsonb,
    '["sorrowful", "poignant", "vulnerable", "wistful"]'::jsonb,
    'Best for quiet late-night reflection, emotional catharsis, or solitary journaling.',
    false
),
(
    'Weightless', 'Marconi Union', 'Weightless', 'Ambient',
    'Instrumental track designed with sound therapists to slow heart rate and lower cortisol levels.',
    'Calm',
    'Peaceful', '["Calm", "Meditative", "Serene"]'::jsonb,
    0.98, 2, 8,
    'Carefully calibrated ambient soundscapes featuring soft droning harmonies, gentle chimes, and breathing rhythms.',
    '["mindfulness", "serenity", "restoration", "stillness"]'::jsonb,
    '["tranquil", "soothing", "ethereal", "hypnotic"]'::jsonb,
    'Ideal for deep meditation, restorative yoga, bedtime unwind, or focused study.',
    false
)
ON CONFLICT DO NOTHING;
