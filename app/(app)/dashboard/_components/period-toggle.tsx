"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Period } from "@/lib/stats";

const OPTIONS: ReadonlyArray<{ value: Period; label: string }> = [
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
] as const;

export function PeriodToggle({ current }: { current: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingValue, startTransition] = useOptimisticPeriod(current);

  function handleClick(next: Period) {
    if (next === pendingValue) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", next);
    startTransition(next, () => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      role="tablist"
      aria-label="기간 선택"
      className="inline-flex rounded-full border border-border bg-card p-1"
    >
      {OPTIONS.map((opt) => {
        const active = pendingValue === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => handleClick(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function useOptimisticPeriod(current: Period) {
  const [optimistic, setOptimistic] = React.useState<Period>(current);
  const [, startReactTransition] = React.useTransition();

  React.useEffect(() => {
    setOptimistic(current);
  }, [current]);

  function start(next: Period, fn: () => void) {
    setOptimistic(next);
    startReactTransition(fn);
  }

  return [optimistic, start] as const;
}
