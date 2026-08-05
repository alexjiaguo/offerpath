"use client";
import Link from "next/link";

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
    <header className="h-14 flex items-center justify-between px-5 bg-surface-0 border border-surface-200 rounded-lg shadow-none relative z-30 flex-shrink-0">
      {/* Mobile Nav + Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="md:hidden">
          <MobileNav />
        </div>

        <div className="relative w-full max-w-lg group">
          <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-brand-900 transition-colors" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-400 focus:outline-none focus:border-surface-400 focus:bg-surface-0 transition-colors font-sans tracking-tight"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-surface-200 bg-surface-0 pointer-events-none shadow-none">
            <Command weight="light" className="w-3 h-3 text-surface-400" />
            <span className="text-[9px] font-mono font-medium text-surface-400 uppercase tracking-widest">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-6">
        {/* Quick Add */}
        <motion.button
          onClick={() => setAddJobDialogOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-md bg-brand-900 text-white shadow-none hover:bg-brand-800 transition-colors group"
          title="Add Job"
        >
          <Plus weight="light" className="w-4 h-4 group-active:scale-95 transition-transform" />
        </motion.button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-md border border-surface-200 bg-surface-0 text-surface-400 hover:text-brand-900 hover:bg-surface-100 shadow-none transition-colors" aria-label="Notifications">
          <Bell weight="light" className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-surface-200 mx-1" />

        {/* Profile */}
        <Link href="/dashboard/settings" className="flex items-center gap-2 px-2 py-1 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 shadow-none transition-colors" aria-label="Profile settings">
          <div className="w-6 h-6 rounded-md bg-brand-900 flex items-center justify-center text-[9px] font-mono font-semibold text-white uppercase tracking-widest">
            DU
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[10px] font-mono font-medium tracking-wider uppercase text-surface-400 leading-none">Demo User</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
