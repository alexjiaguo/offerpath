import type { ResumeData } from "@/types";
import { FileParserService } from "@/lib/FileParserService";
import { ResumeParserService } from "@/lib/ResumeParserService";
import { parseResumeFromPdf } from "@/lib/open-resume-parser";
import { getLLMConfig, parseResumeWithAI } from "@/lib/aiService";

export type ParseUploadResult =
  | { ok: true; data: Partial<ResumeData> }
  | { ok: false; error: string };

const EMPTY_ERROR =
  "We couldn't extract resume information from this file. Try a text-based PDF, DOCX, DOC, or Markdown file, or start from scratch.";

export function isExtractedResumeEmpty(data: Partial<ResumeData>): boolean {
  const noName = !data.personal?.name?.trim();
  const noSummary = !data.summary?.trim();
  const noExperience = !data.experience || data.experience.length === 0;
  return noName && noSummary && noExperience;
}

export async function parseUploadedResume(file: File): Promise<ParseUploadResult> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "txt";

  try {
    let parsed: Partial<ResumeData> = {};
    let rawText = "";

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

    if (isExtractedResumeEmpty(parsed) && getLLMConfig()) {
      if (!rawText) {
        rawText = await FileParserService.parseFile(file);
      }
      parsed = await parseResumeWithAI(rawText, extension);
    }

    if (isExtractedResumeEmpty(parsed)) {
      return { ok: false, error: EMPTY_ERROR };
    }

    return { ok: true, data: parsed };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Parsing failed.",
    };
  }
}
