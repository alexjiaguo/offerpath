import { describe, it, expect } from "vitest";
import {
  exportJobsToCSV,
  parseCSVLine,
  importJobsFromCSV,
} from "@/lib/csvUtility";
import type { Job } from "@/types";

describe("csvUtility", () => {
  describe("parseCSVLine", () => {
    it("should parse simple comma-separated values", () => {
      expect(parseCSVLine("a,b,c")).toEqual(["a", "b", "c"]);
    });

    it("should parse values with quotes and commas", () => {
      expect(parseCSVLine('"hello, world",foo,"bar""baz"')).toEqual([
        "hello, world",
        "foo",
        'bar"baz',
      ]);
    });

    it("should parse values with newlines in quotes", () => {
      expect(parseCSVLine('"line1\nline2",foo')).toEqual([
        "line1\nline2",
        "foo",
      ]);
    });
  });

  describe("exportJobsToCSV", () => {
    it("should export jobs to CSV correctly", () => {
      const testJobs: Job[] = [
        {
          id: "1",
          user_id: "demo",
          title: "Senior Engineer",
          company: {
            id: "c1",
            user_id: "demo",
            name: "Test Co",
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
          location: "Remote",
          url: "https://example.com",
          status: "applied",
          score: 85,
          tier: 2,
          salary_range: "$150k-$180k",
          notes: "Great team!",
          created_at: "2026-01-15",
          updated_at: "2026-01-15",
        },
      ];
      const csv = exportJobsToCSV(testJobs);
      expect(csv).toContain("Senior Engineer");
      expect(csv).toContain("Test Co");
      expect(csv).toContain("Remote");
    });
  });

  describe("importJobsFromCSV", () => {
    it("should import jobs from CSV correctly", () => {
      const testCSV = `Title,Company,Location,URL,Status,Score,Tier,Salary Range,Notes,Date Added
Junior Developer,Startup Inc,New York,https://startup.example.com,interviewing,75,1,$100k-$120k,Good culture,2026-02-01
`;
      const imported = importJobsFromCSV(testCSV);
      expect(imported).toHaveLength(1);
      expect(imported[0].title).toBe("Junior Developer");
      expect(imported[0].company.name).toBe("Startup Inc");
      expect(imported[0].status).toBe("interviewing");
    });
  });
});
