import { describe, it, expect } from "vitest";
import {
  parsePath,
  applyFieldEdit,
  addEntry,
  removeEntry,
  reorderEntries,
  addBullet,
  removeBullet,
} from "@/components/resume/editable/fieldPath";
import type { ResumeData } from "@/types";

const baseData: ResumeData = {
  personal: { name: "Alex Chen", email: "alex@example.com" },
  summary: "Summary",
  experience: [
    {
      company: "TechCorp",
      title: "PM",
      start_date: "2020-01",
      bullets: ["Built things", "Shipped stuff"],
    },
  ],
  education: [{ institution: "NUS", degree: "MBA", field: "Business" }],
  skills: [
    { id: "s1", name: "Strategy", isHighlighted: true },
    { id: "s2", name: "Data", isHighlighted: false },
  ],
  languages: ["English", "Mandarin"],
  technicalSkills: [{ id: "t1", category: "Languages", skills: "Python, SQL" }],
};

describe("parsePath", () => {
  it("parses dot notation", () => {
    expect(parsePath("personal.name")).toEqual(["personal", "name"]);
  });
  it("parses array indices", () => {
    expect(parsePath("experience[0].title")).toEqual(["experience", 0, "title"]);
  });
  it("parses nested arrays", () => {
    expect(parsePath("experience[0].bullets[1]")).toEqual(["experience", 0, "bullets", 1]);
  });
  it("parses top-level arrays", () => {
    expect(parsePath("languages[0]")).toEqual(["languages", 0]);
  });
});

describe("applyFieldEdit", () => {
  it("updates a nested plain field", () => {
    const result = applyFieldEdit(baseData, "personal.name", "Chris Lee");
    expect(result.personal?.name).toBe("Chris Lee");
  });
  it("updates an array element field", () => {
    const result = applyFieldEdit(baseData, "experience[0].title", "Senior PM");
    expect(result.experience?.[0].title).toBe("Senior PM");
  });
  it("updates a nested bullet", () => {
    const result = applyFieldEdit(baseData, "experience[0].bullets[1]", "Shipped more");
    expect(result.experience?.[0].bullets?.[1]).toBe("Shipped more");
  });
  it("updates a skill name", () => {
    const result = applyFieldEdit(baseData, "skills[1].name", "SQL");
    expect(result.skills?.[1].name).toBe("SQL");
  });
  it("updates a top-level array item", () => {
    const result = applyFieldEdit(baseData, "languages[0]", "Chinese");
    expect(result.languages?.[0]).toBe("Chinese");
  });
  it("does not mutate the original data", () => {
    const result = applyFieldEdit(baseData, "personal.name", "Changed");
    expect(baseData.personal?.name).toBe("Alex Chen");
    expect(result).not.toBe(baseData);
  });
});

describe("addEntry / removeEntry / reorderEntries", () => {
  it("adds an experience entry", () => {
    const result = addEntry(baseData, "experience");
    expect(result.experience?.length).toBe(2);
    expect(result.experience?.[1]).toMatchObject({ company: "", title: "" });
  });
  it("adds an education entry", () => {
    const result = addEntry(baseData, "education");
    expect(result.education?.length).toBe(2);
  });
  it("adds a project entry", () => {
    const result = addEntry(baseData, "projects");
    expect(result.projects?.length).toBe(1);
  });
  it("adds a skill", () => {
    const result = addEntry(baseData, "skills");
    expect(result.skills?.length).toBe(3);
  });
  it("removes an entry", () => {
    const result = removeEntry(baseData, "experience", 0);
    expect(result.experience?.length).toBe(0);
  });
  it("reorders entries", () => {
    const withTwo = addEntry(baseData, "experience");
    const result = reorderEntries(withTwo, "experience", 0, 1);
    expect(result.experience?.[1].title).toBe("PM");
  });
  it("adds a bullet", () => {
    const result = addBullet(baseData, 0);
    expect(result.experience?.[0].bullets?.length).toBe(3);
  });
  it("removes a bullet", () => {
    const result = removeBullet(baseData, 0, 0);
    expect(result.experience?.[0].bullets?.length).toBe(1);
    expect(result.experience?.[0].bullets?.[0]).toBe("Shipped stuff");
  });
});
