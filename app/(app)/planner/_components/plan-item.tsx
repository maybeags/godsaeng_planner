"use client";

import * as React from "react";
import { Check, Trash2, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagPill } from "./tag-pill";
import { togglePlanDone, deletePlan } from "../actions";
import type { PlanWithTags } from "@/lib/supabase/types";

export function PlanItem({ plan }: { plan: PlanWithTags }) {
  const [isPending, startTransition] = React.useTransition();
  const [optimisticDone, setOptimisticDone] = React.useState(plan.is_done);

  // 서버 데이터가 바뀌면 동기화
  React.useEffect(() => {
    setOptimisticDone(plan.is_done);
  }, [plan.is_done]);

  function handleToggle() {
    const next = !optimisticDone;
    setOptimisticDone(next);
    startTransition(async () => {
      try {
        await togglePlanDone(plan.id, next);
      } catch {
        setOptimisticDone(!next); // 롤백
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 플랜을 삭제할까요?")) return;
    startTransition(async () => {
      await deletePlan(plan.id);
    });
  }

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border bg-card/40 p-3 transition-all",
        "hover:bg-card/70",
        isPending && "opacity-60"
      )}
    >
      {/* 체크박스 */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={optimisticDone ? "완료 취소" : "완료 표시"}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
          optimisticDone
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary/60"
        )}
      >
        {optimisticDone && <Check className="size-3" strokeWidth={3} />}
      </button>

      {/* 본문 + 태그 */}
      <div className="min-w-0 flex-1">
        {plan.plan_time && (
          <div
            className={cn(
              "mb-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary",
              optimisticDone && "bg-muted/60 text-muted-foreground"
            )}
          >
            <Clock className="size-3" />
            <span className="font-mono tabular-nums">
              {plan.plan_time.slice(0, 5)}
            </span>
          </div>
        )}
        <p
          className={cn(
            "break-words text-sm leading-relaxed",
            optimisticDone && "text-muted-foreground line-through"
          )}
        >
          {plan.content}
        </p>
        {plan.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {plan.tags.map((t) => (
              <TagPill key={t.id} name={t.name} color={t.color} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* 삭제 */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="플랜 삭제"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </button>
    </li>
  );
}
