import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

/**
 * 표시용 닉네임 해석 — DB의 profiles.nickname 우선,
 * 없으면 카카오 메타데이터, 그것도 없으면 '갓생러'.
 */
export function resolveNickname(
  profile: Pick<Profile, "nickname"> | null | undefined,
  user: User | null | undefined
): string {
  return (
    profile?.nickname ??
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined) ??
    (user?.user_metadata?.nickname as string | undefined) ??
    "갓생러"
  );
}

/** 표시용 아바타 — profiles.avatar_url 우선, 없으면 카카오 메타데이터. */
export function resolveAvatarUrl(
  profile: Pick<Profile, "avatar_url"> | null | undefined,
  user: User | null | undefined
): string | null {
  return (
    profile?.avatar_url ??
    (user?.user_metadata?.avatar_url as string | undefined) ??
    null
  );
}

/** 현재 로그인 사용자의 profiles 행을 가져온다. (없으면 null) */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url, created_at, updated_at")
    .single<Profile>();
  return data ?? null;
}
