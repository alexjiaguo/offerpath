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
        "fixed left-4 top-4 bottom-4 flex flex-col z-40 rounded-[2rem]",
        "bg-white/80 backdrop-blur-2xl border border-surface-200/50 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)]",
        "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-4 overflow-hidden group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-surface-200 shadow-sm flex-shrink-0 bg-white">
             <Image src="/logo-mark.svg" alt="Logo" width={32} height={32} className="w-full h-full object-cover scale-110" />
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-medium tracking-tight whitespace-nowrap font-display text-brand-900"
            >
              OfferPath
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-8 relative z-10 scrollbar-hide">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-surface-300 px-4 mb-4">
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
                        "flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group relative overflow-hidden",
                        isActive
                          ? "text-brand-900 bg-black/5"
                          : "text-surface-300 hover:text-brand-900 hover:bg-black/5 border border-transparent"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        weight="light"
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors relative z-10",
                          isActive ? "text-brand-900" : "text-surface-300 group-hover:text-brand-900"
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
                          className="ml-10 mt-2 space-y-1 overflow-hidden"
                        >
                          {item.subItems!.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-full text-[12px] font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group",
                                    subActive
                                      ? "text-brand-900 bg-black/5"
                                      : "text-surface-300 hover:text-brand-900 hover:bg-black/5"
                                  )}
                                >
                                  {sub.icon && <sub.icon weight="light" className="w-4 h-4" />}
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
      <div className="p-4 relative z-10 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-3 rounded-full border border-transparent hover:border-surface-200/50 text-surface-300 hover:text-brand-900 hover:bg-black/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group"
        >
          {collapsed ? (
            <CaretRight weight="light" className="w-5 h-5" />
          ) : (
            <div className="flex items-center justify-between w-full px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Collapse</span>
              <CaretLeft weight="light" className="w-4 h-4" />
            </div>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full py-3 rounded-full border border-transparent hover:border-surface-200/50 text-surface-300 hover:text-brand-900 hover:bg-black/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group"
          title={collapsed ? "Sign Out" : undefined}
        >
          {collapsed ? (
            <SignOut weight="light" className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-3 px-3 w-full text-left">
              <SignOut weight="light" className="w-5 h-5" />
              <span className="text-[13px] font-medium tracking-tight">Sign Out</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
