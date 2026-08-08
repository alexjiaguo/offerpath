import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { chromium } from "playwright-core";
import chromiumAws from "@sparticuz/chromium";
// @ts-expect-error - jsdom module declaration missing
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

// On Vercel, use @sparticuz/chromium (serverless-optimized Chromium build).
// Locally, fall back to the system-installed Chrome/Chromium.
async function getChromium() {
  const securityArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-local-file-access",
    "--disable-extensions",
  ];
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const executablePath = await chromiumAws.executablePath();
    return chromium.launch({
      args: [...chromiumAws.args, ...securityArgs],
      executablePath,
      headless: true,
    });
  }
  return chromium.launch({
    headless: true,
    args: securityArgs,
  });
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { html, title } = await request.json();

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "Valid HTML content string is required" },
        { status: 400 }
      );
    }

    // Sanitize user-provided HTML string for PDF rendering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domWindow = new JSDOM("").window as any;
    const purify = DOMPurify(domWindow);
    const safeHtml = purify.sanitize(html, {
      ADD_TAGS: ["style", "link", "meta"],
      ADD_ATTR: ["style", "class", "id", "media", "charset", "viewport"],
      WHOLE_DOCUMENT: true,
    });

    const browser = await getChromium();
    try {
      const page = await browser.newPage();
      await page.setContent(safeHtml, { waitUntil: "networkidle" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
      });

      const response = new NextResponse(new Uint8Array(pdfBuffer));
      response.headers.set("Content-Type", "application/pdf");
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="${title || "resume"}.pdf"`
      );
      return response;
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error("PDF generation error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate PDF", details },
      { status: 500 }
    );
  }
}
