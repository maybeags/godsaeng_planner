import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">로그인에 실패했어요</h1>
          <p className="text-sm text-muted-foreground">
            {searchParams.reason
              ? decodeURIComponent(searchParams.reason)
              : "잠시 후 다시 시도해 주세요."}
          </p>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/login">로그인으로 돌아가기</Link>
        </Button>
      </div>
    </main>
  );
}
