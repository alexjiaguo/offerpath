import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export const FREE_TIER_WEEKLY_AI_USES = Number(
  process.env.FREE_TIER_WEEKLY_AI_USES ?? "3"
);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface ProfileQuotaRow {
  tier: string | null;
  ai_uses_this_week: number | null;
  week_reset_at: string | null;
}

export interface AiQuotaResult {
  ok: boolean;
  remaining?: number;
  error?: string;
}

export async function consumeAiUse(
  supabase: SupabaseClient,
  userId: string
): Promise<AiQuotaResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("tier, ai_uses_this_week, week_reset_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    logger.warn("[aiQuota] profile read failed, failing open:", error);
    return { ok: true };
  }

  const profile = data as unknown as ProfileQuotaRow;

  if (profile.tier && profile.tier !== "free") {
    return { ok: true };
  }

  const now = Date.now();
  const resetAt = profile.week_reset_at ? Date.parse(profile.week_reset_at) : NaN;
  const windowExpired = Number.isNaN(resetAt) || now >= resetAt;
  const used = windowExpired ? 0 : (profile.ai_uses_this_week ?? 0);

  if (used >= FREE_TIER_WEEKLY_AI_USES) {
    return {
      ok: false,
      remaining: 0,
      error: `Free plan AI limit reached (${FREE_TIER_WEEKLY_AI_USES}/week). Upgrade your plan or connect your own API key in Settings.`,
    };
  }

  const nextUsed = used + 1;
  const nextResetAt = windowExpired
    ? new Date(now + WEEK_MS).toISOString()
    : (profile.week_reset_at as string);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      ai_uses_this_week: nextUsed,
      week_reset_at: nextResetAt,
    })
    .eq("id", userId);

  if (updateError) {
    logger.warn("[aiQuota] counter update failed, failing open:", updateError);
    return { ok: true };
  }

  return {
    ok: true,
    remaining: Math.max(0, FREE_TIER_WEEKLY_AI_USES - nextUsed),
  };
}
