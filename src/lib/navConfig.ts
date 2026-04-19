import { BsBarChartFill, BsChatSquareText, BsCollection, BsCompass, BsCpu, BsCreditCard, BsFileEarmarkText, BsGear, BsGrid1X2, BsKanban, BsKey } from "react-icons/bs";

export interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

export interface NavSection {
  section: string;
  items: NavItemDef[];
}

export const NAV_ITEMS: NavSection[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: BsGrid1X2 },
    ],
  },
  {
    section: "Modules",
    items: [
      {
        label: "Job Tracker",
        href: "/dashboard/pipeline",
        icon: BsKanban,
        subItems: [
          { label: "Board", href: "/dashboard/pipeline", icon: BsKanban },
          { label: "Analytics", href: "/dashboard/pipeline/analytics", icon: BsBarChartFill },
        ],
      },
      { label: "Resume Studio", href: "/dashboard/resume", icon: BsFileEarmarkText },
      { label: "Job Search", href: "/dashboard/discover", icon: BsCompass },
      {
        label: "Interview Simulator",
        href: "/dashboard/interview",
        icon: BsChatSquareText,
        subItems: [
          { label: "Overview", href: "/dashboard/interview", icon: BsCpu },
          { label: "Stories", href: "/dashboard/interview/stories", icon: BsCollection },
        ],
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: BsGear },
      { label: "Billing & Plans", href: "/dashboard/settings/billing", icon: BsCreditCard },
      { label: "API Configuration", href: "/dashboard/settings/api-keys", icon: BsKey },
    ],
  },
];
