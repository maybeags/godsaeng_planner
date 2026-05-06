"use client";

import * as React from "react";
import type { MonthGridCell } from "@/lib/date";
import type { PlanWithTags } from "@/lib/supabase/types";
import { CalendarGrid } from "./calendar-grid";
import { DatePanel } from "./date-panel";

export function CalendarView({
  cells,
  plansByDate,
  todayIso,
}: {
  cells: MonthGridCell[];
  plansByDate: Record<string, PlanWithTags[]>;
  todayIso: string;
}) {
  // 기본 선택: 오늘이 그리드의 현재 월 안에 있으면 오늘, 아니면 그 달 1일
  const initialIso = React.useMemo(() => {
    if (cells.some((c) => c.iso === todayIso && c.isCurrent)) return todayIso;
    return cells.find((c) => c.isCurrent)?.iso ?? null;
  }, [cells, todayIso]);

  const [selectedIso, setSelectedIso] = React.useState<string | null>(
    initialIso
  );

  // 월이 바뀌면 (cells 가 바뀌면) 기본 선택으로 리셋
  React.useEffect(() => {
    setSelectedIso(initialIso);
  }, [initialIso]);

  return (
    <div className="space-y-4">
      <CalendarGrid
        cells={cells}
        plansByDate={plansByDate}
        todayIso={todayIso}
        selectedIso={selectedIso}
        onSelect={(iso) =>
          setSelectedIso((cur) => (cur === iso ? null : iso))
        }
      />

      {selectedIso && (
        <DatePanel
          iso={selectedIso}
          plans={plansByDate[selectedIso] ?? []}
        />
      )}
    </div>
  );
}
