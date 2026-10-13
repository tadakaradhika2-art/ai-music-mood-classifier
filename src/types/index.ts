export type MoodCategory =
  | 'Happy'
  | 'Sad'
  | 'Romantic'
  | 'Energetic'
  | 'Calm'
  | 'Angry'
  | 'Nostalgic'
  | 'Motivational'
  | 'Melancholic'
  | 'Peaceful'
  | 'Mysterious'
  | string;

export interface MoodMetadata {
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export interface SongAnalysisResult {
  primaryMood: string;
  secondaryMoods: string[];
  confidence: number; // 0.0 - 1.0
  energyLevel: number; // 1 - 10
  valence: number; // 1 - 10
  summary: string;
  themes: string[];
  emotionalKeywords: string[];
  recommendedActivity: string;
  metadataOnly?: boolean;
}

export interface SongRecord {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  lyrics: string | null;
  user_mood_guess: string | null;
  primary_mood: string;
  secondary_moods: string[];
  confidence: number;
  energy_level: number;
  valence: number;
  summary: string;
  themes: string[];
  emotional_keywords: string[];
  recommended_activity: string;
  created_at: string;
  metadata_only?: boolean;
}

export interface AnalyzeSongInput {
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  lyrics?: string;
  userMoodGuess?: string;
}

export interface SaveSongInput extends AnalyzeSongInput {
  primaryMood: string;
  secondaryMoods: string[];
  confidence: number;
  energyLevel: number;
  valence: number;
  summary: string;
  themes: string[];
  emotionalKeywords: string[];
  recommendedActivity: string;
  metadataOnly?: boolean;
}

export interface UpdateSongInput {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  userMoodGuess?: string;
}

export interface SongQueryParams {
  search?: string;
  mood?: string;
  genre?: string;
  sortBy?: 'created_at' | 'title' | 'energy_level' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalSongs: number;
  mostCommonMood: string;
  mostCommonMoodCount: number;
  recentCount: number; // Analyzed in last 7 days
  moodDiversity: number; // Number of unique moods
  averageEnergy: number;
  averageValence: number;
  moodDistribution: Record<string, number>;
  genreDistribution: Record<string, number>;
  userGuessAccuracy?: {
    matches: number;
    totalWithGuess: number;
    accuracyPercentage: number;
  };
}

export interface SmartInsightsData {
  highEnergySongs: SongRecord[];
  calmSongs: SongRecord[];
  topThemes: { theme: string; count: number }[];
  aiOverview: string;
  guessComparisonInsight: string | null;
}

export interface SongComparison {
  songA: SongRecord;
  songB: SongRecord;
  energyDifference: number;
  valenceDifference: number;
  sharedThemes: string[];
  sharedKeywords: string[];
  verdict: string;
}
