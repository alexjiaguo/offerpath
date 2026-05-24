import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluateATS } from "@/lib/aiService";
import { useProfileStore } from "@/store/profileStore";

describe("aiService client and robust parsing tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    // Configure Zustand store directly with a mock key
    useProfileStore.setState({
      apiKeys: [
        {
          id: "test-openai",
          provider: "openai",
          label: "Test Key",
          key: "test-user-key",
          status: "active",
          addedAt: "2026-01-01",
        }
      ]
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should successfully route via server proxy and parse a standard JSON block", async () => {
    const mockJson = {
      score: 95,
      matchedKeywords: ["leadership", "ML"],
      missingKeywords: ["agile"],
      feedback: [{ severity: "low", message: "Good job" }]
    };

    // Return exact JSON string
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: JSON.stringify(mockJson) }),
    } as unknown as Response);

    const result = await evaluateATS({
      resumeData: { summary: "Experienced ML leader" },
      jobDescription: "Looking for ML leadership with agile"
    });

    // Check fetch was called with the secure server proxy route
    expect(global.fetch).toHaveBeenCalledWith("/api/ai", expect.any(Object));
    const callArgs = vi.mocked(global.fetch).mock.calls[0][1] as RequestInit;
    const body = JSON.parse(callArgs.body as string);
    expect(body.action).toBe("call-llm");
    expect(body.provider).toBe("openai");
    expect(body.apiKey).toBe("test-user-key");

    // Check parsed output matches
    expect(result.score).toBe(95);
    expect(result.matchedKeywords).toContain("leadership");
  });

  it("should successfully extract and parse a JSON block wrapped in conversational markdown text", async () => {
    const conversationalResponse = `
Here is the requested ATS evaluation JSON:
\`\`\`json
{
  "score": 80,
  "matchedKeywords": ["ML"],
  "missingKeywords": [],
  "feedback": []
}
\`\`\`
Let me know if you need anything else!
    `;

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: conversationalResponse }),
    } as unknown as Response);

    const result = await evaluateATS({
      resumeData: { summary: "Experienced ML expert" },
      jobDescription: "Looking for ML"
    });

    // Check it successfully parsed even with markdown & conversation wrapping
    expect(result.score).toBe(80);
    expect(result.matchedKeywords).toContain("ML");
  });

  it("should gracefully fall back to local mock when server/proxy returns an error", async () => {
    // Return a 500 error from proxy
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    // Run evaluateATS - should not crash, but fall back to the mock keyword-based result
    const result = await evaluateATS({
      resumeData: { summary: "Experienced leader", skills: [{ id: "s1", name: "strategy", isHighlighted: false }] },
      jobDescription: "Looking for leadership and strategy"
    });

    expect(result).toBeDefined();
    expect(typeof result.score).toBe("number");
    // Verify fallback has feedback messages
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});
