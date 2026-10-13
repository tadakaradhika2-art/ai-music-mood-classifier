"use client";

import React, { useState } from "react";
import { X, Sparkles, Scale, Zap, Heart } from "lucide-react";
import { SongRecord, SongComparison } from "@/types";
import { getMoodDetails } from "@/lib/utils";

interface SongComparisonModalProps {
  availableSongs: SongRecord[];
  initialSong?: SongRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SongComparisonModal({
  availableSongs,
  initialSong,
  isOpen,
  onClose,
}: SongComparisonModalProps) {
  const [songIdA, setSongIdA] = useState<string>(
    initialSong?.id || (availableSongs[0]?.id ?? "")
  );
  const [songIdB, setSongIdB] = useState<string>(
    availableSongs.find((s) => s.id !== initialSong?.id)?.id || (availableSongs[1]?.id ?? "")
  );

  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<SongComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!songIdA || !songIdB) {
      setError("Please select two distinct songs to compare.");
      return;
    }

    if (songIdA === songIdB) {
      setError("Please select two different songs for meaningful comparison.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songIdA, songIdB }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate mood comparison.");
      }

      setComparison(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating comparison.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedA = availableSongs.find((s) => s.id === songIdA);
  const selectedB = availableSongs.find((s) => s.id === songIdB);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Compare Track Moods</h3>
              <p className="text-xs text-slate-400">
                Analyze emotional contrasts and energy deltas between two songs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Selectors Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Track A
              </label>
              <select
                value={songIdA}
                onChange={(e) => {
                  setSongIdA(e.target.value);
                  setComparison(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {availableSongs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.primary_mood})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Track B
              </label>
              <select
                value={songIdB}
                onChange={(e) => {
                  setSongIdB(e.target.value);
                  setComparison(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {availableSongs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.primary_mood})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleCompare}
              disabled={loading || !songIdA || !songIdB}
              className="gradient-button text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/25 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{loading ? "Comparing Moods..." : "Run AI Mood Contrast"}</span>
            </button>
          </div>

          {/* Results Comparison View */}
          {comparison && selectedA && selectedB && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {/* AI Comparative Verdict */}
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30">
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider block mb-1">
                  AI Comparative Analysis
                </span>
                <p className="text-sm text-slate-200 leading-relaxed italic">
                  &ldquo;{comparison.verdict}&rdquo;
                </p>
              </div>

              {/* Side by side metric columns */}
              <div className="grid grid-cols-2 gap-3 text-center">
                {/* Track A Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-sm font-bold text-white truncate">{selectedA.title}</h4>
                  <span className="text-xs text-slate-400 block truncate mb-2">
                    {selectedA.artist || "Unknown artist"}
                  </span>
                  <span
                    className={`inline-block text-xs px-2.5 py-1 rounded-lg font-bold border ${getMoodDetails(selectedA.primary_mood).badgeBg} ${getMoodDetails(selectedA.primary_mood).badgeText} ${getMoodDetails(selectedA.primary_mood).badgeBorder}`}
                  >
                    {selectedA.primary_mood}
                  </span>
                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <div>Energy: <strong className="text-amber-400">{selectedA.energy_level}/10</strong></div>
                    <div>Valence: <strong className="text-pink-400">{selectedA.valence}/10</strong></div>
                  </div>
                </div>

                {/* Track B Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-sm font-bold text-white truncate">{selectedB.title}</h4>
                  <span className="text-xs text-slate-400 block truncate mb-2">
                    {selectedB.artist || "Unknown artist"}
                  </span>
                  <span
                    className={`inline-block text-xs px-2.5 py-1 rounded-lg font-bold border ${getMoodDetails(selectedB.primary_mood).badgeBg} ${getMoodDetails(selectedB.primary_mood).badgeText} ${getMoodDetails(selectedB.primary_mood).badgeBorder}`}
                  >
                    {selectedB.primary_mood}
                  </span>
                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <div>Energy: <strong className="text-amber-400">{selectedB.energy_level}/10</strong></div>
                    <div>Valence: <strong className="text-pink-400">{selectedB.valence}/10</strong></div>
                  </div>
                </div>
              </div>

              {/* Deltas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy Delta
                  </span>
                  <span className="font-bold text-white">
                    {comparison.energyDifference} points
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400" /> Valence Delta
                  </span>
                  <span className="font-bold text-white">
                    {comparison.valenceDifference} points
                  </span>
                </div>
              </div>

              {/* Shared Themes & Keywords */}
              {comparison.sharedThemes.length > 0 && (
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">
                    Shared Themes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.sharedThemes.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
