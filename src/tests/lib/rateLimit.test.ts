import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rateLimit";

describe("rateLimit", () => {
  it("allows requests up to the limit then blocks", () => {
    expect(rateLimit("k1", 2, 1_000, 1_000)).toBe(true);
    expect(rateLimit("k1", 2, 1_000, 1_100)).toBe(true);
    expect(rateLimit("k1", 2, 1_000, 1_200)).toBe(false);
    expect(rateLimit("k1", 2, 1_000, 1_300)).toBe(false);
  });

  it("allows again once the window has expired", () => {
    expect(rateLimit("k2", 1, 500, 1_000)).toBe(true);
    expect(rateLimit("k2", 1, 500, 1_200)).toBe(false);
    expect(rateLimit("k2", 1, 500, 1_600)).toBe(true);
  });

  it("tracks keys independently", () => {
    expect(rateLimit("a", 1, 1_000, 1_000)).toBe(true);
    expect(rateLimit("b", 1, 1_000, 1_000)).toBe(true);
    expect(rateLimit("a", 1, 1_000, 1_100)).toBe(false);
    expect(rateLimit("b", 1, 1_000, 1_100)).toBe(false);
  });
});
