import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateApiKey } from "@/lib/validateApiKey";

describe("validateApiKey", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should return invalid for empty key", async () => {
    const result = await validateApiKey("openai", "");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("should call the api/ai proxy for validation", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    } as unknown as Response);

    const result = await validateApiKey("openai", "test-key");
    expect(global.fetch).toHaveBeenCalledWith("/api/ai", expect.any(Object));
    expect(result.valid).toBe(true);
  });

  it("should handle errors from proxy", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    const result = await validateApiKey("openai", "test-key");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("500");
  });
});
