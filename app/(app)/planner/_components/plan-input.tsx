"use client";

import * as React from "react";
import { Loader2, Plus, Hash, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagPill } from "./tag-pill";
import { extractTags, findActiveTagToken } from "@/lib/parse-tags";
import { pickTagColor } from "@/lib/tag-color";
import { createPlan } from "../actions";
import { cn } from "@/lib/utils";
import type { Tag, TagColor } from "@/lib/supabase/types";

const PLACEHOLDERS = [
  "오늘 뭐 했어? 예: 영어 단어 30개 외우기 #학교",
  "10초만 써봐. # 입력하면 태그가 떠요.",
  "스타벅스 가서 공부 #학교 #카페",
  "친구랑 떡볶이 #친구 #식사",
];

export function PlanInput({
  tags,
  selectedDate,
}: {
  tags: Tag[];
  selectedDate: string;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const timeInputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  const [time, setTime] = React.useState(""); // "" = 시간 미지정
  const [active, setActive] = React.useState<{
    start: number;
    query: string;
  } | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [placeholder] = React.useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  // 라이브 파싱된 태그
  const { tags: parsedTagNames } = React.useMemo(
    () => extractTags(value),
    [value]
  );

  // 자동완성 후보
  const suggestions = React.useMemo(() => {
    if (!active) return [];
    const q = active.query.toLowerCase();
    return tags
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [active, tags]);

  const showCreateNew =
    active &&
    active.query.length > 0 &&
    !tags.some((t) => t.name === active.query);

  function syncActive(el: HTMLTextAreaElement) {
    const cursor = el.selectionStart ?? el.value.length;
    setActive(findActiveTagToken(el.value, cursor));
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    syncActive(e.target);
    if (error) setError(null);
  }

  function pickTag(name: string) {
    if (!active || !textareaRef.current) return;
    const el = textareaRef.current;
    const before = value.slice(0, active.start);
    const after = value.slice(active.start + 1 + active.query.length);
    const next = `${before}#${name} ${after}`;
    setValue(next);
    setActive(null);
    // 커서를 삽입한 태그 뒤로 이동
    requestAnimationFrame(() => {
      el.focus();
      const pos = before.length + name.length + 2; // # + name + space
      el.setSelectionRange(pos, pos);
    });
  }

  function quickInsertTag(name: string) {
    const el = textareaRef.current;
    const needsSpace = value.length > 0 && !value.endsWith(" ");
    const next = `${value}${needsSpace ? " " : ""}#${name} `;
    setValue(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(next.length, next.length);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (active && suggestions.length > 0) {
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        pickTag(suggestions[0].name);
        return;
      }
      if (e.key === "Escape") {
        setActive(null);
        return;
      }
    }
    // ⌘/Ctrl + Enter 로 제출
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    const { content } = extractTags(trimmed);
    if (!content) {
      setError("태그 말고 내용도 한 줄 적어줘 :)");
      return;
    }

    startTransition(async () => {
      try {
        await createPlan(trimmed, {
          planDate: selectedDate,
          planTime: time || null,
        });
        setValue("");
        setTime("");
        setActive(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 실패");
      }
    });
  }

  // 빠른 태그 칩 — 기본 태그 우선, 없으면 가장 최근 6개
  const quickTags = React.useMemo(() => {
    const defaults = tags.filter((t) => t.is_default);
    if (defaults.length >= 5) return defaults.slice(0, 6);
    const others = tags.filter((t) => !t.is_default).slice(0, 6 - defaults.length);
    return [...defaults, ...others];
  }, [tags]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl border border-border bg-card/60 p-3 shadow-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyUp={(e) => syncActive(e.currentTarget)}
          onClick={(e) => syncActive(e.currentTarget)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
          disabled={isPending}
        />

        {/* 자동완성 팝오버 — 본체와 시각적 분리: 더 밝은 popover bg + 강한 그림자 + 링 */}
        {active && (suggestions.length > 0 || showCreateNew) && (
          <div className="absolute left-3 right-3 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl ring-1 ring-primary/10 backdrop-blur-md animate-fade-in">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <span>태그 추천</span>
              <span>
                <kbd className="rounded bg-background/80 px-1 font-mono">Tab</kbd>{" "}
                선택 ·{" "}
                <kbd className="rounded bg-background/80 px-1 font-mono">Esc</kbd>{" "}
                닫기
              </span>
            </div>
            <ul className="max-h-64 divide-y divide-border overflow-auto">
              {suggestions.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickTag(t.name);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                      i === 0 && "bg-accent/50"
                    )}
                  >
                    <TagPill name={t.name} color={t.color} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {t.is_default ? "기본" : "내 태그"}
                      {i === 0 && " · Tab"}
                    </span>
                  </button>
                </li>
              ))}
              {showCreateNew && (
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickTag(active!.query);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <Plus className="size-3.5 text-primary" />
                    <span>
                      새 태그{" "}
                      <span className="font-medium text-primary">
                        #{active!.query}
                      </span>{" "}
                      만들기
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* 라이브 파싱된 태그 미리보기 */}
        {parsedTagNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
            {parsedTagNames.map((name) => {
              const existing = tags.find((t) => t.name === name);
              const color: TagColor = existing?.color ?? pickTagColor(name);
              return (
                <TagPill key={name} name={name} color={color} size="sm" />
              );
            })}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              #
            </kbd>{" "}
            로 태그,{" "}
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              ⌘/Ctrl + Enter
            </kbd>{" "}
            로 저장
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md border bg-background/60 px-2 py-1 text-xs transition-colors",
                time
                  ? "border-primary/50 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock
                className="size-3.5 cursor-pointer"
                onClick={() => timeInputRef.current?.showPicker?.()}
              />
              <input
                ref={timeInputRef}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isPending}
                aria-label="시간 (선택)"
                className="min-w-[5.5rem] cursor-pointer bg-transparent text-xs text-foreground outline-none"
              />
              {time && (
                <button
                  type="button"
                  onClick={() => setTime("")}
                  aria-label="시간 비우기"
                  className="rounded-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={isPending || !value.trim()}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              <span>추가</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 빠른 태그 칩 */}
      {quickTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Hash className="size-3.5 text-muted-foreground" />
          <span className="mr-1 text-xs text-muted-foreground">빠른 태그</span>
          {quickTags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => quickInsertTag(t.name)}
              className="transition-transform active:scale-95"
              aria-label={`태그 추가: ${t.name}`}
            >
              <TagPill name={t.name} color={t.color} size="sm" />
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <p className="font-medium">저장에 실패했어요</p>
          <p className="mt-1 break-all font-mono text-[11px] opacity-90">
            {error}
          </p>
          {/relation .* does not exist|schema|table|permission denied/i.test(
            error
          ) && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              💡 Supabase Dashboard → SQL Editor 에서{" "}
              <code className="font-mono">supabase/schema.sql</code> 적용했는지
              확인해 주세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
