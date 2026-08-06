"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CaretLeft, CaretRight, SignOut } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS } from "@/lib/navConfig";
import { signOut } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 flex flex-col z-40",
        "bg-surface-0 border-r border-surface-200",
        "transition-all duration-300 ease-out overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-surface-200 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
             <Image src="/logo-infinity.svg" alt="Logo" width={28} height={28} className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base font-semibold tracking-tight whitespace-nowrap font-display text-surface-400"
            >
              OfferPath
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-6 relative z-10 scrollbar-hide">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-surface-300 px-3 mb-2">
                {section.section}
              </p>
            )}
            <ul className="space-y-1">
              {(() => {
                // Find the most specific matching item in this section.
                // An item "matches" if its href is a prefix of the pathname
                // (with a / boundary so /dashboard/settings doesn't swallow
                // /dashboard/settings/api-keys). The longest match wins so
                // /dashboard/settings only highlights when the user is on
                // the settings page itself, not on a sub-route.
                const matches = section.items
                  .map((it) => {
                    const isPrefix =
                      pathname === it.href ||
                      (it.href !== "/dashboard" && pathname.startsWith(it.href + "/"));
                    return { item: it, isPrefix, len: it.href.length };
                  })
                  .filter((m) => m.isPrefix);
                const longest = matches.reduce(
                  (acc, m) => (m.len > acc ? m.len : acc),
                  0,
                );
                return section.items.map((item) => {
                const isActive =
                  matches.some((m) => m.item === item && m.len === longest);

                const showSubItems =
                  !collapsed && isActive && item.subItems && item.subItems.length > 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 py-2 rounded-md text-xs font-medium transition-all duration-150 group relative overflow-hidden",
                        collapsed ? "justify-center px-0" : "px-3",
                        isActive
                          ? "bg-surface-400 text-surface-0 font-semibold"
                          : "text-surface-400 hover:bg-surface-100 hover:text-surface-400"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        weight={isActive ? "bold" : "regular"}
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors relative z-10",
                          isActive ? "text-surface-0" : "text-surface-300 group-hover:text-surface-400"
                        )}
                      />
                      {!collapsed && <span className="relative z-10 font-sans tracking-tight text-[13px]">{item.label}</span>}
                    </Link>

                    {/* Sub-navigation */}
                    <AnimatePresence>
                      {showSubItems && (
                        <motion.ul 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 mt-1 pl-3 border-l border-surface-200 space-y-1 overflow-hidden"
                        >
                          {item.subItems!.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 group",
                                    subActive
                                      ? "bg-surface-200 text-surface-400 font-semibold"
                                      : "text-surface-300 hover:text-surface-400 hover:bg-surface-100"
                                  )}
                                >
                                  {sub.icon && <sub.icon weight={subActive ? "bold" : "regular"} className="w-3.5 h-3.5" />}
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
                });
              })()}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-200 relative z-10 space-y-1.5 bg-surface-0">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2 rounded-md border border-surface-200 bg-surface-0 text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all duration-150 group"
        >
          {collapsed ? (
            <CaretRight weight="bold" className="w-4 h-4" />
          ) : (
            <div className="flex items-center justify-between w-full px-2.5">
              <span className="text-[10px] font-mono font-medium uppercase tracking-[0.15em]">Collapse</span>
              <CaretLeft weight="bold" className="w-3.5 h-3.5" />
            </div>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full py-2 rounded-md border border-transparent text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all duration-150 group"
          title={collapsed ? "Sign Out" : undefined}
        >
          {collapsed ? (
            <SignOut weight="regular" className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 w-full text-left">
              <SignOut weight="regular" className="w-4 h-4 text-surface-300 group-hover:text-surface-400" />
              <span className="text-[12px] font-medium tracking-tight">Sign Out</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
