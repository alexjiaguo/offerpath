import { NextResponse } from "next/server";
import { chromium } from "playwright-core";
import chromiumAws from "@sparticuz/chromium";

// On Vercel, use @sparticuz/chromium (serverless-optimized Chromium build).
// Locally, fall back to the system-installed Chrome/Chromium.
async function getChromium() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const executablePath = await chromiumAws.executablePath();
    return chromium.launch({
      args: [...chromiumAws.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath,
      headless: true,
    });
  }
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { html, title } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const browser = await getChromium();
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });

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
    console.error("PDF generation error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate PDF", details },
      { status: 500 }
    );
  }
}
