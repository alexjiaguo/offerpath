import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import {
  detectBoard,
  fetchBoardJobs,
  extractJobLinks,
  fetchGenericPage,
  type NormalizedJob,
} from "@/lib/jobBoards";

export const maxDuration = 60;

const MAX_COMPANIES = 10;

interface CompanyInput {
  name?: string;
  career_url?: string;
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(`scan:${clientIpFromHeaders(req.headers)}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many scan requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const companies: CompanyInput[] = Array.isArray(body?.companies)
      ? body.companies.slice(0, MAX_COMPANIES)
      : [];
    if (companies.length === 0) {
      return NextResponse.json({ error: "No companies provided." }, { status: 400 });
    }

    const results = await Promise.all(
      companies.map(async (company) => {
        const name = String(company.name ?? "Unknown").slice(0, 80);
        const careerUrl = String(company.career_url ?? "").trim();
        if (!careerUrl) {
          return { company: name, jobs: [] as NormalizedJob[], error: "No career URL set." };
        }
        try {
          const board = detectBoard(careerUrl);
          if (board) {
            const jobs = await fetchBoardJobs(board);
            return { company: name, jobs, error: jobs.length ? undefined : "Board returned no openings." };
          }
          const html = await fetchGenericPage(careerUrl);
          return {
            company: name,
            jobs: extractJobLinks(html, careerUrl),
            error: undefined,
          };
        } catch (err) {
          logger.warn(`[discover/scan] ${name} failed:`, err);
          const msg =
            err instanceof DOMException && err.name === "AbortError"
              ? "Timed out."
              : err instanceof Error
                ? err.message
                : "Fetch failed.";
          return { company: name, jobs: [] as NormalizedJob[], error: msg };
        }
      })
    );

    const total = results.reduce((acc, r) => acc + r.jobs.length, 0);
    return NextResponse.json({
      results,
      total,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error("[discover/scan] unhandled:", err);
    return NextResponse.json({ error: "Scan failed." }, { status: 500 });
  }
}
