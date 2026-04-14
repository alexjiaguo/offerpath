import { ResumeData, ExperienceEntry, EducationEntry, SkillItem, TechnicalSkillCategory } from '../types';

/**
 * Parses raw text (from MD, PDF, or DOCX) into a structured ResumeData object.
 */
export class ResumeParserService {
  
  static parse(text: string, fileType: string): Partial<ResumeData> {
    if (fileType === 'md') {
      return this.parseMarkdown(text);
    }
    return this.parseGenericText(text);
  }

  private static parseMarkdown(md: string): Partial<ResumeData> {
    const lines = md.split('\n');
    const sections = this.splitMarkdownSections(lines);

    const personal = this.parseMarkdownHeader(lines);
    const summary = sections['professional summary'] || sections['summary'] || sections['profile'] || sections['objective'] || '';
    const experience = this.parseMarkdownExperience(sections['professional experience'] || sections['experience'] || sections['work experience'] || sections['employment'] || '');
    const education = this.parseMarkdownEducation(sections['education'] || sections['academic'] || '');
    const skills = this.parseMarkdownSkills(sections['skills'] || sections['key skills'] || sections['core competencies'] || '');
    const technicalSkills = this.parseTechnicalSkills(sections['technical skills'] || sections['skills'] || '');

    return { personal, summary, experience, education, skills, technicalSkills };
  }

  private static parseMarkdownHeader(lines: string[]) {
    let name = '', title = '', email = '', phone = '', linkedin = '', location = '';

    const stripEmoji = (s: string) => s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2BFF}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();

