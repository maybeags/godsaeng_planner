"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_NAV_ITEMS } from "@/lib/nav-items";

export function AppHeader() {
  const pathname = usePathname();
  const current =
    ALL_NAV_ITEMS.find(
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

      <div className="flex items-center gap-1">
        {/* 모바일에서만: 프로필 진입로 (탭바에서 빠졌으니 헤더로) */}
        <Link
          href="/profile"
          aria-label="프로필"
          title="프로필"
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <User className="size-4" />
        </Link>

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
      </div>
    </header>
  );
}
