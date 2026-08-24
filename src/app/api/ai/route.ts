import { NextResponse } from "next/server";
import { getEnvKey, serverValidateApiKey, serverCallLLM } from "@/lib/ai-providers";
import { createServerClient } from "@/lib/supabase-server";
import {
  getLLMProviderConfig,
  isLLMProvider,
  isLoopbackUrl,
  resolveProviderBaseUrl,
} from "@/lib/llmProviders";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { consumeAiUse } from "@/lib/aiQuota";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 24_000;

function isProdLike(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(`ai:${clientIpFromHeaders(req.headers)}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { action, provider, apiKey, baseUrl, model, systemPrompt, userPrompt } =
      body;

    if (typeof provider !== "string" || !isLLMProvider(provider)) {
      return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
    }

    const providerConfig = getLLMProviderConfig(provider)!;
    const customKey = Boolean(typeof apiKey === "string" && apiKey.trim());
    const usingServerKey = !customKey;

    const resolvedBaseUrl = resolveProviderBaseUrl(
      provider,
      typeof baseUrl === "string" ? baseUrl : undefined,
      { usingServerKey }
    );
    if (resolvedBaseUrl.error) {
      return NextResponse.json({ error: resolvedBaseUrl.error }, { status: 400 });
    }
    const configuredBaseUrl = resolvedBaseUrl.baseUrl;
    const configuredModel =
      typeof model === "string" && model.trim() ? model.trim() : providerConfig.defaultModel;

    const supabase = await createServerClient();
    let userId: string | undefined;
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }
    const authed = Boolean(userId);

    const keylessLocal =
      !isProdLike() && !providerConfig.apiKeyRequired && isLoopbackUrl(configuredBaseUrl);

    if (!authed && !customKey && !keylessLocal && isProdLike()) {
      return NextResponse.json(
        { error: "Unauthorized access to AI proxy endpoint." },
        { status: 401 }
      );
    }

    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    if (action === "validate-key") {
      const keyToValidate = customKey ? apiKey.trim() : getEnvKey(provider);
      if (!keyToValidate && providerConfig.apiKeyRequired) {
        return NextResponse.json({ valid: false, error: "API key is empty" });
      }

      const valid = await serverValidateApiKey(provider, keyToValidate ?? "", {
        baseUrl: configuredBaseUrl,
        model: configuredModel,
        serverManagedKey: usingServerKey,
      });
      return NextResponse.json(valid);
    }

    if (action === "call-llm") {
      const keyToUse = customKey ? apiKey.trim() : getEnvKey(provider);
      if (!keyToUse && providerConfig.apiKeyRequired) {
        return NextResponse.json(
          { error: `${provider || "AI"} API key is not configured.` },
          { status: 400 }
        );
      }

      if (
        !userPrompt ||
        typeof userPrompt !== "string" ||
        userPrompt.length > MAX_PROMPT_LENGTH
      ) {
        return NextResponse.json(
          {
            error: `A user prompt string of at most ${MAX_PROMPT_LENGTH} characters is required.`,
          },
          { status: 400 }
        );
      }

      if (
        typeof systemPrompt !== "undefined" &&
        (typeof systemPrompt !== "string" || systemPrompt.length > MAX_PROMPT_LENGTH)
      ) {
        return NextResponse.json(
          {
            error: `System prompt must be a string of at most ${MAX_PROMPT_LENGTH} characters.`,
          },
          { status: 400 }
        );
      }

      if (!customKey && keyToUse) {
        if (isProdLike() && !authed) {
          return NextResponse.json(
            { error: "Unauthorized access to AI proxy endpoint." },
            { status: 401 }
          );
        }
        if (supabase && authed && userId) {
          const quota = await consumeAiUse(supabase, userId);
          if (!quota.ok) {
            return NextResponse.json({ error: quota.error }, { status: 429 });
          }
        }
      }

      try {
        const result = await serverCallLLM(provider, keyToUse ?? "", systemPrompt || "", userPrompt, {
          baseUrl: configuredBaseUrl,
          model: configuredModel,
          serverManagedKey: usingServerKey,
        });
        return NextResponse.json({ content: result });
      } catch (err) {
        logger.error("[api/ai] LLM call failed:", err);
        const detail =
          process.env.NODE_ENV === "development" && err instanceof Error
            ? err.message
            : "AI request failed. Please check your provider settings.";
        return NextResponse.json({ error: detail }, { status: 502 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logger.error("[api/ai] unhandled error:", err);
    return NextResponse.json({ error: "Unknown server error" }, { status: 500 });
  }
}
