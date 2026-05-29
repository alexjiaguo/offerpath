"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CaretLeft, CaretRight, SignOut } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS } from "@/lib/navConfig";
import { signOut } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40",
        "bg-surface-0 border-r border-surface-200",
        "transition-all duration-300 ease-out"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-surface-200 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center flex-shrink-0">
             <span className="text-white font-bold text-sm">O</span>
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-medium tracking-tight whitespace-nowrap font-display text-surface-400"
            >
              OfferPath
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 relative z-10 scrollbar-hide">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300 px-3 mb-3">
                {section.section}
              </p>
            )}
            <ul className="space-y-1">
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
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group relative overflow-hidden",
                        isActive
                          ? "text-surface-400 bg-surface-100 border border-surface-200"
                          : "text-surface-300 hover:text-surface-400 hover:bg-surface-50 border border-transparent"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        weight={isActive ? "fill" : "bold"}
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors relative z-10",
                          isActive ? "text-brand-500" : "text-surface-300 group-hover:text-surface-400"
                        )}
                      />
                      {!collapsed && <span className="relative z-10 font-sans tracking-tight">{item.label}</span>}
                    </Link>

                    {/* Sub-navigation */}
                    <AnimatePresence>
                      {showSubItems && (
                        <motion.ul 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-8 mt-1 space-y-1 border-l border-surface-200 pl-3 overflow-hidden"
                        >
                          {item.subItems!.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors group",
                                    subActive
                                      ? "text-brand-500 bg-surface-100"
                                      : "text-surface-300 hover:text-surface-400 hover:bg-surface-50"
                                  )}
                                >
                                  {sub.icon && <sub.icon weight={subActive ? "fill" : "bold"} className="w-3.5 h-3.5" />}
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

      {/* Footer */}
      <div className="p-3 border-t border-surface-200 relative z-10 bg-surface-0 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-md border border-transparent hover:border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-50 transition-colors group"
        >
          {collapsed ? (
            <CaretRight weight="bold" className="w-4 h-4" />
          ) : (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Collapse</span>
              <CaretLeft weight="bold" className="w-4 h-4" />
            </div>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full py-2 rounded-md border border-transparent hover:border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-50 transition-colors group"
          title={collapsed ? "Sign Out" : undefined}
        >
          {collapsed ? (
            <SignOut weight="bold" className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 px-2 w-full text-left">
              <SignOut weight="bold" className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-tight">Sign Out</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
