"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Variant = "icon" | "row";

export function ThemeToggle({
  variant = "icon",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = mounted ? resolvedTheme ?? theme : "dark";
  const isDark = current === "dark";
  const next = isDark ? "light" : "dark";
  const labelNext = isDark ? "라이트 모드로" : "다크 모드로";

  function toggle() {
    setTheme(next);
  }

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={labelNext}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2 text-sm transition-colors hover:bg-accent",
          className
        )}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          {mounted ? (
            isDark ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )
          ) : (
            <span className="size-4" />
          )}
          <span className="font-medium text-foreground">
            {mounted ? (isDark ? "다크 모드" : "라이트 모드") : "테마"}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">{labelNext}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={labelNext}
      title={labelNext}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  );
}
