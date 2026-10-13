"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MoodDistributionChart } from "@/components/charts/MoodDistributionChart";
import { EnergyDistributionChart } from "@/components/charts/EnergyDistributionChart";
import { DashboardStats, SongRecord } from "@/types";
import { getMoodDetails, exportToCsv, exportToJson } from "@/lib/utils";
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  FileCode,
  Zap,
  Heart,
  PieChart,
} from "lucide-react";

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, songsRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/songs?limit=1000"),
        ]);
        const repJson = await repRes.json();
        const songsJson = await songsRes.json();

        if (repJson.success) setStats(repJson.data);
        if (songsJson.success) setSongs(songsJson.data || []);
      } catch (err) {
        console.error("Error loading report data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (songs.length === 0) return;
    const rows = songs.map((s) => ({
      Title: s.title,
      Artist: s.artist || "Unknown",
      Genre: s.genre || "",
      PrimaryMood: s.primary_mood,
      SecondaryMoods: (s.secondary_moods || []).join("; "),
      Confidence: s.confidence,
      EnergyLevel: s.energy_level,
      Valence: s.valence,
      UserMoodGuess: s.user_mood_guess || "",
      Themes: (s.themes || []).join("; "),
      EmotionalKeywords: (s.emotional_keywords || []).join("; "),
      AnalyzedDate: s.created_at,
    }));
    exportToCsv(rows, `music-mood-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportJson = () => {
    exportToJson(
      {
        reportGeneratedAt: new Date().toISOString(),
        summaryStats: stats,
        songAnalyses: songs,
      },
      `music-mood-report-${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const moodList = stats ? Object.entries(stats.moodDistribution).sort((a, b) => b[1] - a[1]) : [];
  const genreList = stats ? Object.entries(stats.genreDistribution).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col md:flex-row">
      <Sidebar className="no-print" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header section with print/export actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-violet-600/20 text-violet-400">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Acoustic Intelligence Analytics
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mood & Analytics <span className="gradient-text">Report</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Aggregated statistics, mood taxonomy frequencies, and energy distributions from your library.
              </p>
            </div>

            {/* Actions: Print / PDF / CSV / JSON */}
            <div className="flex items-center gap-2 flex-wrap no-print">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                title="Print or Save as PDF"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={handleExportCsv}
                disabled={songs.length === 0}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={songs.length === 0}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <FileCode className="w-4 h-4 text-violet-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 border border-slate-800 animate-pulse h-36"></div>
              ))}
            </div>
          ) : !stats || stats.totalSongs === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center">
              <PieChart className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-white">Insufficient Data for Reporting</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">
                You must have at least one saved song analysis to generate acoustic reports and mood distribution analytics.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Total Analyzed</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {stats.totalSongs} Tracks
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {stats.recentCount} in the past 7 days
                  </span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Dominant Mood</span>
                  <div className="text-2xl font-extrabold text-violet-300 mt-1">
                    {stats.mostCommonMood}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {stats.mostCommonMoodCount} tracks ({Math.round((stats.mostCommonMoodCount / stats.totalSongs) * 100)}%)
                  </span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Average Energy</span>
                  <div className="text-2xl font-extrabold text-amber-400 mt-1 flex items-center gap-1.5">
                    <Zap className="w-5 h-5" />
                    <span>{stats.averageEnergy} / 10</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Acoustic velocity index</span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Emotional Valence</span>
                  <div className="text-2xl font-extrabold text-pink-400 mt-1 flex items-center gap-1.5">
                    <Heart className="w-5 h-5" />
                    <span>{stats.averageValence} / 10</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Positivity & optimism rating</span>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MoodDistributionChart
                  distribution={stats.moodDistribution}
                  totalSongs={stats.totalSongs}
                />
                <EnergyDistributionChart
                  averageEnergy={stats.averageEnergy}
                  averageValence={stats.averageValence}
                  totalSongs={stats.totalSongs}
                />
              </div>

              {/* Mood Taxonomy Breakdown Table */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-lg">
                <h3 className="text-base font-bold text-white mb-1">
                  Mood Frequency Breakdown
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Detailed distribution across classified emotional states
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                        <th className="py-2.5 px-3">Mood Category</th>
                        <th className="py-2.5 px-3">Track Count</th>
                        <th className="py-2.5 px-3">Percentage</th>
                        <th className="py-2.5 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {moodList.map(([mood, count]) => {
                        const meta = getMoodDetails(mood);
                        const pct = Math.round((count / stats.totalSongs) * 100);
                        return (
                          <tr key={mood} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-semibold">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                              >
                                {mood}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-white">{count}</td>
                            <td className="py-2.5 px-3 text-slate-300">{pct}%</td>
                            <td className="py-2.5 px-3 text-slate-400">{meta.description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Genre Distribution & Intuition Concordance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Genre breakdown */}
                <div className="glass-card rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-base font-bold text-white mb-1">
                    Genre Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Representation by musical genre
                  </p>
                  {genreList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No genre metadata provided yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {genreList.map(([genre, count]) => (
                        <div key={genre} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{genre}</span>
                          <span className="text-slate-400 font-semibold">
                            {count} tracks ({Math.round((count / stats.totalSongs) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Intuition Accuracy */}
                <div className="glass-card rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-base font-bold text-white mb-1">
                    User Intuition Concordance
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Comparison between user guesses and Gemini AI classifications
                  </p>
                  {stats.userGuessAccuracy ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">Concordance Rate</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {stats.userGuessAccuracy.accuracyPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${stats.userGuessAccuracy.accuracyPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Matched on {stats.userGuessAccuracy.matches} out of {stats.userGuessAccuracy.totalWithGuess} tracks where an intuitive mood guess was entered.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No user mood guesses entered yet. Enter guesses in the song form to track your perception accuracy against Gemini!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
