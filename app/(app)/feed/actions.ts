"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayIsoDate } from "@/lib/date";
import type { PostItem, TagColor } from "@/lib/supabase/types";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

const REFLECTION_MIN = 1;
const REFLECTION_MAX = 500;

function validateReflection(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length < REFLECTION_MIN) {
    throw new Error("감상문을 한 줄 적어주세요.");
  }
  if (trimmed.length > REFLECTION_MAX) {
    throw new Error(`감상문은 ${REFLECTION_MAX}자 이내로 적어주세요.`);
  }
  return trimmed;
}

/**
 * 자랑 게시.
 * 클라이언트는 planIds + reflection 만 보냄.
 * 서버에서 본인 오늘 plans 를 다시 조회 → items_json 생성 (스냅샷 + 권한 검증).
 */
export async function createPost(
  planIds: string[],
  rawReflection: string
): Promise<void> {
  const { supabase, user } = await requireUser();
  const reflection = validateReflection(rawReflection);

  if (!Array.isArray(planIds) || planIds.length === 0) {
    throw new Error("자랑할 플랜을 1개 이상 선택해 주세요.");
  }

  const today = todayIsoDate();

  // 본인의 오늘 plans 만 조회 (RLS + plan_date 필터 = 이중 안전)
  const { data: rows, error: selErr } = await supabase
    .from("plans")
    .select(
      `
        id, content, plan_time, is_done, created_at,
        plan_tags ( tags ( name, color ) )
      `
    )
    .eq("plan_date", today)
    .in("id", planIds);

  if (selErr) throw new Error(selErr.message);

  if (!rows || rows.length === 0) {
    throw new Error("선택한 플랜을 찾을 수 없어요. 오늘의 플랜만 자랑할 수 있어요.");
  }

  // 입력 순서 보존 (체크박스 표시순 = items_json 순)
  const byId = new Map<string, (typeof rows)[number]>(
    rows.map((r: any) => [r.id as string, r])
  );

  const items: PostItem[] = planIds
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r: any) => ({
      content: r.content as string,
      plan_time: (r.plan_time as string | null) ?? null,
      is_done: r.is_done as boolean,
      tags: (r.plan_tags ?? [])
        .map((pt: any) => pt.tags)
        .filter(Boolean)
        .map((t: any) => ({
          name: t.name as string,
          color: t.color as TagColor,
        })),
    }));

  if (items.length === 0) {
    throw new Error("자랑할 플랜이 없어요.");
  }

  const { error: insErr } = await supabase.from("posts").insert({
    user_id: user.id,
    reflection,
    posted_for: today,
    items_json: items,
  });

  if (insErr) throw new Error(insErr.message);

  revalidatePath("/feed");
  revalidatePath("/planner");
  revalidatePath("/home");
}

/** 본인 글의 reflection 만 수정 */
export async function updatePostReflection(
  postId: string,
  rawReflection: string
): Promise<void> {
  const { supabase, user } = await requireUser();
  const reflection = validateReflection(rawReflection);

  const { error } = await supabase
    .from("posts")
    .update({ reflection })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/feed");
}

/** 본인 글 삭제 */
export async function deletePost(postId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/feed");
}
