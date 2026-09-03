// Ported from OpenResume (https://github.com/xitanggg/open-resume)
// MIT License

import type { TextItem, FeatureSet, TextItems, TextScores, Lines, Line, Subsections } from "./types";

// ── Common Features ─────────────────────────────────

const isTextItemBold = (fontName: string) =>
  fontName.toLowerCase().includes("bold");
export const isBold = (item: TextItem) => isTextItemBold(item.fontName);
export const hasLetter = (item: TextItem) => /[a-zA-Z]/.test(item.text);
export const hasNumber = (item: TextItem) => /[0-9]/.test(item.text);
export const hasComma = (item: TextItem) => item.text.includes(",");
export const getHasText = (text: string) => (item: TextItem) =>
  item.text.includes(text);
export const hasOnlyLettersSpacesAmpersands = (item: TextItem) =>
  /^[A-Za-z\s&]+$/.test(item.text);
export const hasLetterAndIsAllUpperCase = (item: TextItem) =>
  hasLetter(item) && item.text.toUpperCase() === item.text;

// Date Features
const hasYear = (item: TextItem) => /(?:19|20)\d{2}/.test(item.text);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hasMonth = (item: TextItem) =>
  MONTHS.some(
    (month) =>
      item.text.includes(month) || item.text.includes(month.slice(0, 4))
  );
const SEASONS = ["Summer", "Fall", "Spring", "Winter"];
const hasSeason = (item: TextItem) =>
  SEASONS.some((season) => item.text.includes(season));
const hasPresent = (item: TextItem) => item.text.includes("Present");
// CJK date signals: 2023年, 5月, 至今/现在/目前 (Chinese resumes score 0
// on the English-only features above, so dates were never detected).
const hasCjkDate = (item: TextItem) =>
  /[0-9]{4}年|[0-9]{1,2}月|至今|现在|目前/.test(item.text);
export const DATE_FEATURE_SETS: FeatureSet[] = [
  [hasYear, 1],
  [hasMonth, 1],
  [hasSeason, 1],
  [hasPresent, 1],
  [hasCjkDate, 1],
  [hasComma, -1],
];

// ── Feature Scoring System ──────────────────────────

const computeFeatureScores = (
  textItems: TextItems,
  featureSets: FeatureSet[]
): TextScores => {
  const textScores = textItems.map((item) => ({
    text: item.text,
    score: 0,
    match: false,
  }));

  for (let i = 0; i < textItems.length; i++) {
    const textItem = textItems[i];

    for (const featureSet of featureSets) {
      const [hasFeature, score, returnMatchingText] = featureSet;
      const result = hasFeature(textItem);
      if (result) {
        let text = textItem.text;
        if (returnMatchingText && typeof result === "object") {
          text = result[0];
        }

        const textScore = textScores[i];
        if (textItem.text === text) {
          textScore.score += score;
          if (returnMatchingText) {
            textScore.match = true;
          }
        } else {
          textScores.push({ text, score, match: true });
        }
      }
    }
  }
  return textScores;
};

export const getTextWithHighestFeatureScore = (
  textItems: TextItems,
  featureSets: FeatureSet[],
  returnEmptyStringIfHighestScoreIsNotPositive = true,
  returnConcatenatedStringForTextsWithSameHighestScore = false
) => {
  const textScores = computeFeatureScores(textItems, featureSets);

  let textsWithHighestFeatureScore: string[] = [];
  let highestScore = -Infinity;
  for (const { text, score } of textScores) {
    if (score >= highestScore) {
      if (score > highestScore) {
        textsWithHighestFeatureScore = [];
      }
      textsWithHighestFeatureScore.push(text);
      highestScore = score;
    }
  }

  if (returnEmptyStringIfHighestScoreIsNotPositive && highestScore <= 0)
    return ["", textScores] as const;

  const text = !returnConcatenatedStringForTextsWithSameHighestScore
    ? textsWithHighestFeatureScore[0] ?? ""
    : textsWithHighestFeatureScore.map((s) => s.trim()).join(" ");

  return [text, textScores] as const;
};

// ── Get Section Lines ───────────────────────────────

export const getSectionLinesByKeywords = (
  sections: { [sectionName: string]: Lines },
  keywords: string[]
) => {
  for (const sectionName in sections) {
    const hasKeyWord = keywords.some((keyword) =>
      sectionName.toLowerCase().includes(keyword)
    );
    if (hasKeyWord) {
      return sections[sectionName];
    }
  }
  return [];
};

// ── Bullet Points ───────────────────────────────────

export const BULLET_POINTS = [
  "⋅", "∙", "🞄", "•", "⦁", "⚫︎", "●", "⬤", "⚬", "○",
];

