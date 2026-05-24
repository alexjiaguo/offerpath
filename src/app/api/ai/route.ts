import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, provider, apiKey, systemPrompt, userPrompt } = body;

    if (action === "validate-key") {
      const keyToValidate = apiKey?.trim() || getEnvKey(provider);
      if (!keyToValidate) {
        return NextResponse.json({ valid: false, error: "API key is empty" });
      }

      const valid = await serverValidateApiKey(provider, keyToValidate);
      return NextResponse.json(valid);
    }

    if (action === "call-llm") {
      const keyToUse = apiKey?.trim() || getEnvKey(provider);
      if (!keyToUse) {
        return NextResponse.json(
          { error: `${provider} API key is not configured.` },
          { status: 400 }
        );
      }

      const result = await serverCallLLM(provider, keyToUse, systemPrompt, userPrompt);
      return NextResponse.json({ content: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function getEnvKey(provider: string): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;
    case "gemini":
      return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    default:
      return undefined;
  }
}

async function serverValidateApiKey(provider: string, apiKey: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      if (res.ok) return { valid: true };
      return { valid: false, error: `OpenAI returned ${res.status}` };
    }

    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
        signal: controller.signal,
      });
      if (res.ok) return { valid: true };
      return { valid: false, error: `Anthropic returned ${res.status}` };
    }

    if (provider === "deepseek") {
      const res = await fetch("https://api.deepseek.com/v1/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      if (res.ok) return { valid: true };
      return { valid: false, error: `DeepSeek returned ${res.status}` };
    }

    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { method: "GET", signal: controller.signal }
      );
      if (res.ok) return { valid: true };
      return { valid: false, error: `Gemini returned ${res.status}` };
    }

    return { valid: false, error: `Unsupported provider: ${provider}` };
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

async function serverCallLLM(
  provider: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (provider === "openai" || provider === "deepseek") {
    const baseUrl =
      provider === "deepseek"
        ? "https://api.deepseek.com/v1"
        : "https://api.openai.com/v1";
    const model = provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini";

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
      throw new Error(`${provider} API error: ${res.status} — ${err}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error: ${res.status} — ${err}`);
    }
    const data = await res.json();
    return data.content[0].text;
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error: ${res.status} — ${err}`);
    }
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
