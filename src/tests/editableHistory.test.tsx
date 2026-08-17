import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { EditProvider } from "@/components/resume/editable/EditContext";
import { EditableText } from "@/components/resume/editable/EditableText";
import { ProjectEntryContent } from "@/components/resume/editable/EditableText";
import type { ResumeData } from "@/types";

const data: ResumeData = {
  personal: { name: "Alex Chen", email: "alex@example.com" },
  summary: "Summary",
  experience: [],
  education: [],
  skills: [],
};

describe("history-before-edit", () => {
  it("saves history before applying an inline edit", () => {
    const order: string[] = [];
    const { getByText } = render(
      <EditProvider
        editable
        data={data}
        resumeId="r1"
        updateResume={() => {
          order.push("edit");
        }}
        saveToHistory={() => {
          order.push("history");
        }}
        toggleVisibility={() => {}}
        template="classic-minimal"
      >
        <EditableText field="personal.name" value="Alex Chen" />
      </EditProvider>,
    );

    const el = getByText("Alex Chen");
    fireEvent.focus(el);
    el.textContent = "Chris Lee";
    fireEvent.blur(el);

    expect(order).toEqual(["history", "edit"]);
  });
});

describe("ProjectEntryContent", () => {
  it("styles only the project name as bold primary text", () => {
    const theme = {
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
      itemSpacing: 6,
    };

    const { getByText } = render(
      <ProjectEntryContent
        item={{
          name: "OfferPath",
          url: "https://offerpath.cc.cd/",
          description: "AI job-search operating system.",
        }}
        index={0}
        theme={theme}
      />,
    );

    const name = getByText("OfferPath").closest("a");
    expect(name).not.toBeNull();
    expect(name).toHaveStyle({ color: "#2c3e50", fontWeight: 700 });

    const description = getByText("AI job-search operating system.");
    expect(description).toHaveStyle({ color: "#1a1a2e", fontWeight: 400 });
  });

  it("splits a full-width colon name into bold name and normal description", () => {
    const theme = {
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
      itemSpacing: 6,
    };

    const { getByText } = render(
      <ProjectEntryContent
        item={{
          name: "OfferPath：AI求职操作系统",
          description: "",
        }}
        index={0}
        theme={theme}
      />,
    );

    const name = getByText("OfferPath");
    expect(name).toHaveStyle({ color: "#2c3e50", fontWeight: 700 });

    const description = getByText("AI求职操作系统");
    expect(description).toHaveStyle({ color: "#1a1a2e", fontWeight: 400 });
  });
});
