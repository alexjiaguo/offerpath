import { describe, expect, it } from "vitest";
import { FileParserService } from "@/lib/FileParserService";
import { ResumeParserService } from "@/lib/ResumeParserService";
import { assessExtractionQuality } from "@/lib/resumeUploadPipeline";
import { groupLinesIntoSections } from "@/lib/open-resume-parser/pdf-reader";
import type { TextItem } from "@/lib/open-resume-parser/types";

function item(text: string, x: number, y: number): TextItem {
  return {
    text,
    x,
    y,
    width: text.length * 5,
    height: 10,
    fontName: "Font-Regular",
    hasEOL: true,
  };
}

describe("legacy .doc parsing fixes", () => {
  it("decodes RTF \\uN unicode escapes (CJK) correctly", async () => {
    // \u23378 = 我, \u20206? use two chars: 25105(我) 26159(是)
    const rtf = `{\\rtf1\\ansi \\par \\u25105 ?\\u26159 ? engineer}`;
    const file = new File([rtf], "resume.doc", { type: "application/msword" });
    const text = await FileParserService.parseFile(file);
    expect(text).toContain("我是");
  });

  it("handles large ASCII runs without stack overflow", async () => {
    const bigBinary = new Uint8Array(200_000);
    const header = "Microsoft Word Document ";
    for (let i = 0; i < bigBinary.length; i++) {
      bigBinary[i] = i % 2 === 0 && i > header.length ? 65 + (i % 20) : 0;
      if (i < header.length) bigBinary[i] = header.charCodeAt(i);
    }
    const file = new File([bigBinary], "big.doc", { type: "application/msword" });
    const text = await FileParserService.parseFile(file);
    expect(text.length).toBeGreaterThan(30);
  });
});

describe("ResumeParserService contact extraction", () => {
  it("captures full Chinese mobile numbers", () => {
    const result = ResumeParserService.parse(
      "Zhang Wei\nProduct Manager\n+86 13800138000\nBeijing",
      "txt"
    );
    expect(result.personal?.phone).toContain("13800138000");
  });

  it("still captures US-style numbers", () => {
    const result = ResumeParserService.parse(
      "Jane Doe\nPM\n(555) 123-4567\nNew York",
      "txt"
    );
    expect(result.personal?.phone).toContain("555");
    expect(result.personal?.phone).toContain("4567");
  });
});

describe("CJK section detection in pdf-reader", () => {
  it("splits Chinese section headings into separate sections", () => {
    const items: TextItem[] = [
      item("李明", 72, 700),
      item("产品经理", 72, 680),
      item("工作经历", 72, 650),
      item("字节跳动 产品经理 2020-至今", 72, 630),
      item("- 负责增长业务", 72, 612),
      item("教育背景", 72, 580),
      item("清华大学 本科 2016-2020", 72, 560),
    ];
    const sections = groupLinesIntoSections(items.map((i) => [i]));
    expect(Object.keys(sections)).toContain("工作经历");
    expect(Object.keys(sections)).toContain("教育背景");
    const workLines = sections["工作经历"].map((l) => l[0].text).join("\n");
    expect(workLines).toContain("字节跳动");
  });

  it("does not treat CJK content lines as headings", () => {
    const items: TextItem[] = [
      item("负责技能大赛组织工作", 72, 600),
      item("完成项目经历复盘报告一份", 72, 580),
    ];
    const sections = groupLinesIntoSections(items.map((i) => [i]));
    expect(Object.keys(sections)).not.toContain("技能大赛组织工作");
  });
});

describe("assessExtractionQuality", () => {
  it("classifies empty, sparse, and ok extractions", () => {
    expect(assessExtractionQuality({})).toBe("empty");
    expect(assessExtractionQuality({ personal: { name: "X" } })).toBe("sparse");
    expect(
      assessExtractionQuality({
        personal: { name: "X" },
        summary: "s",
        experience: [
          {
            company: "c",
            title: "t",
            start_date: "2020",
            current: false,
            bullets: [],
          },
        ],
      })
    ).toBe("ok");
  });
});
