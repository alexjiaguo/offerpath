import { Resume, ResumeData, ResumeTheme } from "@/types";

const mockResumeData: ResumeData = {
  personal: {
    name: "Alex Sterling",
    title: "Senior Product Designer",
    email: "alex.sterling@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexsterling",
    website: "alexsterling.design",
    portfolio_url: "https://alexsterling.design",
    portfolio_label: "Portfolio",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  },
  summary: "Award-winning Senior Product Designer with 8+ years of experience leading end-to-end design for enterprise SaaS and consumer apps. Proven track record of increasing user retention by 40% and accelerating design-to-development handoffs. Passionate about creating elegant, utilitarian interfaces that solve complex user problems.",
  experience: [
    {
      company: "InnovateTech (Acquired by TechCorp)",
      title: "Lead Product Designer",
      location: "San Francisco, CA",
      start_date: "2021-03",
      current: true,
      bullets: [
        "Led a team of 4 designers to redesign the core analytics dashboard, resulting in a 35% increase in daily active users and a 50% reduction in customer support tickets.",
        "Established and scaled the company's first comprehensive design system across 12 distinct product lines, cutting UI development time by 40%.",
        "Partnered directly with the VP of Product and VP of Engineering to define the long-term product vision and quarterly OKRs.",
      ],
    },
    {
      company: "Nexus Creative",
      title: "Senior UX Designer",
      location: "New York, NY",
      start_date: "2018-06",
      end_date: "2021-02",
      bullets: [
        "Spearheaded the UX strategy for a flagship fintech application that processed over $50M in monthly transactions.",
        "Conducted extensive generative and evaluative user research, translating insights into high-fidelity prototypes validated by over 200 users.",
        "Mentored 3 junior designers, fostering a culture of rigorous critique and iterative design processes.",
      ],
    },
    {
      company: "Digital Dynamics",
      title: "UI/UX Designer",
      location: "Austin, TX",
      start_date: "2015-08",
      end_date: "2018-05",
      bullets: [
        "Designed responsive web experiences for Fortune 500 clients, strictly adhering to accessibility standards (WCAG 2.1 AA).",
        "Collaborated closely with front-end engineers to ensure pixel-perfect implementation using React and modern CSS frameworks.",
      ],
    },
  ],
  education: [
    {
      institution: "Rhode Island School of Design (RISD)",
      degree: "Bachelor of Fine Arts",
      field: "Graphic Design",
      location: "Providence, RI",
      start_date: "2011-09",
      end_date: "2015-05",
      gpa: "3.8/4.0",
    },
  ],
  skills: [
    { id: "1", name: "Product Strategy", isHighlighted: true },
    { id: "2", name: "User Research", isHighlighted: true },
    { id: "3", name: "Design Systems", isHighlighted: true },
    { id: "4", name: "Interaction Design", isHighlighted: false },
    { id: "5", name: "Prototyping", isHighlighted: false },
    { id: "6", name: "Agile/Scrum", isHighlighted: false },
  ],
  technicalSkills: [
    { id: "1", category: "Design Tools", skills: "Figma, Sketch, Adobe Creative Suite, Principle, Framer" },
    { id: "2", category: "Development", skills: "HTML5, CSS3, TailwindCSS, Basic React, Git" },
  ],
  projects: [
    {
      name: "OpenSource Design System",
      description: "Created and maintain a popular open-source UI kit with 5k+ downloads on Figma Community.",
      url: "figma.com/community/file/123",
    }
  ]
};

const defaultTheme: ResumeTheme = {
  primaryColor: "#0f172a",
  accentColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#334155",
  fontFamily: "Inter, sans-serif",
  baseFontSize: 10,
  headerFontSize: 24,
  sectionTitleSize: 14,
  companyFontSize: 12,
  lineHeight: 1.5,
  pagePadding: 48,
  sectionSpacing: 16,
  itemSpacing: 12,
  headshotSize: 96,
  headshotRadius: 8,
  sidebarBg: "#f8fafc",
  sidebarText: "#334155",
  sidebarAccent: "#3b82f6",
  sidebarWidth: 30,
};

export const mockResume: Resume = {
  id: "mock-123",
  user_id: "user-123",
  title: "Alex Sterling - Lead Product Designer",
  data: mockResumeData,
  template: "classic-minimal",
  theme: defaultTheme,
  section_order: [
    "summary",
    "experience",
    "education",
    "skills",
    "technicalSkills",
    "projects",
  ],
  section_visibility: {},
  is_base: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
