"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Target,
  LayoutDashboard,
  FileText,
  Kanban,
  MessageSquare,
  Settings,
  CreditCard,
  Key,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Library,
  Brain,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

interface NavSection {
  section: string;
  items: NavItemDef[];
}

const NAV_ITEMS: NavSection[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Modules",
    items: [
      {
        label: "Job Tracker",
        href: "/dashboard/pipeline",
        icon: Kanban,
        subItems: [
          { label: "Board", href: "/dashboard/pipeline" },
          { label: "Analytics", href: "/dashboard/pipeline/analytics" },
        ],
      },
      { label: "Resume Studio", href: "/dashboard/resume", icon: FileText },
      { label: "Job Search", href: "/dashboard/discover", icon: Compass },
      {
        label: "Interview Simulator",
        href: "/dashboard/interview",
        icon: MessageSquare,
        subItems: [
          { label: "Overview", href: "/dashboard/interview" },
          { label: "Stories", href: "/dashboard/interview/stories" },
        ],
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing & Plans", href: "/dashboard/settings/billing", icon: CreditCard },
      { label: "API Configuration", href: "/dashboard/settings/api-keys", icon: Key },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40",
        "bg-surface-0/40 backdrop-blur-2xl border-r border-zinc-200 dark:border-white/[0.05]",
        "transition-all duration-500 ease-out"
      )}
    >
      {/* Background Mesh Overlay */}
      <div className="absolute inset-0 bg-mesh-purple opacity-[0.05] pointer-events-none" />

      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/[0.03] relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3.5 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl gradient-futuristic flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-500">
            <Target className="w-5.5 h-5.5 text-white" />
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold tracking-tight whitespace-nowrap font-display text-zinc-900 dark:text-white"
            >
              Offer<span className="text-gradient-futuristic">Path</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-8 relative z-10 scrollbar-hide">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 mb-4">
                {section.section}
              </p>
            )}
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                const showSubItems =
                  !collapsed && isActive && item.subItems && item.subItems.length > 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                        isActive
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <item.icon
                        className={cn(
                          "w-[20px] h-[20px] flex-shrink-0 transition-colors relative z-10",
                          isActive ? "text-brand-400" : "text-zinc-600 group-hover:text-zinc-400"
                        )}
                      />
                      {!collapsed && <span className="relative z-10 font-sans tracking-tight">{item.label}</span>}
                      
                      {isActive && !collapsed && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-500 rounded-full blur-[2px]"
                        />
                      )}
                    </Link>

                    {/* Sub-navigation */}
                    <AnimatePresence>
                      {showSubItems && (
                        <motion.ul 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-10 mt-2 space-y-1 border-l border-zinc-200 dark:border-white/[0.05] pl-4 overflow-hidden"
                        >
                          {item.subItems!.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all group",
                                    subActive
                                      ? "text-brand-400 bg-brand-500/5"
                                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                                  )}
                                >
                                  {sub.label === "Analytics" && <BarChart3 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />}
                                  {sub.label === "Board" && <Kanban className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />}
                                  {sub.label === "Overview" && <Brain className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />}
                                  {sub.label === "Stories" && <Library className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />}
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User / Settings Footer */}
      <div className="p-6 border-t border-zinc-200 dark:border-white/[0.03] relative z-10 bg-surface-50/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-all group"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          ) : (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Operations</span>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
