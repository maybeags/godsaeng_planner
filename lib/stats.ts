import { createSupabaseServerClient } from "./supabase/server";
import {
  addDaysUtc,
  kstNow,
  startOfDayUtc,
  toIsoDate,
} from "./date";
import type { PlanWithTags, Tag, TagColor } from "./supabase/types";

export type Period = "week" | "month";

export type DailyPoint = {
  date: string;
  label: string;
  total: number;
  done: number;
  rate: number;
};

export type TagStat = {
  id: string;
  name: string;
  color: TagColor;
  total: number;
  done: number;
  rate: number;
};

export type ReportSummary = {
  total: number;
  done: number;
  rate: number;
  topTags: TagStat[];
};

export type ReportData = {
  period: Period;
  anchor: string;
  start: string;
  end: string;
  daily: DailyPoint[];
  byTag: TagStat[];
  summary: ReportSummary;
  isCurrent: boolean;
  isFuture: boolean;
};

function periodStartUtc(period: Period, anchor: Date): Date {
  const s = startOfDayUtc(anchor);
  if (period === "week") {
    const dayOfWeek = s.getUTCDay();
    const offset = (dayOfWeek + 6) % 7;
    s.setUTCDate(s.getUTCDate() - offset);
  } else {
    s.setUTCDate(1);
  }
  return s;
}

function periodEndUtc(period: Period, start: Date): Date {
  if (period === "week") {
    return addDaysUtc(start, 6);
  }
  const e = new Date(start);
  e.setUTCMonth(start.getUTCMonth() + 1);
  e.setUTCDate(0);
  return e;
}

/** YYYY-MM-DD 문자열을 UTC Date 로. 잘못되면 오늘(KST)로 폴백 */
export function parseAnchor(raw: string | string[] | null | undefined): Date {
  if (typeof raw !== "string") return kstNow();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return kstNow();
  const [y, m, d] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(date.getTime())) return kstNow();
  return date;
}

/** 인접 기간의 anchor 반환 (week=±7일, month=±1달) */
export function getNeighborAnchor(
  period: Period,
  anchor: Date,
  dir: -1 | 1
): Date {
  if (period === "week") {
    return addDaysUtc(anchor, 7 * dir);
  }
  // month: 15일로 정규화 후 ±1달 — 월 길이 차이로 인한 day-overflow 방지
  const next = startOfDayUtc(anchor);
  next.setUTCDate(15);
  next.setUTCMonth(next.getUTCMonth() + dir);
  return next;
}

export function isAtCurrentPeriod(period: Period, anchor: Date): boolean {
  const a = periodStartUtc(period, anchor);
  const t = periodStartUtc(period, kstNow());
  return a.getTime() === t.getTime();
}

export function getRange(period: Period, anchor: Date = kstNow()): {
  start: string;
  end: string;
  days: string[];
  isCurrent: boolean;
  isFuture: boolean;
} {
  const todayStart = startOfDayUtc(kstNow());
  const start = periodStartUtc(period, anchor);
  const fullEnd = periodEndUtc(period, start);

  const isCurrent =
    start.getTime() <= todayStart.getTime() &&
    todayStart.getTime() <= fullEnd.getTime();
  const isFuture = start.getTime() > todayStart.getTime();

  const endDate = isCurrent ? todayStart : fullEnd;

  const days: string[] = [];
  if (!isFuture) {
    for (
      let cursor = new Date(start);
      cursor.getTime() <= endDate.getTime();
      cursor = addDaysUtc(cursor, 1)
    ) {
      days.push(toIsoDate(cursor));
    }
  }

  return {
    start: toIsoDate(start),
    end: toIsoDate(endDate),
    days,
    isCurrent,
    isFuture,
  };
}

function formatDayLabel(isoDate: string, totalDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (totalDays <= 7) {
    const dow = ["일", "월", "화", "수", "목", "금", "토"];
    return dow[date.getUTCDay()];
  }
  return `${m}/${d}`;
}

async function fetchPeriodPlans(
  period: Period,
  anchor: Date
): Promise<{
  range: ReturnType<typeof getRange>;
  plans: PlanWithTags[];
}> {
  const supabase = await createSupabaseServerClient();
  const range = getRange(period, anchor);

  if (range.isFuture) {
    return { range, plans: [] };
  }

  const { data, error } = await supabase
    .from("plans")
    .select(
      `
        id, user_id, content, plan_date, plan_time, is_done, done_at, created_at, updated_at,
        plan_tags ( tags ( id, user_id, name, color, is_default, created_at ) )
      `
    )
    .gte("plan_date", range.start)
    .lte("plan_date", range.end)
    .order("plan_date", { ascending: true });

  if (error) throw new Error(error.message);

  const plans: PlanWithTags[] = (data ?? []).map((row: any) => ({
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

  return { range, plans };
}

export function computeDaily(plans: PlanWithTags[], days: string[]): DailyPoint[] {
  const buckets = new Map<string, { total: number; done: number }>();
  for (const d of days) buckets.set(d, { total: 0, done: 0 });

  for (const p of plans) {
    const b = buckets.get(p.plan_date);
    if (!b) continue;
    b.total += 1;
    if (p.is_done) b.done += 1;
  }

  return days.map((date) => {
    const b = buckets.get(date)!;
    const rate = b.total === 0 ? 0 : Math.round((b.done / b.total) * 100);
    return { date, label: formatDayLabel(date, days.length), total: b.total, done: b.done, rate };
  });
}

export function computeTagStats(plans: PlanWithTags[]): TagStat[] {
  const map = new Map<string, { tag: Tag; total: number; done: number }>();

  for (const p of plans) {
    for (const t of p.tags) {
      let entry = map.get(t.id);
      if (!entry) {
        entry = { tag: t, total: 0, done: 0 };
        map.set(t.id, entry);
      }
      entry.total += 1;
      if (p.is_done) entry.done += 1;
    }
  }

  return Array.from(map.values())
    .map(({ tag, total, done }) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      total,
      done,
      rate: total === 0 ? 0 : Math.round((done / total) * 100),
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ko"));
}

export function summarize(plans: PlanWithTags[], byTag: TagStat[]): ReportSummary {
  const total = plans.length;
  const done = plans.reduce((acc, p) => acc + (p.is_done ? 1 : 0), 0);
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, rate, topTags: byTag.slice(0, 5) };
}

export async function getReportData(
  period: Period,
  anchor: Date = kstNow()
): Promise<ReportData> {
  const { range, plans } = await fetchPeriodPlans(period, anchor);
  const daily = computeDaily(plans, range.days);
  const byTag = computeTagStats(plans);
  const summary = summarize(plans, byTag);
  return {
    period,
    anchor: toIsoDate(anchor),
    start: range.start,
    end: range.end,
    daily,
    byTag,
    summary,
    isCurrent: range.isCurrent,
    isFuture: range.isFuture,
  };
}

export async function getHomeQuickStats(): Promise<{
  weekRate: number;
  weekTotal: number;
  weekDone: number;
  topTags: TagStat[];
}> {
  const r = await getReportData("week");
  return {
    weekRate: r.summary.rate,
    weekTotal: r.summary.total,
    weekDone: r.summary.done,
    topTags: r.summary.topTags.slice(0, 3),
  };
}
