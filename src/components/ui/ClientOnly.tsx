"use client";

import { useEffect, useState, ReactNode } from "react";

/**
 * Renders children only after the component has mounted on the client.
 * Prevents SSR/CSR hydration mismatches for components that read from
 * client-only state (localStorage, Zustand persist, etc.).
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
