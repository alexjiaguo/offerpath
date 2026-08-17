import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ATSExecutive from "@/components/resume/templates/ATSExecutive";
import ClassicMinimal from "@/components/resume/templates/ClassicMinimal";
import CleanLayout from "@/components/resume/templates/CleanLayout";
import CleanProfessional from "@/components/resume/templates/CleanProfessional";
import BoldEngineer from "@/components/resume/templates/BoldEngineer";
import Academic from "@/components/resume/templates/Academic";
import PhotoHeader from "@/components/resume/templates/PhotoHeader";
import ElegantTwoColumn from "@/components/resume/templates/ElegantTwoColumn";
import PremiumHeadshot from "@/components/resume/templates/PremiumHeadshot";
import { SingleLineEduEntry, TwoLineEduEntry, ProjectEntryContent } from "@/components/resume/editable/EditableText";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types";

const mockTheme: ResumeTheme = {
  primaryColor: "#1a1a2e",
  accentColor: "#0066cc",
  textColor: "#2d3748",
  fontFamily: "Inter",
  baseFontSize: 10,
  headerFontSize: 24,
  sectionTitleSize: 12,
  companyFontSize: 11,
  lineHeight: 1.3,
  pagePadding: 36,
  sectionSpacing: 12,
  itemSpacing: 6,
};

const mockData: ResumeData = {
  personal: {
    name: "Alex Jia",
    title: "Senior Product Manager",
    email: "alex@example.com",
    phone: "+1 234 567 890",
  },
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      start_date: "2020",
      end_date: "2022",
      gpa: "3.9",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Arena Copilot",
      url: "https://github.com/alex/arena",
      description: "AI ops chatbot handling support workflows.",
    },
    {
      id: "proj-2",
      name: "OfferPath",
      url: "https://offerpath.io",
      description: "Smart job application platform.",
    },
  ],
};

const fullVisibility: Record<SectionKey, boolean> = {
  summary: true,
  experience: true,
  education: true,
  skills: true,
  technicalSkills: true,
  languages: true,
  certifications: true,
  projects: true,
  photo: true,
  portfolio: true,
  visaStatus: true,
};

const fullOrder: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "technicalSkills",
  "projects",
  "languages",
  "certifications",
];

describe("Resume-Pro Education Formatting Alignment", () => {
  it("SingleLineEduEntry: school is bold (700), degree is italic normal weight (400)", () => {
    const { container } = render(
      <SingleLineEduEntry item={mockData.education![0]} index={0} theme={mockTheme} />,
    );

    const strongEl = container.querySelector("strong");
    expect(strongEl).not.toBeNull();
    expect(strongEl?.textContent).toContain("Stanford University");

    const italicSpan = container.querySelector("span[style*='italic']");
    expect(italicSpan).not.toBeNull();
    expect(italicSpan?.textContent).toContain("Master of Science");
    expect(italicSpan?.textContent).toContain("Computer Science");
    expect(italicSpan?.textContent).toContain("GPA: 3.9");
  });

  it("TwoLineEduEntry: school is bold (700) with dates flex row, degree is normal weight (400)", () => {
    const { container } = render(
      <TwoLineEduEntry item={mockData.education![0]} index={0} theme={mockTheme} />,
    );

    const strongEl = container.querySelector("strong");
    expect(strongEl).not.toBeNull();
    expect(strongEl?.textContent).toContain("Stanford University");

    const degreeSpan = container.querySelector("span[style*='font-weight: 400']");
    expect(degreeSpan).not.toBeNull();
    expect(degreeSpan?.textContent).toContain("Master of Science");
    expect(degreeSpan?.textContent).toContain("Computer Science");
  });

  it("Single-column templates render education correctly", () => {
    const templates = [
      { name: "ATSExecutive", comp: ATSExecutive },
      { name: "ClassicMinimal", comp: ClassicMinimal },
      { name: "CleanLayout", comp: CleanLayout },
      { name: "CleanProfessional", comp: CleanProfessional },
      { name: "BoldEngineer", comp: BoldEngineer },
      { name: "Academic", comp: Academic },
    ];

    for (const { name, comp: Component } of templates) {
      const { container } = render(
        <Component
          data={mockData}
          theme={mockTheme}
          sectionOrder={fullOrder}
          sectionVisibility={fullVisibility}
        />,
      );
      const school = container.querySelector("strong");
      expect(school?.textContent, `${name} should render bold school`).toContain("Stanford University");
    }
  });

  it("Two-column templates render two-line education correctly", () => {
    const templates = [
      { name: "PhotoHeader", comp: PhotoHeader },
      { name: "ElegantTwoColumn", comp: ElegantTwoColumn },
      { name: "PremiumHeadshot", comp: PremiumHeadshot },
    ];

    for (const { name, comp: Component } of templates) {
      const { container } = render(
        <Component
          data={mockData}
          theme={mockTheme}
          sectionOrder={fullOrder}
          sectionVisibility={fullVisibility}
        />,
      );
      const school = container.querySelector("strong");
      expect(school?.textContent, `${name} should render bold school`).toContain("Stanford University");
    }
  });
});

describe("Resume-Pro Project Formatting Alignment", () => {
  it("ProjectEntryContent: renders (github) badge for github URLs and (website) for non-github", () => {
    const { container: githubContainer } = render(
      <ProjectEntryContent item={mockData.projects![0]} index={0} theme={mockTheme} />,
    );
    expect(githubContainer.textContent).toContain("(github)");
    expect(githubContainer.textContent).toContain("Arena Copilot");
    expect(githubContainer.textContent).toContain(" — ");

    const { container: websiteContainer } = render(
      <ProjectEntryContent item={mockData.projects![1]} index={1} theme={mockTheme} />,
    );
    expect(websiteContainer.textContent).toContain("(website)");
    expect(websiteContainer.textContent).toContain("OfferPath");
  });
});
