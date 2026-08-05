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
        "fixed left-4 top-4 bottom-4 flex flex-col z-40 rounded-lg",
        "bg-surface-0 border border-surface-200 shadow-none",
        "transition-all duration-300 overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 relative z-10 border-b border-surface-200/60">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
             <Image src="/logo-infinity.svg" alt="Logo" width={28} height={28} className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base font-semibold tracking-tight whitespace-nowrap font-display text-brand-900"
            >
              OfferPath
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-6 relative z-10 scrollbar-hide">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 px-3 mb-2">
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
                        "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group relative",
                        isActive
                          ? "text-brand-900 bg-surface-100 border border-surface-200/60 font-semibold"
                          : "text-surface-600 hover:text-brand-900 hover:bg-surface-100/60 border border-transparent"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        weight="light"
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors relative z-10",
                          isActive ? "text-brand-900" : "text-surface-400 group-hover:text-brand-900"
                        )}
                      />
                      {!collapsed && <span className="relative z-10 font-sans tracking-tight text-xs">{item.label}</span>}
                    </Link>

                    {/* Sub-navigation */}
                    <AnimatePresence>
                      {showSubItems && (
                        <motion.ul 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-7 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.subItems!.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors group",
                                    subActive
                                      ? "text-brand-900 bg-surface-100 font-semibold border border-surface-200/50"
                                      : "text-surface-500 hover:text-brand-900 hover:bg-surface-100/50"
                                  )}
                                >
                                  {sub.icon && <sub.icon weight="light" className="w-3.5 h-3.5" />}
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
      <div className="p-2 relative z-10 space-y-1 border-t border-surface-200/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-md border border-transparent hover:border-surface-200 text-surface-500 hover:text-brand-900 hover:bg-surface-100 transition-colors group"
        >
          {collapsed ? (
            <CaretRight weight="light" className="w-4 h-4" />
          ) : (
            <div className="flex items-center justify-between w-full px-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Collapse</span>
              <CaretLeft weight="light" className="w-3.5 h-3.5" />
            </div>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full py-2 rounded-md border border-transparent hover:border-surface-200 text-surface-500 hover:text-brand-900 hover:bg-surface-100 transition-colors group"
          title={collapsed ? "Sign Out" : undefined}
        >
          {collapsed ? (
            <SignOut weight="light" className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 w-full text-left">
              <SignOut weight="light" className="w-4 h-4" />
              <span className="text-xs font-medium tracking-tight">Sign Out</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
