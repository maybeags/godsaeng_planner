import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  getCurrentProfile,
  resolveAvatarUrl,
  resolveNickname,
} from "@/lib/profile";
import { ProfileAvatar } from "./_components/profile-avatar";
import { NicknameEditor } from "./_components/nickname-editor";
import { TagManager } from "./_components/tag-manager";
import type { Tag } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();

  const [
    {
      data: { user },
    },
    profile,
    { data: tagsData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getCurrentProfile(),
    supabase
      .from("tags")
      .select("id, user_id, name, color, is_default, created_at")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  const avatarUrl = resolveAvatarUrl(profile, user);
  const nickname = resolveNickname(profile, user);

  const provider = user?.app_metadata?.provider ?? "—";
  const email = user?.email ?? "—";
  const tags: Tag[] = (tagsData ?? []) as Tag[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">프로필</h1>

      {/* 헤더 카드 — 아바타 + 닉네임 */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:items-center">
          <ProfileAvatar src={avatarUrl} alt={nickname} size="xl" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              닉네임
            </p>
            <NicknameEditor initial={nickname} />
            <p className="text-xs text-muted-foreground">
              {email} · {provider}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 태그 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">태그 관리</CardTitle>
          <CardDescription>
            새 태그를 만들고, 기존 태그의 색상을 바꿔보세요. 기본 태그는 색상만
            변경할 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagManager tags={tags} />
        </CardContent>
      </Card>

      {/* 계정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
