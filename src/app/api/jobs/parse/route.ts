import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { serverCallLLM, getEnvKey } from "@/lib/ai-providers";
import { createServerClient } from "@/lib/supabase-server";
import {
  getLLMProviderConfig,
  isLLMProvider,
  resolveProviderBaseUrl,
} from "@/lib/llmProviders";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { consumeAiUse } from "@/lib/aiQuota";

const MAX_TEXT_LENGTH = 20_000;

function extractFallbackJob(text: string) {
  return {
    title: text.includes("Manager") ? "Product Manager" : text.includes("Engineer") ? "Software Engineer" : "Unknown Title",
    company: text.includes("Google") ? "Google" : text.includes("Meta") ? "Meta" : "Unknown Company",
    location: text.includes("Remote") ? "Remote" : "Unknown Location",
    salary_range: text.includes("$") ? "$100k - $150k" : "",
    notes: "Auto-extracted from provided text.",
  };
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`jobparse:${clientIpFromHeaders(request.headers)}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawText = typeof body?.text === "string" ? body.text : "";
    if (!rawText.trim()) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }
    const text = rawText.slice(0, MAX_TEXT_LENGTH);

    const llmConfig = body?.llmConfig;
    const requestedProvider =
      typeof llmConfig?.provider === "string" && isLLMProvider(llmConfig.provider)
        ? llmConfig.provider
        : "openai";
    const providerConfig = getLLMProviderConfig(requestedProvider)!;

    const userKey =
      typeof llmConfig?.apiKey === "string" ? llmConfig.apiKey.trim() : "";

    let apiKey = userKey;
    let serverManagedKey = false;

    if (!apiKey) {
      const supabase = await createServerClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          apiKey = getEnvKey(requestedProvider);
          serverManagedKey = Boolean(apiKey);
          if (serverManagedKey) {
            const quota = await consumeAiUse(supabase, user.id);
            if (!quota.ok) {
              return NextResponse.json({ error: quota.error }, { status: 429 });
            }
          }
        }
      }
    }

    const resolvedBaseUrl = resolveProviderBaseUrl(
      requestedProvider,
      typeof llmConfig?.baseUrl === "string" ? llmConfig.baseUrl : undefined,
      { usingServerKey: serverManagedKey }
    );

    if (apiKey && !resolvedBaseUrl.error) {
      const systemPrompt = `You are an AI job parser. Extract the following details from the job description and return ONLY valid JSON:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location or Remote",
  "salary_range": "Salary range if mentioned, else empty string",
  "notes": "A brief 2 sentence summary of the role"
}`;

      try {
        const response = await serverCallLLM(
          requestedProvider,
          apiKey,
          systemPrompt,
          text,
          {
            baseUrl: resolvedBaseUrl.baseUrl,
            model:
              typeof llmConfig?.model === "string" && llmConfig.model.trim()
                ? llmConfig.model.trim()
                : providerConfig.defaultModel,
            serverManagedKey,
          }
        );
        const startIdx = response.indexOf("{");
        const endIdx = response.lastIndexOf("}");

        if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
          const jsonStr = response.substring(startIdx, endIdx + 1);
          const parsedJob = JSON.parse(jsonStr);
          return NextResponse.json({ job: parsedJob });
        }
      } catch (err) {
        logger.error("AI Parse error, falling back to mock:", err);
      }
    }

    const parsedJob = extractFallbackJob(text);
    // Flag keyword-guess output so the client doesn't celebrate it as a
    // successful extraction.
    return NextResponse.json({ job: parsedJob, fallback: true });
  } catch (error) {
    logger.error("Job parse error:", error);
    return NextResponse.json({ error: "Failed to parse job description" }, { status: 500 });
  }
}
