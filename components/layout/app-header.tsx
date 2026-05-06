"use client";

import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/nav-items";

export function AppHeader() {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/")
    )?.label ?? "갓생 플래너";

  return (
    <header className="safe-top sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md md:h-16 md:px-8">
      {/* Mobile: 섹션명 / Desktop: 빈 영역 (사이드바가 컨텍스트 제공) */}
      <div className="flex items-center gap-2 md:invisible">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/15">
          <Sparkles className="size-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold">{current}</span>
      </div>

      {/* 우측 상단 로그아웃 — 폼 POST 로 서버사이드 정리 */}
      <form action="/auth/signout" method="post">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="로그아웃"
          title="로그아웃"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
        </Button>
      </form>
    </header>
  );
}
