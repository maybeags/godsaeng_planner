import type { TagColor } from "./supabase/types";

/** 사용 가능한 모든 태그 색상. 해시 색상 배정의 풀. */
export const ALL_TAG_COLORS: readonly TagColor[] = [
  "school",
  "part",
  "hobby",
  "friend",
  "meal",
  "custom",
  "rose",
  "red",
  "coral",
  "orange",
  "amber",
  "lime",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "indigo",
  "violet",
  "fuchsia",
  "magenta",
] as const;

/**
 * 태그 이름 → 안정적인 색상.
 * 같은 이름이면 항상 같은 색이 나오므로 입력 미리보기와 저장 후 색이 일치함.
 */
export function pickTagColor(name: string): TagColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return ALL_TAG_COLORS[Math.abs(hash) % ALL_TAG_COLORS.length];
}
