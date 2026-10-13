"use client";

import React from "react";
import { getMoodDetails } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface MoodDistributionChartProps {
  distribution: Record<string, number>;
  totalSongs: number;
  className?: string;
}

export function MoodDistributionChart({
  distribution,
  totalSongs,
  className = "",
}: MoodDistributionChartProps) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0 || totalSongs === 0) {
    return (
      <div
        className={`glass-card rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center py-12 ${className}`}
      >
        <div className="p-3 rounded-full bg-slate-800/60 text-slate-400 mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">No Mood Distribution Yet</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Analyze and save songs to view emotional distribution breakdowns across your library.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div
      className={`glass-card rounded-2xl p-6 border border-slate-800/80 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            Mood Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Emotional spectrum across {totalSongs} saved tracks
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
          {entries.length} Categories
        </span>
      </div>

      <div className="space-y-3.5">
        {entries.map(([mood, count]) => {
          const meta = getMoodDetails(mood);
          const percentage = Math.round((count / totalSongs) * 100);
          const barWidth = Math.max(8, Math.round((count / maxCount) * 100));

          return (
            <div key={mood} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-2 text-slate-200">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{mood}</span>
                </span>
                <span className="text-slate-400">
                  <strong className="text-white font-semibold">{count}</strong>{" "}
                  <span className="text-[11px] text-slate-400">({percentage}%)</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: meta.color,
                    boxShadow: `0 0 10px ${meta.color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
