import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayIsoDate, buildMonthGrid } from "@/lib/date";
import type { PlanWithTags, Tag } from "@/lib/supabase/types";
import { CalendarHeader } from "./_components/calendar-header";
import { CalendarView } from "./_components/calendar-view";

export const dynamic = "force-dynamic";

const ISO_MONTH_RE = /^\d{4}-\d{2}$/;

function parseMonthParam(raw: string | undefined): {
  year: number;
  month: number;
} {
  if (typeof raw === "string" && ISO_MONTH_RE.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m };
  }
  const today = todayIsoDate();
  const [y, m] = today.split("-").map(Number);
  return { year: y, month: m };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: rawMonth } = await searchParams;
  const { year, month } = parseMonthParam(rawMonth);

  const cells = buildMonthGrid(year, month);
  const gridStart = cells[0].iso;
  const gridEnd = cells[cells.length - 1].iso;

  const supabase = await createSupabaseServerClient();
  const { data: plansData } = await supabase
    .from("plans")
    .select(
      `
        id, user_id, content, plan_date, plan_time, is_done, done_at, created_at, updated_at,
        plan_tags ( tags ( id, user_id, name, color, is_default, created_at ) )
      `
    )
    .gte("plan_date", gridStart)
    .lte("plan_date", gridEnd)
    .order("is_done", { ascending: true })
    .order("plan_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

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

  const plansByDate: Record<string, PlanWithTags[]> = {};
  for (const p of plans) {
    (plansByDate[p.plan_date] ??= []).push(p);
  }

  const todayIso = todayIsoDate();

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          캘린더
        </h1>
        <CalendarHeader year={year} month={month} />
      </header>

      <CalendarView
        cells={cells}
        plansByDate={plansByDate}
        todayIso={todayIso}
      />
    </div>
  );
}