export const getBulletPointsFromLines = (lines: Lines): string[] => {
  const firstBulletPointLineIndex = getFirstBulletPointLineIdx(lines);
  if (firstBulletPointLineIndex === undefined) {
    return lines.map((line) => line.map((item) => item.text).join(" "));
  }

  let lineStr = "";
  for (const item of lines.flat()) {
    const text = item.text;
    if (!lineStr.endsWith(" ") && !text.startsWith(" ")) {
      lineStr += " ";
    }
    lineStr += text;
  }

  const commonBulletPoint = getMostCommonBulletPoint(lineStr);
  const firstBulletPointIndex = lineStr.indexOf(commonBulletPoint);
  if (firstBulletPointIndex !== -1) {
    lineStr = lineStr.slice(firstBulletPointIndex);
  }

  return lineStr
    .split(commonBulletPoint)
    .map((text) => text.trim())
    .filter((text) => !!text);
};

const getMostCommonBulletPoint = (str: string): string => {
  const bulletToCount: { [bullet: string]: number } = BULLET_POINTS.reduce(
    (acc: { [bullet: string]: number }, cur) => {
      acc[cur] = 0;
      return acc;
    },
    {}
  );
  let bulletWithMostCount = BULLET_POINTS[0];
  let bulletMaxCount = 0;
  for (const char of str) {
    if (bulletToCount.hasOwnProperty(char)) {
      bulletToCount[char]++;
      if (bulletToCount[char] > bulletMaxCount) {
        bulletWithMostCount = char;
        bulletMaxCount = bulletToCount[char];
      }
    }
  }
  return bulletWithMostCount;
};

const getFirstBulletPointLineIdx = (lines: Lines): number | undefined => {
  for (let i = 0; i < lines.length; i++) {
    for (const item of lines[i]) {
      if (BULLET_POINTS.some((bullet) => item.text.includes(bullet))) {
        return i;
      }
    }
  }
  return undefined;
};

const isWord = (str: string) => /^[^0-9]+$/.test(str);
const hasAtLeast8Words = (item: TextItem) =>
  item.text.split(/\s/).filter(isWord).length >= 8;

export const getDescriptionsLineIdx = (lines: Lines): number | undefined => {
  let idx = getFirstBulletPointLineIdx(lines);

  if (idx === undefined) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 1 && hasAtLeast8Words(line[0])) {
        idx = i;
        break;
      }
    }
  }

  return idx;
};

// ── Subsections ─────────────────────────────────────

export const divideSectionIntoSubsections = (lines: Lines): Subsections => {
  const isLineNewSubsectionByLineGap =
    createIsLineNewSubsectionByLineGap(lines);

  let subsections = createSubsections(lines, isLineNewSubsectionByLineGap);

  if (subsections.length === 1) {
    const isLineNewSubsectionByBold = (line: Line, prevLine: Line) => {
      if (
        !isBold(prevLine[0]) &&
        isBold(line[0]) &&
        !BULLET_POINTS.includes(line[0].text)
      ) {
        return true;
      }
      return false;
    };

    subsections = createSubsections(lines, isLineNewSubsectionByBold);
  }

  return subsections;
};

type IsLineNewSubsection = (line: Line, prevLine: Line) => boolean;

const createIsLineNewSubsectionByLineGap = (
  lines: Lines
): IsLineNewSubsection => {
  const lineGapToCount: { [lineGap: number]: number } = {};
  const linesY = lines.map((line) => line[0].y);
  let lineGapWithMostCount: number = 0;
  let maxCount = 0;
  for (let i = 1; i < linesY.length; i++) {
    const lineGap = Math.round(linesY[i - 1] - linesY[i]);
    if (!lineGapToCount[lineGap]) lineGapToCount[lineGap] = 0;
    lineGapToCount[lineGap] += 1;
    if (lineGapToCount[lineGap] > maxCount) {
      lineGapWithMostCount = lineGap;
      maxCount = lineGapToCount[lineGap];
    }
  }
  const subsectionLineGapThreshold = lineGapWithMostCount * 1.4;

  const isLineNewSubsection = (line: Line, prevLine: Line) => {
    return Math.round(prevLine[0].y - line[0].y) > subsectionLineGapThreshold;
  };

  return isLineNewSubsection;
};

const createSubsections = (
  lines: Lines,
  isLineNewSubsection: IsLineNewSubsection
): Subsections => {
  const subsections: Subsections = [];
  let subsection: Lines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      subsection.push(line);
      continue;
    }
    if (isLineNewSubsection(line, lines[i - 1])) {
      subsections.push(subsection);
      subsection = [];
    }
    subsection.push(line);
  }
  if (subsection.length > 0) {
    subsections.push(subsection);
  }
  return subsections;
};
