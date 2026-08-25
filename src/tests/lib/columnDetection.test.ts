import { describe, expect, it } from "vitest";
import {
  groupTextItemsIntoLines,
  splitIntoColumns,
} from "@/lib/open-resume-parser/pdf-reader";
import type { TextItem } from "@/lib/open-resume-parser/types";

function mk(text: string, x: number, y: number, width = text.length * 5): TextItem {
  return { text, x, y, width, height: 10, fontName: "F", hasEOL: true };
}

function twoColumnItems(): TextItem[] {
  const items: TextItem[] = [mk("JANE DOE — RESUME", 72, 740, 456)];
  for (let i = 0; i < 12; i++) {
    items.push(mk(`LEFT_SECTION_${i} bullet content`, 72, 700 - i * 14, 240));
  }
  for (let i = 0; i < 10; i++) {
    items.push(mk(`RIGHT_SECTION_${i} detail`, 400, 700 - i * 16, 120));
  }
  return items;
}

describe("splitIntoColumns", () => {
  it("detects a genuine two-column layout with a full-width header", () => {
    const split = splitIntoColumns(twoColumnItems());
    expect(split).not.toBeNull();
    if (!split) return;
    expect(split.fullWidth.map((t) => t.text)).toContain("JANE DOE — RESUME");
    expect(split.left.length).toBe(12);
    expect(split.right.length).toBe(10);
  });

  it("rejects single-column layouts with right-aligned dates", () => {
    const items: TextItem[] = [];
    for (let e = 0; e < 4; e++) {
      // Title lines span the whole width (crossing any would-be gutter)
      items.push(mk(`Company ${e} — Senior Role`, 72, 700 - e * 90, 430));
      items.push(mk(`Jan 202${e} - Present`, 520, 700 - e * 90, 60));
      for (let b = 0; b < 6; b++) {
        items.push(mk(`- Detailed achievement line ${e}-${b}`, 72, 682 - e * 90 - b * 13, 430));
      }
    }
    expect(splitIntoColumns(items)).toBeNull();
  });

  it("leaves small documents untouched", () => {
    const split = splitIntoColumns(twoColumnItems().slice(0, 15));
    expect(split).toBeNull();
  });
});

describe("groupTextItemsIntoLines with columns", () => {
  it("reads left column fully before the right column", () => {
    const lines = groupTextItemsIntoLines(twoColumnItems());
    const flatText = lines.map((l) => l.map((i) => i.text).join(" "));
    const headerIdx = flatText.findIndex((l) => l.includes("JANE DOE"));
    const firstRight = flatText.findIndex((l) => l.includes("RIGHT_SECTION_0"));
    const lastLeft = flatText.findIndex((l) => l.includes("LEFT_SECTION_11"));

    expect(headerIdx).toBe(0);
    expect(lastLeft).toBeGreaterThan(-1);
    expect(firstRight).toBeGreaterThan(lastLeft);

    // No line mixes left and right column content
    for (const line of flatText) {
      const hasLeft = line.includes("LEFT_SECTION");
      const hasRight = line.includes("RIGHT_SECTION");
      expect(hasLeft && hasRight).toBe(false);
    }
  });

  it("preserves title+date grouping on single-column date layouts", () => {
    const items: TextItem[] = [];
    for (let e = 0; e < 4; e++) {
      items.push(mk(`Company ${e} — Senior Role`, 72, 700 - e * 90, 430));
      items.push(mk(`Jan 202${e} - Present`, 520, 700 - e * 90, 60));
      for (let b = 0; b < 6; b++) {
        items.push(mk(`- Detailed achievement line ${e}-${b}`, 72, 682 - e * 90 - b * 13, 430));
      }
    }
    const lines = groupTextItemsIntoLines(items);
    const flatText = lines.map((l) => l.map((i) => i.text).join(" "));
    expect(flatText[0]).toContain("Company 0");
    expect(flatText[1]).toContain("Present");
    expect(flatText.slice(0, 8).join("\n")).toContain("- Detailed achievement line 0-0");
  });
});
