import { ChartBar, ChatCircleText, Folders, Compass, Cpu, CreditCard, FileText, Gear, SquaresFour, Kanban, Key, IconProps } from "@phosphor-icons/react";

export interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ComponentType<IconProps>;
}

export interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
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
      { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
    ],
  },
  {
    section: "Modules",
    items: [
      {
        label: "Job Tracker",
        href: "/dashboard/pipeline",
        icon: Kanban,
        subItems: [
          { label: "Board", href: "/dashboard/pipeline", icon: Kanban },
          { label: "Analytics", href: "/dashboard/pipeline/analytics", icon: ChartBar },
        ],
      },
      { label: "Resume Studio", href: "/dashboard/resume", icon: FileText },
      { label: "Job Search", href: "/dashboard/discover", icon: Compass },
      {
        label: "Interview Simulator",
        href: "/dashboard/interview",
        icon: ChatCircleText,
        subItems: [
          { label: "Overview", href: "/dashboard/interview", icon: Cpu },
          { label: "Stories", href: "/dashboard/interview/stories", icon: Folders },
        ],
      },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Gear },
      { label: "Billing & Plans", href: "/dashboard/settings/billing", icon: CreditCard },
      { label: "API Configuration", href: "/dashboard/settings/api-keys", icon: Key },
    ],
  },
];
