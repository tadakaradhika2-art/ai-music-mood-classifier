"use client";

import React from "react";
import { Music, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  onStartAnalysis: () => void;
  className?: string;
}

export function EmptyState({ onStartAnalysis, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`glass-card rounded-2xl p-8 sm:p-12 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 border border-violet-500/30 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/10">
        <Music className="w-8 h-8 text-violet-400" />
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        Welcome to AI Music Mood Classifier
      </h3>

      <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
        Your library is currently empty. Analyze your first song to begin mapping emotional moods, energy levels, and psychological valence with Google Gemini AI.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onStartAnalysis}
          className="gradient-button text-white text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/25 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-cyan-300" />
          <span>Analyze Your First Song</span>
        </button>
      </div>

      {/* Guide steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-800/80 w-full max-w-2xl text-left">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block mb-1">
            Step 1
          </span>
          <h4 className="text-sm font-semibold text-white">Enter Song Data</h4>
          <p className="text-xs text-slate-400 mt-1">
            Provide the title, artist, genre, and optional lyrics or intuitive guess.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
            Step 2
          </span>
          <h4 className="text-sm font-semibold text-white">AI Classification</h4>
          <p className="text-xs text-slate-400 mt-1">
            Gemini processes emotional tone, energy, valence, and psychological themes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Step 3
          </span>
          <h4 className="text-sm font-semibold text-white">Store & Explore</h4>
          <p className="text-xs text-slate-400 mt-1">
            Save into Supabase, track trends, compare songs, and export analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
