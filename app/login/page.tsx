import { KakaoLoginButton } from "@/components/auth/kakao-login-button";
import { Sparkles } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      {/* Decorative gradient — Z세대 감성 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-[hsl(var(--tag-friend))]/15 blur-[120px]" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-between px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            <span>20대 갓생러를 위한 가장 쉬운 시작</span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            오늘 하루,
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--tag-hobby))] bg-clip-text text-transparent">
              # 한 줄로 끝
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-balance text-sm text-muted-foreground sm:text-base">
            태그로 적고, 회고로 본다. 학교 · 알바 · 취미 — 내 갓생을 데이터로
            보는 가장 쉬운 방법.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full max-w-sm space-y-3">
          <KakaoLoginButton next={searchParams.from} />
          <p className="text-center text-xs text-muted-foreground">
            계속하면 <span className="underline">서비스 약관</span>과{" "}
            <span className="underline">개인정보 처리방침</span>에 동의하는
            것으로 간주됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
