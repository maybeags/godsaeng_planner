"use client";

import { cn } from "@/lib/utils";
import { TAG_COLOR_CLASSES } from "@/components/ui/badge";
import type { MonthGridCell } from "@/lib/date";
import type { PlanWithTags } from "@/lib/supabase/types";

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarGrid({
  cells,
  plansByDate,
  todayIso,
  selectedIso,
  onSelect,
}: {
  cells: MonthGridCell[];
  plansByDate: Record<string, PlanWithTags[]>;
  todayIso: string;
  selectedIso: string | null;
  onSelect: (iso: string) => void;
}) {
  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 pb-2">
        {DOW_KO.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-[11px] font-medium",
              i === 0 && "text-rose-500/80",
              i === 6 && "text-blue-500/80",
              i !== 0 && i !== 6 && "text-muted-foreground"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => {
          const dayPlans = plansByDate[c.iso] ?? [];
          const total = dayPlans.length;
          const done = dayPlans.filter((p) => p.is_done).length;
          const allDone = total > 0 && done === total;
          const someDone = done > 0 && done < total;

          const isSelected = c.iso === selectedIso;
          const isToday = c.iso === todayIso;

          return (
            <button
              key={c.iso}
              type="button"
              onClick={() => onSelect(c.iso)}
              aria-label={
                total > 0
                  ? `${c.iso}, 플랜 ${total}개 중 ${done}개 완료`
                  : c.iso
              }
              aria-pressed={isSelected}
              className={cn(
                "group relative flex aspect-square flex-col items-stretch overflow-hidden rounded-lg border p-1.5 text-left transition-all md:aspect-auto md:min-h-[6.5rem]",
                !c.isCurrent && "opacity-40",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card/40 hover:border-primary/50 hover:bg-accent/40"
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "inline-flex min-w-[1.25rem] items-center justify-center text-xs font-medium tabular-nums",
                    c.dow === 0 && c.isCurrent && !isToday && "text-rose-500/90",
                    c.dow === 6 && c.isCurrent && !isToday && "text-blue-500/90",
                    isToday &&
                      "size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  )}
                >
                  {c.d}
                </span>

                {/* 모바일 전용: 점 인디케이터 */}
                {total > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full md:hidden",
                      allDone && "bg-primary",
                      someDone && "bg-primary/40",
                      done === 0 && "bg-muted-foreground/50"
                    )}
                  />
                )}
              </div>

              {/* PC 전용: 플랜 미리보기 (태그 색상으로 구분) */}
              {total > 0 && (
                <div className="mt-1 hidden flex-1 flex-col gap-0.5 overflow-hidden md:flex">
                  {dayPlans.slice(0, 3).map((p) => {
                    const tagColor = p.tags[0]?.color;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                          p.is_done
                            ? "text-muted-foreground line-through opacity-70"
                            : tagColor
                              ? TAG_COLOR_CLASSES[tagColor]
                              : "bg-muted/60 text-foreground/80"
                        )}
                      >
                        {p.content}
                      </div>
                    );
                  })}
                  {total > 3 && (
                    <div className="px-1 text-[10px] text-muted-foreground">
                      +{total - 3}개
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
