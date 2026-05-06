"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
      <TriangleAlert className="mb-3 size-7 text-destructive" />
      <p className="text-base font-medium">화면을 불러오지 못했어요</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">
        잠깐의 네트워크 이슈일 수 있어요. 다시 시도해 주세요.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={reset}
      >
        다시 시도
      </Button>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">
          {error.digest}
        </p>
      )}
    </div>
  );
}
