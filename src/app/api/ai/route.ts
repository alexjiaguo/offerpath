import { NextResponse } from "next/server";
import { getEnvKey, serverValidateApiKey, serverCallLLM } from "@/lib/ai-providers";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      // When Supabase is configured, require an authenticated session or custom client key
      const bodyText = await req.clone().text();
      let customKey = false;
      try {
        const parsed = JSON.parse(bodyText);
        if (parsed.apiKey?.trim()) customKey = true;
      } catch {
        // payload parse error handled below
      }
      if (!user && !customKey) {
        return NextResponse.json(
          { error: "Unauthorized access to AI proxy endpoint." },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const { action, provider, apiKey, systemPrompt, userPrompt } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

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
          { error: `${provider || "AI"} API key is not configured.` },
          { status: 400 }
        );
      }

      if (!userPrompt || typeof userPrompt !== "string") {
        return NextResponse.json(
          { error: "Valid user prompt string is required." },
          { status: 400 }
        );
      }

      const result = await serverCallLLM(provider, keyToUse, systemPrompt || "", userPrompt);
      return NextResponse.json({ content: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
