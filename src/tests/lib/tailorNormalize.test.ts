import { describe, expect, it } from "vitest";
import { normalizeTailorResult } from "@/lib/aiService";
import type { ResumeData } from "@/types";

const baseResume = {
  summary: "Base professional summary",
  experience: [
    {
      company: "Google",
      title: "Senior Product Manager",
      location: "New York, NY",
      start_date: "Jan 2020",
      end_date: "",
      current: true,
      bullets: ["Led ads revenue team"],
    },
    {
      company: "Meta",
      title: "Product Manager",
      start_date: "2016",
      end_date: "2019",
      current: false,
      bullets: ["Shipped growth features"],
    },
  ],
  skills: [
    { id: "1", name: "Strategy", isHighlighted: false },
    { id: "2", name: "Analytics", isHighlighted: false },
  ],
} as unknown as ResumeData;

describe("normalizeTailorResult", () => {
  it("restores dates and location from the matching base entry when the model omits them", () => {
    const result = normalizeTailorResult(baseResume, {
      summary: "Tailored summary",
      experience: [
        { company: "Google", title: "Senior Product Manager", bullets: ["Rewritten bullet"] },
      ],
      skillsToHighlight: ["Strategy"],
      tailoringNotes: "**Matched** keywords",
    });

    expect(result.experience).toHaveLength(1);
    const entry = result.experience[0];
    expect(entry.company).toBe("Google");
    expect(entry.start_date).toBe("Jan 2020");
    expect(entry.end_date).toBe("");
    expect(entry.current).toBe(true);
    expect(entry.location).toBe("New York, NY");
    expect(entry.bullets).toEqual(["Rewritten bullet"]);
    expect(result.summary).toBe("Tailored summary");
    expect(result.skillsToHighlight).toEqual(["Strategy"]);
  });

  it("keeps verbatim model-provided factual fields when present", () => {
    const result = normalizeTailorResult(baseResume, {
      summary: "Tailored",
      experience: [
        {
          company: "Google",
          title: "Senior Product Manager",
          start_date: "Feb 2020",
          end_date: "",
          current: true,
          bullets: ["b"],
        },
      ],
    });

    expect(result.experience[0].start_date).toBe("Feb 2020");
  });

  it("falls back to base entry by position when names do not match", () => {
    const result = normalizeTailorResult(baseResume, {
      summary: "T",
      experience: [
        { company: "", title: "", start_date: "", current: false, bullets: [] },
      ],
    });

    expect(result.experience[0].company).toBe("Google");
    expect(result.experience[0].start_date).toBe("Jan 2020");
  });

  it("gives anonymous entries positional base identity and drops surplus unidentifiable ones", () => {
    const result = normalizeTailorResult(baseResume, {
      summary: "T",
      experience: [
        { bullets: ["rewritten"], current: false },
        { company: "", title: "", start_date: "", bullets: [] },
        { bullets: ["surplus junk"] },
      ],
      skillsToHighlight: [],
    });

    expect(result.experience).toHaveLength(2);
    expect(result.experience[0].company).toBe("Google");
    expect(result.experience[0].title).toBe("Senior Product Manager");
    expect(result.experience[0].start_date).toBe("Jan 2020");
    expect(result.experience[0].bullets).toEqual(["rewritten"]);
    expect(result.experience[1].company).toBe("Meta");
    expect(result.experience[1].bullets).toEqual(["Shipped growth features"]);
  });

  it("uses the whole base experience when the model returns no experience array", () => {
    const result = normalizeTailorResult(baseResume, {
      summary: "Only a summary came back",
    });

    expect(result.experience).toEqual(baseResume.experience);
    expect(result.summary).toBe("Only a summary came back");
  });

  it("falls back to the base summary when the model omits it", () => {
    const result = normalizeTailorResult(baseResume, {
      experience: [],
    });

    expect(result.summary).toBe("Base professional summary");
  });

  it("filters non-string values out of skillsToHighlight and notes", () => {
    const result = normalizeTailorResult(baseResume, {
      summary: "S",
      skillsToHighlight: ["Strategy", 42, null, ""],
      tailoringNotes: 12345,
    });

    expect(result.skillsToHighlight).toEqual(["Strategy"]);
    expect(result.tailoringNotes).toBe("");
  });

  it("handles completely malformed payloads safely", () => {
    const result = normalizeTailorResult(baseResume, "not an object");

    expect(result.summary).toBe("Base professional summary");
    expect(result.experience).toEqual(baseResume.experience);
    expect(result.skillsToHighlight).toEqual([]);
    expect(result.tailoringNotes).toBe("");
  });
});
