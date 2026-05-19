"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "@/lib/nav-items";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
          <Sparkles className="size-4 text-primary" />
        </div>
        <span className="text-base font-bold tracking-tight">갓생 플래너</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {SIDEBAR_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-3">
        <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">오늘의 한 줄</p>
          <p className="mt-1">
            <span className="text-primary"># 태그</span>로 적으면 회고가 데이터가
            돼요.
          </p>
        </div>
        <ThemeToggle variant="row" />
      </div>
    </aside>
  );
}
