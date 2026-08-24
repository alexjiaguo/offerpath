import type { ResumeData } from "@/types";
import { FileParserService } from "@/lib/FileParserService";
import { ResumeParserService } from "@/lib/ResumeParserService";
import { parseResumeFromPdf } from "@/lib/open-resume-parser";
import { getLLMConfig, parseResumeWithAI } from "@/lib/aiService";

export type ParseUploadResult =
  | {
      ok: true;
      data: Partial<ResumeData>;
      aiUsed?: boolean;
      warning?: string;
    }
  | { ok: false; error: string };

const EMPTY_ERROR =
  "We couldn't extract resume information from this file. Try a text-based PDF, DOCX, DOC, or Markdown file, or start from scratch.";

export function assessExtractionQuality(
  data: Partial<ResumeData>
): "empty" | "sparse" | "ok" {
  const signals = [
    Boolean(data.personal?.name?.trim()),
    Boolean(data.summary?.trim()),
    (data.experience?.length ?? 0) > 0,
    (data.education?.length ?? 0) > 0,
    (data.skills?.length ?? 0) > 0 || (data.technicalSkills?.length ?? 0) > 0,
    (data.projects?.length ?? 0) > 0,
  ].filter(Boolean).length;

  if (signals === 0) return "empty";
  if (signals <= 2) return "sparse";
  return "ok";
}

export function isExtractedResumeEmpty(data: Partial<ResumeData>): boolean {
  return assessExtractionQuality(data) === "empty";
}

export async function parseUploadedResume(
  file: File,
  options?: { allowAIFallback?: boolean }
): Promise<ParseUploadResult> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "txt";

  try {
    let parsed: Partial<ResumeData> = {};
    let rawText = "";
    let aiUsed = false;

    if (extension === "pdf") {
      try {
        parsed = await parseResumeFromPdf(file);
      } catch {
        parsed = {};
      }

      if (isExtractedResumeEmpty(parsed)) {
        rawText = await FileParserService.parseFile(file);
        parsed = ResumeParserService.parse(rawText, extension);
      }
    } else {
      rawText = await FileParserService.parseFile(file);
      parsed = ResumeParserService.parse(rawText, extension);
    }

    const allowAI = options?.allowAIFallback !== false && Boolean(getLLMConfig());

    if (isExtractedResumeEmpty(parsed)) {
      if (!allowAI) {
        if (!rawText) {
          rawText = await FileParserService.parseFile(file);
          parsed = ResumeParserService.parse(rawText, extension);
        }
        if (isExtractedResumeEmpty(parsed)) {
          return { ok: false, error: EMPTY_ERROR };
        }
      } else {
        if (!rawText) {
          rawText = await FileParserService.parseFile(file);
        }
        parsed = await parseResumeWithAI(rawText, extension);
        aiUsed = true;
      }
    }

    if (isExtractedResumeEmpty(parsed)) {
      return { ok: false, error: EMPTY_ERROR };
    }

    const sparseWarning =
      assessExtractionQuality(parsed) === "sparse"
        ? "We could only extract part of this resume. Please review the sections and fill in anything that's missing."
        : undefined;

    return { ok: true, data: parsed, aiUsed, warning: sparseWarning };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Parsing failed.",
    };
  }
}
