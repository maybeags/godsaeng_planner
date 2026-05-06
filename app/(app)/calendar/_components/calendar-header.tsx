import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { todayIsoDate } from "@/lib/date";

function fmtMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  let m = month + delta;
  let y = year;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return { year: y, month: m };
}

export function CalendarHeader({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  const today = todayIsoDate();
  const [ty, tm] = today.split("-").map(Number);
  const isCurrentMonth = ty === year && tm === month;

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/calendar?month=${fmtMonthParam(prev.year, prev.month)}`}
        scroll={false}
        prefetch={false}
        aria-label="이전 달"
        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </Link>

      <div className="min-w-[8rem] px-3 text-center">
        <span className="text-sm font-semibold tabular-nums">
          {year}년 {month}월
        </span>
      </div>

      <Link
        href={`/calendar?month=${fmtMonthParam(next.year, next.month)}`}
        scroll={false}
        prefetch={false}
        aria-label="다음 달"
        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </Link>

      {isCurrentMonth ? (
        <span
          aria-disabled="true"
          className="ml-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          이번 달
        </span>
      ) : (
        <Link
          href="/calendar"
          scroll={false}
          prefetch={false}
          className="ml-1 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
        >
          이번 달
        </Link>
      )}
    </div>
  );
}
