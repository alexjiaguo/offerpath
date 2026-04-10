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
        label: "Pipeline",
        href: "/dashboard/pipeline",
        icon: Kanban,
        subItems: [
          { label: "Board", href: "/dashboard/pipeline" },
          { label: "Analytics", href: "/dashboard/pipeline/analytics" },
        ],
      },
      { label: "Resumes", href: "/dashboard/resume", icon: FileText },
      { label: "Discover", href: "/dashboard/discover", icon: Compass },
      {
        label: "Interview Prep",
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
      { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
      { label: "API Keys", href: "/dashboard/settings/api-keys", icon: Key },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-40",
        "bg-surface-50/80 backdrop-blur-xl border-r border-white/[0.06]",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.04]">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Target className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight whitespace-nowrap">
              Offer<span className="gradient-text">Path</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
                {section.section}
              </p>
            )}
            <ul className="space-y-0.5">
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        isActive
                          ? "bg-brand-500/10 text-brand-300"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                          isActive ? "text-brand-400" : "text-gray-500 group-hover:text-gray-300"
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>

                    {/* Sub-navigation */}
                    {showSubItems && (
                      <ul className="ml-[30px] mt-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                        {item.subItems!.map((sub) => {
                          const subActive = pathname === sub.href;
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                                  subActive
                                    ? "text-brand-300"
                                    : "text-gray-500 hover:text-gray-300"
                                )}
                              >
                                {sub.label === "Analytics" && <BarChart3 className="w-3 h-3" />}
                                {sub.label === "Board" && <Kanban className="w-3 h-3" />}
                                {sub.label === "Overview" && <Brain className="w-3 h-3" />}
                                {sub.label === "Stories" && <Library className="w-3 h-3" />}
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

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/[0.04]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
