import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 서버사이드 로그아웃 — SSR 쿠키를 확실히 정리하기 위해 라우트 핸들러로 처리.
// 브라우저 클라이언트의 signOut() 만으로는 일부 환경에서 SSR 쿠키가 남아 있는 케이스가 있음.
async function handle(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // POST → 303 See Other → 브라우저가 GET 으로 /login 따라감
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export const POST = handle;
// 혹시 form submit 외 GET 으로 접근해도 동작하도록 — 직접 URL 입력으로 로그아웃 가능
export const GET = handle;
