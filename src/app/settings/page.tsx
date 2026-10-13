"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MOOD_DEFINITIONS } from "@/lib/utils";
import {
  Settings,
  Sparkles,
  Database,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
} from "lucide-react";

interface DiagnosticsData {
  appName: string;
  version: string;
  ai: {
    provider: string;
    configured: boolean;
    model: string;
  };
  database: {
    provider: string;
    configured: boolean;
    mode: string;
  };
  environment: string;
}

export default function SettingsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setDiagnostics(json.data);
      })
      .catch((err) => console.error("Error loading diagnostics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-8">
          {/* Header */}
          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400">
                <Settings className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                System Diagnostics & Documentation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & <span className="gradient-text">Configuration</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Review Google Gemini AI connection, Supabase database status, taxonomy categories, and deployment instructions.
            </p>
          </div>

          {/* Integration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Gemini Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Google Gemini AI</h3>
                    <p className="text-xs text-slate-400">Natural Language Classification</p>
                  </div>
                </div>

                {loading ? (
                  <span className="text-xs text-slate-400">Checking...</span>
                ) : diagnostics?.ai.configured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> Key Missing
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Model</span>
                  <span className="font-mono text-violet-300 font-semibold">
                    {diagnostics?.ai.model || "gemini-2.5-flash"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">API Key Secret</span>
                  <span className="font-mono text-slate-400">
                    {diagnostics?.ai.configured ? "•••••••••••••••• (Protected)" : "Unconfigured in .env"}
                  </span>
                </div>
              </div>

              {!diagnostics?.ai.configured && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                  Add <code className="bg-amber-900/50 px-1 py-0.5 rounded text-amber-300">GEMINI_API_KEY</code> to your <code className="bg-amber-900/50 px-1 py-0.5 rounded text-amber-300">.env.local</code> file or Vercel environment variables to enable live AI classification.
                </div>
              )}
            </div>

            {/* Supabase PostgreSQL Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Supabase PostgreSQL</h3>
                    <p className="text-xs text-slate-400">Persistent Cloud Database</p>
                  </div>
                </div>

                {loading ? (
                  <span className="text-xs text-slate-400">Checking...</span>
                ) : diagnostics?.database.configured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Demo Memory Mode
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Operational Mode</span>
                  <span className="font-semibold text-slate-200">
                    {diagnostics?.database.mode || "Checking..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schema File</span>
                  <span className="font-mono text-cyan-300">supabase/schema.sql</span>
                </div>
              </div>

              {!diagnostics?.database.configured && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  Currently operating in ephemeral fallback memory mode so the app is immediately testable. Run <code className="text-cyan-300">supabase/schema.sql</code> in your Supabase SQL editor to connect live PostgreSQL.
                </div>
              )}
            </div>
          </div>

          {/* Supported Mood Categories */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                Supported Mood Taxonomy Categories
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary mood categories recognized and evaluated by the AI classification engine
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {Object.entries(MOOD_DEFINITIONS).map(([mood, meta]) => (
                <div
                  key={mood}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                    >
                      {mood}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Limitations & Ethics Notice */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Analysis Disclaimers & Model Limitations
            </h3>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                • <strong>No Real Audio File Ingestion:</strong> In compliance with the project specifications, this system analyzes song metadata and user-supplied lyrical text using Google Gemini natural language models. It does not perform digital signal processing (DSP) or audio waveform spectral decoding.
              </p>
              <p>
                • <strong>Metadata-Only Fallback:</strong> When lyrics are not provided, Gemini generates mood interpretations derived from title semantics, artist discography, and genre norms. The app explicitly flags these analyses as metadata-only.
              </p>
              <p>
                • <strong>Qualitative Confidence Scores:</strong> Confidence percentages indicate semantic certainty generated by the language model and must not be interpreted as empirical laboratory probabilities.
              </p>
            </div>
          </div>

          {/* Environment Variables Documentation */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Environment Configuration Reference
            </h3>
            <p className="text-xs text-slate-400">
              Set these variables in your local <code className="text-violet-300 font-mono">.env.local</code> or Vercel project settings:
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# Google Gemini AI API Key (Obtain from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Override Gemini Model (Default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash

# Supabase Project URL and Keys (Obtain from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Supabase Service Role Key (Used securely in server routes only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}
