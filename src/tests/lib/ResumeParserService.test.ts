import { describe, it, expect } from "vitest";
import { ResumeParserService } from "@/lib/ResumeParserService";

// ═══════════════════════════════════════════════════
// Sample text inputs simulating each file format's output
// after FileParserService processes the uploaded file
// ═══════════════════════════════════════════════════

// PDF: simulated output from fixed pdfjs extraction with proper line breaks.
// Headings are typically all-caps in PDF resumes.
const PDF_TEXT = `John Smith
Senior Software Engineer
San Francisco, CA | john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years building scalable web applications and leading high-performing teams.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Google | Jan 2020 - Present
Mountain View, CA
- Led development of core infrastructure serving 1B+ daily requests
- Architected microservices migration reducing latency by 40%
- Mentored team of 6 engineers on best practices and code quality

Software Engineer | Amazon | Jun 2016 - Dec 2019
Seattle, WA
- Built payment processing system handling $100M+ in annual transactions
- Reduced deployment time by 70% through CI/CD pipeline improvements
- Led adoption of TypeScript across the organization

EDUCATION
B.S. Computer Science | Stanford University | 2012 - 2016
Stanford, CA

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, GraphQL

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Go
Cloud: AWS, GCP, Docker, Kubernetes
`;

// DOCX: simulated output from fixed mammoth HTML-to-text conversion.
// Headings are uppercased by htmlToText, list items get "- " prefix.
const DOCX_TEXT = `JANE DOE
Product Manager
San Francisco, CA | jane.doe@email.com | (555) 987-6543

PROFESSIONAL SUMMARY

Product manager with 10+ years of experience in B2B SaaS products.

PROFESSIONAL EXPERIENCE

Senior Product Manager | Microsoft | 2018 - Present
Redmond, WA
- Launched 3 major products generating $50M+ in annual revenue
- Led cross-functional team of 20+ engineers and designers
- Drove 40% improvement in user activation through onboarding redesign

Product Manager | Slack | 2015 - 2018
San Francisco, CA
- Drove 200% growth in enterprise customer base
- Shipped key integrations with Salesforce and Google Workspace
- Established product analytics framework adopted company-wide

EDUCATION

MBA | Harvard Business School | 2013 - 2015
Cambridge, MA

B.A. Economics | UC Berkeley | 2007 - 2011
Berkeley, CA

TECHNICAL SKILLS

Product: Roadmapping, User Research, A/B Testing, Analytics, SQL
Technical: SQL, Python, APIs, Agile, Scrum
`;

// TXT: plain text resume with mixed formatting
const TXT_TEXT = `Alex Chen
Data Scientist | Machine Learning Engineer
alex.chen@email.com | (555) 456-7890 | linkedin.com/in/alexchen | New York, NY

SUMMARY
Data scientist with 6 years of experience in ML model development and deployment.

EXPERIENCE
Senior Data Scientist | Netflix | 2019 - Present
Los Gatos, CA
- Built recommendation system improving user engagement by 25%
- Deployed ML pipelines processing 500TB of data daily
- Published 3 papers at NeurIPS and ICML

Data Scientist | Spotify | 2017 - 2019
New York, NY
- Developed audio feature extraction models for music classification
- Created real-time playlist generation serving 400M+ users

EDUCATION
Ph.D. Computer Science | MIT | 2012 - 2017
Cambridge, MA

B.S. Mathematics | UC Los Angeles | 2008 - 2012

SKILLS
Python, TensorFlow, PyTorch, Scikit-learn, SQL, Spark, AWS SageMaker, Kubernetes
`;

