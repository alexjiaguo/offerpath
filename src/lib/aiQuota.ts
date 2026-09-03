import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export const FREE_TIER_AI_USES = 0;
export const PRO_TIER_MONTHLY_AI_USES = Number(
  process.env.PRO_TIER_MONTHLY_AI_USES ?? "50"
);
export const ULTRA_TIER_MONTHLY_AI_USES = Number(
  process.env.ULTRA_TIER_MONTHLY_AI_USES ?? String(PRO_TIER_MONTHLY_AI_USES * 5)
);

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

interface ProfileQuotaRow {
  tier: string | null;
  ai_uses_this_month: number | null;
  month_reset_at: string | null;
}

export interface AiQuotaResult {
  ok: boolean;
  remaining?: number;
  limit?: number;
  used?: number;
  error?: string;
}

export function getTierQuotaLimit(tier: string | null | undefined): number {
  const normalized = (tier ?? "free").toLowerCase();
  if (normalized === "ultra" || normalized === "team") {
    return ULTRA_TIER_MONTHLY_AI_USES;
  }
  if (normalized === "pro") {
    return PRO_TIER_MONTHLY_AI_USES;
  }
  return FREE_TIER_AI_USES;
}

export async function consumeAiUse(
  supabase: SupabaseClient,
  userId: string
): Promise<AiQuotaResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("tier, ai_uses_this_month, month_reset_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    // Fail OPEN on read errors: a transient DB blip must not lock paying
    // users out of AI. Abuse is bounded by the separate per-IP rate limiter.
    logger.warn("[aiQuota] profile read failed, failing open:", error);
    return { ok: true };
  }

  const profile = data as unknown as ProfileQuotaRow;
  const tier = (profile.tier ?? "free").toLowerCase();

  // Free tier has 0 built-in managed AI credits. Requires BYOK.
  if (tier === "free") {
    return {
      ok: false,
      remaining: 0,
      limit: 0,
      used: profile.ai_uses_this_month ?? 0,
      error:
        "Free plan requires bringing your own API key (BYOK) for AI features. Upgrade to Pro for managed AI credits or connect your API key in Settings.",
    };
  }

  const limit = getTierQuotaLimit(tier);
  const now = Date.now();
  const resetAt = profile.month_reset_at ? Date.parse(profile.month_reset_at) : NaN;
  const windowExpired = Number.isNaN(resetAt) || now >= resetAt;
  const used = windowExpired ? 0 : (profile.ai_uses_this_month ?? 0);

  if (used >= limit) {
    const isPro = tier === "pro";
    const upgradeSuggestion = isPro
      ? "Upgrade to Ultra for 5x more quota (250 uses) or connect your own API key in Settings."
      : "Connect your own API key in Settings to continue without limits.";

    return {
      ok: false,
      remaining: 0,
      limit,
      used,
      error: `Monthly AI quota reached (${used}/${limit}). ${upgradeSuggestion}`,
    };
  }

  const nextUsed = used + 1;
  const nextResetAt = windowExpired
    ? new Date(now + MONTH_MS).toISOString()
    : (profile.month_reset_at as string);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      ai_uses_this_month: nextUsed,
      month_reset_at: nextResetAt,
    })
    .eq("id", userId);

  if (updateError) {
    // Fail open: the call was already quota-checked above; a failed counter
    // write grants at most one extra use, while failing closed would punish
    // the user for our DB error.
    logger.warn("[aiQuota] counter update failed, failing open:", updateError);
    return { ok: true, limit, remaining: limit - used };
  }

  return {
    ok: true,
    limit,
    used: nextUsed,
    remaining: Math.max(0, limit - nextUsed),
  };
}
