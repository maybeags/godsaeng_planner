"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TagStat } from "@/lib/stats";
import type { TagColor } from "@/lib/supabase/types";

const TAG_HSL: Record<TagColor, string> = {
  school: "hsl(var(--tag-school))",
  part: "hsl(var(--tag-part))",
  hobby: "hsl(var(--tag-hobby))",
  friend: "hsl(var(--tag-friend))",
  meal: "hsl(var(--tag-meal))",
  custom: "hsl(var(--tag-custom))",
};

const AXIS = "hsl(var(--muted-foreground))";

export function TagChart({ data }: { data: TagStat[] }) {
  const rows = data.map((t) => ({ ...t, label: `#${t.name}` }));
  const height = Math.max(160, rows.length * 36 + 16);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke={AXIS}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke={AXIS}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip
            content={<TagTooltip />}
            cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.4 }}
          />
          <Bar
            dataKey="rate"
            radius={[0, 8, 8, 0]}
            isAnimationActive={false}
            maxBarSize={20}
          >
            {rows.map((r) => (
              <Cell key={r.id} fill={TAG_HSL[r.color]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TagTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TagStat & { label: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-popover-foreground">{p.label}</div>
      <div className="mt-0.5 text-muted-foreground">
        성취율 <span className="font-semibold text-primary">{p.rate}%</span>
      </div>
      <div className="text-muted-foreground">
        완료 {p.done} / 전체 {p.total}
      </div>
    </div>
  );
}
