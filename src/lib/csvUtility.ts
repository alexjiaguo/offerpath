import type { Job, JobStatus } from "@/types";

/* ═══════════════════════════════════════════════════
   csvUtility — Pipeline CSV Mass Import & Export
   ═══════════════════════════════════════════════════ */

const HEADERS = [
  "Title",
  "Company",
  "Location",
  "URL",
  "Status",
  "Score",
  "Tier",
  "Salary Range",
  "Notes",
  "Date Added"
];

// Helper to escape values for CSV
function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportJobsToCSV(jobs: Job[]): string {
  const lines = [HEADERS.join(",")];

  for (const job of jobs) {
    const row = [
      escapeCSVValue(job.title),
      escapeCSVValue(job.company?.name || ""),
      escapeCSVValue(job.location || ""),
      escapeCSVValue(job.url || ""),
      escapeCSVValue(job.status),
      escapeCSVValue(job.score || ""),
      escapeCSVValue(job.tier || ""),
      escapeCSVValue(job.salary_range || ""),
      escapeCSVValue(job.notes || ""),
      escapeCSVValue(job.created_at)
    ];
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function importJobsFromCSV(csvText: string): Omit<Job, "id" | "user_id" | "kanban_order" | "created_at" | "updated_at">[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse header to map columns
  const rawHeaders = parseCSVLine(lines[0]);
  const headerIndices: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerIndices[h.toLowerCase().trim()] = idx;
  });

  const parsedJobs: Omit<Job, "id" | "user_id" | "kanban_order" | "created_at" | "updated_at">[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === 0 || row.join("").trim().length === 0) continue;

    // Get indices or fallback
    const titleVal = row[headerIndices["title"]] || row[0] || "Untitled Role";
    const companyName = row[headerIndices["company"]] || row[1] || "Unknown Company";
    const locationVal = row[headerIndices["location"]] || row[2] || "";
    const urlVal = row[headerIndices["url"]] || row[3] || "";
    
    // Sanitize status mapping
    let statusVal: JobStatus = "new";
    const rawStatus = (row[headerIndices["status"]] || row[4] || "").toLowerCase().trim();
    if (["new", "evaluated", "applied", "interviewing", "offered", "rejected", "discarded", "archived"].includes(rawStatus)) {
      statusVal = rawStatus as JobStatus;
    } else if (rawStatus === "interview") {
      statusVal = "interviewing";
    } else if (rawStatus === "offer") {
      statusVal = "offered";
    }

    const scoreVal = parseFloat(row[headerIndices["score"]] || row[5] || "") || undefined;
    const tierVal = parseInt(row[headerIndices["tier"]] || row[6] || "") || undefined;
    const salaryVal = row[headerIndices["salary range"]] || row[7] || "";
    const notesVal = row[headerIndices["notes"]] || row[8] || "";

    parsedJobs.push({
      title: titleVal,
      company: {
        id: `c_imported_${Date.now()}_${i}`,
        user_id: "demo",
        name: companyName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      location: locationVal,
      url: urlVal,
      status: statusVal,
      score: scoreVal,
      tier: tierVal,
      salary_range: salaryVal,
      notes: notesVal
    });
  }

  return parsedJobs;
}