// MD: OfferPath's own markdown format
const MD_TEXT = `# Alex Sterling

## Senior Product Designer

San Francisco, CA | alex.sterling@example.com | (555) 123-4567 | linkedin.com/in/alexsterling

## Professional Summary

Award-winning Senior Product Designer with 8+ years of experience leading end-to-end design for enterprise SaaS and consumer apps.

## Professional Experience

### Lead Product Designer | InnovateTech
*2021-03 - Present | San Francisco, CA*
- Led a team of 4 designers to redesign the core analytics dashboard, resulting in a 35% increase in daily active users
- Established and scaled the company's first comprehensive design system across 12 product lines

### Senior UX Designer | Nexus Creative
*2018-06 - 2021-02 | New York, NY*
- Spearheaded the UX strategy for a flagship fintech application that processed over $50M in monthly transactions
- Conducted extensive user research, translating insights into high-fidelity prototypes

## Education

- **Bachelor of Fine Arts**, Rhode Island School of Design (2011 - 2015)

## Skills

Product Strategy, User Research, Design Systems, Interaction Design, Prototyping, Agile/Scrum

## Technical Skills

**Design Tools**: Figma, Sketch, Adobe Creative Suite, Principle, Framer
**Development**: HTML5, CSS3, TailwindCSS, Basic React, Git
`;

// ═══════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════

describe("ResumeParserService - PDF format", () => {
  const result = ResumeParserService.parse(PDF_TEXT, "pdf");

  it("extracts personal info correctly", () => {
    expect(result.personal?.name).toBe("John Smith");
    expect(result.personal?.title).toBe("Senior Software Engineer");
    expect(result.personal?.email).toBe("john.smith@email.com");
    expect(result.personal?.phone).toBe("(555) 123-4567");
    expect(result.personal?.linkedin).toContain("johnsmith");
  });

  it("extracts summary", () => {
    expect(result.summary).toContain("Experienced software engineer");
    expect(result.summary!.length).toBeGreaterThan(20);
  });

  it("extracts experience entries with correct title/company split", () => {
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBe(2);

    const first = result.experience![0];
    expect(first.title).toBe("Senior Software Engineer");
    expect(first.company).toBe("Google");
    expect(first.start_date).toBe("Jan 2020");
    expect(first.current).toBe(true);
    expect(first.bullets.length).toBe(3);
    expect(first.bullets[0]).toContain("Led development");

    const second = result.experience![1];
    expect(second.title).toBe("Software Engineer");
    expect(second.company).toBe("Amazon");
    expect(second.start_date).toBe("Jun 2016");
    expect(second.end_date).toBe("Dec 2019");
    expect(second.current).toBe(false);
    expect(second.bullets.length).toBe(3);
  });

  it("extracts education", () => {
    expect(result.education).toBeDefined();
    expect(result.education!.length).toBeGreaterThanOrEqual(1);
    const edu = result.education![0];
    expect(edu.degree).toContain("B.S");
    expect(edu.institution).toContain("Stanford");
  });

  it("extracts skills", () => {
    expect(result.skills).toBeDefined();
    expect(result.skills!.length).toBeGreaterThan(5);
    expect(result.skills!.some(s => s.name.includes("JavaScript"))).toBe(true);
    expect(result.skills!.some(s => s.name.includes("React"))).toBe(true);
  });

  it("extracts technical skills with categories", () => {
    expect(result.technicalSkills).toBeDefined();
    expect(result.technicalSkills!.length).toBeGreaterThanOrEqual(1);
    const langCat = result.technicalSkills!.find(t => t.category.includes("Languages"));
    expect(langCat).toBeDefined();
    expect(langCat!.skills).toContain("JavaScript");
  });
});

