import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ElegantTwoColumn from "@/components/resume/templates/ElegantTwoColumn";
import PhotoHeader from "@/components/resume/templates/PhotoHeader";
import type { ResumeData, ResumeTheme } from "@/types";

const data: ResumeData = {
  personal: { name: "Alex", email: "a@b.c" },
  summary: "Test",
  experience: [
    { id: "1", title: "PM", company: "Acme", location: "SF", start_date: "2020", end_date: "2024", current: false, bullets: ["Did X", "Did Y"] },
    { id: "2", title: "Senior PM", company: "Beta", location: "NY", start_date: "2018", end_date: "2020", current: false, bullets: ["Did Z"] },
  ],
  education: [], skills: [], projects: [],
};

const theme: ResumeTheme = {
  primaryColor: "#2c3e50", accentColor: "#7f8c8d", backgroundColor: "#ffffff",
  textColor: "#1a1a2e", fontFamily: "Inter", baseFontSize: 10, headerFontSize: 24,
  sectionTitleSize: 11, companyFontSize: 11, lineHeight: 1.4, pagePadding: 30,
  sectionSpacing: 12, itemSpacing: 0,
};

const visibility = {
  summary: true, experience: true, education: true, skills: true, technicalSkills: true,
  languages: true, certifications: true, projects: true, photo: true, portfolio: true, visaStatus: true,
} as Record<string, boolean>;

const fullOrder = ["summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects", "photo", "portfolio", "visaStatus"] as SectionKey[];

function findExpItems(container: HTMLElement, expectedBorderColor: string): HTMLElement[] {
  const all = container.querySelectorAll("div");
  const result: HTMLElement[] = [];
  for (const el of all) {
    const bl = (el as HTMLElement).style.borderLeft;
    // Match border with the specific color and only match "2px solid" or "1px solid" (timeline border, not photo border)
    if (bl && bl.includes(expectedBorderColor) && (bl.startsWith("1px solid") || bl.startsWith("2px solid"))) {
      result.push(el as HTMLElement);
    }
  }
  return result;
}

describe("experience item marginBottom uses itemSpacing (zero respected)", () => {
  it("ElegantTwoColumn: experience items honor itemSpacing=0", () => {
    const { container } = render(
      <ElegantTwoColumn data={data} theme={theme} sectionOrder={fullOrder} sectionVisibility={visibility} />,
    );
    const expDivs = findExpItems(container as HTMLElement, "rgb(236, 240, 241)");
    expect(expDivs.length).toBeGreaterThan(0);
    for (const div of expDivs) {
      expect(div.style.marginBottom).toBe("0px");
    }
  });

  it("PhotoHeader: experience items honor itemSpacing=0", () => {
    const { container } = render(
      <PhotoHeader data={data} theme={theme} sectionOrder={fullOrder} sectionVisibility={visibility} />,
    );
    const expDivs = findExpItems(container as HTMLElement, "rgb(238, 238, 238)");
    expect(expDivs.length).toBeGreaterThan(0);
    for (const div of expDivs) {
      expect(div.style.marginBottom).toBe("0px");
    }
  });

  it("ElegantTwoColumn: experience items honor itemSpacing=15", () => {
    const t15 = { ...theme, itemSpacing: 15 };
    const { container } = render(
      <ElegantTwoColumn data={data} theme={t15} sectionOrder={fullOrder} sectionVisibility={visibility} />,
    );
    const expDivs = findExpItems(container as HTMLElement, "rgb(236, 240, 241)");
    expect(expDivs.length).toBeGreaterThan(0);
    for (const div of expDivs) {
      expect(div.style.marginBottom).toBe("15px");
    }
  });
});
