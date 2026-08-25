// Ported from OpenResume (https://github.com/xitanggg/open-resume)
// MIT License

import type { TextItem, TextItems, Line, Lines, ResumeSectionToLines } from "./types";
import { PDFJS_WORKER_SRC } from "@/lib/pdfWorker";
import {
  BULLET_POINTS,
  hasLetterAndIsAllUpperCase,
  hasOnlyLettersSpacesAmpersands,
  isBold,
} from "./helpers";

export function normalizePdfHyphens(text: string): string {
  return text.replace(/[\u002D\u00AD\u2010\u2011]/g, "-");
}

export function resolveFontName(
  commonObjs: { has?: (id: string) => boolean; get: (id: string) => { name?: string } | undefined },
  fontId: string
): string {
  if (!fontId) return "";
  try {
    if (typeof commonObjs.has === "function" && !commonObjs.has(fontId)) {
      return fontId;
    }
    const fontObj = commonObjs.get(fontId);
    return fontObj?.name || fontId;
  } catch {
    return fontId;
  }
}

// ── PDF Reading ─────────────────────────────────────

const MAX_PDF_PAGES = 100;

// Lazy-load pdfjs to avoid worker issues during SSR
let pdfjsModule: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjsModule) {
    pdfjsModule = await import("pdfjs-dist");
    pdfjsModule.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  }
  return pdfjsModule;
}

interface PdfjsTextItem {
  str: string;
  dir?: string;
  transform?: number[];
  width: number;
  height: number;
  fontName?: string;
  hasEOL?: boolean;
}

/**
 * Step 1: Read a PDF file into text items with positional data.
 * Uses an ArrayBuffer (works in both browser and server contexts).
 */
export const readPdfFromFile = async (file: File): Promise<TextItems> => {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new Error(`PDF has ${pdf.numPages} pages. Maximum is ${MAX_PDF_PAGES}.`);
  }

  let textItems: TextItems = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Wait for font data to be loaded so we can resolve font names
    await page.getOperatorList();
    const commonObjs = page.commonObjs as unknown as {
      has?: (id: string) => boolean;
      get: (id: string) => { name?: string } | undefined;
    };

    const pageTextItems = textContent.items.map((item) => {
      const raw = item as unknown as PdfjsTextItem;
      const text = raw.str || "";
      const transform = raw.transform || [0, 0, 0, 0, 0, 0];
      const x = transform[4];
      const y = transform[5];
      const fontName = resolveFontName(commonObjs, raw.fontName || "");
      const newText = normalizePdfHyphens(text);

      return {
        text: newText,
        x,
        y,
        width: raw.width || 0,
        height: raw.height || 0,
        fontName,
        hasEOL: raw.hasEOL || false,
      } as TextItem;
    });

    textItems.push(...pageTextItems);
  }

  // Filter out empty space noise
  const isEmptySpace = (textItem: TextItem) =>
    !textItem.hasEOL && textItem.text.trim() === "";
  textItems = textItems.filter((textItem) => !isEmptySpace(textItem));

  return textItems;
};

// ── Line Grouping ───────────────────────────────────

/**
 * Step 2: Group text items into lines based on hasEOL flags and
 * merge adjacent items that are closer than a typical char width.
 */
const groupByHasEOL = (textItems: TextItems): Lines => {
  const lines: Lines = [];
  let line: Line = [];

  for (const item of textItems) {
    if (item.hasEOL) {
      if (item.text.trim() !== "") {
        line.push({ ...item });
      }
      lines.push(line);
      line = [];
    } else if (item.text.trim() !== "") {
      line.push({ ...item });
    }
  }
  if (line.length > 0) {
    lines.push(line);
  }
  return lines;
};

const groupByY = (textItems: TextItems): Lines => {
  const sorted = [...textItems].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
    return a.x - b.x;
  });

  const lines: Lines = [];
  let line: Line = [];
  let lastY: number | null = null;

  for (const item of sorted) {
    if (!item.text.trim()) continue;
    if (lastY !== null && Math.abs(item.y - lastY) > 2) {
      if (line.length > 0) lines.push(line);
      line = [];
    }
    line.push({ ...item });
    lastY = item.y;
  }
  if (line.length > 0) lines.push(line);
  return lines;
};

