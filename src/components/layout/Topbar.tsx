"use client";
import Link from "next/link";

import { Command, Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useProfileStore } from "@/store/profileStore";
import { useTranslation } from "@/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Topbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchQuery = usePipelineStore((s) => s.filters.search);
  const discoveryQuery = useDiscoveryStore((s) => s.searchQuery);
  const setFilter = usePipelineStore((s) => s.setFilter);
  const setDiscoverySearchQuery = useDiscoveryStore((s) => s.setSearchQuery);
  const setAddJobDialogOpen = usePipelineStore((s) => s.setAddJobDialogOpen);
  const fullName = useProfileStore((s) => s.profile.fullName);
  const initials = fullName.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "G";

  const isDiscover = pathname.startsWith("/dashboard/discover");
  const scopedValue = isDiscover ? discoveryQuery : searchQuery;
  const placeholder = isDiscover
    ? t.topbar.searchDiscovered
    : pathname.startsWith("/dashboard/resume")
    ? t.topbar.searchWorkspace
    : pathname.startsWith("/dashboard/interview")
    ? t.topbar.searchStories
    : t.topbar.searchApplications;

 useEffect(() => {
 document.documentElement.classList.remove("dark");
 }, []);

 const handleSearchChange = useCallback((value: string) => {
 if (pathname.startsWith("/dashboard/discover")) {
 setDiscoverySearchQuery(value);
 } else {
 setFilter({ search: value });
 }
 }, [pathname, setFilter, setDiscoverySearchQuery]);

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
 <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-surface-0/90 backdrop-blur-md border-b border-surface-200 sticky top-0 z-30 flex-shrink-0">
 {/* Mobile Nav + Search */}
 <div className="flex items-center gap-4 flex-1 max-w-xl">
 <div className="md:hidden">
 <MobileNav />
 </div>

 <div className="relative w-full group">
 <MagnifyingGlass weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300 group-focus-within:text-surface-400 transition-colors" />
 <input
 id="global-search-input"
 type="text"
 placeholder={placeholder}
 value={scopedValue}
 onChange={(e) => handleSearchChange(e.target.value)}
 className="w-full pl-9 pr-14 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-400 focus:bg-surface-0 transition-all font-sans tracking-tight"
 />
 <kbd className="kbd-key absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
 <Command weight="bold" className="w-2.5 h-2.5 text-surface-300" />
 <span className="font-semibold">K</span>
 </kbd>
 </div>
 </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-4">
        {/* Language Switcher */}
        <LanguageSwitcher variant="compact" />

        {/* Quick Add */}
        <button
          onClick={() => setAddJobDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-400 text-surface-0 hover:bg-surface-400-hover text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98]"
        >
          <Plus weight="bold" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.topbar.addJob}</span>
        </button>

        {/* Profile */}
        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-2 px-2 py-1 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 transition-all" 
          aria-label={t.topbar.profileSettings}
        >
          <div className="w-6 h-6 rounded bg-surface-400 flex items-center justify-center text-[10px] font-mono font-bold text-surface-0 uppercase">
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[11px] font-mono font-semibold tracking-tight text-surface-400 leading-none">{fullName}</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
