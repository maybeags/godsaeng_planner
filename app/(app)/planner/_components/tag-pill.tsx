import { cn } from "@/lib/utils";
import { TAG_COLOR_CLASSES } from "@/components/ui/badge";
import type { TagColor } from "@/lib/supabase/types";

type Size = "sm" | "md";

export function TagPill({
  name,
  color,
  size = "md",
  className,
  prefixHash = true,
}: {
  name: string;
  color: TagColor;
  size?: Size;
  className?: string;
  prefixHash?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        TAG_COLOR_CLASSES[color],
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {prefixHash && <span className="opacity-70">#</span>}
      {name}
    </span>
  );
}
