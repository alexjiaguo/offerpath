/* ═══════════════════════════════════════════════════
   OfferPath — API Key Validation
   Lightweight calls to verify a key is valid before
   marking it active in the profile store.
   ═══════════════════════════════════════════════════ */

export type ValidationProvider = "openai" | "anthropic" | "gemini" | "deepseek";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}



/**
 * Validate an API key by making a lightweight call to the provider.
 *
 * - OpenAI:    GET /v1/models
 * - Anthropic: POST /v1/messages with minimal payload
 * - DeepSeek:  GET /v1/models
 * - Gemini:    GET /v1beta/models?key=API_KEY
 */
export async function validateApiKey(
  provider: ValidationProvider,
  apiKey: string,
): Promise<ValidationResult> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "API key is empty" };
  }

  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "validate-key",
        provider,
        apiKey,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { valid: false, error: `Proxy returned status ${res.status}: ${errText}` };
    }

    return await res.json() as ValidationResult;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error during key validation";
    return { valid: false, error: message };
  }
}

