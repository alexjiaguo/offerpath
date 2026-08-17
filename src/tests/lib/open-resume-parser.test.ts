import { describe, it, expect } from "vitest";
import {
  groupTextItemsIntoLines,
  groupLinesIntoSections,
  normalizePdfHyphens,
  resolveFontName,
} from "@/lib/open-resume-parser/pdf-reader";
import { mapToResumeData } from "@/lib/open-resume-parser";
import type { ORResume, TextItem } from "@/lib/open-resume-parser/types";

function item(partial: Partial<TextItem> & { text: string }): TextItem {
  return {
    x: 0,
    y: 0,
    width: 40,
    height: 12,
    fontName: "Helvetica",
    hasEOL: false,
    ...partial,
  };
}

const emptyResume = (): ORResume => ({
  profile: { name: "", email: "", phone: "", location: "", url: "", summary: "" },
  educations: [],
  workExperiences: [],
  projects: [],
  skills: { featuredSkills: [], descriptions: [] },
});

describe("OpenResume hyphen and font helpers", () => {
  it("normalizes hyphen variants to ascii hyphen", () => {
    expect(normalizePdfHyphens("2020\u20102024")).toBe("2020-2024");
    expect(normalizePdfHyphens("2020\u00AD2024")).toBe("2020-2024");
    expect(normalizePdfHyphens("2020\u20112024")).toBe("2020-2024");
  });

  it("keeps the font id when commonObjs does not have it", () => {
    const objs = {
      has: (id: string) => id === "known",
      get: (id: string) => {
        if (id !== "known") throw new Error("unresolved");
        return { name: "Times-Bold" };
      },
    };
    expect(resolveFontName(objs, "g_d0_f1")).toBe("g_d0_f1");
    expect(resolveFontName(objs, "known")).toBe("Times-Bold");
  });
});

describe("OpenResume line and section grouping", () => {
  it("groups items by y when hasEOL is rare", () => {
    const items: TextItem[] = [
      item({ text: "Jane", x: 0, y: 100, width: 20 }),
      item({ text: "Doe", x: 30, y: 100, width: 20 }),
      item({ text: "EXPERIENCE", x: 0, y: 80, width: 80, fontName: "Helvetica-Bold" }),
    ];
    const lines = groupTextItemsIntoLines(items);
    expect(lines.length).toBe(2);
    expect(lines[0].map((t) => t.text).join(" ")).toContain("Jane");
    expect(lines[1][0].text).toBe("EXPERIENCE");
  });

  it("treats EXPERIENCE plus a date on the same line as a section title", () => {
    const lines = [
      [item({ text: "Jane Doe", y: 800, fontName: "Helvetica-Bold", hasEOL: true })],
      [
        item({ text: "EXPERIENCE", y: 700, width: 80, fontName: "Helvetica-Bold" }),
        item({ text: "2020", x: 200, y: 700, width: 30, hasEOL: true }),
      ],
      [item({ text: "Engineer", y: 680, hasEOL: true })],
    ];
    const sections = groupLinesIntoSections(lines);
    expect(Object.keys(sections).some((k) => /experience/i.test(k))).toBe(true);
  });
});

describe("mapToResumeData", () => {
  it("maps personal.title from the first job title", () => {
    const resume = emptyResume();
    resume.profile.name = "A";
    resume.workExperiences = [
      { company: "X", jobTitle: "Product Manager", date: "2020 - Present", descriptions: [] },
    ];
    const data = mapToResumeData(resume);
    expect(data.personal?.title).toBe("Product Manager");
  });

  it("returns an empty object when the profile is hollow", () => {
    const data = mapToResumeData(emptyResume());
    expect(data.personal).toBeUndefined();
    expect(data.experience).toBeUndefined();
  });
});
