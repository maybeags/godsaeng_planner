"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/utils";

function RetryHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const hasRunRef = React.useRef(false);

  React.useEffect(() => {
    // Strict Mode 더블 마운트 방지 — signInWithOAuth는 redirect를 일으키므로
    // 두 번 호출하면 OAuth state 충돌이 날 수 있음.
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const attempt = Number(params.get("attempt") || "2");
    const next = params.get("next") || "/home";
    const reason = params.get("reason") || "unknown";

    if (attempt > 2) {
      router.replace(`/auth/error?reason=${encodeURIComponent(reason)}`);
      return;
    }

    (async () => {
      const supabase = createSupabaseBrowserClient();
      const redirect = new URL("/auth/callback", getSiteUrl());
      redirect.searchParams.set("attempt", String(attempt));
      if (next !== "/home") redirect.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: redirect.toString(),
          scopes: "account_email profile_nickname",
        },
      });

      if (error) {
        router.replace(
          `/auth/error?reason=${encodeURIComponent(error.message)}`
        );
      }
      // 정상이라면 카카오로 리다이렉트되므로 추가 처리 불필요
    })();
  }, [params, router]);

  return null;
}

export default function AuthRetryPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <Suspense fallback={null}>
        <RetryHandler />
      </Suspense>

      <div className="relative space-y-3">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">잠시만요…</p>
        <p className="text-xs text-muted-foreground">
          카카오 로그인을 마무리하고 있어요.
        </p>
      </div>
    </main>
  );
}
