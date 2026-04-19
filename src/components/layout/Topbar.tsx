"use client";

import { BsBell, BsCommand, BsMoonFill, BsPlus, BsSearch, BsSunFill } from 'react-icons/bs';
import { useState, useEffect, useCallback } from "react";
import MobileNav from "./MobileNav";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/store/pipelineStore";

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const setAddJobDialogOpen = usePipelineStore((s) => s.setAddJobDialogOpen);
  const setFilter = usePipelineStore((s) => s.setFilter);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setFilter({ search: value });
  }, [setFilter]);

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
    <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-zinc-200 dark:border-white/[0.03] bg-surface-0/40 backdrop-blur-2xl sticky top-0 z-30">
      {/* Mobile Nav + Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="md:hidden">
          <MobileNav />
        </div>

        <div className="relative w-full max-w-lg group">
          <div className="absolute inset-0 bg-brand-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search jobs, resumes, or companies..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-14 py-3 rounded-2xl bg-zinc-100/50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/30 focus:bg-white dark:focus:bg-white/[0.05] transition-all duration-300 font-sans tracking-tight"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-md bg-white dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] pointer-events-none">
            <BsCommand className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-8">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-all group"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <BsSunFill className="w-5 h-5" /> : <BsMoonFill className="w-5 h-5" />}
        </button>

        {/* Quick Add */}
        <motion.button
          onClick={() => setAddJobDialogOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-black/5 dark:shadow-white/5"
        >
          <BsPlus className="w-4.5 h-4.5" />
          <span className="hidden sm:inline">Add Job</span>
        </motion.button>

        {/* Notifications — feature coming soon */}
        <button className="relative p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-all group" title="Notifications coming soon">
          <BsBell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>

        <div className="w-px h-8 bg-zinc-200 dark:bg-white/[0.05] mx-2" />

        {/* Profile */}
        <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-all group" title="Profile settings coming soon">
          <div className="w-9 h-9 rounded-xl gradient-futuristic flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            U
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[11px] font-bold text-zinc-800 dark:text-white leading-none">Demo User</div>
            <div className="text-[10px] font-medium text-zinc-500 leading-none mt-1">Pro Plan</div>
          </div>
        </button>
      </div>
    </header>
  );
}
