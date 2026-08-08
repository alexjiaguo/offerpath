"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Globally respects the user's prefers-reduced-motion setting (WCAG 2.3.3).
// When enabled, framer-motion disables enter animations and interaction
// animations across every motion component without per-component changes.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
