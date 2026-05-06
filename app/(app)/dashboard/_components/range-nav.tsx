import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function RangeNav({
  label,
  prevHref,
  nextHref,
  todayHref,
  isCurrent,
}: {
  label: string;
  prevHref: string;
  nextHref: string | null;
  todayHref: string;
  isCurrent: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={prevHref}
        scroll={false}
        prefetch={false}
        aria-label="이전 기간"
        className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </Link>

      <span className="min-w-[8.5rem] px-2 text-center text-xs font-medium tabular-nums text-foreground">
        {label}
      </span>

      {nextHref ? (
        <Link
          href={nextHref}
          scroll={false}
          prefetch={false}
          aria-label="다음 기간"
          className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-label="다음 기간 (이미 현재 기간)"
          className="inline-flex size-8 cursor-not-allowed items-center justify-center rounded-full border border-border bg-card/30 text-muted-foreground/40"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {!isCurrent && (
        <Link
          href={todayHref}
          scroll={false}
          prefetch={false}
          className="ml-1 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
        >
          오늘
        </Link>
      )}
    </div>
  );
}
