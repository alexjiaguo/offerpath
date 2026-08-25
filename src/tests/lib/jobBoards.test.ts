import { describe, expect, it } from "vitest";
import {
  detectBoard,
  extractJobLinks,
} from "@/lib/jobBoards";

describe("detectBoard", () => {
  it("identifies the four supported ATS boards", () => {
    expect(detectBoard("https://boards.greenhouse.io/acme")).toEqual({
      kind: "greenhouse",
      org: "acme",
    });
    expect(detectBoard("https://job-boards.greenhouse.io/acme/jobs/123")).toEqual({
      kind: "greenhouse",
      org: "acme",
    });
    expect(detectBoard("https://jobs.lever.co/acme")).toEqual({
      kind: "lever",
      org: "acme",
    });
    expect(detectBoard("https://jobs.ashbyhq.com/acme")).toEqual({
      kind: "ashby",
      org: "acme",
    });
    expect(detectBoard("https://apply.workable.com/acme")).toEqual({
      kind: "workable",
      org: "acme",
    });
  });

  it("returns null for unknown or invalid URLs", () => {
    expect(detectBoard("https://careers.example.com/team")).toBeNull();
    expect(detectBoard("not a url")).toBeNull();
  });
});

describe("extractJobLinks", () => {
  it("extracts job-like anchors from generic career HTML", () => {
    const html = `
      <html><body>
        <nav><a href="/about">About us</a></nav>
        <main>
          <a href="/jobs/senior-pm">Senior Product Manager</a>
          <a href="/jobs/data-eng?ref=home">Data Engineer</a>
          <a href="/blog/post-1">Blog: our hiring philosophy</a>
        </main>
      </body></html>`;
    const jobs = extractJobLinks(html, "https://careers.example.com/team");
    const titles = jobs.map((j) => j.title);
    expect(titles).toContain("Senior Product Manager");
    expect(titles).toContain("Data Engineer");
    expect(jobs.every((j) => j.url.startsWith("https://careers.example.com"))).toBe(true);
  });

  it("caps results and skips non-job anchors", () => {
    const rows = Array.from({ length: 40 }, (_, i) => `<a href="/jobs/role-${i}">Engineer role ${i}</a>`).join("");
    const jobs = extractJobLinks(`<html><body>${rows}</body></html>`, "https://x.com/careers");
    expect(jobs.length).toBeLessThanOrEqual(25);
  });
});
