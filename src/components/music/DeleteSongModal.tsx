"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { SongRecord } from "@/types";

interface DeleteSongModalProps {
  song: SongRecord;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}

export function DeleteSongModal({ song, isOpen, onClose, onDeleted }: DeleteSongModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/songs/${song.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete song analysis.");
      }

      onDeleted(song.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting record.";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-white">Delete Song Analysis</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-300">
            Are you sure you want to permanently delete the mood analysis for:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold text-white">{song.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {song.artist || "Unknown artist"} • Classified as {song.primary_mood}
            </p>
          </div>
          <p className="text-xs text-red-400/90 leading-relaxed">
            This action cannot be undone. All associated lyrical themes, keywords, and energy ratings will be removed from your database.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md shadow-red-600/20 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? "Deleting..." : "Confirm Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
