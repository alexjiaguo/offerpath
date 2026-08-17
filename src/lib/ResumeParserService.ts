import { ResumeData, ExperienceEntry, EducationEntry, SkillItem, TechnicalSkillCategory, ProjectEntry } from '../types';

/**
 * Parses raw text (from MD, PDF, DOCX, DOC, or TXT) into a structured ResumeData object.
 */
export class ResumeParserService {

  static parse(text: string, fileType: string): Partial<ResumeData> {
    if (fileType === 'md') {
      const mdResult = this.parseMarkdown(text);
      if (!mdResult.experience?.length && !mdResult.education?.length) {
        return this.mergeParseResults(mdResult, this.parseGenericText(text));
      }
      return mdResult;
    }
    return this.parseGenericText(text);
  }

  private static mergeParseResults(
    primary: Partial<ResumeData>,
    fallback: Partial<ResumeData>
  ): Partial<ResumeData> {
    const heading = /^(professional\s+)?(summary|experience|education|skills|projects?|languages?|certifications?|工作经历|教育背景|技能)$/i;
    const primaryTitle = primary.personal?.title;
    const title = primaryTitle && !heading.test(primaryTitle)
      ? primaryTitle
      : fallback.personal?.title;
    return {
      personal: {
        name: primary.personal?.name || fallback.personal?.name || '',
        title,
        email: primary.personal?.email || fallback.personal?.email,
        phone: primary.personal?.phone || fallback.personal?.phone,
        location: primary.personal?.location || fallback.personal?.location,
        linkedin: primary.personal?.linkedin || fallback.personal?.linkedin,
        website: primary.personal?.website || fallback.personal?.website,
      },
      summary: primary.summary || fallback.summary,
      experience: primary.experience?.length ? primary.experience : fallback.experience,
      education: primary.education?.length ? primary.education : fallback.education,
      skills: primary.skills?.length ? primary.skills : fallback.skills,
      technicalSkills: primary.technicalSkills?.length ? primary.technicalSkills : fallback.technicalSkills,
      projects: primary.projects?.length ? primary.projects : fallback.projects,
      languages: primary.languages?.length ? primary.languages : fallback.languages,
      certifications: primary.certifications?.length ? primary.certifications : fallback.certifications,
    };
  }

  // ═══════════════════════════════════════════════════
  // Date helpers
  // ═══════════════════════════════════════════════════

  /**
   * Splits a date range string like "Jan 2020 - Present", "2020.01 - 2023.05",
   * "01/2020 - 05/2023", "2020年1月 - 2023年5月" into start_date, end_date, and current flag.
   */
  public static parseDateRange(dateStr: string): { start_date: string; end_date: string; current: boolean } {
    if (!dateStr) return { start_date: '', end_date: '', current: false };

    // Clean up surrounding parentheses or brackets
    const clean = dateStr.replace(/^\s*[(\[{]/, '').replace(/[)\]}]\s*$/, '').trim();

    // Check for present / current / 至今
    const isCurrent = /present|current|now|至今|现在/i.test(clean);

    // 1. First try splitting on separator surrounded by spaces (e.g., "Jan 2020 - Present", "2020-03 - 2021-05")
    let parts = clean.split(/\s+(?:–|—|-|to|~|至)\s+/i);

    // 2. If not split, try unicode dashes or tilde or 至 with optional spaces (e.g., "2020–Present", "2020~2023", "2020至2023")
    if (parts.length === 1) {
      parts = clean.split(/\s*[–—~至]\s*/);
    }

    // 3. If still not split, try "to" with optional spaces
    if (parts.length === 1) {
      parts = clean.split(/\s+to\s+/i);
    }

    // 4. If still not split, try hyphen range like "2020-2023" or "2020-Present"
    if (parts.length === 1) {
      const m = clean.match(/^(\d{4}(?:[./-]\d{1,2})?)\s*-\s*(\d{4}(?:[./-]\d{1,2})?|Present|Current|Now|至今|现在)$/i);
      if (m) {
        parts = [m[1].trim(), m[2].trim()];
      }
    }

    const start_date = parts[0]?.trim() || '';
    const endPart = parts[1]?.trim() || '';
    const current = isCurrent || /present|current|now|至今|现在/i.test(endPart);
    const end_date = current ? '' : endPart;

    return { start_date, end_date, current };
  }

