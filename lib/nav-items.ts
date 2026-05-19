import {
  Home,
  ListChecks,
  CalendarDays,
  BarChart3,
  User,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** 모바일 하단탭 — 5개 고정. 프로필은 헤더 우상단으로 분리. */
export const TAB_ITEMS: NavItem[] = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/planner", label: "플래너", icon: ListChecks },
  { href: "/calendar", label: "캘린더", icon: CalendarDays },
  { href: "/dashboard", label: "리포트", icon: BarChart3 },
  { href: "/feed", label: "피드", icon: Megaphone },
];

/** 데스크톱 사이드바 — 탭바 5개 + 프로필 */
export const SIDEBAR_ITEMS: NavItem[] = [
  ...TAB_ITEMS,
  { href: "/profile", label: "프로필", icon: User },
];

/** 헤더의 현재 섹션 라벨 매칭용 — 프로필 포함 전체 */
export const ALL_NAV_ITEMS: NavItem[] = SIDEBAR_ITEMS;

/** @deprecated TAB_ITEMS / SIDEBAR_ITEMS / ALL_NAV_ITEMS 를 사용하세요. */
export const NAV_ITEMS: NavItem[] = SIDEBAR_ITEMS;
