import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayIsoDate } from "@/lib/date";
import type { ComposeItem } from "@/lib/posts";
import { DateNav } from "./_components/date-nav";
import { PlanInput } from "./_components/plan-input";
import { PlanList } from "./_components/plan-list";
import { PostComposer } from "../feed/_components/post-composer";
import type { PlanWithTags, Tag, TagColor } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(raw: string | string[] | undefined): string {
  if (typeof raw === "string" && ISO_DATE_RE.test(raw)) return raw;
  return todayIsoDate();
}

function formatHeaderTitle(iso: string): string {
  const today = todayIsoDate();
  if (iso === today) return "오늘의 플래너";
  const [, m, d] = iso.split("-").map(Number);
  return `${m}월 ${d}일의 플래너`;
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { date: rawDate } = await searchParams;
  const selectedDate = parseDateParam(rawDate);

  const [{ data: tagsData }, { data: plansData }] = await Promise.all([
    supabase
      .from("tags")
      .select("id, user_id, name, color, is_default, created_at")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("plans")
      .select(
        `
          id, user_id, content, plan_date, plan_time, is_done, done_at, created_at, updated_at,
          plan_tags ( tags ( id, user_id, name, color, is_default, created_at ) )
        `
      )
      .eq("plan_date", selectedDate)
      .order("is_done", { ascending: true })
      .order("plan_time", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
  ]);

  const tags: Tag[] = (tagsData ?? []) as Tag[];

  const plans: PlanWithTags[] = (plansData ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    content: row.content,
    plan_date: row.plan_date,
    plan_time: row.plan_time,
    is_done: row.is_done,
    done_at: row.done_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: (row.plan_tags ?? [])
      .map((pt: any) => pt.tags)
      .filter(Boolean) as Tag[],
  }));

  const headerTitle = formatHeaderTitle(selectedDate);
  const isToday = selectedDate === todayIsoDate();

  // PostComposer 는 오늘에만 노출 — KST RLS check 와 일치
  const composeItems: ComposeItem[] = isToday
    ? plans.map((p) => ({
        planId: p.id,
        item: {
          content: p.content,
          plan_time: p.plan_time,
          is_done: p.is_done,
          tags: p.tags.map((t) => ({
            name: t.name,
            color: t.color as TagColor,
          })),
        },
      }))
    : [];

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {headerTitle}
        </h1>
        <DateNav selectedDate={selectedDate} />
      </header>

      <PlanInput tags={tags} selectedDate={selectedDate} />

      <PlanList plans={plans} tags={tags} />

      {isToday && (
        <PostComposer initialItems={composeItems} mode="planner" />
      )}
    </div>
  );
}