describe("ResumeParserService - DOCX format", () => {
  const result = ResumeParserService.parse(DOCX_TEXT, "docx");

  it("extracts personal info correctly", () => {
    expect(result.personal?.name).toBe("JANE DOE");
    expect(result.personal?.title).toBe("Product Manager");
    expect(result.personal?.email).toBe("jane.doe@email.com");
    expect(result.personal?.phone).toBe("(555) 987-6543");
  });

  it("extracts summary", () => {
    expect(result.summary).toContain("Product manager with 10+");
  });

  it("extracts experience with correct title/company split", () => {
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBe(2);

    const first = result.experience![0];
    expect(first.title).toBe("Senior Product Manager");
    expect(first.company).toBe("Microsoft");
    expect(first.start_date).toBe("2018");
    expect(first.current).toBe(true);
    expect(first.bullets.length).toBe(3);

    const second = result.experience![1];
    expect(second.title).toBe("Product Manager");
    expect(second.company).toBe("Slack");
    expect(second.start_date).toBe("2015");
    expect(second.end_date).toBe("2018");
    expect(second.bullets.length).toBe(3);
  });

  it("extracts education entries", () => {
    expect(result.education).toBeDefined();
    expect(result.education!.length).toBe(2);
    expect(result.education![0].degree).toContain("MBA");
    expect(result.education![0].institution).toContain("Harvard");
    expect(result.education![1].degree).toContain("B.A");
    expect(result.education![1].institution).toContain("UC Berkeley");
  });

  it("extracts technical skills", () => {
    expect(result.technicalSkills).toBeDefined();
    expect(result.technicalSkills!.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ResumeParserService - TXT format", () => {
  const result = ResumeParserService.parse(TXT_TEXT, "txt");

  it("extracts personal info correctly", () => {
    expect(result.personal?.name).toBe("Alex Chen");
    expect(result.personal?.title).toContain("Data Scientist");
    expect(result.personal?.email).toBe("alex.chen@email.com");
    expect(result.personal?.phone).toBe("(555) 456-7890");
    expect(result.personal?.linkedin).toContain("alexchen");
  });

  it("extracts summary", () => {
    expect(result.summary).toContain("Data scientist with 6 years");
  });

  it("extracts experience entries", () => {
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBe(2);

    const first = result.experience![0];
    expect(first.title).toBe("Senior Data Scientist");
    expect(first.company).toBe("Netflix");
    expect(first.start_date).toBe("2019");
    expect(first.current).toBe(true);
    expect(first.bullets.length).toBe(3);

    const second = result.experience![1];
    expect(second.company).toBe("Spotify");
    expect(second.start_date).toBe("2017");
    expect(second.end_date).toBe("2019");
  });

  it("extracts education", () => {
    expect(result.education).toBeDefined();
    expect(result.education!.length).toBeGreaterThanOrEqual(1);
    const phd = result.education!.find(e => e.degree?.includes("Ph"));
    expect(phd).toBeDefined();
    expect(phd!.institution).toContain("MIT");
  });

  it("extracts skills", () => {
    expect(result.skills).toBeDefined();
    expect(result.skills!.length).toBeGreaterThan(3);
    expect(result.skills!.some(s => s.name.includes("Python"))).toBe(true);
    expect(result.skills!.some(s => s.name.includes("TensorFlow"))).toBe(true);
  });
});

describe("ResumeParserService - MD format (OfferPath markdown)", () => {
  const result = ResumeParserService.parse(MD_TEXT, "md");

  it("extracts personal info from markdown header", () => {
    expect(result.personal?.name).toBe("Alex Sterling");
    expect(result.personal?.title).toBe("Senior Product Designer");
    expect(result.personal?.email).toBe("alex.sterling@example.com");
    expect(result.personal?.phone).toBe("(555) 123-4567");
  });

  it("extracts summary from markdown", () => {
    expect(result.summary).toContain("Award-winning");
  });

  it("extracts experience from markdown", () => {
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBe(2);

    const first = result.experience![0];
    expect(first.title).toBe("Lead Product Designer");
    expect(first.company).toBe("InnovateTech");
    expect(first.start_date).toBe("2021-03");
    expect(first.current).toBe(true);
    expect(first.bullets.length).toBe(2);

    const second = result.experience![1];
    expect(second.title).toBe("Senior UX Designer");
    expect(second.company).toBe("Nexus Creative");
    expect(second.start_date).toBe("2018-06");
    expect(second.end_date).toBe("2021-02");
  });

  it("extracts education from markdown", () => {
    expect(result.education).toBeDefined();
    expect(result.education!.length).toBeGreaterThanOrEqual(1);
    expect(result.education![0].degree).toContain("Bachelor");
    expect(result.education![0].institution).toContain("Rhode Island");
  });

  it("extracts skills from markdown", () => {
    expect(result.skills).toBeDefined();
    expect(result.skills!.length).toBeGreaterThan(3);
  });

  it("extracts technical skills with categories", () => {
    expect(result.technicalSkills).toBeDefined();
    expect(result.technicalSkills!.length).toBe(2);
    expect(result.technicalSkills![0].category).toContain("Design Tools");
  });
});

// ═══════════════════════════════════════════════════
// Edge case tests
// ═══════════════════════════════════════════════════

describe("ResumeParserService - edge cases", () => {
  it("handles empty text gracefully", () => {
    const result = ResumeParserService.parse("", "pdf");
    expect(result.experience).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.skills).toEqual([]);
  });

  it("handles text with no recognizable sections", () => {
    const text = "Just some random text without any resume structure or headings.";
    const result = ResumeParserService.parse(text, "txt");
    expect(result.experience).toEqual([]);
  });

  it("handles experience with no dates (falls back to no-date parser)", () => {
    const text = `EXPERIENCE
Software Engineer at Google
- Built awesome things
- Led a team

Product Manager at Amazon
- Launched products
- Grew revenue`;

    const result = ResumeParserService.parse(text, "txt");
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBe(2);
    expect(result.experience![0].company).toContain("Google");
    expect(result.experience![0].bullets.length).toBe(2);
  });

  it("correctly splits title and company when separated by delimiters", () => {
    // This is the critical regression test for the delimiter bug
    const text = `EXPERIENCE
Software Engineer | Google | Jan 2020 - Present
- Built things
- Led team

Product Manager | Amazon | 2018 - 2020
- Shipped product
- Grew revenue`;

    const result = ResumeParserService.parse(text, "pdf");
    expect(result.experience!.length).toBe(2);

    // Critical: title and company must be separate, not concatenated
    expect(result.experience![0].title).toBe("Software Engineer");
    expect(result.experience![0].company).toBe("Google");
    expect(result.experience![0].title).not.toContain("Google");

    expect(result.experience![1].title).toBe("Product Manager");
    expect(result.experience![1].company).toBe("Amazon");
    expect(result.experience![1].title).not.toContain("Amazon");
  });

  it("parses date ranges into start_date and end_date correctly", () => {
    const text = `EXPERIENCE
Developer | Corp | Jan 2020 - Dec 2023
- Did stuff`;

    const result = ResumeParserService.parse(text, "pdf");
    expect(result.experience!.length).toBe(1);
    expect(result.experience![0].start_date).toBe("Jan 2020");
    expect(result.experience![0].end_date).toBe("Dec 2023");
    expect(result.experience![0].current).toBe(false);
  });

  it("sets current flag for Present end dates", () => {
    const text = `EXPERIENCE
Developer | Corp | 2020 - Present
- Did stuff`;

    const result = ResumeParserService.parse(text, "pdf");
    expect(result.experience![0].start_date).toBe("2020");
    expect(result.experience![0].end_date).toBe("");
    expect(result.experience![0].current).toBe(true);
  });

  it("handles multi-line experience headers (date on separate line)", () => {
    const text = `EXPERIENCE
Senior Engineer
Acme Corp
2020 - Present
San Francisco, CA
- Built things`;

    const result = ResumeParserService.parse(text, "pdf");
    expect(result.experience!.length).toBe(1);
    expect(result.experience![0].start_date).toBe("2020");
    expect(result.experience![0].current).toBe(true);
    expect(result.experience![0].bullets.length).toBe(1);
  });

  it("does not use a section heading as personal.title", () => {
    const text = `# Jane Doe

## Experience

Engineer | Corp | 2020 - Present
- Did stuff

## Education

B.S. Computer Science | MIT | 2016 - 2020
`;
    const result = ResumeParserService.parse(text, "md");
    expect(result.personal?.name).toBe("Jane Doe");
    expect(result.personal?.title).not.toBe("Experience");
    expect(result.experience?.length).toBeGreaterThan(0);
  });

  it("falls back to generic parser when markdown has a name but no experience", () => {
    const text = `# John Doe
Software Engineer
john@email.com

EXPERIENCE
Engineer | Corp | 2020 - Present
- Did stuff`;
    const result = ResumeParserService.parse(text, "md");
    expect(result.personal?.name).toBe("John Doe");
    expect(result.experience?.length).toBeGreaterThan(0);
  });

  it("extracts projects, languages, and certifications from markdown", () => {
    const text = `# Jane Doe

## Senior Engineer

## Experience
Engineer | Corp | 2020 - Present
- Did stuff

## Projects
- OfferPath — job hunt OS

## Languages
- English
- Mandarin

## Certifications
- AWS Solutions Architect
`;
    const result = ResumeParserService.parse(text, "md");
    expect(result.projects?.length).toBeGreaterThan(0);
    expect(result.languages?.some((l) => /english/i.test(l))).toBe(true);
    expect(result.certifications?.some((c) => /AWS/i.test(c))).toBe(true);
  });

  it("separates name, URL, and description in resume-pro project bullets", () => {
    const text = `# Jane Doe

## Projects
- **[OfferPath](https://offerpath.cc.cd/)**: AI job-search operating system.
- **[dify-mcp](https://github.com/alexjiaguo/dify-mcp)**: MCP server with 138 tools.
`;
    const result = ResumeParserService.parse(text, "md");
    expect(result.projects).toEqual([
      {
        name: "OfferPath",
        url: "https://offerpath.cc.cd/",
        description: "AI job-search operating system.",
      },
      {
        name: "dify-mcp",
        url: "https://github.com/alexjiaguo/dify-mcp",
        description: "MCP server with 138 tools.",
      },
    ]);
  });

  it("splits Chinese-colon project lines into name and description", () => {
    const text = `# Jane Doe

## Projects
OfferPath：AI求职操作系统，自动生成定制简历、管理投递管线并提供面试准备。
`;
    const result = ResumeParserService.parse(text, "md");
    expect(result.projects).toEqual([
      {
        name: "OfferPath",
        url: undefined,
        description: "AI求职操作系统，自动生成定制简历、管理投递管线并提供面试准备。",
      },
    ]);
  });

  it("falls back to generic parser when markdown yields nothing", () => {
    // Markdown without proper headings - should fall back to generic
    const text = `John Doe
Software Engineer
john@email.com

EXPERIENCE
Engineer | Corp | 2020 - Present
- Did stuff`;

    const result = ResumeParserService.parse(text, "md");
    expect(result.personal?.name).toBe("John Doe");
    expect(result.experience).toBeDefined();
    expect(result.experience!.length).toBe(1);
  });
});

describe("ResumeParserService - Advanced Format Handling", () => {
  it("parses flexible Markdown without pipe delimiters and parenthetical dates", () => {
    const md = `**Michael Chen**
michael.chen@example.com • (555) 987-6543 • San Francisco, CA • github.com/mchen

## Professional Summary
Senior Staff Engineer with extensive background in distributed systems.

## Work Experience

### Staff Infrastructure Engineer at Uber (2020.03 - Present)
- Designed next-generation storage architecture serving 20M requests/sec.
- Mentored 12 staff and senior engineers across multiple timezones.

### Senior Software Engineer at Airbnb (2017.06 - 2020.02)
- Rebuilt real-time messaging pipeline reducing delivery latency by 60%.
- Improved service reliability to 99.995% uptime.

## Education
**University of Illinois Urbana-Champaign**
B.S. in Computer Science (2013 - 2017)

## Skills
Languages: Go, TypeScript, Python, Rust
Frameworks: React, Next.js, gRPC, Kubernetes
`;

    const result = ResumeParserService.parse(md, "md");
    expect(result.personal?.name).toBe("Michael Chen");
    expect(result.personal?.email).toBe("michael.chen@example.com");
    expect(result.personal?.phone).toBe("(555) 987-6543");
    expect(result.personal?.location).toBe("San Francisco, CA");
    expect(result.personal?.website).toBe("github.com/mchen");
    expect(result.summary).toContain("distributed systems");
    expect(result.experience?.length).toBe(2);
    expect(result.experience![0].title).toBe("Staff Infrastructure Engineer");
    expect(result.experience![0].company).toBe("Uber");
    expect(result.experience![0].current).toBe(true);
    expect(result.experience![0].bullets.length).toBe(2);
    expect(result.education?.length).toBe(1);
    expect(result.education![0].institution).toContain("University of Illinois");
    expect(result.education![0].degree).toContain("B.S.");
    expect(result.technicalSkills?.length).toBe(2);
  });

  it("handles wrapped multi-line bullet points in PDF text without corrupting the next job", () => {
    const pdfText = `Sarah Jenkins
sarah.j@example.com | Seattle, WA

EXPERIENCE

Principal Architect | Microsoft | 2021.01 - Present
- Architected enterprise cloud infrastructure that scaled to 50M daily active users
  across 14 global Azure regions with zero recorded downtime
- Led cross-functional team of 25 engineers during major platform migration
  saving $4.2M annually in compute expenses

Senior Cloud Engineer | Amazon | 2018.05 - 2020.12
- Developed high-throughput message streaming queue for prime delivery logistics
- Optimized database indexing and partitioned tables for 4x query speedup

EDUCATION
University of Washington
M.S. Computer Science | 2016 - 2018
`;

    const result = ResumeParserService.parse(pdfText, "pdf");
    expect(result.personal?.name).toBe("Sarah Jenkins");
    expect(result.experience?.length).toBe(2);

    const first = result.experience![0];
    expect(first.title).toBe("Principal Architect");
    expect(first.company).toBe("Microsoft");
    expect(first.bullets.length).toBe(2);
    expect(first.bullets[0]).toContain("scaled to 50M daily active users");
    expect(first.bullets[0]).toContain("zero recorded downtime");
    expect(first.bullets[1]).toContain("saving $4.2M annually");

    const second = result.experience![1];
    expect(second.title).toBe("Senior Cloud Engineer");
    expect(second.company).toBe("Amazon");
    expect(second.bullets.length).toBe(2);
  });

  it("parses Chinese resumes and date formats", () => {
    const chineseText = `张伟
zhangwei@example.com | 13800138000 | 北京

个人总结
拥有8年互联网大厂全栈开发经验，主导过多个亿级用户高并发核心系统设计。

工作经历
高级前端工程师 | 字节跳动 | 2021年3月 - 至今
- 负责抖音电商核心结算链路性能优化，页面加载时间减少35%
- 主导跨端组件库重构，提升团队研发效率50%

前端开发工程师 | 阿里巴巴 | 2018年7月 - 2021年2月
- 负责淘宝购物车核心业务模块开发与维护
- 建设前端自动化测试体系

教育背景
清华大学 | 计算机科学与技术 | 学士 | 2014年9月 - 2018年6月

专业技能
JavaScript, TypeScript, React, Vue, Node.js, Webpack
`;

    const result = ResumeParserService.parse(chineseText, "txt");
    expect(result.personal?.name).toBe("张伟");
    expect(result.summary).toContain("全栈开发经验");
    expect(result.experience?.length).toBe(2);
    expect(result.experience![0].title).toBe("高级前端工程师");
    expect(result.experience![0].company).toBe("字节跳动");
    expect(result.experience![0].current).toBe(true);
    expect(result.experience![0].bullets.length).toBe(2);
    expect(result.education?.length).toBe(1);
    expect(result.education![0].institution).toBe("清华大学");
    expect(result.education![0].degree).toBe("学士");
    expect(result.skills?.length).toBeGreaterThan(3);
  });
});

describe("ResumeParserService - Senior PM snapshot fixture", () => {
  it("extracts Priya Anand from the checked-in markdown snapshot", async () => {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    const snapshot = await readFile(
      resolve(process.cwd(), "scripts/snapshots/Senior_PM_Generic_v9.0.md"),
      "utf8"
    );
    const result = ResumeParserService.parse(snapshot, "md");
    expect(result.personal?.name).toBe("Priya Anand");
    expect(result.personal?.title).toMatch(/Product Manager/i);
    expect(result.experience?.length).toBeGreaterThan(0);
    expect(result.education?.length).toBeGreaterThan(0);
  });
});
