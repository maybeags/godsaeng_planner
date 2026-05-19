"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  Loader2,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagPill } from "../../planner/_components/tag-pill";
import { cn } from "@/lib/utils";
import type { ComposeItem } from "@/lib/posts";
import { createPost } from "../actions";

const REFLECTION_MAX = 500;

export function PostComposer({
  initialItems,
  mode,
}: {
  initialItems: ComposeItem[];
  mode: "feed" | "planner";
}) {
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(initialItems.filter((i) => i.item.is_done).map((i) => i.planId))
  );
  const [reflection, setReflection] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const empty = initialItems.length === 0;
  const reflectionLen = reflection.trim().length;
  const canSubmit =
    selected.size > 0 && reflectionLen >= 1 && reflectionLen <= REFLECTION_MAX;

  function toggle(planId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) next.delete(planId);
      else next.add(planId);
      return next;
    });
  }

  function submit() {
    if (!canSubmit) return;
    setError(null);
    const planIds = initialItems
      .map((i) => i.planId)
      .filter((id) => selected.has(id));

    startTransition(async () => {
      try {
        await createPost(planIds, reflection.trim());
        setReflection("");
        setSelected(new Set());
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "게시 실패");
      }
    });
  }

  // 헤더 라벨 — 모드별로 살짝 다르게
  const headerTitle =
    mode === "planner" ? "오늘의 갓생 자랑하기" : "오늘의 자랑 쓰기";
  const headerDesc =
    mode === "planner"
      ? "완료한 플랜을 골라 한 줄 회고와 함께 피드에 올려보세요."
      : "오늘 한 일들을 골라 한 줄 자랑해보세요. KST 오늘만 가능해요.";

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card/40 p-4 shadow-sm",
        "space-y-3"
      )}
    >
      <header className="flex items-start gap-2">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Megaphone className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{headerTitle}</h2>
          <p className="text-xs text-muted-foreground">{headerDesc}</p>
        </div>
      </header>

      {empty ? (
        <EmptyState mode={mode} />
      ) : (
        <>
          {/* 플랜 체크박스 리스트 */}
          <ul className="space-y-1.5">
            {initialItems.map(({ planId, item }) => {
              const checked = selected.has(planId);
              return (
                <li key={planId}>
                  <button
                    type="button"
                    onClick={() => toggle(planId)}
                    disabled={pending}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                      checked
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-background/30 hover:bg-accent/30",
                      pending && "opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      )}
                    >
                      {checked && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.plan_time && (
                          <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                            <Clock className="size-2.5" />
                            {item.plan_time.slice(0, 5)}
                          </span>
                        )}
                        {item.is_done && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/15 px-1 py-0.5 text-[10px] font-medium text-emerald-500">
                            <Check className="size-2.5" strokeWidth={3} />
                            완료
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 break-words text-sm leading-snug",
                          !item.is_done && "text-muted-foreground"
                        )}
                      >
                        {item.content}
                      </p>
                      {item.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags.map((t) => (
                            <TagPill
                              key={t.name}
                              name={t.name}
                              color={t.color}
                              size="sm"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* 감상문 */}
          <div className="space-y-1">
            <textarea
              value={reflection}
              onChange={(e) => {
                if (e.target.value.length <= REFLECTION_MAX) {
                  setReflection(e.target.value);
                }
                if (error) setError(null);
              }}
              placeholder="오늘은 어땠어요? 한 줄 회고를 적어보세요."
              rows={3}
              disabled={pending}
              className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {selected.size}개 플랜 선택 · {reflectionLen}/{REFLECTION_MAX}자
              </span>
              <Button
                type="button"
                size="sm"
                onClick={submit}
                disabled={!canSubmit || pending}
              >
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Megaphone className="size-3.5" />
                )}
                <span>자랑하기</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {success && (
        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">
          <Sparkles className="size-3.5" />
          <span>자랑 완료! 피드에서 확인해 보세요.</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </section>
  );
}

function EmptyState({ mode }: { mode: "feed" | "planner" }) {
  if (mode === "planner") {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
        오늘 작성한 플랜이 없어요. 위에서 한 줄 적고 다시 와볼게요.
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
      <p>오늘 작성한 플랜이 없어요.</p>
      <Link
        href="/planner"
        className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
      >
        플래너에서 한 줄 적기 →
      </Link>
    </div>
  );
}
