"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint, Period } from "@/lib/stats";

const PRIMARY = "hsl(var(--primary))";
const GRID = "hsl(var(--border))";
const AXIS = "hsl(var(--muted-foreground))";

export function DailyChart({
  data,
  period,
}: {
  data: DailyPoint[];
  period: Period;
}) {
  const useLine = period === "month";
  const monthInterval = data.length > 14 ? Math.ceil(data.length / 7) - 1 : 0;

  const axisProps = {
    stroke: AXIS,
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  };

  const tooltipContent = <DailyTooltip />;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {useLine ? (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" interval={monthInterval} {...axisProps} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v) => `${v}%`}
              {...axisProps}
            />
            <Tooltip content={tooltipContent} cursor={{ stroke: PRIMARY, strokeOpacity: 0.2 }} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={PRIMARY}
              strokeWidth={2}
              dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v) => `${v}%`}
              {...axisProps}
            />
            <Tooltip content={tooltipContent} cursor={{ fill: PRIMARY, fillOpacity: 0.08 }} />
            <Bar
              dataKey="rate"
              fill={PRIMARY}
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
              maxBarSize={36}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function DailyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DailyPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-popover-foreground">{p.date}</div>
      <div className="mt-0.5 text-muted-foreground">
        성취율 <span className="font-semibold text-primary">{p.rate}%</span>
      </div>
      <div className="text-muted-foreground">
        완료 {p.done} / 전체 {p.total}
      </div>
    </div>
  );
}
