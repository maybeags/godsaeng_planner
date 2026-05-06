"use client";

import * as React from "react";
import { PlanItem } from "./plan-item";
import { TagFilter } from "./tag-filter";
import type { PlanWithTags, Tag } from "@/lib/supabase/types";
import { Sparkles } from "lucide-react";

export function PlanList({
  plans,
  tags,
}: {
  plans: PlanWithTags[];
  tags: Tag[];
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    if (selected.size === 0) return plans;
    return plans.filter((p) => p.tags.some((t) => selected.has(t.id)));
  }, [plans, selected]);

  const total = filtered.length;
  const done = filtered.filter((p) => p.is_done).length;
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-4">
      <TagFilter tags={tags} selected={selected} onChange={setSelected} />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          총 <span className="font-medium text-foreground">{total}</span>개 ·{" "}
          완료 <span className="font-medium text-foreground">{done}</span>개
        </span>
        <span>
          성취율{" "}
          <span className="font-semibold text-primary">{rate}%</span>
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState filtered={selected.size > 0} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <PlanItem key={p.id} plan={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
      <Sparkles className="mb-3 size-6 text-primary" />
      <p className="text-sm font-medium">
        {filtered ? "이 태그로는 아직 없어요" : "오늘의 첫 한 줄을 적어볼까?"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {filtered
          ? "필터를 풀거나 다른 태그를 선택해 보세요."
          : "위 입력창에 # 으로 태그를 붙여서 적어보세요."}
      </p>
    </div>
  );
}
