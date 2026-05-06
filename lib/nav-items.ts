import {
  Home,
  ListChecks,
  CalendarDays,
  BarChart3,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/planner", label: "플래너", icon: ListChecks },
  { href: "/calendar", label: "캘린더", icon: CalendarDays },
  { href: "/dashboard", label: "리포트", icon: BarChart3 },
  { href: "/profile", label: "프로필", icon: User },
];
