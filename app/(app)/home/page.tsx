import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getHomeQuickStats } from "@/lib/stats";
import { TagPill } from "../planner/_components/tag-pill";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [
    {
      data: { user },
    },
    stats,
  ] = await Promise.all([supabase.auth.getUser(), getHomeQuickStats()]);

  const nickname =
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined) ??
    "갓생러";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">오늘도 한 줄로 시작</p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          안녕, {nickname} 님 👋
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/planner" className="group block">
          <Card className="h-full bg-gradient-to-br from-primary/15 to-transparent transition-colors group-hover:from-primary/25">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                오늘의 한 줄
                <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
              </CardTitle>
              <CardDescription># 태그로 분류되는 갓생 시작</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              플래너에서{" "}
              <code className="text-primary">#학교 #알바</code> 처럼 적어보세요
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard" className="group block">
          <Card className="h-full transition-colors group-hover:bg-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                이번 주 성취율
                <ArrowRight className="size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </CardTitle>
              <CardDescription>월요일 ~ 오늘</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.weekTotal === 0 ? (
                <p className="text-sm text-muted-foreground">
                  플랜이 쌓이면 보여드릴게요
                </p>
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary">
                    {stats.weekRate}%
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    완료 {stats.weekDone} / 전체 {stats.weekTotal}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">가장 많이 쓴 태그</CardTitle>
            <CardDescription>
              {stats.topTags.length > 0
                ? `이번 주 top ${stats.topTags.length}`
                : "이번 주 기준"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                데이터가 쌓이면 보여드릴게요.
              </p>
            ) : (
              <ul className="space-y-2">
                {stats.topTags.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <TagPill name={t.name} color={t.color} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {t.total}회 ·{" "}
                      <span className="font-semibold text-primary">
                        {t.rate}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
