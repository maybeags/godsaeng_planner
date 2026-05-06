import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 2;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/home";
  const attempt = Number(searchParams.get("attempt") || "1");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // 콜백 실패: OAuth 코드는 1회용이라 같은 코드로 재시도 불가.
  // attempt 카운터를 늘려 /auth/retry 로 보내고 → 거기서 새 OAuth 플로우를 시작.
  // 첫 카카오 가입 시 가끔 발생하는 PKCE 레이스/이메일 스코프 누락을 한 번 더 시도해서 흡수.
  if (attempt < MAX_ATTEMPTS) {
    const retryUrl = new URL("/auth/retry", origin);
    retryUrl.searchParams.set("next", next);
    retryUrl.searchParams.set("attempt", String(attempt + 1));
    retryUrl.searchParams.set("reason", error.message);
    return NextResponse.redirect(retryUrl);
  }

  return NextResponse.redirect(
    `${origin}/auth/error?reason=${encodeURIComponent(error.message)}`
  );
}
