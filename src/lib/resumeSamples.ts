import type { ResumeData, ResumeTheme, SectionKey } from "@/types";

/* ─── Resume Samples — "Use Resume Sample" affordance from resume.com ───
   Each sample is a pre-filled resume users can fork in one click. They
   cover the most common archetypes so the empty state is never blank. */

export interface ResumeSample {
  id: string;
  title: string;
  summary: string;       // one-line description for the gallery tile
  template: string;
  theme: ResumeTheme;
  data: ResumeData;
  section_order: SectionKey[];
  section_visibility: Record<string, Record<SectionKey, boolean>>;
}

const baseTheme: ResumeTheme = {
  primaryColor: "#0f172a",
  accentColor: "#64748b",
  backgroundColor: "#ffffff",
  textColor: "#1e293b",
  fontFamily: "'Inter', sans-serif",
  baseFontSize: 11,
  headerFontSize: 24,
  sectionTitleSize: 11,
  companyFontSize: 11,
  lineHeight: 1.45,
  pagePadding: 28,
  sectionSpacing: 14,
  itemSpacing: 6,
};

const allVisible: Record<SectionKey, boolean> = {
  summary: true, experience: true, education: true, skills: true,
  technicalSkills: true, languages: true, certifications: true,
  projects: true, photo: false, portfolio: true, visaStatus: false,
};

