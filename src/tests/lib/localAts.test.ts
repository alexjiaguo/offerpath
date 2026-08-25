import { describe, expect, it } from "vitest";
import { evaluateLocalAts, resumeToText } from "@/lib/localAts";
import type { ResumeData } from "@/types";

const resume = {
  summary: "Senior product manager focused on growth and analytics.",
  experience: [
    {
      company: "Acme",
      title: "Product Manager",
      start_date: "2020",
      current: true,
      bullets: [
        "Led A/B testing program raising conversion by 12%",
        "Owned roadmap for ML-powered recommendations",
      ],
    },
  ],
  skills: [
    { id: "1", name: "SQL", isHighlighted: false },
    { id: "2", name: "Roadmapping", isHighlighted: false },
  ],
} as unknown as ResumeData;

describe("evaluateLocalAts", () => {
  it("scores keyword coverage between resume and JD", () => {
    const jd =
      "We need a product manager with SQL, A/B testing experience and ML exposure. Strong analytics skills required.";
    const result = evaluateLocalAts(resume, jd);

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(95);
    expect(result.matchedKeywords).toContain("sql");
    expect(result.matchedKeywords).toContain("analytics");
    expect(result.missingKeywords).not.toContain("sql");
  });

  it("marks absent requirements as missing", () => {
    const jd = "Requires Kubernetes, Terraform and Go programming.";
    const result = evaluateLocalAts(resume, jd);
    expect(result.matchedKeywords).not.toContain("kubernetes");
    expect(result.missingKeywords).toContain("kubernetes");
    expect(result.score).toBeLessThan(50);
  });

  it("ignores stopwords and pure numbers", () => {
    const result = evaluateLocalAts(resume, "the 2023 and we will require sql");
    expect(result.matchedKeywords).toEqual(["sql"]);
    expect(result.missingKeywords.length).toBe(0);
  });

  it("matches CJK keywords by substring", () => {
    const cnResume = {
      summary: "负责增长业务与数据分析",
      experience: [],
    } as unknown as ResumeData;
    const result = evaluateLocalAts(cnResume, "要求 数据分析 能力 与 增长 思维");
    expect(result.matchedKeywords).toContain("数据分析");
    expect(result.matchedKeywords).toContain("增长");
  });

  it("returns zero for empty inputs", () => {
    expect(evaluateLocalAts(undefined, "anything").score).toBe(0);
    expect(evaluateLocalAts(resume, "   ").score).toBe(0);
  });

  it("resumeToText flattens all sections", () => {
    const text = resumeToText(resume);
    expect(text).toContain("roadmap");
    expect(text).toContain("sql");
    expect(text).toContain("acme");
  });
});
