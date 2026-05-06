"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { addDaysUtc, todayIsoDate, toIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { MonthCalendar } from "./month-calendar";

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

function parseIsoToUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatLabel(iso: string): { main: string; relative: string | null } {
  const d = parseIsoToUtc(iso);
  const main = `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${DOW_KO[d.getUTCDay()]})`;

  const today = todayIsoDate();
  const yesterday = toIsoDate(addDaysUtc(parseIsoToUtc(today), -1));
  const tomorrow = toIsoDate(addDaysUtc(parseIsoToUtc(today), 1));

  let relative: string | null = null;
  if (iso === today) relative = "오늘";
  else if (iso === yesterday) relative = "어제";
  else if (iso === tomorrow) relative = "내일";

  return { main, relative };
}

export function DateNav({ selectedDate }: { selectedDate: string }) {
  const { main, relative } = formatLabel(selectedDate);

  const dateUtc = parseIsoToUtc(selectedDate);
  const prevIso = toIsoDate(addDaysUtc(dateUtc, -1));
  const nextIso = toIsoDate(addDaysUtc(dateUtc, 1));

  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // selectedDate 가 바뀌면(=다른 페이지에서 navigate) 팝오버 자동 닫기
  React.useEffect(() => {
    setOpen(false);
  }, [selectedDate]);

  // 바깥 클릭 → 닫기
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className="flex items-center gap-1.5">
      <Link
        href={`/planner?date=${prevIso}`}
        scroll={false}
        prefetch={false}
        aria-label="어제로"
        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="월간 캘린더 열기"
          aria-expanded={open}
          className={cn(
            "flex min-w-[10rem] items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-center transition-colors",
            "hover:bg-accent",
            open && "bg-accent"
          )}
        >
          <CalendarDays className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold tabular-nums">{main}</span>
          {relative && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
              {relative}
            </span>
          )}
        </button>

        {open && (
          <MonthCalendar
            selectedDate={selectedDate}
            onClose={() => setOpen(false)}
          />
        )}
      </div>

      <Link
        href={`/planner?date=${nextIso}`}
        scroll={false}
        prefetch={false}
        aria-label="내일로"
        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