export const RESUME_SAMPLES: ResumeSample[] = [
  {
    id: "pm-sample",
    title: "Senior Product Manager",
    summary: "8+ years in platform PM, AI/ML product launches",
    template: "clean-layout",
    theme: baseTheme,
    section_order: ["summary", "experience", "education", "skills", "projects"],
    section_visibility: { "clean-layout": allVisible },
    data: {
      personal: { name: "Jordan Lee", title: "Senior Product Manager", email: "jordan@example.com", location: "San Francisco, CA", linkedin: "linkedin.com/in/jordanlee" },
      summary: "Senior PM with 8+ years driving platform and AI/ML product strategy. Track record of shipping 0-to-1 features that move revenue. Comfortable in the engine room with engineers, in the boardroom with execs, and on the call with enterprise customers.",
      experience: [
        { company: "Series B SaaS", title: "Senior PM, Platform", start_date: "2022", end_date: "Present", current: true,
          bullets: ["Led platform rewrite that cut time-to-first-value 62% and unblocked $4.8M ARR.",
                    "Shipped AI co-pilot across 3 SKUs; 41% weekly active within 8 weeks of GA.",
                    "Owned pricing migration from seat-based to usage-based with no revenue churn."] },
        { company: "Acme Ads", title: "Product Manager, Monetization", start_date: "2018", end_date: "2022",
          bullets: ["Owned header-bidding integration, +18% publisher revenue.",
                    "Ran weekly experiment cadence; 0.8% RPM lift on average per release."] },
      ],
      education: [{ institution: "UC Berkeley", degree: "B.S.", field: "Cognitive Science", end_date: "2016" }],
      skills: [{ id: "s1", name: "Product strategy", isHighlighted: true }, { id: "s2", name: "A/B testing", isHighlighted: true }, { id: "s3", name: "SQL", isHighlighted: false }, { id: "s4", name: "Roadmapping", isHighlighted: true }],
    },
  },
  {
    id: "swe-sample",
    title: "Staff Software Engineer",
    summary: "Distributed systems, 12+ years at scale",
    template: "bold-engineer",
    theme: baseTheme,
    section_order: ["summary", "experience", "skills", "education", "projects"],
    section_visibility: { "bold-engineer": allVisible },
    data: {
      personal: { name: "Aisha Patel", title: "Staff Software Engineer", email: "aisha@example.com", location: "Seattle, WA" },
      summary: "Staff engineer specializing in distributed systems at consumer scale. Led re-architecture of a 9-service ad-serving platform to a stateful streaming model, recovering ~$3M/year in infra cost.",
      experience: [
        { company: "Hyperscaler", title: "Staff Engineer, Ads Infrastructure", start_date: "2020", end_date: "Present", current: true,
          bullets: ["Migrated real-time budget pacing from batch to stream; p99 latency 11s → 1.4s.",
                    "Tech-lead for 11 engineers across two timezones; 0 unplanned attrition in 18 months."] },
        { company: "SearchCo", title: "Senior Engineer", start_date: "2016", end_date: "2020",
          bullets: ["Owned the indexing pipeline; throughput +220% on the same fleet.",
                    "Wrote the team's onboarding doc; still in use 4 years later."] },
      ],
      education: [{ institution: "Carnegie Mellon", degree: "M.S.", field: "Computer Science", end_date: "2016" }],
      skills: [{ id: "s1", name: "Go", isHighlighted: true }, { id: "s2", name: "Kafka", isHighlighted: true }, { id: "s3", name: "Kubernetes", isHighlighted: true }, { id: "s4", name: "System design", isHighlighted: true }],
    },
  },
  {
    id: "designer-sample",
    title: "Senior Product Designer",
    summary: "Mobile-first, design systems, 7+ years",
    template: "elegant-two-column",
    theme: baseTheme,
    section_order: ["summary", "experience", "skills", "projects"],
    section_visibility: { "elegant-two-column": allVisible },
    data: {
      personal: { name: "Marco Bellini", title: "Senior Product Designer", email: "marco@example.com", location: "New York, NY" },
      summary: "Product designer with 7+ years building consumer fintech and marketplace products. Lead designer on two complete design systems still in production.",
      experience: [
        { company: "NeoBank", title: "Senior Product Designer", start_date: "2021", end_date: "Present", current: true,
          bullets: ["Led onboarding redesign, +34% activation in 6 weeks.",
                    "Owned the design system across web and iOS; 120+ components, 4 engineers, 0 new tokens shipped without review."] },
        { company: "DesignStudio", title: "Designer", start_date: "2018", end_date: "2021",
          bullets: ["Shipped 14 client MVPs in 30 months across fintech, healthcare, and e-commerce."] },
      ],
      education: [{ institution: "RISD", degree: "BFA", field: "Graphic Design", end_date: "2017" }],
      skills: [{ id: "s1", name: "Figma", isHighlighted: true }, { id: "s2", name: "Design systems", isHighlighted: true }, { id: "s3", name: "User research", isHighlighted: true }, { id: "s4", name: "Prototyping", isHighlighted: false }],
    },
  },
  {
    id: "data-sample",
    title: "Senior Data Scientist",
    summary: "ML + experimentation at marketplace scale",
    template: "ats-executive",
    theme: baseTheme,
    section_order: ["summary", "experience", "skills", "education"],
    section_visibility: { "ats-executive": allVisible },
    data: {
      personal: { name: "Priya Subramanian", title: "Senior Data Scientist", email: "priya@example.com", location: "Austin, TX" },
      summary: "Data scientist with 6+ years leading experimentation and causal inference work on two-sided marketplaces. PhD in statistics.",
      experience: [
        { company: "Marketplace Inc", title: "Senior Data Scientist", start_date: "2021", end_date: "Present", current: true,
          bullets: ["Owned search ranking A/B framework; 23 experiments shipped in 2024.",
                    "Built counterfactual uplift model adopted by 4 product teams."] },
      ],
      education: [{ institution: "UT Austin", degree: "PhD", field: "Statistics", end_date: "2019" }],
      skills: [{ id: "s1", name: "Python", isHighlighted: true }, { id: "s2", name: "Causal inference", isHighlighted: true }, { id: "s3", name: "A/B testing", isHighlighted: true }, { id: "s4", name: "SQL", isHighlighted: true }],
    },
  },
  {
    id: "student-sample",
    title: "New Graduate / Intern",
    summary: "First job out of college, internship-ready",
    template: "classic-minimal",
    theme: baseTheme,
    section_order: ["education", "experience", "skills", "projects"],
    section_visibility: { "classic-minimal": allVisible },
    data: {
      personal: { name: "Sam Chen", title: "Recent CS Graduate", email: "sam@example.com", location: "Boston, MA" },
      summary: "Recent CS graduate with two prior internships in full-stack engineering. Looking for an SWE role where I can keep building product-shaped tools.",
      experience: [
        { company: "StartupCo", title: "SWE Intern", start_date: "Summer 2025",
          bullets: ["Built an internal analytics dashboard in React + Postgres used by the whole team.",
                    "Shipped 9 PRs across 11 weeks; all reviewed and merged."] },
        { company: "University Lab", title: "Undergrad Research Assistant", start_date: "2024", end_date: "2025",
          bullets: ["Implemented a small ML pipeline for a publication; first-author acknowledgement."] },
      ],
      education: [{ institution: "Boston University", degree: "B.S.", field: "Computer Science", end_date: "2025", gpa: "3.82" }],
      skills: [{ id: "s1", name: "TypeScript", isHighlighted: true }, { id: "s2", name: "React", isHighlighted: true }, { id: "s3", name: "Python", isHighlighted: false }, { id: "s4", name: "PostgreSQL", isHighlighted: true }],
    },
  },
  {
    id: "exec-sample",
    title: "VP of Engineering",
    summary: "Org leadership, 50+ reports, multiple reorgs",
    template: "clean-professional",
    theme: baseTheme,
    section_order: ["summary", "experience", "skills", "education"],
    section_visibility: { "clean-professional": allVisible },
    data: {
      personal: { name: "Helena Voss", title: "VP of Engineering", email: "helena@example.com", location: "London, UK" },
      summary: "Engineering leader with 18+ years of experience scaling orgs from 10 to 200+. Twice-built platform orgs for B2B SaaS unicorns.",
      experience: [
        { company: "Public SaaS Co", title: "VP of Engineering", start_date: "2020", end_date: "Present", current: true,
          bullets: ["Scaled platform org 22 → 95 in 30 months; eNPS +28.",
                    "Led migration from single-region to multi-region active-active; 99.99% SLO sustained."] },
        { company: "AcquiredCo", title: "Director of Engineering", start_date: "2016", end_date: "2020",
          bullets: ["Built the SRE function from scratch after the second major outage."] },
      ],
      education: [{ institution: "Imperial College London", degree: "MEng", field: "Computing", end_date: "2006" }],
      skills: [{ id: "s1", name: "Org design", isHighlighted: true }, { id: "s2", name: "SRE", isHighlighted: true }, { id: "s3", name: "Hiring", isHighlighted: true }, { id: "s4", name: "Strategy", isHighlighted: true }],
    },
  },
];
