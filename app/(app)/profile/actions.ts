"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pickTagColor } from "@/lib/tag-color";
import { ALL_TAG_COLORS } from "@/lib/tag-color";
import type { TagColor } from "@/lib/supabase/types";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

const NICKNAME_RE = /^.{1,20}$/;
const TAG_NAME_RE = /^[\p{L}\p{N}_-]{1,20}$/u;

/** 닉네임 변경 */
export async function updateNickname(raw: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const nickname = raw.trim();
  if (!nickname) throw new Error("닉네임을 입력해 주세요.");
  if (!NICKNAME_RE.test(nickname)) {
    throw new Error("닉네임은 1~20자로 입력해 주세요.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/home");
}

/** 커스텀 태그 추가 */
export async function createCustomTag(
  rawName: string,
  rawColor?: string
): Promise<void> {
  const { supabase, user } = await requireUser();
  const name = rawName.trim().replace(/^#/, "");
  if (!name) throw new Error("태그 이름을 입력해 주세요.");
  if (!TAG_NAME_RE.test(name)) {
    throw new Error("태그는 1~20자(공백/특수문자 제외)로 입력해 주세요.");
  }

  const color: TagColor =
    rawColor && (ALL_TAG_COLORS as readonly string[]).includes(rawColor)
      ? (rawColor as TagColor)
      : pickTagColor(name);

  const { error } = await supabase.from("tags").insert({
    user_id: user.id,
    name,
    color,
    is_default: false,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 같은 이름의 태그가 있어요.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  revalidatePath("/planner");
  revalidatePath("/home");
}

/** 태그 색상 변경 (기본/커스텀 모두 가능) */
export async function updateTagColor(
  tagId: string,
  color: string
): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!(ALL_TAG_COLORS as readonly string[]).includes(color)) {
    throw new Error("허용되지 않은 색상이에요.");
  }
  const { error } = await supabase
    .from("tags")
    .update({ color })
    .eq("id", tagId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/planner");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

/** 커스텀 태그 삭제 — 기본 태그는 RLS가 차단 */
export async function deleteCustomTag(tagId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", tagId)
    .eq("user_id", user.id)
    .eq("is_default", false);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/planner");
  revalidatePath("/home");
}
