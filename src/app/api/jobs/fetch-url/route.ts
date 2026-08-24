import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { isPrivateHostname } from "@/lib/llmProviders";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";
import { extractTextFromHtml } from "@/lib/urlText";

export const maxDuration = 30;

const MAX_HTML_CHARS = 2_000_000;
const MAX_TEXT_CHARS = 20_000;
const REDIRECT_LIMIT = 3;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function assertPublicHttps(url: URL): string | null {
  if (url.protocol !== "https:") return "Only https:// URLs are supported.";
  if (url.username || url.password) return "URL must not embed credentials.";
  if (isPrivateHostname(url.hostname)) return "URL must not point at a private network.";
  return null;
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(`fetchurl:${clientIpFromHeaders(req.headers)}`, 10, 60_000)) {
      return bad("Too many requests. Please slow down.", 429);
    }

    const body = await req.json();
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
    if (!rawUrl) return bad("A job posting URL is required.");

    let target: URL;
    try {
      target = new URL(rawUrl);
    } catch {
      return bad("Invalid URL.");
    }
    const invalid = assertPublicHttps(target);
    if (invalid) return bad(invalid);

    let currentUrl = target.toString();
    let response: Response | null = null;

    for (let hop = 0; hop <= REDIRECT_LIMIT; hop++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(currentUrl, {
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; OfferPathBot/1.0; +https://offerpath.cc.cd)",
            Accept: "text/html,application/xhtml+xml",
          },
        });

        if ([301, 302, 303, 307, 308].includes(res.status)) {
          const location = res.headers.get("location");
          if (!location) return bad("The URL redirected without a destination.", 502);
          const next = new URL(location, currentUrl);
          const redirectInvalid = assertPublicHttps(next);
          if (redirectInvalid) return bad(redirectInvalid);
          currentUrl = next.toString();
          continue;
        }

        response = res;
        break;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return bad("The page took too long to respond.", 504);
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    }

    if (!response) return bad("Too many redirects.", 508);
    if (!response.ok) {
      return bad(`The site responded with status ${response.status}.`, 502);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html") && !contentType.includes("text")) {
      return bad("That URL does not point at a web page.", 415);
    }

    const rawHtml = (await response.text()).slice(0, MAX_HTML_CHARS);
    const text = extractTextFromHtml(rawHtml).slice(0, MAX_TEXT_CHARS);

    if (text.length < 80) {
      return bad(
        "Couldn't find readable job content on that page. Paste the description instead.",
        422
      );
    }

    return NextResponse.json({ text, finalUrl: response.url || currentUrl });
  } catch (err) {
    logger.error("[api/jobs/fetch-url] failed:", err);
    return bad("Failed to fetch the page. Please check the URL and try again.", 502);
  }
}
