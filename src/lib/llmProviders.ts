export const LLM_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "deepseek",
  "mistral",
  "openrouter",
  "perplexity",
  "ollama",
  "lmstudio",
] as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[number];

export interface LLMProviderConfig {
  name: string;
  kind: "openai-compatible" | "anthropic" | "gemini";
  defaultBaseUrl: string;
  defaultModel: string;
  apiKeyRequired: boolean;
  local?: boolean;
  keyPlaceholder?: string;
}

export const LLM_PROVIDER_CONFIG: Record<LLMProvider, LLMProviderConfig> = {
  openai: {
    name: "OpenAI",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    apiKeyRequired: true,
    keyPlaceholder: "sk-...",
  },
  anthropic: {
    name: "Anthropic",
    kind: "anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-haiku-4-5-20251001",
    apiKeyRequired: true,
    keyPlaceholder: "sk-ant-...",
  },
  gemini: {
    name: "Google Gemini",
    kind: "gemini",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    apiKeyRequired: true,
    keyPlaceholder: "AIza...",
  },
  deepseek: {
    name: "DeepSeek",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    apiKeyRequired: true,
    keyPlaceholder: "sk-...",
  },
  mistral: {
    name: "Mistral AI",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-small-latest",
    apiKeyRequired: true,
    keyPlaceholder: "...",
  },
  openrouter: {
    name: "OpenRouter",
    kind: "openai-compatible",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    apiKeyRequired: true,
    keyPlaceholder: "sk-or-...",
  },
  perplexity: {
    name: "Perplexity",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.perplexity.ai",
    defaultModel: "sonar",
    apiKeyRequired: true,
    keyPlaceholder: "pplx-...",
  },
  ollama: {
    name: "Ollama",
    kind: "openai-compatible",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.1",
    apiKeyRequired: false,
    local: true,
    keyPlaceholder: "Optional",
  },
  lmstudio: {
    name: "LM Studio",
    kind: "openai-compatible",
    defaultBaseUrl: "http://localhost:1234/v1",
    defaultModel: "local-model",
    apiKeyRequired: false,
    local: true,
    keyPlaceholder: "Optional",
  },
};

export function isLLMProvider(value: unknown): value is LLMProvider {
  return typeof value === "string" && LLM_PROVIDERS.includes(value as LLMProvider);
}

export function getLLMProviderConfig(provider: string): LLMProviderConfig | undefined {
  return isLLMProvider(provider) ? LLM_PROVIDER_CONFIG[provider] : undefined;
}

export function normalizeLLMBaseUrl(
  provider: LLMProvider,
  baseUrl?: string
): { baseUrl: string; error?: string } {
  const config = LLM_PROVIDER_CONFIG[provider];
  const raw = baseUrl?.trim() || config.defaultBaseUrl;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { baseUrl: raw, error: "Base URL must use http or https" };
    }
    return { baseUrl: `${url.origin}${url.pathname.replace(/\/+$/, "")}` };
  } catch {
    return { baseUrl: raw, error: "Invalid base URL" };
  }
}

export function isLoopbackUrl(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]"
    );
  } catch {
    return false;
  }
}
