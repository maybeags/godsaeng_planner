"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayIsoDate, buildMonthGrid } from "@/lib/date";

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function MonthCalendar({
  selectedDate,
  onClose,
}: {
  selectedDate: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const todayIso = React.useMemo(() => todayIsoDate(), []);
  const sel = parseIso(selectedDate);

  const [view, setView] = React.useState<{ year: number; month: number }>({
    year: sel.y,
    month: sel.m,
  });

  const cells = React.useMemo(
    () => buildMonthGrid(view.year, view.month),
    [view]
  );

  function changeMonth(delta: number) {
    setView((cur) => {
      const next = cur.month + delta;
      if (next < 1) return { year: cur.year - 1, month: 12 };
      if (next > 12) return { year: cur.year + 1, month: 1 };
      return { year: cur.year, month: next };
    });
  }

  function jumpToToday() {
    const t = parseIso(todayIso);
    setView({ year: t.y, month: t.m });
    onClose();
    router.push("/planner", { scroll: false });
  }

  function pickDate(iso: string) {
    onClose();
    router.push(`/planner?date=${iso}`, { scroll: false });
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2">
      <div
        role="dialog"
        aria-label="월간 캘린더"
        className="w-[19rem] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl ring-1 ring-primary/10 animate-fade-in"
      >
      {/* 월 헤더 */}
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="이전 달"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold tabular-nums">
          {view.year}년 {view.month}월
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="다음 달"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-0.5 pb-1">
        {DOW_KO.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-1 text-center text-[10px] font-medium",
              i === 0 && "text-rose-500/80",
              i === 6 && "text-blue-500/80",
              i !== 0 && i !== 6 && "text-muted-foreground"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c) => {
          const isSelected = c.iso === selectedDate;
          const isToday = c.iso === todayIso;
          return (
            <button
              key={c.iso}
              type="button"
              onClick={() => pickDate(c.iso)}
              aria-label={c.iso}
              aria-pressed={isSelected}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-xs tabular-nums transition-all",
                !c.isCurrent && "text-muted-foreground/40",
                c.isCurrent &&
                  !isSelected &&
                  c.dow === 0 &&
                  "text-rose-500/90",
                c.isCurrent &&
                  !isSelected &&
                  c.dow === 6 &&
                  "text-blue-500/90",
                !isSelected && "hover:bg-accent",
                isSelected &&
                  "bg-primary font-semibold text-primary-foreground shadow-sm",
                !isSelected &&
                  isToday &&
                  "ring-1 ring-inset ring-primary/60"
              )}
            >
              {c.d}
            </button>
          );
        })}
      </div>

      {/* 푸터 — 오늘로 점프 */}
      <div className="mt-2 flex justify-end border-t border-border/60 pt-2">
        <button
          type="button"
          onClick={jumpToToday}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
        >
          오늘로
        </button>
      </div>
      </div>
    </div>
  );
}
