-- Migration: posts (공개 자랑 게시물) 추가 + profiles SELECT 완화
-- 적용: Supabase Dashboard → SQL Editor 에서 전체 실행
-- Idempotent: 여러 번 실행해도 안전

-- ─────────────────────────────────────────────────────────────────────
-- 1. posts 테이블 — 그 날의 플랜 스냅샷 + 감상문
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default extensions.uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  reflection   text not null check (length(btrim(reflection)) between 1 and 500),
  posted_for   date not null,
  items_json   jsonb not null
                 check (jsonb_typeof(items_json) = 'array'
                        and jsonb_array_length(items_json) > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_created_idx
  on public.posts(created_at desc);
create index if not exists posts_user_created_idx
  on public.posts(user_id, created_at desc);

comment on table public.posts is
  '공개 자랑 게시물. items_json 은 그날 플랜의 스냅샷 배열 (PostItem[]).';
comment on column public.posts.posted_for is
  '어떤 날짜의 자랑인지 (KST). INSERT 시 KST 오늘만 허용.';
comment on column public.posts.items_json is
  '플랜 스냅샷 배열. 각 항목: { content, plan_time, is_done, tags: [{name,color}] }';

-- updated_at 자동 갱신 트리거 (schema.sql 의 handle_updated_at 재사용)
drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────────────
-- 2. RLS
-- ─────────────────────────────────────────────────────────────────────
alter table public.posts enable row level security;

-- 모든 로그인 사용자가 모든 포스트를 읽을 수 있음
drop policy if exists "posts_select_authenticated" on public.posts;
create policy "posts_select_authenticated"
  on public.posts for select
  to authenticated
  using (true);

-- INSERT — 본인 user_id + posted_for 는 KST 오늘만
drop policy if exists "posts_insert_own_today" on public.posts;
create policy "posts_insert_own_today"
  on public.posts for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and posted_for = (now() at time zone 'Asia/Seoul')::date
  );

-- UPDATE — 본인 포스트만 (서버 액션에서 reflection 만 변경 보장)
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE — 본인 포스트만
drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────
-- 3. profiles SELECT 정책 완화
--    피드에서 다른 사용자 닉네임/아바타 표시해야 하므로
--    "본인만" → "로그인된 모든 사용자" 로 변경
--    profiles 컬럼은 id/nickname/avatar_url/timestamps 뿐이라 PII 노출 없음
-- ─────────────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);
