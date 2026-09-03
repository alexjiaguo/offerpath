"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { List, X } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navConfig";
import { useProfileStore } from "@/store/profileStore";
import { useTranslation } from "@/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

/* ═══════════════════════════════════════════════════
 MobileNav — Hamburger drawer for small screens.
 The backdrop + drawer are portaled to document.body
 to escape the Topbar's `backdrop-blur` containing block
 (backdrop-filter creates a new containing block for
 position:fixed descendants, which would otherwise trap
 the drawer inside the small pill-shaped header).
 ═══════════════════════════════════════════════════ */

export default function MobileNav() {
  const { t, isZh } = useTranslation();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fullName = useProfileStore((s) => s.profile.fullName);
  const email = useProfileStore((s) => s.profile.email);
  const navSections = getNavItems(t);
  const initials =
    fullName.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() ||
    (isZh ? "访" : "G");
  const displayName = fullName || (isZh ? "访客" : "Guest");
  const displayEmail = email || (isZh ? "未登录" : "Not signed in");

  useEffect(() => { setMounted(true); }, []);

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

  const drawer = (
    <>
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
          "fixed top-0 left-0 h-full w-[280px] z-50 bg-surface-0 border-r border-surface-200 flex flex-col md:hidden transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo-infinity.svg"
                alt="OfferPath Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-base font-bold tracking-tight text-surface-400">
              OfferPath
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all"
            aria-label={isZh ? "关闭导航菜单" : "Close navigation menu"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {/* Language Switcher in Mobile Drawer */}
          <div className="px-1">
            <LanguageSwitcher variant="inline" />
          </div>

          {navSections.map((section) => (
            <div key={section.section}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-300 px-3 mb-2">
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
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all",
                          isActive
                            ? "bg-surface-400 text-surface-0 font-semibold"
                            : "text-surface-300 hover:text-surface-400 hover:bg-surface-100"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-[18px] h-[18px] flex-shrink-0",
                            isActive ? "text-surface-0" : "text-surface-300"
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>

                      {/* Sub-navigation */}
                      {isActive && item.subItems && (
                        <ul className="ml-[30px] mt-1 space-y-0.5 border-l border-surface-200 pl-3">
                          {item.subItems.map((sub) => {
                            const subActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  onClick={() => setIsOpen(false)}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium transition-all",
                                    subActive
                                      ? "text-surface-400 font-semibold"
                                      : "text-surface-300 hover:text-surface-400"
                                  )}
                                >
                                  {sub.icon && <sub.icon className="w-3 h-3" />}
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
        <div className="p-4 border-t border-surface-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-md bg-surface-400 flex items-center justify-center text-xs font-bold text-white uppercase">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-surface-300 truncate">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );

 return (
 <>
 {/* Hamburger Button — stays in place inside the Topbar */}
  <button
  onClick={() => setIsOpen(true)}
  className="md:hidden p-2 rounded-md text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all"
  aria-label={isZh ? "打开导航菜单" : "Open navigation menu"}
  >
 <List className="w-5 h-5" />
 </button>

 {/* Backdrop + Drawer — portaled to escape the Topbar's backdrop-blur containing block */}
 {mounted && createPortal(drawer, document.body)}
 </>
 );
}