export const groupTextItemsIntoLines = (textItems: TextItems): Lines => {
  // Two-column layouts need their streams read sequentially (left column
  // top-to-bottom, then right); naive Y-grouping interleaves them.
  const split = splitIntoColumns(textItems);
  if (split) {
    return [
      ...groupSingleStream(split.fullWidth),
      ...groupSingleStream(split.left),
      ...groupSingleStream(split.right),
    ];
  }
  return groupSingleStream(textItems);
};

function groupSingleStream(textItems: TextItems): Lines {
  const eolCount = textItems.filter((item) => item.hasEOL).length;
  const useY = textItems.length > 0 && eolCount < Math.max(1, textItems.length * 0.15);
  const lines = useY ? groupByY(textItems) : groupByHasEOL(textItems);

  // Merge adjacent text items that are closer than a typical char width
  const typicalCharWidth = getTypicalCharWidth(lines.flat());
  for (const line of lines) {
    for (let i = line.length - 1; i > 0; i--) {
      const currentItem = line[i];
      const leftItem = line[i - 1];
      const leftItemXEnd = leftItem.x + leftItem.width;
      const distance = currentItem.x - leftItemXEnd;
      if (distance <= typicalCharWidth) {
        if (shouldAddSpaceBetweenText(leftItem.text, currentItem.text)) {
          leftItem.text += " ";
        }
        leftItem.text += currentItem.text;
        const currentItemXEnd = currentItem.x + currentItem.width;
        leftItem.width = currentItemXEnd - leftItem.x;
        line.splice(i, 1);
      }
    }
  }

  return lines;
}

interface ColumnSplit {
  left: TextItems;
  right: TextItems;
  fullWidth: TextItems;
}

/**
 * Conservative two-column detector. Deliberately strict: it must never fire
 * on the common single-column-with-right-aligned-dates layout, where a
 * "gutter" exists but the right side holds only short date strings.
 */
export function splitIntoColumns(textItems: TextItems): ColumnSplit | null {
  if (textItems.length < 20) return null;

  const minX = Math.min(...textItems.map((t) => t.x));
  const maxX = Math.max(...textItems.map((t) => t.x + t.width));
  const span = maxX - minX;
  if (span < 200) return null;

  const BUCKETS = 100;
  const occupied = new Array<boolean>(BUCKETS).fill(false);
  for (const item of textItems) {
    // Full-width elements (name headers, section rules) would occupy every
    // bucket and hide real gutters — exclude them from occupancy.
    if (item.width > span * 0.6) continue;
    const startB = Math.floor(((item.x - minX) / span) * BUCKETS);
    const endB = Math.ceil(((item.x + item.width - minX) / span) * BUCKETS);
    for (let b = Math.max(0, startB); b <= Math.min(BUCKETS - 1, endB); b++) {
      occupied[b] = true;
    }
  }

  const zoneStart = Math.floor(BUCKETS * 0.3);
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let b = zoneStart; b <= Math.ceil(BUCKETS * 0.7); b++) {
    if (!occupied[b]) {
      if (curStart === -1) curStart = b;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }
  if (bestLen < 5) return null;

  const gutterX0 = minX + (bestStart / BUCKETS) * span;
  const gutterX1 = minX + ((bestStart + bestLen) / BUCKETS) * span;

  const left: TextItems = [];
  const right: TextItems = [];
  const fullWidth: TextItems = [];
  let crossedChars = 0;
  let totalChars = 0;

  for (const item of textItems) {
    const chars = item.text.trim().length;
    totalChars += chars;
    const itemEnd = item.x + item.width;
    if (itemEnd <= gutterX0) left.push(item);
    else if (item.x >= gutterX1) right.push(item);
    else {
      fullWidth.push(item);
      crossedChars += chars;
    }
  }

  if (left.length < 8 || right.length < 8) return null;

  const rightChars = right.reduce((a, t) => a + t.text.trim().length, 0);
  if (totalChars === 0) return null;
  if (rightChars / totalChars < 0.15) return null;
  if (crossedChars / totalChars > 0.25) return null;

  const distinctY = new Set(right.map((t) => Math.round(t.y)));
  if (distinctY.size < 3) return null;

  return { left, right, fullWidth };
}

const shouldAddSpaceBetweenText = (leftText: string, rightText: string) => {
  const leftTextEnd = leftText[leftText.length - 1];
  const rightTextStart = rightText[0];
  const conditions = [
    [":", ",", "|", ".", ...BULLET_POINTS].includes(leftTextEnd) &&
      rightTextStart !== " ",
    leftTextEnd !== " " && ["|", ...BULLET_POINTS].includes(rightTextStart),
  ];
  return conditions.some((condition) => condition);
};

