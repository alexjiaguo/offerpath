import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluateATS, parseResumeWithAI, getLLMConfig } from "@/lib/aiService";
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

 it("throws when the proxy errors even though an API key is configured", async () => {
  // Return a 500 error from proxy
  vi.mocked(global.fetch).mockResolvedValueOnce({
  ok: false,
  status: 500,
  text: async () => "Internal Server Error",
  } as unknown as Response);

  await expect(
  evaluateATS({
  resumeData: { summary: "Experienced leader" },
  jobDescription: "Looking for leadership",
  })
  ).rejects.toThrow();
 });

 it("falls back to keyword-based mock only when no API key is configured", async () => {
  useProfileStore.setState({ apiKeys: [] });

  const result = await evaluateATS({
  resumeData: { summary: "Experienced leader", skills: [{ id: "s1", name: "strategy", isHighlighted: false }] },
  jobDescription: "Looking for leadership and strategy"
  });

  expect(global.fetch).not.toHaveBeenCalled();
  expect(result).toBeDefined();
  expect(typeof result.score).toBe("number");
  expect(result.feedback.length).toBeGreaterThan(0);
 });

});

describe("parseResumeWithAI - LLM extraction with regex fallback", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
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

  const SAMPLE_RESUME_TEXT = `John Smith
Senior Software Engineer
San Francisco, CA | john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years building scalable web applications.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Google | Jan 2020 - Present
- Led development of core infrastructure
- Architected microservices migration

EDUCATION
B.S. Computer Science | Stanford University | 2012 - 2016

SKILLS
JavaScript, TypeScript, React, Node.js, Python`;

  it("uses LLM result when available and normalizes the data correctly", async () => {
    const llmJson = {
      personal: {
        name: "John Smith",
        title: "Senior Software Engineer",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/johnsmith",
        website: ""
      },
      summary: "Experienced software engineer with 8+ years building scalable web applications.",
      experience: [
        {
          company: "Google",
          title: "Senior Software Engineer",
          location: "Mountain View, CA",
          start_date: "Jan 2020",
          end_date: "",
          current: true,
          bullets: ["Led development of core infrastructure", "Architected microservices migration"]
        }
      ],
      education: [
        {
          institution: "Stanford University",
          degree: "B.S. Computer Science",
          field: "Computer Science",
          start_date: "2012",
          end_date: "2016"
        }
      ],
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
      technicalSkills: [
        { category: "Languages", skills: "JavaScript, TypeScript, Python" }
      ],
      certifications: [],
      projects: [],
      languages: ["English"]
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: JSON.stringify(llmJson) }),
    } as unknown as Response);

    const result = await parseResumeWithAI(SAMPLE_RESUME_TEXT, "pdf");

    // Personal info
    expect(result.personal?.name).toBe("John Smith");
    expect(result.personal?.email).toBe("john.smith@email.com");
    expect(result.personal?.title).toBe("Senior Software Engineer");

    // Summary
    expect(result.summary).toContain("Experienced software engineer");

    // Experience - normalized shape
    expect(result.experience).toHaveLength(1);
    expect(result.experience![0].company).toBe("Google");
    expect(result.experience![0].title).toBe("Senior Software Engineer");
    expect(result.experience![0].current).toBe(true);
    expect(result.experience![0].bullets).toHaveLength(2);

    // Education
    expect(result.education).toHaveLength(1);
    expect(result.education![0].institution).toBe("Stanford University");

    // Skills - normalized to SkillItem[] with IDs
    expect(result.skills).toHaveLength(5);
    expect(result.skills![0].id).toBe("1");
    expect(result.skills![0].name).toBe("JavaScript");
    expect(result.skills![0].isHighlighted).toBe(false);

    // Technical skills - normalized with IDs
    expect(result.technicalSkills).toHaveLength(1);
    expect(result.technicalSkills![0].id).toBe("1");
    expect(result.technicalSkills![0].category).toBe("Languages");

    // Languages
    expect(result.languages).toEqual(["English"]);
  });

  it("falls back to regex parser when LLM call fails", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    const result = await parseResumeWithAI(SAMPLE_RESUME_TEXT, "pdf");

    // Should still get data from the regex fallback parser
    expect(result.personal?.name).toBe("John Smith");
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBeGreaterThanOrEqual(1);
  });

 it("returns null from getLLMConfig when no API key is configured", () => {
 useProfileStore.setState({ apiKeys: [] });
 expect(getLLMConfig()).toBeNull();
 });

  it("returns keyless local configurations with base URL and model", () => {
    useProfileStore.setState({
      apiKeys: [
        {
          id: "test-ollama",
          provider: "ollama",
          label: "Local Qwen",
          key: "",
          baseUrl: "http://localhost:11434/v1",
          model: "qwen2.5:7b",
          status: "active",
          addedAt: "2026-01-01",
        },
      ],
    });

    expect(getLLMConfig()).toEqual({
      provider: "ollama",
      apiKey: undefined,
      baseUrl: "http://localhost:11434/v1",
      model: "qwen2.5:7b",
    });
  });

  it("falls back to regex parser when no API key is configured", async () => {
    useProfileStore.setState({ apiKeys: [] });

    const result = await parseResumeWithAI(SAMPLE_RESUME_TEXT, "pdf");

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.personal?.name).toBe("John Smith");
    expect(result.experience).toBeDefined();
  });

  it("falls back to regex parser when LLM returns empty result", async () => {
    const emptyJson = {
      personal: { name: "" },
      experience: [],
      education: []
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: JSON.stringify(emptyJson) }),
    } as unknown as Response);

    const result = await parseResumeWithAI(SAMPLE_RESUME_TEXT, "pdf");

    // Should fall back to regex parser since LLM returned empty
    expect(result.personal?.name).toBe("John Smith");
  });

  it("handles LLM response with markdown code fences", async () => {
    const fencedJson = `\`\`\`json
{
  "personal": { "name": "Jane Doe", "title": "PM", "email": "jane@test.com" },
  "summary": "Product manager",
  "experience": [],
  "education": [],
  "skills": ["Strategy", "Analytics"],
  "technicalSkills": [],
  "certifications": [],
  "projects": [],
  "languages": ["English"]
}
\`\`\``;

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: fencedJson }),
    } as unknown as Response);

    const result = await parseResumeWithAI("Jane Doe\nPM\njane@test.com", "txt");

    expect(result.personal?.name).toBe("Jane Doe");
    expect(result.skills).toHaveLength(2);
    expect(result.skills![0].name).toBe("Strategy");
  });

});
