"use client";

import * as React from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deletePost, updatePostReflection } from "../actions";

const REFLECTION_MAX = 500;

/**
 * 자기 자랑글의 reflection 박스를 감싸는 client wrapper.
 * 평소: reflection 텍스트 + 우하단에 수정/삭제 아이콘.
 * 수정 모드: 인라인 textarea + 저장/취소.
 */
export function OwnPostReflection({
  postId,
  initialReflection,
}: {
  postId: string;
  initialReflection: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialReflection);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValue(initialReflection);
  }, [initialReflection]);

  function startEdit() {
    setValue(initialReflection);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setValue(initialReflection);
    setError(null);
    setEditing(false);
  }

  function saveEdit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("감상문을 적어주세요.");
      return;
    }
    if (trimmed === initialReflection) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      try {
        await updatePostReflection(postId, trimmed);
        setEditing(false);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 실패");
      }
    });
  }

  function handleDelete() {
    if (!confirm("이 자랑글을 삭제할까요?")) return;
    startTransition(async () => {
      try {
        await deletePost(postId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "삭제 실패");
      }
    });
  }

  if (editing) {
    return (
      <div className="mt-3 space-y-1.5 rounded-lg border border-primary/40 bg-background/60 p-2.5">
        <textarea
          autoFocus
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= REFLECTION_MAX) setValue(e.target.value);
            if (error) setError(null);
          }}
          rows={3}
          disabled={pending}
          className={cn(
            "w-full resize-none rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none transition-colors",
            error
              ? "border-destructive/60 focus:border-destructive"
              : "border-border focus:border-primary/60"
          )}
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {value.trim().length}/{REFLECTION_MAX}자
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={cancelEdit}
              disabled={pending}
            >
              <X className="size-3.5" />
              <span>취소</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveEdit}
              disabled={pending || !value.trim()}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              <span>저장</span>
            </Button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative mt-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 transition-opacity",
        pending && "opacity-60"
      )}
    >
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {initialReflection}
      </p>
      <div className="mt-2 flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={startEdit}
          disabled={pending}
          aria-label="수정"
          title="수정"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          aria-label="삭제"
          title="삭제"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
