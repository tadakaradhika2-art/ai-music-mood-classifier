import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MoodMetadata } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOOD_DEFINITIONS: Record<string, MoodMetadata> = {
  Happy: {
    name: "Happy",
    color: "#f59e0b",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/30",
    description: "Joyful, upbeat, cheerful, and filled with delight.",
  },
  Sad: {
    name: "Sad",
    color: "#3b82f6",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-400",
    badgeBorder: "border-blue-500/30",
    description: "Sorrowful, grieving, downcast, and emotionally heavy.",
  },
  Romantic: {
    name: "Romantic",
    color: "#ec4899",
    badgeBg: "bg-pink-500/15",
    badgeText: "text-pink-400",
    badgeBorder: "border-pink-500/30",
    description: "Passionate, loving, tender, intimate, and affectionate.",
  },
  Energetic: {
    name: "Energetic",
    color: "#ef4444",
    badgeBg: "bg-red-500/15",
    badgeText: "text-red-400",
    badgeBorder: "border-red-500/30",
    description: "High-tempo, driving, electrifying, and physical.",
  },
  Calm: {
    name: "Calm",
    color: "#10b981",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    description: "Tranquil, balanced, soothing, relaxed, and gentle.",
  },
  Angry: {
    name: "Angry",
    color: "#dc2626",
    badgeBg: "bg-rose-700/20",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/40",
    description: "Aggressive, intense, rebellious, frustrated, and furious.",
  },
  Nostalgic: {
    name: "Nostalgic",
    color: "#d97706",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-400",
    badgeBorder: "border-orange-500/30",
    description: "Reminiscent of the past, bittersweet, and warm-hearted.",
  },
  Motivational: {
    name: "Motivational",
    color: "#8b5cf6",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-400",
    badgeBorder: "border-purple-500/30",
    description: "Empowering, inspiring, resolute, and overcoming hurdles.",
  },
  Melancholic: {
    name: "Melancholic",
    color: "#6366f1",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/30",
    description: "Pensively sad, wistful, poetic, and longing.",
  },
  Peaceful: {
    name: "Peaceful",
    color: "#06b6d4",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    description: "Harmonious, quiet, serene, and spiritually restful.",
  },
  Mysterious: {
    name: "Mysterious",
    color: "#a855f7",
    badgeBg: "bg-fuchsia-500/15",
    badgeText: "text-fuchsia-400",
    badgeBorder: "border-fuchsia-500/30",
    description: "Enigmatic, hypnotic, dark, atmospheric, and cryptic.",
  },
};

export function getMoodDetails(mood: string): MoodMetadata {
  const normalized = mood.trim();
  const matchedKey = Object.keys(MOOD_DEFINITIONS).find(
    (k) => k.toLowerCase() === normalized.toLowerCase()
  );

  if (matchedKey && MOOD_DEFINITIONS[matchedKey]) {
    return MOOD_DEFINITIONS[matchedKey];
  }

  // Fallback for custom/unrecognized moods
  return {
    name: normalized,
    color: "#a78bfa",
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-400",
    badgeBorder: "border-violet-500/30",
    description: `Expressive mood characterized as ${normalized}.`,
  };
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Recent";
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(isoString);
  } catch {
    return "Recently";
  }
}

export function exportToCsv(data: Record<string, unknown>[], filename = "music-mood-report.csv"): void {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        if (typeof val === "object") {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJson(data: unknown, filename = "analysis-result.json"): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
