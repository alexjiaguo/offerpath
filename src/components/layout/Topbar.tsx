"use client";

import { Bell, Command, Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { useEffect, useCallback } from "react";
import MobileNav from "./MobileNav";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";

export default function Topbar() {
  const searchQuery = usePipelineStore((s) => s.filters.search);
  const setFilter = usePipelineStore((s) => s.setFilter);
  const setDiscoverySearchQuery = useDiscoveryStore((s) => s.setSearchQuery);
  const setAddJobDialogOpen = usePipelineStore((s) => s.setAddJobDialogOpen);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilter({ search: value });
    setDiscoverySearchQuery(value);
  }, [setFilter, setDiscoverySearchQuery]);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-surface-200 bg-surface-50 sticky top-0 z-30">
      {/* Mobile Nav + Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="md:hidden">
          <MobileNav />
        </div>

        <div className="relative w-full max-w-lg group">
          <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300 group-focus-within:text-surface-400 transition-colors" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-12 py-2 rounded-md bg-surface-0 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-300 transition-all duration-200 font-sans tracking-tight"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-surface-200 bg-surface-50 pointer-events-none">
            <Command weight="bold" className="w-3 h-3 text-surface-300" />
            <span className="text-[10px] font-bold text-surface-300 uppercase">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-8">
        {/* Quick Add */}
        <motion.button
          onClick={() => setAddJobDialogOpen(true)}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-400 text-surface-0 text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span className="hidden sm:inline">Add Job</span>
        </motion.button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md border border-surface-200 bg-surface-0 text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-colors" title="Notifications coming soon">
          <Bell weight="bold" className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-surface-200 mx-2" />

        {/* Profile */}
        <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 transition-colors" title="Profile settings coming soon">
          <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white">
            DU
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[11px] font-semibold text-surface-400 leading-none">Demo User</div>
          </div>
        </button>
      </div>
    </header>
  );
}
