"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Music,
  Library,
  BarChart3,
  Settings,
  Headphones,
  SlidersHorizontal,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/" || pathname === "/dashboard",
    },
    {
      name: "Analyze Music",
      href: "/#analyze",
      icon: Music,
      active: false,
    },
    {
      name: "Music Library",
      href: "/library",
      icon: Library,
      active: pathname === "/library",
    },
    {
      name: "Reports & Analytics",
      href: "/reports",
      icon: BarChart3,
      active: pathname === "/reports",
    },
    {
      name: "Settings & Setup",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#090e1c] h-screen sticky top-0 shrink-0 z-30 ${className}`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-200">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block">
              MusicMood<span className="text-violet-400">AI</span>
            </span>
            <span className="text-xs text-slate-400 font-medium block">
              Mood Classifier
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.active
                  ? "bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  item.active ? "text-violet-400" : "text-slate-400"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info / Gemini Indicator */}
      <div className="p-4 m-3 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Gemini AI Engine
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Multi-dimensional semantic mood classification & valence mapping.
        </p>
      </div>

      <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>v1.0.0 Production</span>
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Vercel Ready
        </span>
      </div>
    </aside>
  );
}
