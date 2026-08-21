/* Server-side AI provider utilities shared by API routes. */

import {
  getLLMProviderConfig,
  isLLMProvider,
  normalizeLLMBaseUrl,
  type LLMProvider,
} from "@/lib/llmProviders";

export interface LLMRequestOptions {
  baseUrl?: string;
  model?: string;
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 30000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function getEnvKey(provider: string): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;
    case "gemini":
      return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    case "mistral":
      return process.env.MISTRAL_API_KEY;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "perplexity":
      return process.env.PERPLEXITY_API_KEY;
    case "ollama":
    case "lmstudio":
      return process.env.LOCAL_LLM_API_KEY;
    default:
      return undefined;
  }
}

function getRequestConfig(provider: string, options?: LLMRequestOptions) {
  if (!isLLMProvider(provider)) {
    return { error: `Unsupported provider: ${provider}` };
  }

  const config = getLLMProviderConfig(provider)!;
  const normalized = normalizeLLMBaseUrl(provider, options?.baseUrl);
  if (normalized.error) {
    return { error: normalized.error };
  }

  return {
    provider: provider as LLMProvider,
    baseUrl: normalized.baseUrl,
    model: options?.model?.trim() || config.defaultModel,
  };
}

export async function serverValidateApiKey(
  provider: string,
  apiKey: string,
  options?: LLMRequestOptions
): Promise<{ valid: boolean; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const request = getRequestConfig(provider, options);
    if (request.error) return { valid: false, error: request.error };
    const config = getLLMProviderConfig(provider)!;

    if (config.apiKeyRequired && !apiKey.trim()) {
      return { valid: false, error: "API key is empty" };
    }

    let res: Response;
    if (config.kind === "gemini") {
      const url = new URL(`${request.baseUrl}/models`);
      url.searchParams.set("key", apiKey);
      res = await fetch(url, { method: "GET", signal: controller.signal });
    } else if (config.kind === "anthropic") {
      res = await fetch(`${request.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
        signal: controller.signal,
      });
    } else {
      res = await fetch(`${request.baseUrl}/models`, {
        method: "GET",
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        signal: controller.signal,
      });
    }

    if (res.ok) return { valid: true };
    return { valid: false, error: `${config.name} returned ${res.status}` };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { valid: false, error: "Validation request timed out" };
    }
    const msg = err instanceof Error ? err.message : "Network error";
    return { valid: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

export async function serverCallLLM(
  provider: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  options?: LLMRequestOptions
): Promise<string> {
  const request = getRequestConfig(provider, options);
  if (request.error) throw new Error(request.error);
  const config = getLLMProviderConfig(provider)!;

  if (config.kind === "openai-compatible") {
    const res = await fetchWithTimeout(`${request.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${config.name} API error: ${res.status} - ${err}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (config.kind === "anthropic") {
    const res = await fetchWithTimeout(`${request.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${config.name} API error: ${res.status} - ${err}`);
    }
    const data = await res.json();
    return data.content[0].text;
  }

  const url = new URL(`${request.baseUrl}/models/${request.model}:generateContent`);
  url.searchParams.set("key", apiKey);
  const res = await fetchWithTimeout(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${config.name} API error: ${res.status} - ${err}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