  public static readonly DATE_RANGE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,]*\d{4}|\d{4}[./年-]\d{1,2}(?:[月日])?|\d{1,2}\/\d{4}|\d{4})\s*(?:–|—|-|to|~|至)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,]*\d{4}|\d{4}[./年-]\d{1,2}(?:[月日])?|\d{1,2}\/\d{4}|\d{4}|Present|Current|Now|至今|现在)/gi;

  // ═══════════════════════════════════════════════════
  // Markdown Parser (for .md files)
  // ═══════════════════════════════════════════════════

  private static parseMarkdown(md: string): Partial<ResumeData> {
    // Strip YAML frontmatter (--- ... ---) if present at the start
    const fmMatch = md.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
    const cleanMd = fmMatch ? md.slice(fmMatch[0].length) : md;
    // Strip Tailoring Notes section (resume-pro artifact, not resume content)
    const tnMatch = cleanMd.match(/\n##\s+Tailoring Notes\b/i);
    const finalMd = tnMatch ? cleanMd.slice(0, tnMatch.index) : cleanMd;

    const lines = finalMd.split('\n');
    const sections = this.splitMarkdownSections(lines);

    const personal = this.parseMarkdownHeader(lines);
    const summary = this.getSectionByKeywords(sections, ['summary', 'profile', 'objective', 'about', '个人简介', '个人总结', '简介', '概述']);
    const experience = this.parseMarkdownExperience(this.getSectionByKeywords(sections, ['experience', 'employment', 'work history', 'career', 'work experience', '工作经历', '专业经历', '工作经验', '经历']));
    const education = this.parseMarkdownEducation(this.getSectionByKeywords(sections, ['education', 'academic', '教育背景', '教育经历', '学历', '教育']));
    const skills = this.parseMarkdownSkills(this.getSectionByKeywords(sections, ['technical skill', 'key skill', 'core competenc', 'technologies', '技术技能', '技能', '核心技能', 'skill']));
    const technicalSkills = this.parseTechnicalSkills(this.getSectionByKeywords(sections, ['technical skill', '技术技能', 'technologies', 'skill', '专业技能']));
    const projects = this.parseMarkdownProjects(this.getSectionByKeywords(sections, ['project', '项目经历', '项目经验', '项目', 'personal project']));
    const languages = this.parseMarkdownList(this.getSectionByKeywords(sections, ['language', '语言能力', '语言']));
    const certifications = this.parseMarkdownList(this.getSectionByKeywords(sections, ['certification', 'certificate', 'license', '证书', '培训', '资格认证', 'certifications']));

    return { personal, summary, experience, education, skills, technicalSkills, projects, languages, certifications };
  }

  private static getSectionByKeywords(sections: Record<string, string>, keywords: string[]): string {
    for (const kw of keywords) {
      for (const name in sections) {
        if (name.toLowerCase().includes(kw.toLowerCase())) {
          return sections[name];
        }
      }
    }
    return '';
  }

  private static parseMarkdownList(text: string): string[] {
    if (!text.trim()) return [];
    return text
      .split('\n')
      .map((line) => line.replace(/^[-*•▪▫➢✓+]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(Boolean);
  }

  private static parseMarkdownProjects(text: string): ProjectEntry[] {
    if (!text.trim()) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const projects: ProjectEntry[] = [];
    let current: ProjectEntry | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Check resume-pro's bold-linked project format, as well as plain inline links.
      // Also accept plain text lines like "OfferPath: description" / "OfferPath：描述".
      const linkMatch = line.match(
        /^[-*•]?\s*(?:\*\*)?\[([^\]]+)\]\((https?:\/\/[^)]+)\)(?:\*\*)?[：:][\s\u3000–-]*(.*)/,
      );
      const colonLine = linkMatch ?? line.match(
        /^[-*•]?\s*([^：:(]+?)[：:][\s\u3000]*(.*)/,
      );
      if (colonLine) {
        if (current) projects.push(current);
        current = {
          name: (linkMatch ? linkMatch[1] : colonLine[1]).trim(),
          url: linkMatch ? linkMatch[2].trim() : undefined,
          description: (linkMatch ? linkMatch[3] : colonLine[2] || '').trim(),
        };
        continue;
      }

      // Check for bold or colon format: **OfferPath**: Description or OfferPath: Description
      const colonMatch = line.match(/^[-*•]?\s*\*\*([^*]+)\*\*[:\s–—-]*(.*)/) || line.match(/^[-*•]?\s*([^:(]+)(?:\((https?:\/\/[^)]+)\))?:\s*(.+)/);
      if (colonMatch && !line.match(/^#{1,2}\s/)) {
        if (current) projects.push(current);
        current = {
          name: colonMatch[1].replace(/\*\*/g, '').trim(),
          url: colonMatch[2]?.trim(),
          description: (colonMatch[3] || '').trim(),
        };
        continue;
      }

      const isHeader = line.match(/^#{3,4}\s+(.+)/) || line.match(/^\*\*([^*]+)\*\*/);
      if (isHeader) {
        if (current) projects.push(current);
        const headerText = (isHeader[1] || '').trim();
        const headerLink = headerText.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
        if (headerLink) {
          current = { name: headerLink[1].trim(), url: headerLink[2].trim(), description: '' };
        } else {
          const parts = headerText.split('|').map(s => s.trim());
          current = { name: parts[0].replace(/\*\*/g, '').trim(), url: parts[1] || undefined, description: '' };
        }
      } else if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
        const bullet = line.replace(/^[-*•\d.)\s]+/, '').trim();
        if (current) {
          current.description = current.description ? `${current.description}\n• ${bullet}` : `• ${bullet}`;
        } else {
          current = { name: bullet, description: '' };
        }
      } else if (current) {
        current.description = current.description ? `${current.description} ${line}` : line;
      } else {
        current = { name: line.replace(/\*\*/g, ''), description: '' };
      }
    }
    if (current) projects.push(current);
    return projects;
  }

  private static parseMarkdownHeader(lines: string[]) {
    let name = '', title = '', email = '', phone = '', linkedin = '', location = '', website = '';

    const stripEmoji = (s: string) => s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2BFF}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();
    const sectionHeading = /^(professional\s+)?(summary|experience|education|skills|technical skills|languages?|certifications?|projects?|objective|profile|about|工作经历|教育背景|技能)(\s+.*)?$/i;

    // 1. Candidate Name detection
    const nameLine = lines.find(l => l.match(/^#\s+[^#]/));
    if (nameLine) {
      const candidate = nameLine.replace(/^#\s+/, '').trim();
      if (!candidate.toLowerCase().includes('resume') && !candidate.toLowerCase().includes('curriculum vitae')) {
        name = candidate;
      }
    }

    if (!name) {
      // Try bold name or first non-empty line
      for (const line of lines.slice(0, 5)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const boldMatch = trimmed.match(/^\*\*([^*]+)\*\*$/);
        if (boldMatch && boldMatch[1].length < 40 && !sectionHeading.test(boldMatch[1])) {
          name = boldMatch[1].trim();
          break;
        }
        if (!trimmed.startsWith('#') && !trimmed.includes('@') && trimmed.length < 35 && !sectionHeading.test(trimmed)) {
          name = trimmed.replace(/\*\*/g, '').trim();
          break;
        }
      }
    }

    // 2. Candidate Title detection
    const titleLine = lines.find(l => {
      const m = l.match(/^##\s+([^#].+)/);
      if (!m) return false;
      return !sectionHeading.test(m[1].trim());
    });
    if (titleLine) {
      title = titleLine.replace(/^##\s+/, '').trim();
    }

    // 3. Contact info parsing
    const headerLines = lines.slice(0, 15);
    for (const rawLine of headerLines) {
      if (rawLine.match(/^#{1,3}\s/) && rawLine === nameLine) continue;
      const line = stripEmoji(rawLine);

      // Check for email
      const emailMatch = line.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
      if (emailMatch && !email) email = emailMatch[0];

      // Check for phone
      const phoneMatch = line.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      if (phoneMatch && !phone) phone = phoneMatch[0];

      // Check for linkedin
      const linkedinMatch = line.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/)?[\w-]+/i);
      if (linkedinMatch && !linkedin) linkedin = linkedinMatch[0];

      // Check for website / portfolio
      const lineWithoutEmail = emailMatch ? line.replace(emailMatch[0], '') : line;
      const webMatch = lineWithoutEmail.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[\w-]+|[a-zA-Z0-9-]+\.(?:dev|me|io|com|org|co))(?:\/[^\s•|·,]*)?/i);
      if (webMatch && !website && !webMatch[0].includes('linkedin.com')) {
        website = webMatch[0];
      }

      // Check for location
      if (!location) {
        if (line.includes('|') || line.includes('•') || line.includes('·') || line.includes('/')) {
          const parts = line.split(/[|•·/]/).map(p => p.trim());
          for (const p of parts) {
            if (p.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/) || p.match(/\b(United States|USA|UK|Canada|Remote|Beijing|Shanghai|Shenzhen|London|New York|San Francisco|Seattle|Toronto)\b/i)) {
              location = p;
              break;
            }
          }
        } else if (line.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/) || line.match(/\b(United States|USA|UK|Canada|Remote)\b/i)) {
          location = line.trim();
        }
      }
    }

    return { name, title, email, phone, linkedin, location, website };
  }

  private static splitMarkdownSections(lines: string[]): Record<string, string> {
    const sections: Record<string, string> = {};
    let currentSection = '';
    let content: string[] = [];

    const knownSections = /summary|experience|education|skill|language|certification|training|profile|objective|competenc|employment|project|about|career|academic|工作经历|专业经历|教育背景|教育经历|技能|技术技能|语言能力|语言|培训与认证|培训|个人项目|项目经历|证书|学历|经历/i;
    let sectionLevel = 2; // default to ##
    for (const line of lines) {
      const m = line.match(/^(#{1,4})\s+(.+)/);
      if (m && knownSections.test(m[2])) {
        sectionLevel = m[1].length;
        break;
      }
    }

    const sectionRegex = new RegExp(`^#{${sectionLevel}}\\s+(.+)`);

    for (const line of lines) {
      const sectionMatch = line.match(sectionRegex);
      const boldSectionMatch = !sectionMatch ? line.match(/^\*\*([^*]+)\*\*$/) : null;
      const isBoldSection = boldSectionMatch ? knownSections.test(boldSectionMatch[1]) : false;

      if (sectionMatch || (isBoldSection && boldSectionMatch)) {
        if (currentSection) {
          sections[currentSection] = content.join('\n').trim();
        }
        currentSection = (sectionMatch ? sectionMatch[1] : boldSectionMatch![1]).toLowerCase().trim();
        content = [];
      } else if (currentSection) {
        content.push(line);
      }
    }
    if (currentSection) {
      sections[currentSection] = content.join('\n').trim();
    }
    return sections;
  }

  private static parseMarkdownExperience(text: string): ExperienceEntry[] {
    if (!text.trim()) return [];

    // Format 1: Entries with ### or #### headers
    const headerEntries = text.split(/^#{3,4}\s+/m).filter(Boolean);
    if (headerEntries.length > 1 || (headerEntries.length === 1 && /^#{3,4}/.test(text.trim()))) {
      return headerEntries.map((entry) => {
        const lines = entry.split('\n').filter(Boolean);
        const headerLine = lines[0] || '';
        let title = '';
        let company = '';
        let dates = '';
        let location = '';

        // Check for date range in the header line itself
        const headerDateMatch = headerLine.match(ResumeParserService.DATE_RANGE_REGEX);
        if (headerDateMatch) {
          dates = headerDateMatch[0];
        }

        const cleanHeader = headerLine.replace(ResumeParserService.DATE_RANGE_REGEX, '').replace(/[()]/g, '').trim();

        if (cleanHeader.includes('|')) {
          const parts = cleanHeader.split('|').map(p => p.trim());
          title = parts[0] || '';
          company = parts[1] || '';
        } else if (cleanHeader.includes(' at ')) {
          const parts = cleanHeader.split(/\s+at\s+/i).map(p => p.trim());
          title = parts[0] || '';
          company = parts[1] || '';
        } else if (cleanHeader.includes(' - ') || cleanHeader.includes(' — ') || cleanHeader.includes(' – ')) {
          const parts = cleanHeader.split(/\s+[–—\-]\s+/).map(p => p.trim());
          title = parts[0] || '';
          company = parts[1] || '';
        } else if (cleanHeader.includes(',')) {
          const parts = cleanHeader.split(',').map(p => p.trim());
          title = parts[0] || '';
          company = parts.slice(1).join(' ').trim();
        } else {
          title = cleanHeader;
        }

        // Check line 1 for dates/location if not found in header
        let contentStartIndex = 1;
        if (lines[1]) {
          const line1 = lines[1].replace(/^\*+|\*+$/g, '').trim();
          const line1DateMatch = line1.match(ResumeParserService.DATE_RANGE_REGEX);
          const isBullet = line1.startsWith('-') || line1.startsWith('*') || line1.startsWith('•');

          if (line1DateMatch && !isBullet) {
            dates = line1DateMatch[0];
            const metaParts = line1.split('|').map(p => p.trim());
            location = metaParts.find(p => p !== dates && !p.match(ResumeParserService.DATE_RANGE_REGEX)) || '';
            contentStartIndex = 2;
          } else if (!isBullet && line1.includes('|')) {
            const metaParts = line1.split('|').map(p => p.trim());
            if (!company && metaParts[0]) company = metaParts[0];
            if (!dates && metaParts[1]) dates = metaParts[1];
            contentStartIndex = 2;
          }
        }

        const { start_date, end_date, current } = this.parseDateRange(dates);
        const bullets: string[] = [];

        for (let i = contentStartIndex; i < lines.length; i++) {
          const l = lines[i].trim();
          if (l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || l.match(/^\d+\.\s/)) {
            bullets.push(l.replace(/^[\s\-*•\d.)]+/, '').trim());
          } else if (bullets.length > 0 && l.length > 0) {
            bullets[bullets.length - 1] += ' ' + l;
          } else if (l.length > 0) {
            bullets.push(l);
          }
        }

        return { company, title, start_date, end_date, current, location, bullets: bullets.filter(Boolean) };
      });
    }

    // Format 2: Entries starting with bold text or dates
    return this.parseExperienceFromLines(text.split('\n'));
  }

  private static parseExperienceFromLines(lines: string[]): ExperienceEntry[] {
    const entries: ExperienceEntry[] = [];
    let current: ExperienceEntry | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const hasDate = line.match(ResumeParserService.DATE_RANGE_REGEX);
      const isBoldHeader = /^\*\*[^*]+\*\*/.test(line) && !line.startsWith('-');

      if (hasDate || isBoldHeader) {
        if (current && (current.title || current.company || current.bullets.length > 0)) {
          entries.push(current);
        }

        current = { company: '', title: '', start_date: '', end_date: '', current: false, bullets: [] };

        if (hasDate) {
          const { start_date, end_date, current: isCurrent } = this.parseDateRange(hasDate[0]);
          current.start_date = start_date;
          current.end_date = end_date;
          current.current = isCurrent;

          const beforeDate = line.replace(hasDate[0], '').replace(/[()]/g, '').replace(/\s*[|,·—–\-]\s*$/, '').trim();
          const parts = beforeDate.split(/[|·—–\-,]/).map(p => p.replace(/\*\*/g, '').trim()).filter(Boolean);
          if (parts.length >= 2) {
            current.title = parts[0];
            current.company = parts.slice(1).join(' ');
          } else if (parts.length === 1) {
            current.title = parts[0];
          }
        } else if (isBoldHeader) {
          const parts = line.replace(/\*\*/g, '').split(/[|—–\-]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            current.title = parts[0];
            current.company = parts[1];
          } else {
            current.title = parts[0] || '';
          }
        }
      } else if (line.match(/^[-•*+]\s/) || line.match(/^\d+\.\s/)) {
        if (current) {
          current.bullets.push(line.replace(/^[-•*+\d.)\s]+/, '').trim());
        }
      } else if (current) {
        if (current.bullets.length > 0) {
          current.bullets[current.bullets.length - 1] += ' ' + line;
        } else if (!current.company && current.title) {
          current.company = line.replace(/\*\*/g, '').trim();
        }
      }
    }

    if (current && (current.title || current.company || current.bullets.length > 0)) {
      entries.push(current);
    }

    return entries;
  }

  private static parseMarkdownEducation(text: string): EducationEntry[] {
    if (!text.trim()) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const entries: EducationEntry[] = [];
    let currentEntry: Partial<EducationEntry> | null = null;
    const institutionPattern = /(?:university|college|school|institute|academy|polytechnic|大学|学院|分校)/i;
    const degreePattern = /(?:B\.S\.?|M\.S\.?|B\.A\.?|M\.A\.?|Ph\.D\.?|MBA|B\.Eng\.?|M\.Eng\.?|B\.Tech|M\.Tech|Sc\.B|A\.B|Bachelor|Master|Doctor|Diploma|Certificate|Associate|学士|硕士|博士|本科|研究生)/i;

    for (const line of lines) {
      const clean = line.replace(/^[-•*▪▫➢✓+]\s*/, '').trim();
      const dateMatch = clean.match(ResumeParserService.DATE_RANGE_REGEX);
      const dateStr = dateMatch ? dateMatch[0] : '';
      const { start_date, end_date } = this.parseDateRange(dateStr);
      const withoutDate = clean.replace(ResumeParserService.DATE_RANGE_REGEX, '').replace(/[()]/g, '').trim();

      const parts = withoutDate.split(/[|•·,]|\s+[–—\-]\s+|[–—]/).map(p => p.replace(/\*\*/g, '').trim()).filter(Boolean);

      let institution = '';
      let degree = '';
      let field = '';

      if (parts.length >= 2) {
        const schoolPart = parts.find(p => institutionPattern.test(p));
        const degPart = parts.find(p => degreePattern.test(p));
        if (schoolPart && degPart) {
          institution = schoolPart;
          degree = degPart;
          field = parts.find(p => p !== schoolPart && p !== degPart) || '';
        } else if (schoolPart) {
          institution = schoolPart;
          degree = parts.find(p => p !== schoolPart) || '';
        } else if (degPart) {
          degree = degPart;
          institution = parts.find(p => p !== degPart) || '';
        } else {
          degree = parts[0];
          institution = parts[1];
        }
      } else if (parts.length === 1) {
        if (institutionPattern.test(parts[0])) institution = parts[0];
        else degree = parts[0];
      }

      if (institution && degree) {
        if (currentEntry && (currentEntry.institution || currentEntry.degree)) {
          entries.push({
            institution: currentEntry.institution || '',
            degree: currentEntry.degree || '',
            field: currentEntry.field || '',
            start_date: currentEntry.start_date || '',
            end_date: currentEntry.end_date || '',
          });
          currentEntry = null;
        }
        entries.push({ institution, degree, field, start_date, end_date: end_date || dateStr });
      } else if (institution) {
        if (currentEntry && currentEntry.institution) {
          entries.push({
            institution: currentEntry.institution || '',
            degree: currentEntry.degree || '',
            field: currentEntry.field || '',
            start_date: currentEntry.start_date || '',
            end_date: currentEntry.end_date || '',
          });
          currentEntry = { institution, start_date, end_date: end_date || dateStr };
        } else if (currentEntry) {
          currentEntry.institution = institution;
          if (start_date) currentEntry.start_date = start_date;
          if (end_date || dateStr) currentEntry.end_date = end_date || dateStr;
        } else {
          currentEntry = { institution, start_date, end_date: end_date || dateStr };
        }
      } else if (degree) {
        if (currentEntry && currentEntry.degree) {
          entries.push({
            institution: currentEntry.institution || '',
            degree: currentEntry.degree || '',
            field: currentEntry.field || '',
            start_date: currentEntry.start_date || '',
            end_date: currentEntry.end_date || '',
          });
          currentEntry = { degree, field, start_date, end_date: end_date || dateStr };
        } else if (currentEntry) {
          currentEntry.degree = degree;
          currentEntry.field = field;
          if (start_date) currentEntry.start_date = start_date;
          if (end_date || dateStr) currentEntry.end_date = end_date || dateStr;
        } else {
          currentEntry = { degree, field, start_date, end_date: end_date || dateStr };
        }
      }
    }

    if (currentEntry && (currentEntry.institution || currentEntry.degree)) {
      entries.push({
        institution: currentEntry.institution || '',
        degree: currentEntry.degree || '',
        field: currentEntry.field || '',
        start_date: currentEntry.start_date || '',
        end_date: currentEntry.end_date || '',
      });
    }

    return entries;
  }

  private static parseMarkdownSkills(text: string): SkillItem[] {
    if (!text.trim()) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const skills: SkillItem[] = [];
    let idCounter = 1;

    for (const line of lines) {
      const trimmed = line.replace(/^[-•*▪▫➢✓+]\s*/, '').trim();
      const catMatch = trimmed.match(/^\**([^:*]+)\**:\s*(.+)/);
      if (catMatch) {
        const items = catMatch[2].split(/[,|•·]/).map(s => s.trim()).filter(Boolean);
        for (const name of items) {
          skills.push({ id: String(idCounter++), name: name.replace(/\*\*/g, ''), isHighlighted: false });
        }
      } else if (trimmed.includes(',')) {
        const items = trimmed.split(',').map(s => s.replace(/\*\*/g, '').trim()).filter(Boolean);
        for (const name of items) {
          skills.push({ id: String(idCounter++), name: name.replace(/\*\*/g, ''), isHighlighted: name.includes('**') });
        }
      } else if (trimmed) {
        skills.push({ id: String(idCounter++), name: trimmed.replace(/\*\*/g, ''), isHighlighted: trimmed.includes('**') });
      }
    }
    return skills;
  }

  // ═══════════════════════════════════════════════════
  // Generic Text Parser (for PDF, DOCX, DOC, TXT)
  // ═══════════════════════════════════════════════════

  private static parseGenericText(text: string): Partial<ResumeData> {
    const sections = this.detectSections(text);
    const personal = this.extractContactInfo(text);

    return {
      personal,
      summary: sections['summary'] || sections['professional summary'] || sections['profile'] || sections['objective'] || sections['about'] || sections['个人简介'] || sections['个人总结'] || sections['简介'] || '',
      experience: this.parseGenericExperience(sections['experience'] || sections['work experience'] || sections['professional experience'] || sections['employment'] || sections['work history'] || sections['relevant experience'] || sections['工作经历'] || sections['工作经验'] || sections['经历'] || ''),
      education: this.parseGenericEducation(sections['education'] || sections['academic'] || sections['academic background'] || sections['教育背景'] || sections['教育经历'] || sections['学历'] || ''),
      skills: this.parseGenericSkills(sections['skills'] || sections['technical skills'] || sections['core competencies'] || sections['competencies'] || sections['technologies'] || sections['key skills'] || sections['专业技能'] || sections['技能'] || sections['技术技能'] || ''),
      technicalSkills: this.parseTechnicalSkills(sections['technical skills'] || sections['skills'] || sections['technologies'] || sections['技术技能'] || sections['专业技能'] || ''),
      projects: this.parseMarkdownProjects(sections['projects'] || sections['project experience'] || sections['项目经历'] || sections['项目经验'] || sections['项目'] || ''),
      languages: this.parseMarkdownList(sections['languages'] || sections['语言能力'] || sections['语言'] || ''),
      certifications: this.parseMarkdownList(sections['certifications'] || sections['certificates'] || sections['证书'] || sections['培训'] || sections['资格认证'] || ''),
    };
  }

  private static detectSections(text: string): Record<string, string> {
    const lines = text.split('\n');
    const sectionKeywords = [
      'summary', 'professional summary', 'profile', 'objective', 'about', 'about me', 'executive summary',
      'experience', 'work experience', 'professional experience', 'employment', 'work history', 'relevant experience', 'career history', 'employment history',
      'education', 'academic', 'academic background', 'educational background',
      'skills', 'technical skills', 'core competencies', 'competencies', 'technologies', 'key skills', 'technical expertise', 'skills & tools', 'core technical skills',
      'languages', 'certifications', 'certificates', 'licenses', 'awards', 'honors',
      'projects', 'project experience', 'key projects', 'publications', 'volunteer', 'interests', 'additional information',
      // Chinese section keywords
      '工作经历', '工作经验', '专业经历', '经历',
      '教育背景', '教育经历', '学历背景', '学历', '教育',
      '专业技能', '技能特长', '技能清单', '技术技能', '核心技能', '技能',
      '项目经历', '项目经验', '个人项目', '主要项目',
      '个人总结', '个人简介', '自我评价', '简介', '关于我',
      '语言能力', '语言', '培训与认证', '荣誉证书', '证书', '资格证书'
    ];

    const sections: Record<string, string> = {};
    let currentSection = '';
    let content: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const lowerLine = line.toLowerCase().replace(/[:\-_=|·•\s#*]+$/, '').replace(/^[#*\s\d.]+/, '').replace(/\s+/g, ' ').trim();

      const isHeading = (
        sectionKeywords.some(k => lowerLine === k) ||
        (line.length > 2 && line.length < 50 && line === line.toUpperCase() && /[A-Z]/.test(line) &&
          sectionKeywords.some(k => lowerLine.includes(k))) ||
        (line.length <= 60 && !line.endsWith('.') && !line.match(/^[-•*▪▫➢✓\d]/) &&
          sectionKeywords.some(k => {
            return lowerLine === k ||
              lowerLine.startsWith(k + ' ') ||
              lowerLine.startsWith(k + ' & ') ||
              lowerLine.startsWith(k + ' and ') ||
              lowerLine.startsWith(k + '/') ||
              lowerLine.startsWith(k + ' &') ||
              lowerLine.endsWith(' ' + k);
          }))
      );

      if (isHeading) {
        if (currentSection) {
          sections[currentSection] = content.join('\n').trim();
        }
        const match = sectionKeywords.find(k => lowerLine === k) ||
                      sectionKeywords.find(k => lowerLine.includes(k));
        currentSection = match || lowerLine;
        content = [];
      } else if (currentSection) {
        content.push(lines[i]);
      }
    }
    if (currentSection) {
      sections[currentSection] = content.join('\n').trim();
    }
    return sections;
  }

  private static extractContactInfo(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const email = emailMatch ? emailMatch[0] : '';
    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/)?[\w-]+/i);
    const linkedin = linkedinMatch ? linkedinMatch[0] : '';
    const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[\w-]+|[a-zA-Z0-9-]+\.(?:dev|me|io|com|org|co))(?:\/[^\s]*)?/i);
    const website = (websiteMatch && !websiteMatch[0].includes('linkedin.com') && !emailMatch?.[0]?.includes(websiteMatch[0])) ? websiteMatch[0] : '';

    let name = '';
    let title = '';
    let location = '';

    const headerLines = lines.slice(0, 15);

    for (const line of headerLines) {
      const lower = line.toLowerCase();
      if (line.includes('@') || line.match(/^\+?\d/) || lower.includes('linkedin') || lower.includes('http')) continue;
      if (lower.match(/^(summary|experience|education|skills|objective|profile|about|technical|core|competencies|certifications|projects|languages|工作经历|教育背景|专业技能)/)) continue;
      if (line.match(/^[-•*▪▫➢✓]\s/)) continue;

      if (!name) {
        const cleaned = line.replace(/[#*]/g, '').trim();
        const words = cleaned.split(/\s+/);
        if (words.length >= 1 && words.length <= 5 && cleaned.length < 50 && !cleaned.includes(':')) {
          name = cleaned;
        }
        continue;
      }
      if (!title) {
        const cleaned = line.replace(/[#*]/g, '').trim();
        const parts = cleaned.split(/[|,·•]/).map(p => p.trim()).filter(Boolean);
        title = parts[0] || cleaned;
        for (const part of parts) {
          if (part.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/) || part.match(/\b(United States|USA|UK|Canada|Remote|Beijing|Shanghai|Shenzhen|London|New York|San Francisco|Seattle)\b/i)) {
            location = part;
          }
        }
        continue;
      }
      if (!location && (line.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/) || line.match(/\b(United States|USA|UK|Canada|Remote|Beijing|Shanghai|Shenzhen|London|New York|San Francisco|Seattle)\b/i))) {
        location = line;
      }
    }

    return { name, title, email, phone, linkedin, location, website };
  }

  private static parseGenericExperience(text: string): ExperienceEntry[] {
    if (!text.trim()) return [];

    const lines = text.split('\n').map(l => l.trim());

    // First pass: find all date line indices
    const dateInfos: { lineIdx: number; dateStr: string; start_date: string; end_date: string; current: boolean }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(ResumeParserService.DATE_RANGE_REGEX);
      if (match) {
        const parsed = this.parseDateRange(match[0]);
        dateInfos.push({ lineIdx: i, dateStr: match[0], ...parsed });
      }
    }

    if (dateInfos.length === 0) {
      return this.parseExperienceWithoutDates(lines);
    }

    const entries: ExperienceEntry[] = [];

    for (let d = 0; d < dateInfos.length; d++) {
      const info = dateInfos[d];
      // Header lines for this entry:
      const headerLines: string[] = [];
      const beforeDate = lines[info.lineIdx].replace(info.dateStr, '').replace(/\s*[|,·—–\-]\s*$/, '').trim();

      if (beforeDate.includes('|') || beforeDate.includes(' at ') || beforeDate.includes(' - ') || beforeDate.includes(' – ') || (beforeDate.includes(',') && !beforeDate.match(/^[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}$/))) {
        headerLines.push(beforeDate);
      } else {
        const headerStart = d > 0 ? dateInfos[d - 1].lineIdx + 1 : 0;
        const nonBulletCandidates: string[] = [];

        for (let i = info.lineIdx - 1; i >= headerStart; i--) {
          const l = lines[i];
          if (!l) continue;
          const isBullet = l.match(/^[-•*▪▫➢✓]\s/) || l.match(/^\d+\.\s/) || l.match(/^\s{2,}/);
          if (isBullet) {
            break; // Stop going backwards once we encounter a bullet or continuation from the previous job
          }
          nonBulletCandidates.unshift(l);
          if (nonBulletCandidates.length >= 2) break;
        }

        if (nonBulletCandidates.length > 0) {
          headerLines.push(...nonBulletCandidates);
        }
        if (beforeDate) {
          headerLines.push(beforeDate);
        }
      }

      // Collect bullet lines: from current date line + 1 to next date line
      const nextDateIdx = d + 1 < dateInfos.length ? dateInfos[d + 1].lineIdx : lines.length;
      const bullets: string[] = [];
      let currentBullet = '';
      let hasStartedBullets = false;
      let extraLocation: string | undefined;

      for (let i = info.lineIdx + 1; i < nextDateIdx; i++) {
        const line = lines[i];
        if (!line) continue;
        const isBulletStart = line.match(/^[-•*▪▫➢✓]\s/) || line.match(/^\d+\.\s/);

        if (isBulletStart) {
          hasStartedBullets = true;
          if (currentBullet) bullets.push(currentBullet);
          currentBullet = line.replace(/^[-•*▪▫➢✓\d.)\s]+/, '').trim();
        } else if (hasStartedBullets) {
          currentBullet += ' ' + line;
        } else {
          // Line before any bullets started (e.g. location or subtitle)
          if (!extraLocation && (line.match(/^[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}$/) || line.match(/\b(Remote|USA|UK|China|California|New York)\b/i))) {
            extraLocation = line;
          }
        }
      }
      if (currentBullet) bullets.push(currentBullet);

      const { title, company, location } = this.parseExperienceHeader(headerLines);

      entries.push({
        company,
        title,
        location: location || extraLocation,
        start_date: info.start_date,
        end_date: info.end_date,
        current: info.current,
        bullets: bullets.filter(Boolean),
      });
    }

    return entries;
  }

  private static parseExperienceWithoutDates(lines: string[]): ExperienceEntry[] {
    const entries: ExperienceEntry[] = [];
    let currentEntry: ExperienceEntry | null = null;

    for (const line of lines) {
      if (!line) continue;

      if (line.match(/^[-•*▪▫➢✓]\s/) || line.match(/^\d+\.\s/)) {
        if (currentEntry) {
          currentEntry.bullets.push(line.replace(/^[-•*▪▫➢✓\d.)\s]+/, '').trim());
        }
      } else {
        if (currentEntry && currentEntry.bullets.length > 0) {
          entries.push(currentEntry);
          currentEntry = null;
        }

        if (!currentEntry) {
          const { title, company, location } = this.parseExperienceHeader([line]);
          currentEntry = { company, title, location, start_date: '', bullets: [] };
        } else if (!currentEntry.location && (line.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/) || line.match(/\b(Remote|USA|UK|China)\b/i))) {
          currentEntry.location = line;
        }
      }
    }

    if (currentEntry) {
      entries.push(currentEntry);
    }

    return entries;
  }

  private static parseExperienceHeader(headerLines: string[]): { title: string; company: string; location?: string } {
    if (headerLines.length === 0) return { title: '', company: '' };

    let location: string | undefined;
    const parts: string[] = [];
    const locationPattern = /^[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}$/;
    const countryPattern = /\b(United States|USA|UK|Canada|Remote|Beijing|Shanghai|Shenzhen|London|New York|San Francisco|Seattle)\b/i;

    for (const line of headerLines) {
      if (locationPattern.test(line) || countryPattern.test(line)) {
        if (!location) location = line;
        continue;
      }

      let split = line.split(/[|·•—–]/).map(p => p.trim()).filter(Boolean);
      if (split.length === 1) {
        const atSplit = split[0].split(/\s+at\s+/i).map(p => p.trim()).filter(Boolean);
        if (atSplit.length >= 2) {
          split = atSplit;
        }
      }
      parts.push(...split);
    }

    if (parts.length === 0) return { title: '', company: '', location };

    const locationIdx = parts.findIndex(p => locationPattern.test(p) || countryPattern.test(p));
    if (locationIdx >= 0) {
      if (!location) location = parts.splice(locationIdx, 1)[0];
      else parts.splice(locationIdx, 1);
    }

    const titleKeywords = /(engineer|developer|manager|designer|analyst|consultant|director|lead|senior|junior|intern|specialist|architect|scientist|coordinator|officer|administrator|head|founder|president|partner|associate|principal|staff|工程师|经理|主管|总监|专员|负责人|顾问)/i;

    let title = '';
    let company = '';

    if (parts.length === 1) {
      if (titleKeywords.test(parts[0])) {
        title = parts[0];
      } else {
        company = parts[0];
      }
    } else {
      if (titleKeywords.test(parts[0])) {
        title = parts[0];
        company = parts.slice(1).join(' ');
      } else if (parts.length > 1 && titleKeywords.test(parts[1])) {
        company = parts[0];
        title = parts[1];
      } else {
        title = parts[0];
        company = parts.slice(1).join(' ');
      }
    }

    return { title, company, location };
  }

  private static parseGenericEducation(text: string): EducationEntry[] {
    if (!text.trim()) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const entries: EducationEntry[] = [];
    let currentEntry: Partial<EducationEntry> = {};

    const degreePattern = /(?:B\.S\.?|M\.S\.?|B\.A\.?|M\.A\.?|Ph\.D\.?|MBA|B\.Eng\.?|M\.Eng\.?|B\.Tech|M\.Tech|Sc\.B|A\.B|Bachelor|Master|Doctor|Diploma|Certificate|Associate|学士|硕士|博士|本科|研究生)/i;
    const institutionPattern = /(?:university|college|school|institute|academy|polytechnic|大学|学院|分校)/i;

    for (const line of lines) {
      const trimmed = line.trim().replace(/^[-•*▪▫➢✓+]\s*/, '');

      if (trimmed.match(/^[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}$/)) {
        if (entries.length > 0 && !entries[entries.length - 1].location) {
          entries[entries.length - 1].location = trimmed;
        }
        continue;
      }

      const dateMatch = trimmed.match(ResumeParserService.DATE_RANGE_REGEX);
      if (dateMatch) {
        const { start_date, end_date } = this.parseDateRange(dateMatch[0]);
        const beforeDate = trimmed.replace(dateMatch[0], '').replace(/[()]/g, '').trim();
        const cleaned = beforeDate.replace(/\s*[|,·—–\-]\s*$/, '').trim();

        if (cleaned) {
          const parts = cleaned.split(/[|•·,]|\s+[–—\-]\s+|[–—]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            const school = parts.find(p => institutionPattern.test(p));
            const deg = parts.find(p => degreePattern.test(p));
            if (school && deg) {
              currentEntry.institution = school;
              currentEntry.degree = deg;
              currentEntry.field = parts.find(p => p !== school && p !== deg) || '';
            } else if (school) {
              currentEntry.institution = school;
              currentEntry.degree = parts.find(p => p !== school) || '';
            } else if (deg) {
              currentEntry.degree = deg;
              currentEntry.institution = parts.find(p => p !== deg) || '';
            } else {
              currentEntry.degree = parts[0];
              currentEntry.institution = parts.slice(1).join(' ');
            }
          } else if (degreePattern.test(parts[0])) {
            currentEntry.degree = parts[0];
          } else if (institutionPattern.test(parts[0])) {
            currentEntry.institution = parts[0];
          } else {
            currentEntry.degree = parts[0];
          }
        }

        currentEntry.start_date = start_date;
        currentEntry.end_date = end_date;

        entries.push({
          institution: currentEntry.institution || '',
          degree: currentEntry.degree || '',
          end_date: currentEntry.end_date || '',
          start_date: currentEntry.start_date || '',
          field: currentEntry.field || '',
          location: currentEntry.location || '',
        });
        currentEntry = {};
        continue;
      }

      if (institutionPattern.test(trimmed)) {
        if (currentEntry.institution || currentEntry.degree) {
          entries.push({
            institution: currentEntry.institution || '',
            degree: currentEntry.degree || '',
            end_date: currentEntry.end_date || '',
            start_date: currentEntry.start_date || '',
            field: currentEntry.field || '',
            location: currentEntry.location || '',
          });
          currentEntry = {};
        }
        currentEntry.institution = trimmed;
      } else if (degreePattern.test(trimmed)) {
        currentEntry.degree = trimmed;
      } else if (!currentEntry.institution && !currentEntry.degree) {
        currentEntry.degree = trimmed;
      } else if (!currentEntry.institution) {
        currentEntry.institution = trimmed;
      } else if (!currentEntry.degree) {
        currentEntry.degree = trimmed;
      }
    }

    if (currentEntry.institution || currentEntry.degree) {
      entries.push({
        institution: currentEntry.institution || '',
        degree: currentEntry.degree || '',
        end_date: currentEntry.end_date || '',
        start_date: currentEntry.start_date || '',
        field: currentEntry.field || '',
        location: currentEntry.location || '',
      });
    }
    return entries;
  }

  private static parseGenericSkills(text: string): SkillItem[] {
    if (!text.trim()) return [];
    let items: string[];
    if (text.includes(',')) {
      items = text.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      items = text.split(/[\n•\-*▪▫➢✓|]/).map(s => s.trim()).filter(Boolean);
    }
    const flat: string[] = [];
    for (const item of items) {
      if (item.includes(':')) {
        const [, skills] = item.split(':');
        if (skills) {
          flat.push(...skills.split(/[,|•·]/).map(s => s.trim()).filter(Boolean));
        }
      } else {
        flat.push(item);
      }
    }
    return flat.slice(0, 60).map((name, i) => ({
      id: String(i + 1),
      name: name.replace(/\*\*/g, '').trim(),
      isHighlighted: false,
    }));
  }

  private static parseTechnicalSkills(text: string): TechnicalSkillCategory[] {
    if (!text.trim()) return [];
    const categories: TechnicalSkillCategory[] = [];
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.replace(/^[-•*▪▫➢✓+]\s*/, '').trim();
      const match = trimmed.match(/^\**([^:*]+)\**:\s*(.+)/);
      if (match) {
        categories.push({
          id: String(categories.length + 1),
          category: match[1].trim(),
          skills: match[2].trim(),
        });
      }
    }
    return categories;
  }
}
