import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectEntryContent } from "@/components/resume/editable/EditableText";
import ATSExecutive from "@/components/resume/templates/ATSExecutive";
import Academic from "@/components/resume/templates/Academic";
import ClassicMinimal from "@/components/resume/templates/ClassicMinimal";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types";

const baseTheme: ResumeTheme = {
  primaryColor: "#2c3e50",
  accentColor: "#7f8c8d",
  backgroundColor: "#ffffff",
  textColor: "#1a1a2e",
  fontFamily: "Inter",
  baseFontSize: 10,
  headerFontSize: 24,
  sectionTitleSize: 11,
  companyFontSize: 11,
  lineHeight: 1.4,
  pagePadding: 30,
  sectionSpacing: 12,
  itemSpacing: 0,
};

const mockData: ResumeData = {
  personal: { name: "Alex Guo", email: "alex@example.com" },
  education: [
    { institution: "Stanford", degree: "MS", field: "CS", start_date: "2018", end_date: "2020" },
    { institution: "Berkeley", degree: "BS", field: "EECS", start_date: "2014", end_date: "2018" },
  ],
  technicalSkills: [
    { id: "t1", category: "Languages", skills: "TypeScript, Python, Go" },
    { id: "t2", category: "Frameworks", skills: "React, Next.js, FastAPI" },
  ],
  certifications: ["AWS Solutions Architect", "CFA Level 1"],
  projects: [
    {
      name: "[OfferPath](https://offerpath.io):",
      url: "",
      description: "AI-powered job search OS with ATS analysis.",
    },
  ],
};

const visibility = {
  summary: true, experience: true, education: true, skills: true, technicalSkills: true,
  languages: true, certifications: true, projects: true, photo: true,
} as Record<string, boolean>;

const sectionOrder: SectionKey[] = ["education", "technicalSkills", "certifications", "projects"];

describe("itemSpacing 0 and custom spacing", () => {
  it("renders project with itemSpacing=0", () => {
    const { container } = render(
      <ProjectEntryContent
        item={{
          name: "OfferPath",
          url: "https://offerpath.cc.cd/",
          description: "AI job-search operating system.",
        }}
        index={0}
        theme={baseTheme}
      />,
    );
    const projectDiv = container.firstElementChild as HTMLElement;
    expect(projectDiv.style.marginBottom).toBe("0px");
  });

  it("renders project with itemSpacing=undefined (default to 8)", () => {
    const theme: ResumeTheme = { ...baseTheme, itemSpacing: undefined as unknown as number };
    const { container } = render(
      <ProjectEntryContent
        item={{ name: "A", url: "", description: "B" }}
        index={0}
        theme={theme}
      />,
    );
    const projectDiv = container.firstElementChild as HTMLElement;
    expect(projectDiv.style.marginBottom).toBe("8px");
  });

  it("extracts markdown link in project name and strips trailing colons", () => {
    render(
      <ProjectEntryContent
        item={{
          name: "[OfferPath](https://offerpath.io):",
          url: "",
          description: "AI resume builder.",
        }}
        index={0}
        theme={baseTheme}
      />,
    );
    const link = screen.getByRole("link", { name: "OfferPath" });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("https://offerpath.io");
    expect(link.textContent).toBe("OfferPath");
  });

  it("ATSExecutive technicalSkills honors itemSpacing=0 (0px gap)", () => {
    const { container } = render(
      <ATSExecutive data={mockData} theme={baseTheme} sectionOrder={sectionOrder} sectionVisibility={visibility} />,
    );
    const techSection = container.querySelector("section[data-key='technicalSkills'], section");
    expect(techSection).toBeDefined();
  });
});
