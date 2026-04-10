"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Target,
  LayoutDashboard,
  FileText,
  Kanban,
  MessageSquare,
  Settings,
  CreditCard,
  Key,
  BarChart3,
  Library,
  Brain,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   MobileNav — Hamburger drawer for small screens
   ═══════════════════════════════════════════════════ */

interface NavSubItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
        label: "Pipeline",
        href: "/dashboard/pipeline",
        icon: Kanban,
        subItems: [
          { label: "Board", href: "/dashboard/pipeline", icon: Kanban },
          { label: "Analytics", href: "/dashboard/pipeline/analytics", icon: BarChart3 },
        ],
      },
      { label: "Resumes", href: "/dashboard/resume", icon: FileText },
      { label: "Discover", href: "/dashboard/discover", icon: Compass },
      {
        label: "Interview Prep",
        href: "/dashboard/interview",
        icon: MessageSquare,
        subItems: [
          { label: "Overview", href: "/dashboard/interview", icon: Brain },
          { label: "Stories", href: "/dashboard/interview/stories", icon: Library },
        ],
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
      { label: "API Keys", href: "/dashboard/settings/api-keys", icon: Key },
    ],
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] z-50 bg-surface-50 border-r border-white/[0.06] flex flex-col md:hidden transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.04]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Offer<span className="gradient-text">Path</span>
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
                {section.section}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-brand-500/10 text-brand-300"
                            : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-[18px] h-[18px] flex-shrink-0",
                            isActive ? "text-brand-400" : "text-gray-500"
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>

                      {/* Sub-navigation */}
                      {isActive && item.subItems && (
                        <ul className="ml-[30px] mt-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                          {item.subItems.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium transition-all",
                                    subActive
                                      ? "text-brand-300"
                                      : "text-gray-500 hover:text-gray-300"
                                  )}
                                >
                                  <sub.icon className="w-3 h-3" />
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Demo User</p>
              <p className="text-[10px] text-gray-500 truncate">
                user@offerpath.io
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
