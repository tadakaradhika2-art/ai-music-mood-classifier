"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Heart,
  Save,
  Download,
  RotateCcw,
  CheckCircle2,
  Compass,
  FileText,
  Tag,
  KeyRound,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AnalyzeSongInput, SongAnalysisResult, SongRecord } from "@/types";
import { getMoodDetails, exportToJson } from "@/lib/utils";

interface MoodResultCardProps {
  analysis: SongAnalysisResult & { metadataOnly?: boolean };
  input: AnalyzeSongInput;
  onSaved?: (savedSong: SongRecord) => void;
  onReset: () => void;
  className?: string;
}

export function MoodResultCard({
  analysis,
  input,
  onSaved,
  onReset,
  className = "",
}: MoodResultCardProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const moodMeta = getMoodDetails(analysis.primaryMood);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    setSaveError(null);

    const payload = {
      title: input.title,
      artist: input.artist,
      album: input.album,
      genre: input.genre,
      lyrics: input.lyrics,
      userMoodGuess: input.userMoodGuess,
      primaryMood: analysis.primaryMood,
      secondaryMoods: analysis.secondaryMoods,
      confidence: analysis.confidence,
      energyLevel: analysis.energyLevel,
      valence: analysis.valence,
      summary: analysis.summary,
      themes: analysis.themes,
      emotionalKeywords: analysis.emotionalKeywords,
      recommendedActivity: analysis.recommendedActivity,
      metadataOnly: Boolean(analysis.metadataOnly),
    };

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save song to database.");
      }

      setSaved(true);
      if (onSaved) {
        onSaved(json.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving analysis";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    exportToJson(
      {
        track: {
          title: input.title,
          artist: input.artist || null,
          album: input.album || null,
          genre: input.genre || null,
        },
        classification: analysis,
        timestamp: new Date().toISOString(),
      },
      `${input.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-mood-analysis.json`
    );
  };

  return (
    <div
      className={`glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        boxShadow: `0 0 40px ${moodMeta.color}15, 0 10px 30px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Top ambient color strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: moodMeta.color }}
      />

      {/* Header section with Title and Primary Mood Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {input.genre || "Music Track"}
            </span>
            {analysis.metadataOnly && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                Metadata-Only Analysis
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {input.title}
          </h2>
          <p className="text-sm text-slate-300 mt-0.5">
            {input.artist ? `by ${input.artist}` : "Artist not specified"}
            {input.album ? ` • ${input.album}` : ""}
          </p>
        </div>

        {/* Primary Mood Badge */}
        <div className="flex flex-col sm:items-end">
          <span className="text-[11px] text-slate-400 font-semibold mb-1">
            Primary Classified Mood
          </span>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold border shadow-lg ${moodMeta.badgeBg} ${moodMeta.badgeText} ${moodMeta.badgeBorder}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: moodMeta.color }}
            />
            {analysis.primaryMood}
          </div>
        </div>
      </div>

      {/* Disclaimer Alert */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">AI-Generated Interpretation:</span>{" "}
          This classification is powered by Google Gemini natural language and musicological analysis. Confidence estimate ({(analysis.confidence * 100).toFixed(0)}%) reflects semantic certainty rather than empirical acoustic laboratory measurement.
        </div>
      </div>

      {/* Intuition comparison if user supplied a guess */}
      {input.userMoodGuess && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Your intuition guess was <strong className="text-white">{input.userMoodGuess}</strong>
          </span>
          {input.userMoodGuess.toLowerCase() === analysis.primaryMood.toLowerCase() ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Perfect Match
            </span>
          ) : (
            <span className="text-amber-400 font-medium">
              Subtle contrast with AI analysis
            </span>
          )}
        </div>
      )}

      {/* Metrics Row: Energy Level, Valence, and Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Energy Meter */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Energy Level
            </span>
            <span className="text-sm font-extrabold text-white">
              {analysis.energyLevel} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </span>
          </div>
          {/* Visual bar meter */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                  i < analysis.energyLevel
                    ? i > 7
                      ? "bg-red-500"
                      : i > 4
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                    : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analysis.energyLevel >= 8
              ? "High tempo, vigorous & explosive"
              : analysis.energyLevel >= 5
              ? "Moderate, driving & steady tempo"
              : "Subdued, tranquil & low tempo"}
          </span>
        </div>

        {/* Emotional Valence Meter */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-400" />
              Emotional Valence
            </span>
            <span className="text-sm font-extrabold text-white">
              {analysis.valence} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                  i < analysis.valence
                    ? i > 6
                      ? "bg-cyan-400"
                      : i > 3
                      ? "bg-violet-400"
                      : "bg-indigo-500"
                    : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {analysis.valence >= 7
              ? "Euphoric, optimistic & joyous"
              : analysis.valence >= 4
              ? "Ambivalent, reflective & nuanced"
              : "Somber, melancholic & heavy"}
          </span>
        </div>

        {/* Qualitative AI Confidence */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              AI Semantic Fit
            </span>
            <span className="text-sm font-extrabold text-violet-300">
              {(analysis.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, analysis.confidence * 100))}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Qualitative linguistic coherence score
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          Emotional & Musical Summary
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          {analysis.summary}
        </p>
      </div>

      {/* Secondary Moods, Themes, Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Secondary Moods */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            Secondary Mood Dimensions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.secondaryMoods.length > 0 ? (
              analysis.secondaryMoods.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/60 font-medium"
                >
                  {m}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">None identified</span>
            )}
          </div>
        </div>

        {/* Identified Themes */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-violet-400" />
            Key Lyrical & Sonic Themes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.themes.length > 0 ? (
              analysis.themes.map((theme) => (
                <span
                  key={theme}
                  className="text-xs px-2.5 py-1 rounded-lg bg-violet-950/40 text-violet-300 border border-violet-800/40 font-medium"
                >
                  #{theme}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">None extracted</span>
            )}
          </div>
        </div>
      </div>

      {/* Emotional Keywords & Recommended Activity */}
      <div className="space-y-4 mb-6">
        {/* Emotional Keywords */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Emotional Keywords
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.emotionalKeywords.map((k) => (
              <span
                key={k}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium"
              >
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Activity */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/30 to-cyan-950/20 border border-violet-500/20 flex items-start gap-3">
          <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Recommended Listening Context
            </h5>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
              {analysis.recommendedActivity}
            </p>
          </div>
        </div>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
          {saveError}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md transition ${
              saved
                ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default"
                : "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved to Library</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save to Library</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analyze Another Song</span>
        </button>
      </div>
    </div>
  );
}
