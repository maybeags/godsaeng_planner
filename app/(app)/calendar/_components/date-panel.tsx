"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PlanItem } from "@/app/(app)/planner/_components/plan-item";
import type { PlanWithTags } from "@/lib/supabase/types";

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

function parseIsoToUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatHeader(iso: string): string {
  const d = parseIsoToUtc(iso);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${DOW_KO[d.getUTCDay()]})`;
}

export function DatePanel({
  iso,
  plans,
}: {
  iso: string;
  plans: PlanWithTags[];
}) {
  const total = plans.length;
  const done = plans.filter((p) => p.is_done).length;
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card/40 p-4 animate-fade-in">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{formatHeader(iso)}</h2>
          {total > 0 ? (
            <p className="text-xs text-muted-foreground">
              총 <span className="text-foreground">{total}</span>개 · 완료{" "}
              <span className="text-foreground">{done}</span>개 · 성취율{" "}
              <span className="font-semibold text-primary">{rate}%</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">아직 플랜이 없어요</p>
          )}
        </div>
        <Link
          href={`/planner?date=${iso}`}
          prefetch={false}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <ExternalLink className="size-3.5" />
          편집
        </Link>
      </header>

      {total > 0 ? (
        <ul className="space-y-2">
          {plans.map((p) => (
            <PlanItem key={p.id} plan={p} />
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/30 px-4 py-6 text-center text-xs text-muted-foreground">
          이 날엔 적은 게 없네 — 편집 버튼으로 한 줄 추가해 봐.
        </div>
      )}
    </section>
  );
}
