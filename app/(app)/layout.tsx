import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        {/* pb-24 = 모바일 하단 탭바 높이 보정 */}
        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
        <BottomNav />
        {/* 모바일 전용: 하단 탭바 바로 위 우측에 떠있는 테마 토글 */}
        <ThemeToggle
          className="fixed right-4 z-40 bottom-[calc(env(safe-area-inset-bottom)+5rem)] md:hidden"
        />
      </div>
    </div>
  );
}
