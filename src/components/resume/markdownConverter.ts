import type {
  ResumeData,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
} from "@/types";

/* ═══════════════════════════════════════════════════
   Markdown <-> ResumeData converter
   Format spec:
     # Name
     email | phone | location | linkedin | website

     ## Summary
     Summary text...

     ## Experience
     ### Title | Company | Location | Start - End
     - Bullet 1
     - Bullet 2

     ## Education
     ### Institution | Degree | Field | Start - End
     GPA: 3.9

     ## Skills
     Skill1, Skill2, Skill3

     ## Technical Skills
     ### Category: skill1, skill2

     ## Languages
     English, Spanish

     ## Certifications
     Cert1, Cert2

     ## Projects
     ### Name | URL
     Description text.
     Tech: tech1, tech2
   ═══════════════════════════════════════════════════ */

// ── Serialize ResumeData → Markdown ──────────────────

export function resumeToMarkdown(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.personal;

  if (p?.name) lines.push(`# ${p.name}`);

  const contactParts = [
    p?.email,
    p?.phone,
    p?.location,
    p?.linkedin,
    p?.website,
  ].filter(Boolean);
  if (contactParts.length) lines.push(contactParts.join(" | "));

  if (data.summary) {
    lines.push("", "## Summary", data.summary);
  }

  if (data.experience?.length) {
    lines.push("", "## Experience");
    for (const exp of data.experience) {
      const header = [
        exp.title || "",
        exp.company || "",
        exp.location || "",
        [exp.start_date, exp.current ? "Present" : exp.end_date].filter(Boolean).join(" - "),
      ].filter(Boolean).join(" | ");
      lines.push("", `### ${header}`);
      for (const b of exp.bullets || []) {
        lines.push(`- ${b.replace(/<[^>]*>/g, "")}`);
      }
    }
  }

  if (data.education?.length) {
    lines.push("", "## Education");
    for (const edu of data.education) {
      const header = [
        edu.institution || "",
        edu.degree || "",
        edu.field || "",
        [edu.start_date, edu.end_date].filter(Boolean).join(" - "),
      ].filter(Boolean).join(" | ");
      lines.push("", `### ${header}`);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
    }
  }

  if (data.skills?.length) {
    lines.push("", "## Skills");
    lines.push(
      data.skills
        .map((s) => (typeof s === "string" ? s : s.name))
        .join(", "),
    );
  }

  if (data.technicalSkills?.length) {
    lines.push("", "## Technical Skills");
    for (const cat of data.technicalSkills) {
      lines.push(`### ${cat.category}: ${cat.skills}`);
    }
  }

  if (data.languages?.length) {
    lines.push("", "## Languages", data.languages.join(", "));
  }

  if (data.certifications?.length) {
    lines.push("", "## Certifications", data.certifications.join(", "));
  }

  if (data.projects?.length) {
    lines.push("", "## Projects");
    for (const proj of data.projects) {
      const header = [proj.name, proj.url].filter(Boolean).join(" | ");
      lines.push("", `### ${header}`);
      if (proj.description) lines.push(proj.description);
      if (proj.tech?.length) lines.push(`Tech: ${proj.tech.join(", ")}`);
    }
  }

  return lines.join("\n");
}

// ── Parse Markdown → ResumeData ──────────────────────

