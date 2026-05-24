import { describe, it, expect } from "vitest";
import { cn, formatDate, statusColor } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("formatDate", () => {
  it("should format a date string", () => {
    const result = formatDate("2026-01-15");
    expect(result).toBeTruthy();
  });
});

describe("statusColor", () => {
  it("should return a color class for known statuses", () => {
    const result = statusColor("applied");
    expect(result).toBeTruthy();
  });
});
