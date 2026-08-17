import { describe, it, expect, vi } from "vitest";
import { generateDocx } from "@/lib/exportDocx";
import type { ResumeData } from "@/types";

vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

describe("exportDocx", () => {
  it("generates a DOCX file without crashing when passed full resume data with SkillItems and technicalSkills", async () => {
    const { saveAs } = await import("file-saver");

    const sampleData: ResumeData = {
      personal: {
        name: "Jane Doe",
        title: "Senior Full Stack Engineer",
        email: "jane@example.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/janedoe",
        website: "github.com/janedoe",
      },
      summary: "Passionate developer with 8+ years experience building web systems.",
      experience: [
        {
          company: "Acme Corp",
          title: "Senior Engineer",
          location: "San Francisco, CA",
          start_date: "Jan 2020",
          end_date: "Present",
          current: true,
          bullets: ["Led engineering team of 5", "Reduced API latency by 35%"],
        },
      ],
      education: [
        {
          institution: "University of California, Berkeley",
          degree: "B.S.",
          field: "Computer Science",
          start_date: "2015",
          end_date: "2019",
          gpa: "3.9",
        },
      ],
      skills: [
        { id: "1", name: "React", isHighlighted: true },
        { id: "2", name: "TypeScript", isHighlighted: false },
        { id: "3", name: "Node.js", isHighlighted: false },
      ],
      technicalSkills: [
        { id: "ts-1", category: "Languages", skills: "TypeScript, Python, Go" },
        { id: "ts-2", category: "Frameworks", skills: "React, Next.js, FastAPI" },
      ],
      projects: [
        {
          name: "OfferPath OS",
          description: "Career management platform",
          url: "https://offerpath.io",
        },
      ],
      languages: ["English", "Mandarin"],
      certifications: ["AWS Certified Solutions Architect"],
    };

    await generateDocx(sampleData, "Jane Doe - Resume");

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(saveAs).mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(filename).toBe("Jane_Doe_-_Resume.docx");
  });

  it("handles minimal resume data without errors", async () => {
    const { saveAs } = await import("file-saver");
    vi.mocked(saveAs).mockClear();

    const minimalData: ResumeData = {
      personal: { name: "Minimal User" },
      experience: [],
      education: [],
      skills: [],
    };

    await generateDocx(minimalData, "Minimal");
    expect(saveAs).toHaveBeenCalledTimes(1);
  });
});
