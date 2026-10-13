"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { EditSongModal } from "@/components/music/EditSongModal";
import { DeleteSongModal } from "@/components/music/DeleteSongModal";
import { SongComparisonModal } from "@/components/music/SongComparisonModal";
import { SongRecord } from "@/types";
import { getMoodDetails, formatDate, exportToCsv, exportToJson } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  Eye,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  Scale,
  Music,
  PlusCircle,
  FileSpreadsheet,
  X,
} from "lucide-react";
import Link from "next/link";

const ALL_MOODS = [
  "All",
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

const ALL_GENRES = [
  "All",
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

export default function MusicLibraryPage() {
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & sorting
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "energy_level">("created_at");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [selectedSongDetails, setSelectedSongDetails] = useState<SongRecord | null>(null);
  const [songToEdit, setSongToEdit] = useState<SongRecord | null>(null);
  const [songToDelete, setSongToDelete] = useState<SongRecord | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareSong, setCompareSong] = useState<SongRecord | null>(null);

  useEffect(() => {
    let ignore = false;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (search.trim()) queryParams.set("search", search.trim());
    if (moodFilter !== "All") queryParams.set("mood", moodFilter);
    if (genreFilter !== "All") queryParams.set("genre", genreFilter);

    fetch(`/api/songs?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success) {
          setSongs(json.data || []);
          setTotal(json.total || 0);
        }
      })
      .catch((err) => console.error("Error fetching library songs:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, limit, sortBy, sortOrder, search, moodFilter, genreFilter]);

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await fetch("/api/songs?limit=1000");
      const json = await res.json();
      if (json.success && json.data) {
        const rows = json.data.map((s: SongRecord) => ({
          Title: s.title,
          Artist: s.artist || "Unknown",
          Album: s.album || "",
          Genre: s.genre || "",
          PrimaryMood: s.primary_mood,
          SecondaryMoods: (s.secondary_moods || []).join("; "),
          Confidence: s.confidence,
          EnergyLevel: s.energy_level,
          Valence: s.valence,
          UserMoodGuess: s.user_mood_guess || "",
          Themes: (s.themes || []).join("; "),
          EmotionalKeywords: (s.emotional_keywords || []).join("; "),
          RecommendedActivity: s.recommended_activity,
          AnalyzedDate: s.created_at,
        }));
        exportToCsv(rows, `music-mood-library-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } catch (err) {
      console.error("CSV Export error:", err);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-violet-600/20 text-violet-400">
                  <Music className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Supabase PostgreSQL Storage
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Music <span className="gradient-text">Library</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage, search, filter, and compare all saved song mood analyses ({total} total tracks).
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleExportCsv}
                disabled={songs.length === 0}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setCompareSong(null);
                  setIsCompareOpen(true);
                }}
                disabled={songs.length < 2}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Compare Tracks</span>
              </button>

              <Link
                href="/#analyze"
                className="gradient-button text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-violet-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Analyze New</span>
              </Link>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, artist, or genre..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Mood Filter */}
              <div className="relative">
                <select
                  value={moodFilter}
                  onChange={(e) => {
                    setMoodFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option disabled value="">Filter by Mood</option>
                  {ALL_MOODS.map((m) => (
                    <option key={m} value={m}>
                      Mood: {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre Filter */}
              <div className="relative">
                <select
                  value={genreFilter}
                  onChange={(e) => {
                    setGenreFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option disabled value="">Filter by Genre</option>
                  {ALL_GENRES.map((g) => (
                    <option key={g} value={g}>
                      Genre: {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sorting Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1 font-semibold">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("created_at")}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    sortBy === "created_at"
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Date Analyzed
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("title")}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    sortBy === "title"
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Title
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("energy_level")}
                  className={`px-2.5 py-1 rounded-lg border transition ${
                    sortBy === "energy_level"
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  Energy Level
                </button>

                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-2 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                  title="Toggle Ascending/Descending"
                >
                  {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>

              {(search || moodFilter !== "All" || genreFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setMoodFilter("All");
                    setGenreFilter("All");
                    setPage(1);
                  }}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Songs Table / Cards */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-5 border border-slate-800 animate-pulse h-20"></div>
              ))}
            </div>
          ) : songs.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center">
              <Music className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-white">No Tracks Found</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1 mb-5">
                {search || moodFilter !== "All" || genreFilter !== "All"
                  ? "No saved songs matched your active search or filters. Try relaxing your search criteria."
                  : "You haven't saved any song analyses yet. Analyze your first song to build your library."}
              </p>
              <Link
                href="/#analyze"
                className="gradient-button text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Analyze a Song</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table View */}
              <div className="hidden lg:block glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Track Title</th>
                      <th className="py-3.5 px-4">Artist</th>
                      <th className="py-3.5 px-4">Primary Mood</th>
                      <th className="py-3.5 px-4">Genre</th>
                      <th className="py-3.5 px-4">Energy</th>
                      <th className="py-3.5 px-4">Valence</th>
                      <th className="py-3.5 px-4">Analyzed</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-sm">
                    {songs.map((song) => {
                      const moodMeta = getMoodDetails(song.primary_mood);
                      return (
                        <tr key={song.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{song.title}</span>
                              {song.metadata_only && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                  Meta
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {song.artist || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold border ${moodMeta.badgeBg} ${moodMeta.badgeText} ${moodMeta.badgeBorder}`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: moodMeta.color }}
                              />
                              {song.primary_mood}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {song.genre || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-amber-400">
                              <Zap className="w-3.5 h-3.5" />
                              {song.energy_level}/10
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-pink-400">
                              <Heart className="w-3.5 h-3.5" />
                              {song.valence}/10
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {formatDate(song.created_at)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedSongDetails(song)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setCompareSong(song);
                                  setIsCompareOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                                title="Compare Mood"
                              >
                                <Scale className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSongToEdit(song)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-slate-800"
                                title="Edit Metadata"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  exportToJson(
                                    song,
                                    `${song.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-analysis.json`
                                  )
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                                title="Export JSON"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSongToDelete(song)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden space-y-3">
                {songs.map((song) => {
                  const moodMeta = getMoodDetails(song.primary_mood);
                  return (
                    <div
                      key={song.id}
                      className="glass-card rounded-xl p-4 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-white">{song.title}</h4>
                          <p className="text-xs text-slate-400">
                            {song.artist || "Unknown artist"} {song.genre ? `• ${song.genre}` : ""}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold border shrink-0 ${moodMeta.badgeBg} ${moodMeta.badgeText} ${moodMeta.badgeBorder}`}
                        >
                          {song.primary_mood}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Energy</span>
                          <span className="font-bold text-amber-400">{song.energy_level}/10</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Valence</span>
                          <span className="font-bold text-pink-400">{song.valence}/10</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Date</span>
                          <span className="font-medium text-slate-300">{formatDate(song.created_at)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedSongDetails(song)}
                          className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSongToEdit(song)}
                            className="p-1.5 text-slate-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              exportToJson(
                                song,
                                `${song.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-analysis.json`
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-emerald-400"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSongToDelete(song)}
                            className="p-1.5 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 glass-card rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} songs
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-white px-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Details Modal */}
      {selectedSongDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSongDetails.title}</h3>
                <p className="text-xs text-slate-400">
                  {selectedSongDetails.artist || "Unknown artist"} • {formatDate(selectedSongDetails.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSongDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  AI Summary
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedSongDetails.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Energy Rating</span>
                  <span className="text-sm font-bold text-amber-400">
                    {selectedSongDetails.energy_level}/10
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Emotional Valence</span>
                  <span className="text-sm font-bold text-pink-400">
                    {selectedSongDetails.valence}/10
                  </span>
                </div>
              </div>

              {/* Themes */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Extracted Themes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedSongDetails.themes || []).map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-lg bg-violet-950/40 text-violet-300 border border-violet-800/40"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Activity */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-950/30 to-cyan-950/20 border border-violet-500/20 text-xs">
                <span className="font-bold text-white block mb-0.5">
                  Recommended Activity
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedSongDetails.recommended_activity}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSongDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {songToEdit && (
        <EditSongModal
          song={songToEdit}
          isOpen={Boolean(songToEdit)}
          onClose={() => setSongToEdit(null)}
          onSave={(updated) => {
            setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          }}
        />
      )}

      {/* Delete Modal */}
      {songToDelete && (
        <DeleteSongModal
          song={songToDelete}
          isOpen={Boolean(songToDelete)}
          onClose={() => setSongToDelete(null)}
          onDeleted={(id) => {
            setSongs((prev) => prev.filter((s) => s.id !== id));
            setTotal((t) => Math.max(0, t - 1));
          }}
        />
      )}

      {/* Compare Modal */}
      <SongComparisonModal
        availableSongs={songs}
        initialSong={compareSong}
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setCompareSong(null);
        }}
      />
    </div>
  );
}
