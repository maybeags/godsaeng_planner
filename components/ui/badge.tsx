import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { TagColor } from "@/lib/supabase/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// ─── Tag 전용 색상 클래스 ─────────────────────────────────────────────
// Tailwind JIT가 정적 분석할 수 있도록 명시 매핑.
export const TAG_COLOR_CLASSES: Record<TagColor, string> = {
  school:
    "bg-[hsl(var(--tag-school)/0.15)] text-[hsl(var(--tag-school))] border-[hsl(var(--tag-school)/0.35)]",
  part: "bg-[hsl(var(--tag-part)/0.15)] text-[hsl(var(--tag-part))] border-[hsl(var(--tag-part)/0.35)]",
  hobby:
    "bg-[hsl(var(--tag-hobby)/0.15)] text-[hsl(var(--tag-hobby))] border-[hsl(var(--tag-hobby)/0.35)]",
  friend:
    "bg-[hsl(var(--tag-friend)/0.15)] text-[hsl(var(--tag-friend))] border-[hsl(var(--tag-friend)/0.35)]",
  meal: "bg-[hsl(var(--tag-meal)/0.15)] text-[hsl(var(--tag-meal))] border-[hsl(var(--tag-meal)/0.35)]",
  custom:
    "bg-[hsl(var(--tag-custom)/0.15)] text-[hsl(var(--tag-custom))] border-[hsl(var(--tag-custom)/0.35)]",
  rose: "bg-[hsl(var(--tag-rose)/0.15)] text-[hsl(var(--tag-rose))] border-[hsl(var(--tag-rose)/0.35)]",
  red: "bg-[hsl(var(--tag-red)/0.15)] text-[hsl(var(--tag-red))] border-[hsl(var(--tag-red)/0.35)]",
  coral:
    "bg-[hsl(var(--tag-coral)/0.15)] text-[hsl(var(--tag-coral))] border-[hsl(var(--tag-coral)/0.35)]",
  orange:
    "bg-[hsl(var(--tag-orange)/0.15)] text-[hsl(var(--tag-orange))] border-[hsl(var(--tag-orange)/0.35)]",
  amber:
    "bg-[hsl(var(--tag-amber)/0.15)] text-[hsl(var(--tag-amber))] border-[hsl(var(--tag-amber)/0.35)]",
  lime: "bg-[hsl(var(--tag-lime)/0.15)] text-[hsl(var(--tag-lime))] border-[hsl(var(--tag-lime)/0.35)]",
  emerald:
    "bg-[hsl(var(--tag-emerald)/0.15)] text-[hsl(var(--tag-emerald))] border-[hsl(var(--tag-emerald)/0.35)]",
  teal: "bg-[hsl(var(--tag-teal)/0.15)] text-[hsl(var(--tag-teal))] border-[hsl(var(--tag-teal)/0.35)]",
  cyan: "bg-[hsl(var(--tag-cyan)/0.15)] text-[hsl(var(--tag-cyan))] border-[hsl(var(--tag-cyan)/0.35)]",
  sky: "bg-[hsl(var(--tag-sky)/0.15)] text-[hsl(var(--tag-sky))] border-[hsl(var(--tag-sky)/0.35)]",
  indigo:
    "bg-[hsl(var(--tag-indigo)/0.15)] text-[hsl(var(--tag-indigo))] border-[hsl(var(--tag-indigo)/0.35)]",
  violet:
    "bg-[hsl(var(--tag-violet)/0.15)] text-[hsl(var(--tag-violet))] border-[hsl(var(--tag-violet)/0.35)]",
  fuchsia:
    "bg-[hsl(var(--tag-fuchsia)/0.15)] text-[hsl(var(--tag-fuchsia))] border-[hsl(var(--tag-fuchsia)/0.35)]",
  magenta:
    "bg-[hsl(var(--tag-magenta)/0.15)] text-[hsl(var(--tag-magenta))] border-[hsl(var(--tag-magenta)/0.35)]",
};

export const TAG_COLOR_SOLID: Record<TagColor, string> = {
  school: "bg-[hsl(var(--tag-school))] text-background",
  part: "bg-[hsl(var(--tag-part))] text-background",
  hobby: "bg-[hsl(var(--tag-hobby))] text-background",
  friend: "bg-[hsl(var(--tag-friend))] text-background",
  meal: "bg-[hsl(var(--tag-meal))] text-background",
  custom: "bg-[hsl(var(--tag-custom))] text-background",
  rose: "bg-[hsl(var(--tag-rose))] text-background",
  red: "bg-[hsl(var(--tag-red))] text-background",
  coral: "bg-[hsl(var(--tag-coral))] text-background",
  orange: "bg-[hsl(var(--tag-orange))] text-background",
  amber: "bg-[hsl(var(--tag-amber))] text-background",
  lime: "bg-[hsl(var(--tag-lime))] text-background",
  emerald: "bg-[hsl(var(--tag-emerald))] text-background",
  teal: "bg-[hsl(var(--tag-teal))] text-background",
  cyan: "bg-[hsl(var(--tag-cyan))] text-background",
  sky: "bg-[hsl(var(--tag-sky))] text-background",
  indigo: "bg-[hsl(var(--tag-indigo))] text-background",
  violet: "bg-[hsl(var(--tag-violet))] text-background",
  fuchsia: "bg-[hsl(var(--tag-fuchsia))] text-background",
  magenta: "bg-[hsl(var(--tag-magenta))] text-background",
};
