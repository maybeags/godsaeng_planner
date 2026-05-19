import { Check, Clock, Square } from "lucide-react";
import { ProfileAvatar } from "../../profile/_components/profile-avatar";
import { TagPill } from "../../planner/_components/tag-pill";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { PostItem, PostWithAuthor } from "@/lib/supabase/types";
import { OwnPostReflection } from "./post-actions";

function formatPostedFor(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

export function PostCard({
  post,
  isOwn,
}: {
  post: PostWithAuthor;
  isOwn: boolean;
}) {
  const items = (post.items_json ?? []) as PostItem[];
  const doneCount = items.filter((i) => i.is_done).length;

  return (
    <article className="rounded-2xl border border-border bg-card/40 p-4 shadow-sm transition-colors hover:bg-card/60">
      {/* 헤더 */}
      <header className="flex items-start gap-3">
        <ProfileAvatar
          src={post.author?.avatar_url ?? null}
          alt={post.author?.nickname ?? "갓생러"}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {post.author?.nickname ?? "갓생러"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatRelativeTime(post.created_at)} ·{" "}
            {formatPostedFor(post.posted_for)}의 갓생 · 완료 {doneCount}/
            {items.length}
          </p>
        </div>
      </header>

      {/* 플랜 스냅샷 */}
      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 rounded-lg bg-background/40 px-2.5 py-2"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                  it.is_done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {it.is_done ? (
                  <Check className="size-2.5" strokeWidth={3} />
                ) : (
                  <Square className="size-2 opacity-0" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {it.plan_time && (
                    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                      <Clock className="size-2.5" />
                      {it.plan_time.slice(0, 5)}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "break-words text-sm leading-snug",
                    !it.is_done && "text-muted-foreground line-through"
                  )}
                >
                  {it.content}
                </p>
                {it.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {it.tags.map((t, i) => (
                      <TagPill
                        key={`${t.name}-${i}`}
                        name={t.name}
                        color={t.color}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 감상문 — 본인 글이면 인라인 편집/삭제 가능 */}
      {isOwn ? (
        <OwnPostReflection
          postId={post.id}
          initialReflection={post.reflection}
        />
      ) : (
        <div className="mt-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {post.reflection}
          </p>
        </div>
      )}
    </article>
  );
}
