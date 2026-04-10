"use client";

import { Search, Bell, Plus } from "lucide-react";
import { useState } from "react";
import MobileNav from "./MobileNav";

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.04] bg-surface-0/60 backdrop-blur-lg sticky top-0 z-30">
      {/* Mobile Nav + Search */}
      <div className="flex items-center gap-3 flex-1">
        <MobileNav />
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search jobs, resumes, or interviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-100 border border-white/[0.06] text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Quick Add */}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Job</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-xs font-bold text-white">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
