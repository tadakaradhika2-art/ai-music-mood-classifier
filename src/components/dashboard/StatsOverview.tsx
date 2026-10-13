"use client";

import React from "react";
import { Music, Sparkles, Clock, Palette } from "lucide-react";
import { DashboardStats } from "@/types";
import { getMoodDetails } from "@/lib/utils";

interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse h-28 flex flex-col justify-between"
          >
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const mostCommonMoodMeta = stats.mostCommonMood && stats.mostCommonMood !== "None"
    ? getMoodDetails(stats.mostCommonMood)
    : null;

  const cards = [
    {
      label: "Total Songs Analyzed",
      value: stats.totalSongs.toString(),
      subtext: stats.totalSongs === 1 ? "1 song in library" : `${stats.totalSongs} records saved`,
      icon: Music,
      color: "text-violet-400",
      bg: "bg-violet-600/15 border-violet-500/20",
    },
    {
      label: "Most Common Mood",
      value: stats.mostCommonMood,
      subtext: mostCommonMoodMeta && stats.mostCommonMoodCount > 0
        ? `${stats.mostCommonMoodCount} tracks (${Math.round((stats.mostCommonMoodCount / (stats.totalSongs || 1)) * 100)}%)`
        : "No data yet",
      icon: Sparkles,
      color: mostCommonMoodMeta?.badgeText || "text-cyan-400",
      bg: mostCommonMoodMeta
        ? `${mostCommonMoodMeta.badgeBg} ${mostCommonMoodMeta.badgeBorder}`
        : "bg-cyan-600/15 border-cyan-500/20",
      isMoodBadge: Boolean(mostCommonMoodMeta),
    },
    {
      label: "Analyzed Recently",
      value: stats.recentCount.toString(),
      subtext: "In the last 7 days",
      icon: Clock,
      color: "text-emerald-400",
      bg: "bg-emerald-600/15 border-emerald-500/20",
    },
    {
      label: "Mood Diversity",
      value: `${stats.moodDiversity}`,
      subtext: `${stats.moodDiversity} distinct mood states`,
      icon: Palette,
      color: "text-pink-400",
      bg: "bg-pink-600/15 border-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
