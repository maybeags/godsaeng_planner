"use client";

import * as React from "react";
import { Loader2, Plus, Trash2, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagPill } from "../../planner/_components/tag-pill";
import { TAG_COLOR_CLASSES } from "@/components/ui/badge";
import { ALL_TAG_COLORS, pickTagColor } from "@/lib/tag-color";
import { cn } from "@/lib/utils";
import type { Tag, TagColor } from "@/lib/supabase/types";
import {
  createCustomTag,
  deleteCustomTag,
  updateTagColor,
} from "../actions";

export function TagManager({ tags }: { tags: Tag[] }) {
  const [name, setName] = React.useState("");
  const [pickedColor, setPickedColor] = React.useState<TagColor | null>(null);
  const [adding, startAdd] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);
  const [colorOpenFor, setColorOpenFor] = React.useState<string | null>(null);
  const [pendingColor, setPendingColor] = React.useState<string | null>(null);

  const previewName = name.trim().replace(/^#/, "");
  const previewColor: TagColor =
    pickedColor ?? (previewName ? pickTagColor(previewName) : "custom");

  const defaults = tags.filter((t) => t.is_default);
  const customs = tags.filter((t) => !t.is_default);

  function handleAdd() {
    const trimmed = name.trim().replace(/^#/, "");
    if (!trimmed) {
      setError("태그 이름을 입력해 주세요.");
      return;
    }
    startAdd(async () => {
      try {
        await createCustomTag(trimmed, pickedColor ?? undefined);
        setName("");
        setPickedColor(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "추가 실패");
      }
    });
  }

  async function handleDelete(tagId: string) {
    if (!confirm("이 태그를 삭제할까요? 기존 플랜에서도 사라져요.")) return;
    setPendingDelete(tagId);
    try {
      await deleteCustomTag(tagId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setPendingDelete(null);
    }
  }

  async function handleChangeColor(tagId: string, color: TagColor) {
    setPendingColor(tagId);
    try {
      await updateTagColor(tagId, color);
      setColorOpenFor(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "색상 변경 실패");
    } finally {
      setPendingColor(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* 추가 입력 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-border bg-background px-2.5 py-1.5 focus-within:border-primary/60">
            <span className="text-sm text-muted-foreground">#</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="새 태그 (예: 운동)"
              maxLength={20}
              disabled={adding}
              className="ml-1 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            {previewName && (
              <TagPill
                name={previewName}
                color={previewColor}
                size="sm"
                className="ml-2"
              />
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={adding || !name.trim()}
          >
            {adding ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span>추가</span>
          </Button>
        </div>

        {/* 색상 팔레트 (선택) */}
        <details className="group">
          <summary className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Palette className="size-3" />
            <span>색상 직접 고르기 (선택)</span>
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setPickedColor(null)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                pickedColor === null
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              자동
            </button>
            {ALL_TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPickedColor(c)}
                aria-label={`${c} 색상 선택`}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] transition-transform",
                  TAG_COLOR_CLASSES[c],
                  pickedColor === c
                    ? "ring-2 ring-primary/60"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </details>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>

      {/* 기본 태그 */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          기본 태그 ({defaults.length})
        </h3>
        <ul className="flex flex-wrap gap-2">
          {defaults.map((t) => (
            <TagRow
              key={t.id}
              tag={t}
              isOpen={colorOpenFor === t.id}
              onToggleColor={() =>
                setColorOpenFor(colorOpenFor === t.id ? null : t.id)
              }
              onPickColor={(c) => handleChangeColor(t.id, c)}
              colorPending={pendingColor === t.id}
            />
          ))}
        </ul>
      </section>

      {/* 커스텀 태그 */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          내 태그 ({customs.length})
        </h3>
        {customs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            아직 만든 태그가 없어요. 위에서 새 태그를 추가해 보세요.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {customs.map((t) => (
              <TagRow
                key={t.id}
                tag={t}
                deletable
                deletePending={pendingDelete === t.id}
                onDelete={() => handleDelete(t.id)}
                isOpen={colorOpenFor === t.id}
                onToggleColor={() =>
                  setColorOpenFor(colorOpenFor === t.id ? null : t.id)
                }
                onPickColor={(c) => handleChangeColor(t.id, c)}
                colorPending={pendingColor === t.id}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TagRow({
  tag,
  deletable,
  deletePending,
  onDelete,
  isOpen,
  onToggleColor,
  onPickColor,
  colorPending,
}: {
  tag: Tag;
  deletable?: boolean;
  deletePending?: boolean;
  onDelete?: () => void;
  isOpen: boolean;
  onToggleColor: () => void;
  onPickColor: (c: TagColor) => void;
  colorPending: boolean;
}) {
  return (
    <li className="relative">
      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 py-0.5 pl-1 pr-1">
        <button
          type="button"
          onClick={onToggleColor}
          className="rounded-full transition-transform hover:scale-105"
          aria-label="색상 변경"
        >
          <TagPill name={tag.name} color={tag.color} size="sm" />
        </button>
        {deletable && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="태그 삭제"
          >
            {deletePending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-popover p-2 shadow-xl">
          <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            색상 변경
          </p>
          <div className="flex flex-wrap gap-1">
            {ALL_TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onPickColor(c)}
                disabled={colorPending}
                aria-label={`${c} 색상`}
                className={cn(
                  "relative size-5 rounded-full border transition-transform hover:scale-110 disabled:opacity-50",
                  TAG_COLOR_CLASSES[c]
                )}
              >
                {tag.color === c && (
                  <Check className="absolute inset-0 m-auto size-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
