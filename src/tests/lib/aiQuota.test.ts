import { describe, expect, it, vi } from "vitest";
import {
  consumeAiUse,
  getTierQuotaLimit,
  FREE_TIER_AI_USES,
  PRO_TIER_MONTHLY_AI_USES,
  ULTRA_TIER_MONTHLY_AI_USES,
} from "@/lib/aiQuota";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabase(profileData: {
  tier: string | null;
  ai_uses_this_month: number | null;
  month_reset_at: string | null;
} | null, updateError: Error | null = null) {
  const updateMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: updateError }),
  });

  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: profileData,
            error: profileData ? null : new Error("Not found"),
          }),
        }),
      }),
      update: updateMock,
    }),
    _updateMock: updateMock,
  } as unknown as SupabaseClient & { _updateMock: ReturnType<typeof vi.fn> };
}

describe("aiQuota", () => {
  it("calculates correct tier quota limits with Ultra having 5x Pro quota", () => {
    expect(FREE_TIER_AI_USES).toBe(0);
    expect(PRO_TIER_MONTHLY_AI_USES).toBe(50);
    expect(ULTRA_TIER_MONTHLY_AI_USES).toBe(250);

    expect(getTierQuotaLimit("free")).toBe(0);
    expect(getTierQuotaLimit(null)).toBe(0);
    expect(getTierQuotaLimit("pro")).toBe(50);
    expect(getTierQuotaLimit("ultra")).toBe(250);
    expect(getTierQuotaLimit("team")).toBe(250);
  });

  it("blocks Free tier users from consuming managed AI credits (requires BYOK)", async () => {
    const supabase = createMockSupabase({
      tier: "free",
      ai_uses_this_month: 0,
      month_reset_at: new Date(Date.now() + 86400000).toISOString(),
    });

    const result = await consumeAiUse(supabase, "user-free-1");
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(0);
    expect(result.error).toContain("BYOK");
  });

  it("allows Pro tier users to consume managed AI credits up to limit (50)", async () => {
    const supabase = createMockSupabase({
      tier: "pro",
      ai_uses_this_month: 10,
      month_reset_at: new Date(Date.now() + 86400000).toISOString(),
    });

    const result = await consumeAiUse(supabase, "user-pro-1");
    expect(result.ok).toBe(true);
    expect(result.used).toBe(11);
    expect(result.remaining).toBe(39);
    expect(result.limit).toBe(50);
  });

  it("blocks Pro tier users when 50 quota is exhausted and suggests Ultra / BYOK", async () => {
    const supabase = createMockSupabase({
      tier: "pro",
      ai_uses_this_month: 50,
      month_reset_at: new Date(Date.now() + 86400000).toISOString(),
    });

    const result = await consumeAiUse(supabase, "user-pro-exhausted");
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.error).toContain("Monthly AI quota reached (50/50)");
    expect(result.error).toContain("Ultra");
  });

  it("allows Ultra tier users to consume managed AI credits up to 250 (5x Pro)", async () => {
    const supabase = createMockSupabase({
      tier: "ultra",
      ai_uses_this_month: 200,
      month_reset_at: new Date(Date.now() + 86400000).toISOString(),
    });

    const result = await consumeAiUse(supabase, "user-ultra-1");
    expect(result.ok).toBe(true);
    expect(result.used).toBe(201);
    expect(result.remaining).toBe(49);
    expect(result.limit).toBe(250);
  });

  it("blocks Ultra tier users when 250 quota is exhausted", async () => {
    const supabase = createMockSupabase({
      tier: "ultra",
      ai_uses_this_month: 250,
      month_reset_at: new Date(Date.now() + 86400000).toISOString(),
    });

    const result = await consumeAiUse(supabase, "user-ultra-exhausted");
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.error).toContain("Monthly AI quota reached (250/250)");
  });

  it("resets usage counter when the monthly window has expired", async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const supabase = createMockSupabase({
      tier: "pro",
      ai_uses_this_month: 50, // previously exhausted in expired window
      month_reset_at: pastDate,
    });

    const result = await consumeAiUse(supabase, "user-pro-reset");
    expect(result.ok).toBe(true);
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(49);
  });
});
