import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseUploadedResume } from "@/lib/resumeUploadPipeline";
import { useProfileStore } from "@/store/profileStore";

const MD_TEXT = `# Alex Sterling

## Senior Product Designer

San Francisco, CA | alex.sterling@example.com | (555) 123-4567

## Professional Summary

Award-winning Senior Product Designer with 8+ years of experience.

## Professional Experience

### Lead Product Designer | InnovateTech
*2021-03 - Present | San Francisco, CA*
- Led a team of 4 designers
`;

describe("parseUploadedResume", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    useProfileStore.setState({ apiKeys: [] });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("does not treat an empty extract as success", async () => {
    const file = new File(["   \n\n"], "empty.md", { type: "text/markdown" });
    const result = await parseUploadedResume(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(10);
    }
  });

  it("extracts name and experience from markdown without calling AI", async () => {
    const file = new File([MD_TEXT], "resume.md", { type: "text/markdown" });
    const result = await parseUploadedResume(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.personal?.name).toBe("Alex Sterling");
      expect(result.data.experience?.length).toBeGreaterThan(0);
    }
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("accepts markdown downloaded as application/octet-stream", async () => {
    const file = new File([MD_TEXT], "resume.md", {
      type: "application/octet-stream",
    });
    const result = await parseUploadedResume(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.personal?.name).toBe("Alex Sterling");
    }
  });

  it("parses .doc file content successfully", async () => {
    const docContent = `{\\rtf1\\ansi\\deff0
\\par John Doe
\\par Senior Developer | john@example.com | (555) 000-1111
\\par EXPERIENCE
\\par Google | Senior Developer | 2020 - Present
\\par - Led core infrastructure team
}`;
    const file = new File([docContent], "resume.doc", { type: "application/msword" });
    const result = await parseUploadedResume(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.personal?.name).toBe("John Doe");
      expect(result.data.experience?.length).toBeGreaterThan(0);
    }
  });

  it("handles unreadable/empty .doc files gracefully with informative error", async () => {
    const file = new File(["\x00\x01\x02"], "corrupt.doc", { type: "application/msword" });
    const result = await parseUploadedResume(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(5);
    }
  });
});