const getTypicalCharWidth = (textItems: TextItems): number => {
  textItems = textItems.filter((item) => item.text.trim() !== "");

  const heightToCount: { [height: number]: number } = {};
  let commonHeight = 0;
  let heightMaxCount = 0;

  const fontNameToCount: { [fontName: string]: number } = {};
  let commonFontName = "";
  let fontNameMaxCount = 0;

  for (const item of textItems) {
    const { text, height, fontName } = item;
    if (!heightToCount[height]) heightToCount[height] = 0;
    heightToCount[height]++;
    if (heightToCount[height] > heightMaxCount) {
      commonHeight = height;
      heightMaxCount = heightToCount[height];
    }

    if (!fontNameToCount[fontName]) fontNameToCount[fontName] = 0;
    fontNameToCount[fontName] += text.length;
    if (fontNameToCount[fontName] > fontNameMaxCount) {
      commonFontName = fontName;
      fontNameMaxCount = fontNameToCount[fontName];
    }
  }

  const commonTextItems = textItems.filter(
    (item) => item.fontName === commonFontName && item.height === commonHeight
  );
  const [totalWidth, numChars] = commonTextItems.reduce(
    (acc, cur) => {
      return [acc[0] + cur.width, acc[1] + cur.text.length];
    },
    [0, 0]
  );
  return numChars > 0 ? totalWidth / numChars : 1;
};

// ── Section Grouping ────────────────────────────────

const PROFILE_SECTION = "profile";

const SECTION_TITLE_PRIMARY_KEYWORDS = [
  "experience", "education", "project", "skill",
];
const SECTION_TITLE_SECONDARY_KEYWORDS = [
  "job", "course", "extracurricular", "objective", "summary", "award", "honor", "project",
];
// Chinese section headings are matched by exact title text since the
// bold/uppercase heuristics below do not apply to CJK characters.
const CJK_SECTION_TITLES = [
  "工作经历", "工作经验", "专业经历", "职业经历",
  "教育背景", "教育经历", "学历背景",
  "技能特长", "专业技能", "技术技能", "核心技能", "技能",
  "项目经历", "项目经验", "个人项目", "主要项目",
  "个人总结", "个人简介", "自我评价",
  "语言能力", "资格证书", "荣誉证书",
];

const isCjkSectionTitle = (text: string) => {
  const normalized = text.replace(/[\s:：]+/g, "");
  return normalized.length > 0 && CJK_SECTION_TITLES.includes(normalized);
};
const SECTION_TITLE_KEYWORDS = [
  ...SECTION_TITLE_PRIMARY_KEYWORDS,
  ...SECTION_TITLE_SECONDARY_KEYWORDS,
];

const isSectionTitle = (line: Line, lineNumber: number) => {
  const hasNoItemInLine = line.length === 0;
  if (hasNoItemInLine) {
    return false;
  }

  const textItem = line[0];
  const text = textItem.text.trim();

  if (isCjkSectionTitle(text)) {
    return true;
  }

  const matchesKeyword = SECTION_TITLE_KEYWORDS.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );

  if (lineNumber < 2 && !matchesKeyword) {
    return false;
  }

  // Main heuristic: bold AND all uppercase
  if (isBold(textItem) && hasLetterAndIsAllUpperCase(textItem)) {
    return true;
  }

  // Fallback heuristic: keyword match with formatting constraints
  const textHasAtMost2Words =
    text.split(" ").filter((s) => s !== "&").length <= 2;
  const startsWithCapitalLetter = /[A-Z]/.test(text.slice(0, 1));

  if (
    textHasAtMost2Words &&
    hasOnlyLettersSpacesAmpersands(textItem) &&
    startsWithCapitalLetter &&
    SECTION_TITLE_KEYWORDS.some((keyword) =>
      text.toLowerCase().includes(keyword)
    )
  ) {
    return true;
  }

  return false;
};

/**
 * Step 3: Group lines into sections. Every section (except profile)
 * starts with a section title that takes up the entire line.
 */
export const groupLinesIntoSections = (lines: Lines): ResumeSectionToLines => {
  const sections: ResumeSectionToLines = {};
  let sectionName: string = PROFILE_SECTION;
  let sectionLines: Lines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = line[0]?.text.trim();
    if (isSectionTitle(line, i)) {
      sections[sectionName] = [...sectionLines];
      sectionName = text;
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }
  if (sectionLines.length > 0) {
    sections[sectionName] = [...sectionLines];
  }

  return sections;
};
