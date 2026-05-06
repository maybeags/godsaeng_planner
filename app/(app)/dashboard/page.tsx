import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TagPill } from "../planner/_components/tag-pill";
import { DailyChart } from "./_components/daily-chart";
import { PeriodToggle } from "./_components/period-toggle";
import { RangeNav } from "./_components/range-nav";
import { SummaryCards } from "./_components/summary-cards";
import { TagChart } from "./_components/tag-chart";
import {
  getNeighborAnchor,
  getRange,
  getReportData,
  parseAnchor,
  type Period,
} from "@/lib/stats";

export const dynamic = "force-dynamic";

function parsePeriod(raw: string | string[] | undefined): Period {
  return raw === "month" ? "month" : "week";
}

function formatRangeLabel(period: Period, start: string, end: string): string {
  const [, sm, sd] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  if (period === "month") return `${ey}년 ${em}월`;
  const [, em2, ed] = end.split("-").map(Number);
  return `${sm}/${sd} – ${em2}/${ed}`;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildHref(period: Period, anchorIso?: string): string {
  return anchorIso
    ? `/dashboard?period=${period}&anchor=${anchorIso}`
    : `/dashboard?period=${period}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; anchor?: string }>;
}) {
  const { period: rawPeriod, anchor: rawAnchor } = await searchParams;
  const period = parsePeriod(rawPeriod);
  const anchor = parseAnchor(rawAnchor);
  const report = await getReportData(period, anchor);
  const rangeLabel = formatRangeLabel(period, report.start, report.end);
  const isEmpty = report.summary.total === 0;

  const prevDate = getNeighborAnchor(period, anchor, -1);
  const nextDate = getNeighborAnchor(period, anchor, +1);
  const nextRange = getRange(period, nextDate);

  const prevHref = buildHref(period, toIso(prevDate));
  const nextHref = nextRange.isFuture ? null : buildHref(period, toIso(nextDate));
  const todayHref = buildHref(period);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          나의 갓생 리포트
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PeriodToggle current={period} />
          <RangeNav
            label={rangeLabel}
            prevHref={prevHref}
            nextHref={nextHref}
            todayHref={todayHref}
            isCurrent={report.isCurrent}
          />
        </div>
      </header>

      {isEmpty ? (
        <EmptyReport period={period} isCurrent={report.isCurrent} />
      ) : (
        <>
          <SummaryCards summary={report.summary} rangeLabel={rangeLabel} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">일별 성취율</CardTitle>
              <CardDescription>
                {period === "week"
                  ? "월요일부터 날짜별 완료 비율"
                  : "한 달 동안 날짜별 완료 비율"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyChart data={report.daily} period={period} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">태그별 성취율</CardTitle>
              <CardDescription>많이 쓴 태그 순</CardDescription>
            </CardHeader>
            <CardContent>
              {report.byTag.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  아직 # 태그가 붙은 플랜이 없어요.
                </p>
              ) : (
                <TagChart data={report.byTag} />
              )}
            </CardContent>
          </Card>

          {report.summary.topTags.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">가장 많이 쓴 태그</CardTitle>
                <CardDescription>top {report.summary.topTags.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.summary.topTags.map((t, i) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-xs tabular-nums text-muted-foreground">
                          {i + 1}
                        </span>
                        <TagPill name={t.name} color={t.color} size="sm" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t.done}/{t.total} ·{" "}
                        <span className="font-semibold text-primary">
                          {t.rate}%
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function EmptyReport({
  period,
  isCurrent,
}: {
  period: Period;
  isCurrent: boolean;
}) {
  const unit = period === "week" ? "주" : "달";
  const title = isCurrent
    ? `이번 ${unit} 데이터가 아직 없어요`
    : `이 ${unit}에는 기록이 없어요`;
  const desc = isCurrent
    ? "플래너에서 한 줄 적으면 여기에 성취율이 쌓이기 시작해요."
    : "다른 기간을 선택하거나 오늘로 돌아와보세요.";
  return (
    <Card className="border-dashed bg-card/30">
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <Sparkles className="mb-3 size-7 text-primary" />
        <p className="text-base font-medium">{title}</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
