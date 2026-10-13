"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { SongAnalysisForm } from "@/components/music/SongAnalysisForm";
import { MoodResultCard } from "@/components/music/MoodResultCard";
import { MoodDistributionChart } from "@/components/charts/MoodDistributionChart";
import { EnergyDistributionChart } from "@/components/charts/EnergyDistributionChart";
import { RecentAnalysesList } from "@/components/dashboard/RecentAnalysesList";
import { SmartInsightsCard } from "@/components/dashboard/SmartInsightsCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SongComparisonModal } from "@/components/music/SongComparisonModal";
import {
  AnalyzeSongInput,
  DashboardStats,
  SongAnalysisResult,
  SongRecord,
} from "@/types";
import { Scale, Library, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSongs, setRecentSongs] = useState<SongRecord[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Active analysis in progress or just completed
  const [activeAnalysis, setActiveAnalysis] = useState<(SongAnalysisResult & { metadataOnly?: boolean }) | null>(null);
  const [activeInput, setActiveInput] = useState<AnalyzeSongInput | null>(null);

  // Comparison modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedSongForCompare, setSelectedSongForCompare] = useState<SongRecord | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
        setRecentSongs(json.recentSongs || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard reports:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/reports")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success) {
          setStats(json.data);
          setRecentSongs(json.recentSongs || []);
        }
      })
      .catch((err) => console.error("Failed to fetch dashboard reports:", err))
      .finally(() => {
        if (!ignore) setLoadingStats(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleAnalysisSuccess = (
    result: SongAnalysisResult & { metadataOnly: boolean },
    input: AnalyzeSongInput
  ) => {
    setActiveAnalysis(result);
    setActiveInput(input);
    // Smooth scroll to result
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleSavedToLibrary = () => {
    fetchDashboardData();
  };

  const handleResetAnalysis = () => {
    setActiveAnalysis(null);
    setActiveInput(null);
  };

  const scrollToAnalysisForm = () => {
    const el = document.getElementById("analyze");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openComparisonWith = (song: SongRecord) => {
    setSelectedSongForCompare(song);
    setIsCompareOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onAnalyzeClick={scrollToAnalysisForm} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Heading Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                  AI Acoustic Psychology
                </span>
                <span className="text-xs text-slate-400">Next.js 16 + Supabase + Gemini 2.5</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                AI Music Mood <span className="gradient-text">Classifier</span>
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Classify musical emotions, detect nuanced lyrical themes, estimate energy dynamics, and map psychological valence with Google Gemini AI.
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIsCompareOpen(true)}
                disabled={recentSongs.length < 2}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Compare Tracks</span>
              </button>
              <Link
                href="/library"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Library className="w-4 h-4 text-violet-400" />
                <span>Browse Library</span>
              </Link>
              <Link
                href="/reports"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <BarChart3 className="w-4 h-4 text-pink-400" />
                <span>Reports</span>
              </Link>
            </div>
          </div>

          {/* Database Metric Overview Cards */}
          <StatsOverview stats={stats} loading={loadingStats} />

          {/* Active Result Card (When Analysis Succeeds) */}
          {activeAnalysis && activeInput && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <MoodResultCard
                analysis={activeAnalysis}
                input={activeInput}
                onSaved={handleSavedToLibrary}
                onReset={handleResetAnalysis}
              />
            </div>
          )}

          {/* Prominent Song Analysis Form */}
          <SongAnalysisForm onAnalysisSuccess={handleAnalysisSuccess} />

          {/* If 0 songs exist and not loading, show empty state onboarding */}
          {!loadingStats && stats && stats.totalSongs === 0 && (
            <EmptyState onStartAnalysis={scrollToAnalysisForm} />
          )}

          {/* Analytics & Distribution Grid */}
          {stats && stats.totalSongs > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodDistributionChart
                distribution={stats.moodDistribution}
                totalSongs={stats.totalSongs}
              />
              <div className="space-y-6">
                <EnergyDistributionChart
                  averageEnergy={stats.averageEnergy}
                  averageValence={stats.averageValence}
                  totalSongs={stats.totalSongs}
                />
                <RecentAnalysesList
                  songs={recentSongs}
                  onSelectSong={openComparisonWith}
                />
              </div>
            </div>
          )}

          {/* AI Smart Psychological Insights Card */}
          {stats && stats.totalSongs > 0 && (
            <SmartInsightsCard totalSongs={stats.totalSongs} />
          )}
        </main>
      </div>

      {/* Comparison Modal */}
      <SongComparisonModal
        availableSongs={recentSongs}
        initialSong={selectedSongForCompare}
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setSelectedSongForCompare(null);
        }}
      />
    </div>
  );
}
