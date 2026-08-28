import { describe, expect, it } from "vitest";
import {
  isPrivateHostname,
  resolveProviderBaseUrl,
} from "@/lib/llmProviders";

describe("resolveProviderBaseUrl", () => {
  it("pins the official endpoint when a server-managed key is used", () => {
    expect(
      resolveProviderBaseUrl("openai", "https://evil.example.com/v1", {
        usingServerKey: true,
      })
    ).toEqual({ baseUrl: "https://api.openai.com/v1" });

    expect(
      resolveProviderBaseUrl("anthropic", "http://127.0.0.1:9/v1", {
        usingServerKey: true,
      })
    ).toEqual({ baseUrl: "https://api.anthropic.com/v1" });
  });

  it("falls back to the official endpoint when none is supplied", () => {
    expect(resolveProviderBaseUrl("deepseek", undefined)).toEqual({
      baseUrl: "https://api.deepseek.com/v1",
    });
    expect(resolveProviderBaseUrl("gemini", "   ")).toEqual({
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    });
  });

  it("allows public https endpoints for BYO keys", () => {
    const result = resolveProviderBaseUrl(
      "openai",
      "https://proxy.example.com/v1/"
    );
    expect(result.error).toBeUndefined();
    expect(result.baseUrl).toBe("https://proxy.example.com/v1");

    const resultCompatOpenAI = resolveProviderBaseUrl(
      "openai-compatible",
      "https://custom-openai.example.com/v1"
    );
    expect(resultCompatOpenAI.error).toBeUndefined();
    expect(resultCompatOpenAI.baseUrl).toBe("https://custom-openai.example.com/v1");

    const resultCompatAnthropic = resolveProviderBaseUrl(
      "anthropic-compatible",
      "https://custom-anthropic.example.com/v1"
    );
    expect(resultCompatAnthropic.error).toBeUndefined();
    expect(resultCompatAnthropic.baseUrl).toBe("https://custom-anthropic.example.com/v1");
  });

  it("rejects non-https custom endpoints for cloud providers", () => {
    const result = resolveProviderBaseUrl("openai", "http://proxy.example.com/v1");
    expect(result.error).toBeDefined();
  });

  it("rejects loopback and private hosts for cloud providers", () => {
    for (const url of [
      "http://localhost:8080/v1",
      "https://127.0.0.1/v1",
      "https://10.0.0.5/v1",
      "https://192.168.1.10/v1",
      "https://172.16.0.9/v1",
      "https://169.254.169.254/latest/meta-data",
    ]) {
      expect(resolveProviderBaseUrl("anthropic", url).error).toBeDefined();
    }
  });

  it("rejects embedded credentials", () => {
    expect(
      resolveProviderBaseUrl("openai", "https://user:pass@evil.example.com/v1").error
    ).toBeDefined();
  });

  it("restricts local providers to loopback addresses", () => {
    expect(
      resolveProviderBaseUrl("ollama", "http://127.0.0.1:11434/v1").error
    ).toBeUndefined();
    expect(
      resolveProviderBaseUrl("lmstudio", "http://localhost:1234/v1").error
    ).toBeUndefined();
    expect(
      resolveProviderBaseUrl("ollama", "http://192.168.0.5:11434/v1").error
    ).toBeDefined();
  });
});

describe("isPrivateHostname", () => {
  it("flags private and reserved hosts", () => {
    for (const host of [
      "localhost",
      "api.localhost",
      "nas.local",
      "service.internal",
      "10.1.2.3",
      "172.31.255.1",
      "192.168.0.1",
      "169.254.169.254",
      "127.0.0.1",
      "fd00::1",
      "fe80::1",
      "[::1]",
    ]) {
      expect(isPrivateHostname(host)).toBe(true);
    }
  });

  it("allows public hosts", () => {
    for (const host of [
      "api.openai.com",
      "proxy.example.com",
      "8.8.8.8",
      "100.200.300.1".replace("300", "30"),
    ]) {
      expect(isPrivateHostname(host)).toBe(false);
    }
  });
});
