import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayIsoDate } from "@/lib/date";
import type { PostItem } from "@/lib/supabase/types";

export type ComposeItem = {
  planId: string;
  item: PostItem;
};

/**
 * 오늘(KST) 본인의 plans + 태그를 가져와 PostItem 으로 변환.
 * 자랑 작성 컴포저에서 체크박스 후보로 표시.
 *
 * 정렬: 완료 안 한 거 → 시간 빠른 거 → 최근 만든 거 순.
 * (planner/page.tsx 와 동일한 정렬 — 사용자 인지 일관성)
 */
export async function getTodayPlanItemsForCompose(): Promise<ComposeItem[]> {
  const supabase = await createSupabaseServerClient();
  const today = todayIsoDate();

  const { data } = await supabase
    .from("plans")
    .select(
      `
        id, content, plan_time, is_done,
        plan_tags ( tags ( name, color ) )
      `
    )
    .eq("plan_date", today)
    .order("is_done", { ascending: true })
    .order("plan_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => ({
    planId: row.id as string,
    item: {
      content: row.content as string,
      plan_time: (row.plan_time as string | null) ?? null,
      is_done: row.is_done as boolean,
      tags: (row.plan_tags ?? [])
        .map((pt: any) => pt.tags)
        .filter(Boolean)
        .map((t: any) => ({ name: t.name as string, color: t.color })),
    },
  }));
}
