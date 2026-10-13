"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Headphones,
  Music,
  LayoutDashboard,
  Library,
  BarChart3,
  Settings,
  Sparkles,
  PlusCircle,
} from "lucide-react";

interface HeaderProps {
  onAnalyzeClick?: () => void;
}

export function Header({ onAnalyzeClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Music Library", href: "/library", icon: Library },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090e1c]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left: Mobile Brand & Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">
              MusicMood<span className="text-violet-400">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI Music Mood Classifier & Acoustic Analytics</span>
          </div>
        </div>

        {/* Right: Quick Action Button */}
        <div className="flex items-center gap-3">
          {onAnalyzeClick ? (
            <button
              onClick={onAnalyzeClick}
              className="gradient-button text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze a Song</span>
            </button>
          ) : (
            <Link
              href="/#analyze"
              className="gradient-button text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-violet-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze a Song</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-start">
          <div className="bg-[#090e1c] border-b border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-sm">
                  MusicMood<span className="text-violet-400">AI</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-violet-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                href="/#analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/60"
              >
                <Music className="w-4 h-4 text-cyan-400" />
                <span>Analyze Music</span>
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Powered by Google Gemini
              </span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
}
