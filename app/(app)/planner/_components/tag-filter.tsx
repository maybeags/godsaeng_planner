"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TAG_COLOR_CLASSES } from "@/components/ui/badge";
import type { Tag } from "@/lib/supabase/types";
import { ListFilter, Search, X } from "lucide-react";

const SEARCH_THRESHOLD = 5; // 태그가 이 수보다 많을 때 검색 input 노출

export function TagFilter({
  tags,
  selected,
  onChange,
}: {
  tags: Tag[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [query, setQuery] = React.useState("");

  const queryLower = query.trim().toLowerCase();

  // 검색 시: 선택된 태그는 보존(선택 가시성 유지) + 검색어 매치 태그 추가
  const visible = React.useMemo(() => {
    if (!queryLower) return tags;
    return tags.filter(
      (t) => selected.has(t.id) || t.name.toLowerCase().includes(queryLower)
    );
  }, [tags, queryLower, selected]);

  const noMatch = React.useMemo(() => {
    if (!queryLower) return false;
    return !tags.some((t) => t.name.toLowerCase().includes(queryLower));
  }, [tags, queryLower]);

  if (tags.length === 0) return null;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function clear() {
    onChange(new Set());
  }

  return (
    <div className="space-y-2">
      {/* 위 행: 필터 라벨 + 전체 버튼 + (조건부) 검색 입력 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ListFilter className="size-3.5" />
          필터
        </span>

        <button
          type="button"
          onClick={clear}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            selected.size === 0
              ? "border-primary/40 bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:bg-accent"
          )}
        >
          전체
        </button>

        {tags.length > SEARCH_THRESHOLD && (
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 transition-colors focus-within:border-primary/50">
            <Search className="size-3 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="태그 검색"
              aria-label="태그 검색"
              className="w-24 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="검색어 지우기"
                className="rounded-sm text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        {selected.size > 0 && (
          <button
            type="button"
            onClick={clear}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> 초기화
          </button>
        )}
      </div>

      {/* 아래 행: 태그 칩 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {visible.map((t) => {
          const active = selected.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                active
                  ? TAG_COLOR_CLASSES[t.color]
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="opacity-70">#</span>
              {t.name}
            </button>
          );
        })}

        {noMatch && (
          <span className="text-xs text-muted-foreground">
            일치하는 태그 없음
          </span>
        )}
      </div>
    </div>
  );
}
