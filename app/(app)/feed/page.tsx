import { Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTodayPlanItemsForCompose } from "@/lib/posts";
import type { PostWithAuthor } from "@/lib/supabase/types";
import { PostComposer } from "./_components/post-composer";
import { PostCard } from "./_components/post-card";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createSupabaseServerClient();

  const [
    {
      data: { user },
    },
    composeItems,
    { data: postsData, error: postsErr },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getTodayPlanItemsForCompose(),
    supabase
      .from("posts")
      .select(
        "id, user_id, reflection, posted_for, items_json, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (postsErr) {
    console.error("[feed] posts query failed:", postsErr.message);
  }

  const myId = user?.id ?? null;
  const postsRows = (postsData ?? []) as Array<{
    id: string;
    user_id: string;
    reflection: string;
    posted_for: string;
    items_json: any;
    created_at: string;
    updated_at: string;
  }>;

  // posts.user_id → profiles.id 관계가 PostgREST 자동 추론 안 됨 (FK 가 auth.users).
  // 별도 쿼리로 profiles 가져와서 메모리에서 join.
  const authorIds = Array.from(new Set(postsRows.map((p) => p.user_id)));
  const { data: profilesData } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", authorIds)
    : { data: [] };

  const profileById = new Map<
    string,
    { nickname: string; avatar_url: string | null }
  >(
    (profilesData ?? []).map((p: any) => [
      p.id as string,
      { nickname: p.nickname as string, avatar_url: p.avatar_url ?? null },
    ])
  );

  const posts: PostWithAuthor[] = postsRows.map((row) => {
    const author = profileById.get(row.user_id);
    return {
      id: row.id,
      user_id: row.user_id,
      reflection: row.reflection,
      posted_for: row.posted_for,
      items_json: row.items_json,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        nickname: author?.nickname ?? "갓생러",
        avatar_url: author?.avatar_url ?? null,
      },
    };
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">피드</h1>
        <p className="text-sm text-muted-foreground">
          오늘의 갓생을 한 줄로 자랑하고, 다른 사람들의 갓생도 구경해 보세요.
        </p>
      </header>

      <PostComposer initialItems={composeItems} mode="feed" />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
          <Sparkles className="mb-3 size-7 text-primary" />
          <p className="text-base font-medium">아직 자랑이 없어요</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            첫 번째 갓생 자랑러가 되어 보세요!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard post={p} isOwn={p.user_id === myId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
