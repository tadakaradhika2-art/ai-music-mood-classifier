"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Music2,
  FileText,
  User,
  Disc3,
  Tag,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { AnalyzeSongInput, SongAnalysisResult } from "@/types";

const POPULAR_GENRES = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Indie",
  "Electronic",
  "Jazz",
  "Classical",
  "Ambient",
  "Metal",
];

const MOOD_OPTIONS = [
  "Happy",
  "Sad",
  "Romantic",
  "Energetic",
  "Calm",
  "Angry",
  "Nostalgic",
  "Motivational",
  "Melancholic",
  "Peaceful",
  "Mysterious",
];

interface SongAnalysisFormProps {
  onAnalysisSuccess: (result: SongAnalysisResult & { metadataOnly: boolean }, input: AnalyzeSongInput) => void;
  className?: string;
}

export function SongAnalysisForm({ onAnalysisSuccess, className = "" }: SongAnalysisFormProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [userMoodGuess, setUserMoodGuess] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = "Song title is required.";
    } else if (title.trim().length > 255) {
      errors.title = "Song title must be 255 characters or fewer.";
    }

    if (artist && artist.trim().length > 255) {
      errors.artist = "Artist name must be 255 characters or fewer.";
    }
    if (album && album.trim().length > 255) {
      errors.album = "Album name must be 255 characters or fewer.";
    }
    if (lyrics && lyrics.length > 30000) {
      errors.lyrics = "Lyrics must be 30,000 characters or fewer.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    const payload: AnalyzeSongInput = {
      title: title.trim(),
      artist: artist.trim() || undefined,
      album: album.trim() || undefined,
      genre: genre.trim() || undefined,
      lyrics: lyrics.trim() || undefined,
      userMoodGuess: userMoodGuess || undefined,
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis failed. Please check your network and configuration.");
      }

      onAnalysisSuccess(json.data, payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during analysis.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setArtist("");
    setAlbum("");
    setGenre("");
    setLyrics("");
    setUserMoodGuess("");
    setError(null);
    setValidationErrors({});
  };

  const fillSampleSong = (sample: {
    title: string;
    artist: string;
    genre: string;
    lyrics: string;
    guess: string;
  }) => {
    setTitle(sample.title);
    setArtist(sample.artist);
    setGenre(sample.genre);
    setLyrics(sample.lyrics);
    setUserMoodGuess(sample.guess);
    setError(null);
    setValidationErrors({});
  };

  return (
    <div
      id="analyze"
      className={`glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-500 to-indigo-600"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Analyze Song Mood
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter song metadata and optional lyrics for multi-dimensional emotional classification.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Try Sample:</span>
          <button
            type="button"
            onClick={() =>
              fillSampleSong({
                title: "Viva La Vida",
                artist: "Coldplay",
                genre: "Pop / Rock",
                lyrics:
                  "I used to rule the world, seas would rise when I gave the word. Now in the morning I sleep alone, sweep the streets I used to own. I used to roll the dice, feel the fear in my enemy's eyes...",
                guess: "Nostalgic",
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Viva La Vida
          </button>
          <button
            type="button"
            onClick={() =>
              fillSampleSong({
                title: "Clair de Lune",
                artist: "Claude Debussy",
                genre: "Classical",
                lyrics: "",
                guess: "Peaceful",
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Clair de Lune (No Lyrics)
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-300">Analysis Error</h4>
            <p className="text-xs text-red-200/80 mt-0.5 leading-relaxed">{error}</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-xs px-2.5 py-1 bg-red-800/40 hover:bg-red-800/60 text-red-200 rounded border border-red-500/30 shrink-0 transition"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title and Artist Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5 text-violet-400" />
                Song Title <span className="text-violet-400">*</span>
              </span>
              <span className="text-[10px] text-slate-400">Required</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Bohemian Rhapsody"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition ${
                validationErrors.title ? "border-red-500" : "border-slate-800 hover:border-slate-700"
              }`}
            />
            {validationErrors.title && (
              <p className="text-[11px] text-red-400 mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Artist Name
            </label>
            <input
              type="text"
              placeholder="e.g. Queen"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Album and Genre Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Disc3 className="w-3.5 h-3.5 text-slate-400" />
              Album Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. A Night at the Opera"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Genre
            </label>
            <input
              type="text"
              placeholder="e.g. Rock, Synthwave, Classical"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Quick Genre Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-400">Quick genre:</span>
          {POPULAR_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                genre.toLowerCase() === g.toLowerCase()
                  ? "bg-violet-600/30 text-violet-300 border-violet-500/40"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* User's Mood Guess */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Your Intuitive Mood Guess (Optional)
            </span>
            <span className="text-[10px] text-slate-400">
              Helps compare your perception vs Gemini analysis
            </span>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setUserMoodGuess(userMoodGuess === mood ? "" : mood)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                  userMoodGuess === mood
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Lyrics Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              Lyrics (Optional)
            </span>
            <span className="text-[10px] text-slate-400">
              {lyrics.length.toLocaleString()} / 30,000 chars
            </span>
          </label>
          <textarea
            rows={4}
            placeholder="Paste lyrics or memorable lines here. If left empty, Gemini classifies based on metadata & artist style."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition font-mono leading-relaxed"
          />
          {lyrics.trim().length === 0 && (
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyan-400 shrink-0" />
              Without lyrics, Gemini will perform a metadata-only analysis based on artist discography and genre.
            </p>
          )}
        </div>

        {/* Submit & Reset Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2.5 shadow-lg shadow-violet-600/30 transition cursor-pointer ${
              loading
                ? "bg-violet-900/50 cursor-not-allowed opacity-80"
                : "gradient-button"
            }`}
          >
            {loading ? (
              <>
                {/* Animated sound wave bars */}
                <div className="flex items-center gap-1 h-5">
                  <span className="w-1 bg-violet-300 rounded-full animate-wave-1"></span>
                  <span className="w-1 bg-violet-300 rounded-full animate-wave-2"></span>
                  <span className="w-1 bg-violet-300 rounded-full animate-wave-3"></span>
                  <span className="w-1 bg-violet-300 rounded-full animate-wave-4"></span>
                  <span className="w-1 bg-violet-300 rounded-full animate-wave-5"></span>
                </div>
                <span>Analyzing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Classify Song Mood</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
