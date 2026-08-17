import { describe, it, expect } from "vitest";
import { markdownInlineToHtml, unwrapMarkdownBold } from "@/lib/markdownInline";
import { markdownToResume, resumeToMarkdown } from "@/components/resume/markdownConverter";
import type { ResumeData } from "@/types";

describe("unwrapMarkdownBold", () => {
  it("strips wrapping bold markers from a project name", () => {
    expect(unwrapMarkdownBold("**OpenSource Design System**")).toBe("OpenSource Design System");
  });

  it("strips inline bold markers", () => {
    expect(unwrapMarkdownBold("See **Foo** bar")).toBe("See Foo bar");
  });

  it("strips underscore emphasis", () => {
    expect(unwrapMarkdownBold("__Project X__")).toBe("Project X");
  });

  it("leaves plain text and unmatched asterisks unchanged", () => {
    expect(unwrapMarkdownBold("OpenSource Design System")).toBe("OpenSource Design System");
    expect(unwrapMarkdownBold("C* pointer")).toBe("C* pointer");
  });
});

describe("markdownInlineToHtml", () => {
  it("converts markdown bold to strong tags", () => {
    expect(markdownInlineToHtml("**Launch**")).toBe("<strong>Launch</strong>");
  });

  it("converts inline bold inside existing HTML", () => {
    expect(markdownInlineToHtml("<p>**shipped v2**</p>")).toBe("<p><strong>shipped v2</strong></p>");
  });

  it("leaves existing strong tags alone", () => {
    expect(markdownInlineToHtml("<strong>Launch</strong>")).toBe("<strong>Launch</strong>");
  });

  it("converts markdown links to anchor tags", () => {
    expect(markdownInlineToHtml("[OfferPath](https://offerpath.cc.cd/)")).toContain('<a href="https://offerpath.cc.cd/"');
  });
});

describe("markdownToResume emphasis and projects", () => {
  const base: ResumeData = { personal: { name: "" } };

  it("unwraps project names from markdown headers", () => {
    const data = markdownToResume("## Projects\n### **Foo** | https://x.com\n", base);
    expect(data.projects?.[0]?.name).toBe("Foo");
  });

  it("parses direct markdown link format for projects", () => {
    const md = `## Projects\n[OfferPath](https://offerpath.cc.cd/): AI求职操作系统\n[dify-mcp](https://github.com/alexjiaguo/dify-mcp): MCP Server 138 tools`;
    const data = markdownToResume(md, base);
    expect(data.projects).toHaveLength(2);
    expect(data.projects?.[0]?.name).toBe("OfferPath");
    expect(data.projects?.[0]?.url).toBe("https://offerpath.cc.cd/");
    expect(data.projects?.[0]?.description).toBe("AI求职操作系统");
    expect(data.projects?.[1]?.name).toBe("dify-mcp");
    expect(data.projects?.[1]?.url).toBe("https://github.com/alexjiaguo/dify-mcp");
  });

  it("parses resume-pro's bold-linked project format", () => {
    const data = markdownToResume(
      "## Projects\n- **[OfferPath](https://offerpath.cc.cd/)**: AI job-search operating system.",
      base,
    );
    expect(data.projects).toHaveLength(1);
    expect(data.projects?.[0]).toEqual({
      name: "OfferPath",
      url: "https://offerpath.cc.cd/",
      description: "AI job-search operating system.",
      tech: [],
    });
  });

  it("parses plain Chinese-colon project lines", () => {
    const data = markdownToResume(
      "## Projects\nOfferPath：AI求职操作系统\ndify-mcp：MCP Server 138 tools",
      base,
    );
    expect(data.projects).toEqual([
      { name: "OfferPath", url: undefined, description: "AI求职操作系统", tech: [] },
      { name: "dify-mcp", url: undefined, description: "MCP Server 138 tools", tech: [] },
    ]);
  });

  it("does not reintroduce asterisks on round-trip", () => {
    const parsed = markdownToResume("## Projects\n### **Apollo**\nShipped v2\n", base);
    expect(resumeToMarkdown(parsed)).not.toContain("**");
    expect(resumeToMarkdown(parsed)).toContain("### Apollo");
  });
});
