"use client";

import React from "react";
import { Zap, Heart } from "lucide-react";

interface EnergyDistributionChartProps {
  averageEnergy: number;
  averageValence: number;
  totalSongs: number;
  className?: string;
}

export function EnergyDistributionChart({
  averageEnergy,
  averageValence,
  totalSongs,
  className = "",
}: EnergyDistributionChartProps) {
  if (totalSongs === 0) return null;

  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-800/80 shadow-lg ${className}`}>
      <h3 className="text-base font-bold text-white tracking-tight mb-1 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        Energy & Valence Averages
      </h3>
      <p className="text-xs text-slate-400 mb-5">
        Average acoustic velocity and emotional optimism across your music
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Average Energy Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Avg Energy
            </span>
            <span className="text-lg font-bold text-amber-300">
              {averageEnergy.toFixed(1)} <span className="text-xs text-slate-400">/ 10</span>
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${(averageEnergy / 10) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {averageEnergy >= 7
              ? "Collection leans dynamic & upbeat"
              : averageEnergy >= 4
              ? "Well-balanced tempo distribution"
              : "Predominantly ambient & mellow"}
          </p>
        </div>

        {/* Average Valence Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-400" />
              Avg Valence
            </span>
            <span className="text-lg font-bold text-pink-300">
              {averageValence.toFixed(1)} <span className="text-xs text-slate-400">/ 10</span>
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${(averageValence / 10) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {averageValence >= 7
              ? "High optimism & joyous tones"
              : averageValence >= 4
              ? "Complex bittersweet & nuanced emotions"
              : "Somber, moody & introspective"}
          </p>
        </div>
      </div>
    </div>
  );
}