export function markdownToResume(md: string, base: ResumeData): ResumeData {
  const lines = md.split("\n");
  const data: ResumeData = {
    ...base,
    personal: { ...(base.personal || { name: "" }) },
    experience: [],
    education: [],
    skills: [],
    technicalSkills: [],
    languages: [],
    certifications: [],
    projects: [],
    summary: "",
  };

  let i = 0;
  let currentSection = "";
  let currentExp: ExperienceEntry | null = null;
  let currentEdu: EducationEntry | null = null;
  let currentProj: ProjectEntry | null = null;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // H1 - Name + contact line
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      data.personal!.name = trimmed.slice(2).trim();
      // Next non-empty line is contact info
      i++;
      if (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("#")) {
        const contact = lines[i].trim();
        const parts = contact.split("|").map((s) => s.trim());
        // Heuristic: email contains @, phone starts with + or has digits, etc.
        for (const part of parts) {
          if (part.includes("@")) data.personal!.email = part;
          else if (/^[+\d\s()\-]+$/.test(part) && part.length > 3) data.personal!.phone = part;
          else if (part.includes("linkedin")) data.personal!.linkedin = part;
          else if (part.includes("http") || part.includes(".")) data.personal!.website = part;
          else if (!data.personal!.location) data.personal!.location = part;
        }
      }
      i++;
      continue;
    }

    // H2 - Section header
    if (trimmed.startsWith("## ")) {
      currentSection = trimmed.slice(3).trim().toLowerCase();
      i++;

      // Flush any pending entry
      if (currentExp) { data.experience!.push(currentExp); currentExp = null; }
      if (currentEdu) { data.education!.push(currentEdu); currentEdu = null; }
      if (currentProj) { data.projects!.push(currentProj); currentProj = null; }

      // Handle single-line sections (Skills, Languages, Certifications)
      if (currentSection === "skills") {
        // Collect until next ## or end
        const skillLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("## ")) {
          if (lines[i].trim()) skillLines.push(lines[i].trim());
          i++;
        }
        const skills = skillLines.join(" ").split(",").map((s) => s.trim()).filter(Boolean);
        data.skills = skills.map((s, idx) => ({ id: `skill-${idx}`, name: s, isHighlighted: false }));
        continue;
      }
      if (currentSection === "languages") {
        const langLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("## ")) {
          if (lines[i].trim()) langLines.push(lines[i].trim());
          i++;
        }
        data.languages = langLines.join(" ").split(",").map((s) => s.trim()).filter(Boolean);
        continue;
      }
      if (currentSection === "certifications") {
        const certLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("## ")) {
          if (lines[i].trim()) certLines.push(lines[i].trim());
          i++;
        }
        data.certifications = certLines.join(" ").split(",").map((s) => s.trim()).filter(Boolean);
        continue;
      }
      if (currentSection === "summary") {
        const summaryLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("## ")) {
          summaryLines.push(lines[i]);
          i++;
        }
        data.summary = summaryLines.join("\n").trim();
        continue;
      }
      continue;
    }

    // H3 - Entry header (Experience, Education, Projects, Technical Skills)
    if (trimmed.startsWith("### ")) {
      // Flush previous entry
      if (currentExp) { data.experience!.push(currentExp); currentExp = null; }
      if (currentEdu) { data.education!.push(currentEdu); currentEdu = null; }
      if (currentProj) { data.projects!.push(currentProj); currentProj = null; }

      const header = trimmed.slice(4).trim();
      const parts = header.split("|").map((s) => s.trim());

      if (currentSection === "experience") {
        // Title | Company | Location | Start - End
        const datePart = parts.length > 1 ? parts[parts.length - 1] : "";
        const [startDate, endDate] = parseDateRange(datePart);
        currentExp = {
          title: parts[0] || "",
          company: parts[1] || "",
          location: parts[2] || "",
          start_date: startDate,
          end_date: endDate,
          current: endDate?.toLowerCase() === "present",
          bullets: [],
        };
      } else if (currentSection === "education") {
        // Institution | Degree | Field | Start - End
        const datePart = parts.length > 1 ? parts[parts.length - 1] : "";
        const [startDate, endDate] = parseDateRange(datePart);
        currentEdu = {
          institution: parts[0] || "",
          degree: parts[1] || "",
          field: parts[2] || "",
          start_date: startDate,
          end_date: endDate,
        };
      } else if (currentSection === "projects") {
        // Name | URL
        currentProj = {
          name: parts[0] || "",
          description: "",
          url: parts[1] || undefined,
          tech: [],
        };
      } else if (currentSection === "technical skills") {
        // Category: skills
        const colonIdx = header.indexOf(":");
        if (colonIdx >= 0) {
          data.technicalSkills!.push({
            id: `ts-${data.technicalSkills!.length}`,
            category: header.slice(0, colonIdx).trim(),
            skills: header.slice(colonIdx + 1).trim(),
          });
        } else {
          data.technicalSkills!.push({
            id: `ts-${data.technicalSkills!.length}`,
            category: header,
            skills: "",
          });
        }
      }
      i++;
      continue;
    }

    // Bullet point
    if (trimmed.startsWith("- ") && currentExp) {
      currentExp.bullets.push(trimmed.slice(2));
      i++;
      continue;
    }

    // GPA line
    if (trimmed.toLowerCase().startsWith("gpa:") && currentEdu) {
      currentEdu.gpa = trimmed.slice(4).trim();
      i++;
      continue;
    }

    // Tech line for projects
    if (trimmed.toLowerCase().startsWith("tech:") && currentProj) {
      currentProj.tech = trimmed.slice(5).split(",").map((s) => s.trim()).filter(Boolean);
      i++;
      continue;
    }

    // Description line for projects
    if (currentProj && trimmed && !trimmed.startsWith("#")) {
      currentProj.description = currentProj.description
        ? `${currentProj.description}\n${trimmed}`
        : trimmed;
      i++;
      continue;
    }

    i++;
  }

  // Flush final entries
  if (currentExp) data.experience!.push(currentExp);
  if (currentEdu) data.education!.push(currentEdu);
  if (currentProj) data.projects!.push(currentProj);

  // Clean up empty arrays to avoid overwriting with empties
  if (!data.experience?.length) delete data.experience;
  if (!data.education?.length) delete data.education;
  if (!data.skills?.length) delete data.skills;
  if (!data.technicalSkills?.length) delete data.technicalSkills;
  if (!data.languages?.length) delete data.languages;
  if (!data.certifications?.length) delete data.certifications;
  if (!data.projects?.length) delete data.projects;
  if (!data.summary) delete data.summary;

  return data;
}

function parseDateRange(dateStr: string): [string, string] {
  if (!dateStr) return ["", ""];
  const parts = dateStr.split("-").map((s) => s.trim());
  if (parts.length >= 2) {
    return [parts[0], parts.slice(1).join("-").trim()];
  }
  return [dateStr, ""];
}
