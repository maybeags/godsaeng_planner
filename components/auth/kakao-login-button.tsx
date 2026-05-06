"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.78 1.86 5.22 4.66 6.6-.2.7-.74 2.6-.84 3.02-.14.5.18.5.4.36.16-.1 2.5-1.7 3.52-2.4.74.1 1.5.16 2.26.16 5.52 0 10-3.48 10-7.74C22 6.48 17.52 3 12 3z" />
    </svg>
  );
}

export function KakaoLoginButton({ next }: { next?: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleLogin() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const redirect = new URL("/auth/callback", getSiteUrl());
    if (next) redirect.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: redirect.toString(),
        // Kakao 동의항목 — 이메일/닉네임 누락 시 auth.users 인서트가 깨지는
        // 케이스 방지. Kakao Developers 콘솔에서도 동의항목 ON 필요.
        scopes: "account_email profile_nickname",
      },
    });

    if (error) {
      setLoading(false);
      window.location.href = `/auth/error?reason=${encodeURIComponent(
        error.message
      )}`;
    }
    // 정상이라면 카카오로 리다이렉트되므로 setLoading(false) 불필요
  }

  return (
    <Button
      type="button"
      variant="kakao"
      size="xl"
      className="w-full"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <KakaoIcon className="size-5" />
      )}
      <span>카카오톡으로 시작하기</span>
    </Button>
  );
}
