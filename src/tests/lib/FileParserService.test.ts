import { describe, it, expect } from "vitest";
import { FileParserService } from "@/lib/FileParserService";

describe("FileParserService MIME handling", () => {
  it("accepts markdown with application/octet-stream", async () => {
    const file = new File(["# Priya Anand\n"], "resume.md", {
      type: "application/octet-stream",
    });
    const text = await FileParserService.parseFile(file);
    expect(text).toContain("Priya Anand");
  });

  it("accepts markdown with an empty MIME type", async () => {
    const file = new File(["# Jane Doe\n"], "resume.md", { type: "" });
    const text = await FileParserService.parseFile(file);
    expect(text).toContain("Jane Doe");
  });

  it("accepts text/markdown", async () => {
    const file = new File(["# Alex\n"], "resume.md", { type: "text/markdown" });
    const text = await FileParserService.parseFile(file);
    expect(text).toContain("Alex");
  });

  it("rejects a mismatched MIME for pdf extensions", async () => {
    const file = new File(["not a pdf"], "resume.pdf", { type: "image/png" });
    await expect(FileParserService.parseFile(file)).rejects.toThrow(/MIME type/i);
  });

  it("rejects legacy .doc files with a convert message if empty/corrupted", async () => {
    const file = new File(["ole"], "old.doc", { type: "application/msword" });
    await expect(FileParserService.parseFile(file)).rejects.toThrow(/docx/i);
  });

  it("parses RTF-based .doc files successfully", async () => {
    const rtf = "{\\rtf1\\ansi\\deff0\\par John Doe\\par Senior Engineer\\par}";
    const file = new File([rtf], "resume.doc", { type: "application/msword" });
    const text = await FileParserService.parseFile(file);
    expect(text).toContain("John Doe");
    expect(text).toContain("Senior Engineer");
  });
});
