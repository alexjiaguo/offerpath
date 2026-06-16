import { NextResponse } from "next/server";
import { getEnvKey, serverValidateApiKey, serverCallLLM } from "@/lib/ai-providers";

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
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
