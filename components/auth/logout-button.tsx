import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// 폼 POST 방식 — 서버 라우트(/auth/signout)에서 SSR 쿠키까지 안전하게 정리.
// 클라이언트 컴포넌트일 필요 없음.
export function LogoutButton() {
  return (
    <form action="/auth/signout" method="post" className="w-full">
      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full"
      >
        <LogOut />
        <span>로그아웃</span>
      </Button>
    </form>
  );
}
