import { Bank, ChartBar, ChatCircleText, Folders, Compass, Cpu, CreditCard, FileText, Gear, SquaresFour, Kanban, Key, IconProps } from "@phosphor-icons/react";
import { TranslationSchema } from "@/i18n/types";

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

export function getNavItems(t: TranslationSchema): NavSection[] {
  return [
    {
      section: t.nav.overview,
      items: [
        { label: t.nav.dashboard, href: "/dashboard", icon: SquaresFour },
      ],
    },
    {
      section: t.nav.workspace,
      items: [
        {
          label: t.nav.jobTracker,
          href: "/dashboard/pipeline",
          icon: Kanban,
          subItems: [
            { label: t.nav.board, href: "/dashboard/pipeline", icon: Kanban },
            { label: t.nav.analytics, href: "/dashboard/pipeline/analytics", icon: ChartBar },
            { label: t.nav.compareOffers, href: "/dashboard/pipeline/compare", icon: Bank },
          ],
        },
        { label: t.nav.resumes, href: "/dashboard/resume", icon: FileText },
        { label: t.nav.jobSearch, href: "/dashboard/discover", icon: Compass },
        {
          label: t.nav.interviewPrep,
          href: "/dashboard/interview",
          icon: ChatCircleText,
          subItems: [
            { label: t.nav.overview, href: "/dashboard/interview", icon: Cpu },
            { label: t.nav.starStories, href: "/dashboard/interview/stories", icon: Folders },
          ],
        },
      ],
    },
    {
      section: t.nav.account,
      items: [
        { label: t.nav.settings, href: "/dashboard/settings", icon: Gear },
        { label: t.nav.billingPlans, href: "/dashboard/settings/billing", icon: CreditCard },
        { label: t.nav.apiKeys, href: "/dashboard/settings/api-keys", icon: Key },
      ],
    },
  ];
}
