"use client";

import * as React from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateNickname } from "../actions";

export function NicknameEditor({ initial }: { initial: string }) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function start() {
    setValue(initial);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setValue(initial);
    setError(null);
    setEditing(false);
  }

  function save() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    if (trimmed === initial) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      try {
        await updateNickname(trimmed);
        setEditing(false);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 실패");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">{initial}</span>
        <button
          type="button"
          onClick={start}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="닉네임 수정"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              cancel();
            }
          }}
          maxLength={20}
          disabled={pending}
          className={cn(
            "min-w-0 flex-1 rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none transition-colors",
            error
              ? "border-destructive/60 focus:border-destructive"
              : "border-border focus:border-primary"
          )}
        />
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={save}
          disabled={pending || !value.trim()}
          aria-label="저장"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={cancel}
          disabled={pending}
          aria-label="취소"
        >
          <X className="size-3.5" />
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
