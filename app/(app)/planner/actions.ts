"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractTags } from "@/lib/parse-tags";
import { pickTagColor } from "@/lib/tag-color";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM_RE = /^\d{2}:\d{2}$/;

/** 한 줄 플랜 + # 태그 파싱 → 신규 태그 자동 생성 → plan_tags 연결 */
export async function createPlan(
  rawContent: string,
  opts?: { planDate?: string; planTime?: string | null }
): Promise<void> {
  const { supabase, user } = await requireUser();

  const { content, tags: tagNames } = extractTags(rawContent);
  if (!content) throw new Error("내용을 입력해 주세요.");

  // 날짜/시간 검증 — 잘못된 입력은 차단
  let planDate: string | undefined;
  if (opts?.planDate !== undefined) {
    if (!ISO_DATE_RE.test(opts.planDate)) {
      throw new Error("날짜 형식이 올바르지 않아요 (YYYY-MM-DD).");
    }
    planDate = opts.planDate;
  }

  let planTime: string | null | undefined;
  if (opts?.planTime !== undefined) {
    if (opts.planTime === null || opts.planTime === "") {
      planTime = null;
    } else if (HHMM_RE.test(opts.planTime)) {
      planTime = `${opts.planTime}:00`; // HH:mm → HH:mm:ss
    } else {
      throw new Error("시간 형식이 올바르지 않아요 (HH:mm).");
    }
  }

  // 1) plan
  const insertRow: { user_id: string; content: string; plan_date?: string; plan_time?: string | null } = {
    user_id: user.id,
    content,
  };
  if (planDate !== undefined) insertRow.plan_date = planDate;
  if (planTime !== undefined) insertRow.plan_time = planTime;

  const { data: plan, error: planErr } = await supabase
    .from("plans")
    .insert(insertRow)
    .select("id")
    .single();
  if (planErr || !plan) {
    throw new Error(planErr?.message ?? "플랜 생성 실패");
  }

  if (tagNames.length === 0) {
    revalidatePath("/planner");
    revalidatePath("/home");
    revalidatePath("/calendar");
    return;
  }

  // 2) 기존 태그 조회
  const { data: existing } = await supabase
    .from("tags")
    .select("id, name")
    .in("name", tagNames);

  const tagIdByName = new Map<string, string>(
    (existing ?? []).map((t) => [t.name, t.id])
  );

  // 3) 신규 태그 생성 (없는 것만)
  const toCreate = tagNames.filter((n) => !tagIdByName.has(n));
  if (toCreate.length > 0) {
    const { data: created, error: tagErr } = await supabase
      .from("tags")
      .insert(
        toCreate.map((name) => ({
          user_id: user.id,
          name,
          color: pickTagColor(name),
        }))
      )
      .select("id, name");
    if (tagErr) throw new Error(tagErr.message);
    (created ?? []).forEach((t) => tagIdByName.set(t.name, t.id));
  }

  // 4) plan_tags 일괄 insert
  const planTagRows = tagNames
    .map((n) => tagIdByName.get(n))
    .filter((id): id is string => Boolean(id))
    .map((tag_id) => ({ plan_id: plan.id, tag_id }));

  if (planTagRows.length > 0) {
    const { error: ptErr } = await supabase.from("plan_tags").insert(planTagRows);
    if (ptErr) throw new Error(ptErr.message);
  }

  revalidatePath("/planner");
  revalidatePath("/home");
  revalidatePath("/calendar");
}

export async function togglePlanDone(
  planId: string,
  isDone: boolean
): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("plans")
    .update({ is_done: isDone })
    .eq("id", planId);
  if (error) throw new Error(error.message);
  revalidatePath("/planner");
  revalidatePath("/home");
  revalidatePath("/calendar");
}

export async function deletePlan(planId: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("plans").delete().eq("id", planId);
  if (error) throw new Error(error.message);
  revalidatePath("/planner");
  revalidatePath("/home");
  revalidatePath("/calendar");
}
