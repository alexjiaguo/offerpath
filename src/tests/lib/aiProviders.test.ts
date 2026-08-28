import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { serverCallLLM, serverValidateApiKey } from "@/lib/ai-providers";

function mockResponse(data: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
}

describe("ai-providers", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("uses custom base URL and model for OpenAI-compatible providers", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({ choices: [{ message: { content: "ok" } }] })
    );

    const result = await serverCallLLM(
      "openai",
      "test-key",
      "system",
      "user",
      { baseUrl: "https://proxy.example.com/v1/", model: "custom-model" }
    );

    expect(result).toBe("ok");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://proxy.example.com/v1/chat/completions",
      expect.objectContaining({
        body: expect.stringContaining('"model":"custom-model"'),
      })
    );
  });

  it("supports keyless local providers", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse({ data: [] }));

    const result = await serverValidateApiKey("ollama", "", {
      baseUrl: "http://localhost:11434/v1",
    });

    expect(result.valid).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:11434/v1/models",
      expect.objectContaining({ headers: undefined })
    );
  });

  it("uses custom Anthropic endpoints and models", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({ content: [{ type: "text", text: "ok" }] })
    );

    const result = await serverCallLLM(
      "anthropic",
      "test-key",
      "system",
      "user",
      { baseUrl: "https://anthropic-proxy.example.com/v1", model: "custom-claude" }
    );

    expect(result).toBe("ok");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://anthropic-proxy.example.com/v1/messages",
      expect.objectContaining({
        body: expect.stringContaining('"model":"custom-claude"'),
      })
    );
  });

  it("uses custom Gemini endpoints and models", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({ candidates: [{ content: { parts: [{ text: "ok" }] } }] })
    );

    const result = await serverCallLLM(
      "gemini",
      "test-key",
      "system",
      "user",
      { baseUrl: "https://gemini-proxy.example.com/v1beta", model: "custom-gemini" }
    );

    expect(result).toBe("ok");
    const calledUrl = String(vi.mocked(global.fetch).mock.calls[0][0]);
    expect(calledUrl).toBe(
      "https://gemini-proxy.example.com/v1beta/models/custom-gemini:generateContent?key=test-key"
    );
  });

  it("supports openai-compatible custom endpoints", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({ choices: [{ message: { content: "openai-compatible-ok" } }] })
    );

    const result = await serverCallLLM(
      "openai-compatible",
      "custom-key",
      "system",
      "user",
      { baseUrl: "https://my-openai-proxy.com/v1", model: "deepseek-v3" }
    );

    expect(result).toBe("openai-compatible-ok");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://my-openai-proxy.com/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer custom-key",
        }),
        body: expect.stringContaining('"model":"deepseek-v3"'),
      })
    );
  });

  it("supports anthropic-compatible custom endpoints", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({ content: [{ type: "text", text: "anthropic-compatible-ok" }] })
    );

    const result = await serverCallLLM(
      "anthropic-compatible",
      "ant-key",
      "system",
      "user",
      { baseUrl: "https://my-claude-proxy.com/v1", model: "claude-3-7-sonnet" }
    );

    expect(result).toBe("anthropic-compatible-ok");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://my-claude-proxy.com/v1/messages",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "ant-key",
        }),
        body: expect.stringContaining('"model":"claude-3-7-sonnet"'),
      })
    );
  });
});