    const nameLine = lines.find(l => l.match(/^#\s+[^#]/));
    if (nameLine) name = nameLine.replace(/^#\s+/, '').trim();

    const titleLine = lines.find(l => l.match(/^##\s+[^#]/));
    if (titleLine) title = titleLine.replace(/^##\s+/, '').trim();

    const headerLines = lines.slice(0, 10);
    for (const rawLine of headerLines) {
      if (rawLine.match(/^#{1,3}\s/)) continue;
      const line = stripEmoji(rawLine);
      
      if (line.includes('|') && (line.includes('@') || line.includes('linkedin') || line.match(/\+?\d{2,}/))) {
        const parts = line.split('|').map(p => p.trim());
        for (const part of parts) {
          const clean = part.trim();
          if (!clean) continue;
          if (clean.includes('@') && clean.includes('.')) email = clean;
          else if (clean.match(/\+?\d[\d\s\-().]{6,}/)) phone = clean;
          else if (clean.match(/linkedin/i)) linkedin = clean;
          else if (!title && !clean.match(/[|@]/) && clean.length > 3) location = clean;
          else if (clean.match(/^\w[\w\s]+,\s*\w/)) location = clean;
        }
      }
    }

    return { name, title, email, phone, linkedin, location };
  }

  private static splitMarkdownSections(lines: string[]): Record<string, string> {
    const sections: Record<string, string> = {};
    let currentSection = '';
    let content: string[] = [];

    let sectionLevel = 2;
    const knownSections = /summary|experience|education|skills|languages|certifications|training|profile|objective|competencies|employment|projects/i;
    for (const line of lines) {
      const m3 = line.match(/^###\s+(.+)/);
      const m2 = line.match(/^##\s+(.+)/);
      if (m3 && knownSections.test(m3[1])) { sectionLevel = 3; break; }
      if (m2 && knownSections.test(m2[1])) { sectionLevel = 2; break; }
    }

    const sectionRegex = sectionLevel === 3 ? /^###\s+(.+)/ : /^##\s+(.+)/;

    for (const line of lines) {
      const sectionMatch = line.match(sectionRegex);
      if (sectionMatch) {
        if (currentSection) {
          sections[currentSection] = content.join('\n').trim();
        }
        currentSection = sectionMatch[1].toLowerCase().trim();
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
    const entries = text.split(/^#{3,4}\s+/m).filter(Boolean);
    return entries.map((entry) => {
      const lines = entry.split('\n').filter(Boolean);
      const headerParts = lines[0]?.split('|').map(p => p.trim()) || [];
      const title = headerParts[0] || '';
      const company = headerParts[1] || '';
      const metaRaw = (lines[1] || '').replace(/^\*+|\*+$/g, '').trim();
      const metaParts = metaRaw.split('|').map(p => p.trim());
      const dates = metaParts[0] || '';
      const location = metaParts[1] || '';
      const bullets = lines.slice(2)
        .filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
        .map(l => l.replace(/^[\s\-•]+/, '').trim())
        .filter(Boolean);
      return { company, title, start_date: dates, location, bullets };
    });
  }

  private static parseMarkdownEducation(text: string): EducationEntry[] {
    if (!text.trim()) return [];
    const bulletLines = text.split('\n').filter(l => l.trim().match(/^[-•]\s/));
    if (bulletLines.length > 0) {
      return bulletLines.map((line) => {
        const clean = line.replace(/^[\s\-•]+/, '').trim();
        const m = clean.match(/\*\*(.+?)\*\*,?\s*(.+?)(?:\s*\((.+?)\))?$/);
        if (m) {
          return { degree: m[1].trim(), institution: m[2].trim(), end_date: m[3]?.trim() || '', field: '' };
        }
        return { degree: clean, institution: '', end_date: '', field: '' };
      });
    }

    const entries = text.split(/^#{3,4}\s+/m).filter(Boolean);
    return entries.map((entry) => {
      const lines = entry.split('\n').filter(Boolean);
      const degree = lines[0]?.trim() || '';
      const metaParts = (lines[1] || '').split('|').map(p => p.trim());
      const institution = metaParts[0] || '';
      const end_date = metaParts[1] || '';
      return { institution, degree, end_date, field: '' };
    });
  }

  private static parseMarkdownSkills(text: string): SkillItem[] {
    if (!text.trim()) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const skills: SkillItem[] = [];
    let idCounter = 1;

    for (const line of lines) {
      const trimmed = line.replace(/^[\s\-•*]+/, '').trim();
      const catMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*(.+)/);
      if (catMatch) {
        const items = catMatch[2].split(',').map(s => s.trim()).filter(Boolean);
        for (const name of items) {
          skills.push({ id: String(idCounter++), name, isHighlighted: false });
        }
      } else if (trimmed.includes(',')) {
        const items = trimmed.split(',').map(s => s.replace(/\*\*/g, '').trim()).filter(Boolean);
        for (const name of items) {
          skills.push({ id: String(idCounter++), name, isHighlighted: name.includes('**') });
        }
      } else if (trimmed) {
        skills.push({ id: String(idCounter++), name: trimmed.replace(/\*\*/g, ''), isHighlighted: trimmed.includes('**') });
      }
    }
    return skills;
  }

  private static parseGenericText(text: string): Partial<ResumeData> {
    const sections = this.detectSections(text);
    const personal = this.extractContactInfo(text);
    
    return {
      personal,
      summary: sections['summary'] || sections['professional summary'] || sections['profile'] || sections['objective'] || '',
      experience: this.parseGenericExperience(sections['experience'] || sections['work experience'] || sections['professional experience'] || sections['employment'] || ''),
      education: this.parseGenericEducation(sections['education'] || sections['academic'] || ''),
      skills: this.parseGenericSkills(sections['skills'] || sections['technical skills'] || sections['core competencies'] || sections['competencies'] || ''),
      technicalSkills: this.parseTechnicalSkills(sections['technical skills'] || sections['skills'] || ''),
    };
  }

  private static detectSections(text: string): Record<string, string> {
    const lines = text.split('\n');
    const sectionKeywords = [
      'summary', 'professional summary', 'profile', 'objective', 'about',
      'experience', 'work experience', 'professional experience', 'employment', 'work history',
      'education', 'academic', 'academic background',
      'skills', 'technical skills', 'core competencies', 'competencies', 'technologies',
      'languages', 'certifications', 'certificates', 'licenses', 'awards',
      'projects', 'publications', 'volunteer', 'interests'
    ];

    const sections: Record<string, string> = {};
    let currentSection = '';
    let content: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase().replace(/[:\-—_|]/g, '').trim();
      
      const isHeading = (
        sectionKeywords.some(k => lowerLine === k) ||
        (line.length > 2 && line.length < 40 && line === line.toUpperCase() && /[A-Z]/.test(line) && sectionKeywords.some(k => lowerLine.includes(k)))
      );

      if (isHeading) {
        if (currentSection) {
          sections[currentSection] = content.join('\n').trim();
        }
        currentSection = sectionKeywords.find(k => lowerLine.includes(k)) || lowerLine;
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
    const firstLines = text.split('\n').slice(0, 10).join('\n');
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    const email = emailMatch ? emailMatch[0] : '';
    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
    const linkedinMatch = text.match(/(?:linkedin\.com\/in\/[\w-]+|linkedin\.com\/[\w-]+)/i);
    const linkedin = linkedinMatch ? linkedinMatch[0] : '';

    const lines = firstLines.split('\n').map(l => l.trim()).filter(Boolean);
    let name = '';
    let title = '';
    let location = '';

    for (const line of lines) {
      if (line.includes('@') || line.match(/^\+?\d/) || line.toLowerCase().includes('linkedin')) continue;
      if (!name) {
        name = line.replace(/[#*]/g, '').trim();
        continue;
      }
      if (!title) {
        const parts = line.split(/[|,·]/).map(p => p.trim());
        title = parts[0] || '';
        if (parts.length > 1) location = parts[parts.length - 1];
        continue;
      }
      if (!location && (line.toLowerCase().includes('ca') || line.includes(','))) {
        location = line;
      }
    }

    return { name, title, email, phone, linkedin, location };
  }

  private static parseGenericExperience(text: string): ExperienceEntry[] {
    if (!text.trim()) return [];
    const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,]*\d{4}|2\d{3})\s*[–\-—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,]*\d{4}|2\d{3}|Present|Current)/gi;
    const lines = text.split('\n');
    const entries: ExperienceEntry[] = [];
    let currentEntry: Partial<ExperienceEntry> | null = null;
    let bullets: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const dateMatch = trimmed.match(datePattern);
      if (dateMatch) {
        if (currentEntry) {
          entries.push({
            company: currentEntry.company || '',
            title: currentEntry.title || '',
            start_date: currentEntry.start_date || '',
            location: currentEntry.location || '',
            bullets: [...bullets],
          });
        }
        const start_date = dateMatch[0];
        const beforeDate = trimmed.replace(start_date, '').trim().replace(/[|,·]/g, '').trim();
        currentEntry = { start_date };
        bullets = [];
        if (beforeDate) {
          const parts = beforeDate.split(/[|,·]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            currentEntry.title = parts[0];
            currentEntry.company = parts[1];
          } else {
            currentEntry.company = parts[0];
          }
        }
        continue;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
        bullets.push(trimmed.replace(/^[\-•*\d.)\s]+/, '').trim());
        continue;
      }
      if (currentEntry && !currentEntry.title) {
        currentEntry.title = trimmed;
      } else if (currentEntry && !currentEntry.company) {
        currentEntry.company = trimmed;
      }
    }
    if (currentEntry) {
      entries.push({
        company: currentEntry.company || '',
        title: currentEntry.title || '',
        start_date: currentEntry.start_date || '',
        location: currentEntry.location || '',
        bullets: [...bullets],
      });
    }
    return entries;
  }

  private static parseGenericEducation(text: string): EducationEntry[] {
    if (!text.trim()) return [];
    const lines = text.split('\n').filter(l => l.trim());
    const entries: EducationEntry[] = [];
    let currentEntry: Partial<EducationEntry> = {};
    for (const line of lines) {
      const trimmed = line.trim();
      const dateMatch = trimmed.match(/\b(20\d{2}|19\d{2})\s*[–\-—to]+\s*(20\d{2}|19\d{2}|Present|Current)\b/i);
      if (dateMatch) {
        if (currentEntry.degree || currentEntry.institution) {
          currentEntry.end_date = dateMatch[0];
          const rest = trimmed.replace(dateMatch[0], '').replace(/[|,·]/g, '').trim();
          if (rest && !currentEntry.location) currentEntry.location = rest;
          entries.push({
            institution: currentEntry.institution || '',
            degree: currentEntry.degree || '',
            end_date: currentEntry.end_date || '',
            field: currentEntry.field || '',
            location: currentEntry.location || '',
          });
          currentEntry = {};
        }
        continue;
      }
      if (trimmed.match(/\b(university|college|school|institute|academy)\b/i)) {
        if (currentEntry.institution) {
          entries.push({
            institution: currentEntry.institution || '',
            degree: currentEntry.degree || '',
            end_date: currentEntry.end_date || '',
            field: currentEntry.field || '',
            location: currentEntry.location || '',
          });
          currentEntry = {};
        }
        currentEntry.institution = trimmed;
      } else if (trimmed.match(/\b(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D|MBA|Bachelor|Master|Doctor|Diploma|Certificate|Associate)\b/i)) {
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
      items = text.split(/[\n•\-*]/).map(s => s.trim()).filter(Boolean);
    }
    const flat: string[] = [];
    for (const item of items) {
      if (item.includes(':')) {
        const [, skills] = item.split(':');
        if (skills) {
          flat.push(...skills.split(',').map(s => s.trim()).filter(Boolean));
        }
      } else {
        flat.push(item);
      }
    }
    return flat.slice(0, 30).map((name, i) => ({
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
      const trimmed = line.replace(/^[\-•*]\s*/, '').trim();
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
