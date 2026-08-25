import * as cheerio from "cheerio";

export type BoardKind = "greenhouse" | "lever" | "ashby" | "workable" | "generic";

export interface NormalizedJob {
  title: string;
  location: string;
  url: string;
  posted_date?: string;
  salary_range?: string;
  description?: string;
  source: BoardKind;
}

export interface BoardTarget {
  kind: BoardKind;
  org: string;
}

export function detectBoard(careerUrl: string): BoardTarget | null {
  let url: URL;
  try {
    url = new URL(careerUrl.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "boards.greenhouse.io" && parts[0]) {
    return { kind: "greenhouse", org: parts[0].replace(/\/jobs.*/, "") };
  }
  if (host === "job-boards.greenhouse.io" && parts[0]) {
    return { kind: "greenhouse", org: parts[0] };
  }
  if (host === "jobs.lever.co" && parts[0]) {
    return { kind: "lever", org: parts[0] };
  }
  if (host === "jobs.ashbyhq.com" && parts[0]) {
    return { kind: "ashby", org: parts[0] };
  }
  if (host === "apply.workable.com" && parts[0]) {
    return { kind: "workable", org: parts[0] };
  }
  return null;
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "OfferPathBot/1.0" },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

interface GreenhouseJob {
  title?: string;
  location?: { name?: string };
  absolute_url?: string;
  updated_at?: string;
}

async function fetchGreenhouse(org: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${org}/jobs`
  )) as { jobs?: GreenhouseJob[] };
  return (data.jobs ?? []).map((j) => ({
    title: j.title ?? "Untitled role",
    location: j.location?.name ?? "",
    url: j.absolute_url ?? "",
    posted_date: j.updated_at?.slice(0, 10),
    source: "greenhouse" as const,
  }));
}

interface LeverPosting {
  text?: string;
  categories?: { location?: string; commitment?: string };
  hostedUrl?: string;
  createdAt?: number;
}

async function fetchLever(org: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(
    `https://api.lever.co/v0/postings/${org}?mode=json`
  )) as LeverPosting[];
  return (Array.isArray(data) ? data : []).map((p) => ({
    title: p.text ?? "Untitled role",
    location: p.categories?.location ?? "",
    url: p.hostedUrl ?? "",
    posted_date: p.createdAt
      ? new Date(p.createdAt).toISOString().slice(0, 10)
      : undefined,
    source: "lever" as const,
  }));
}

interface AshbyJob {
  title?: string;
  location?: string;
  jobUrl?: string;
  publishedAt?: string;
  isRemote?: boolean;
}

async function fetchAshby(org: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(
    `https://api.ashbyhq.com/posting-api/job-board/${org}`
  )) as { jobs?: AshbyJob[] };
  return (data.jobs ?? [])
    .filter((j) => !j.isRemote || true)
    .map((j) => ({
      title: j.title ?? "Untitled role",
      location: j.location ?? "",
      url: j.jobUrl ?? "",
      posted_date: j.publishedAt?.slice(0, 10),
      source: "ashby" as const,
    }));
}

interface WorkableJob {
  title?: string;
  country?: string;
  city?: string;
  shortlink?: string;
  url?: string;
  published_on?: string;
}

async function fetchWorkable(org: string): Promise<NormalizedJob[]> {
  const data = (await fetchJson(
    `https://apply.workable.com/api/v1/widget/accounts/${org}`
  )) as { jobs?: WorkableJob[] };
  return (data.jobs ?? []).map((j) => ({
    title: j.title ?? "Untitled role",
    location: [j.city, j.country].filter(Boolean).join(", "),
    url: j.shortlink || j.url || "",
    posted_date: j.published_on,
    source: "workable" as const,
  }));
}

const FETCHERS: Record<
  Exclude<BoardKind, "generic">,
  (org: string) => Promise<NormalizedJob[]>
> = {
  greenhouse: fetchGreenhouse,
  lever: fetchLever,
  ashby: fetchAshby,
  workable: fetchWorkable,
};

export async function fetchBoardJobs(target: BoardTarget): Promise<NormalizedJob[]> {
  if (target.kind === "generic") return [];
  return FETCHERS[target.kind](target.org);
}

/**
 * Generic HTML fallback for career pages without a known board API.
 * Extracts links whose text/anchor looks like a job posting.
 */
const NAV_TEXT =
  /^(about|blog|contact|login|log in|sign ?up|sign in|privacy|terms|home|press|media|faq|help|support|events|life|culture|benefits|teams?|departments|offices)\b/i;

export function extractJobLinks(html: string, baseUrl: string): NormalizedJob[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  const out: NormalizedJob[] = [];

  $("a[href]").each((_i, el) => {
    const anchor = $(el);
    const href = anchor.attr("href") ?? "";
    const text = (anchor.text() ?? "").replace(/\s+/g, " ").trim();
    if (text.length < 4 || text.length > 120) return;
    if (NAV_TEXT.test(text)) return;
    if (/^(mailto:|tel:|#)/i.test(href)) return;
    let abs: URL;
    try {
      abs = new URL(href, base);
    } catch {
      return;
    }
    if (abs.hostname !== base.hostname) return;

    const pathish = `${abs.pathname}${abs.search}`;
    const urlLooksLikeJob =
      /job|position|opening|career|role|vacanc|apply|requisition|req[-_/]?\d/i.test(pathish);
    const titleLooksLikeRole =
      /(engineer|manager|designer|developer|scientist|analyst|marketer|recruiter|intern|specialist|director|consultant|architect|lead\b|招聘)/i.test(
        text
      );
    if (!urlLooksLikeJob && !titleLooksLikeRole) return;

    const key = abs.toString();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      title: text,
      location: "",
      url: key,
      source: "generic",
    });
  });

  return out.slice(0, 25);
}

export async function fetchGenericPage(url: string, timeoutMs = 8000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OfferPathBot/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) throw new Error("not html");
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
