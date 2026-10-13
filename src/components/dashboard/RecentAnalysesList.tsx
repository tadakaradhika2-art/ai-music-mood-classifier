"use client";

import React from "react";
import Link from "next/link";
import { Music, ArrowRight, Zap, Calendar } from "lucide-react";
import { SongRecord } from "@/types";
import { getMoodDetails, formatTimeAgo } from "@/lib/utils";

interface RecentAnalysesListProps {
  songs: SongRecord[];
  onSelectSong?: (song: SongRecord) => void;
  className?: string;
}

export function RecentAnalysesList({
  songs,
  onSelectSong,
  className = "",
}: RecentAnalysesListProps) {
  if (songs.length === 0) return null;

  return (
    <div
      className={`glass-card rounded-2xl p-6 border border-slate-800/80 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Music className="w-4 h-4 text-cyan-400" />
            Recently Analyzed Tracks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest classifications saved to your database
          </p>
        </div>
        <Link
          href="/library"
          className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"
        >
          <span>View Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-800/80">
        {songs.map((song) => {
          const meta = getMoodDetails(song.primary_mood);
          return (
            <div
              key={song.id}
              onClick={() => onSelectSong?.(song)}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-800/30 px-2 rounded-xl transition cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition">
                    {song.title}
                  </h4>
                  {song.genre && (
                    <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {song.genre}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {song.artist || "Unknown artist"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Energy Indicator */}
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{song.energy_level}/10</span>
                </div>

                {/* Primary Mood Badge */}
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                >
                  {song.primary_mood}
                </span>

                <span className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {formatTimeAgo(song.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
