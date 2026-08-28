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
  "openai-compatible",
  "anthropic-compatible",
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
  "openai-compatible": {
    name: "OpenAI Compatible",
    kind: "openai-compatible",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    apiKeyRequired: true,
    keyPlaceholder: "sk-...",
  },
  "anthropic-compatible": {
    name: "Anthropic Compatible",
    kind: "anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    apiKeyRequired: true,
    keyPlaceholder: "sk-ant-...",
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

export function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "::1" || host === "[::1]") return true;
  if (/^f[cd][0-9a-f]{2}:/.test(host) || host.startsWith("fe80:")) return true;
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}

export interface ResolveBaseUrlOptions {
  usingServerKey?: boolean;
}

export function resolveProviderBaseUrl(
  provider: LLMProvider,
  baseUrl: string | undefined,
  options?: ResolveBaseUrlOptions
): { baseUrl: string; error?: string } {
  const config = LLM_PROVIDER_CONFIG[provider];
  const raw = baseUrl?.trim() ?? "";

  if (options?.usingServerKey || raw === "") {
    return { baseUrl: config.defaultBaseUrl };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { baseUrl: raw, error: "Invalid base URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { baseUrl: raw, error: "Base URL must use http or https" };
  }

  if (url.username || url.password) {
    return { baseUrl: raw, error: "Base URL must not embed credentials" };
  }

  if (config.local) {
    if (!isLoopbackUrl(url.toString())) {
      return {
        baseUrl: raw,
        error: `${config.name} base URL must be a loopback address`,
      };
    }
  } else {
    if (url.protocol !== "https:") {
      return { baseUrl: raw, error: "Custom base URL must use https" };
    }
    if (isPrivateHostname(url.hostname)) {
      return {
        baseUrl: raw,
        error: "Custom base URL must not point at a private network",
      };
    }
  }

  return { baseUrl: `${url.origin}${url.pathname.replace(/\/+$/, "")}` };
}
