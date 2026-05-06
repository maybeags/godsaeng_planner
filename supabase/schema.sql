-- =======================================================================
-- 갓생 플래너 — Supabase 스키마 (Step 2)
-- =======================================================================
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
--
-- 멱등(idempotent) — 여러 번 실행해도 안전합니다.
-- 단, 한 번 적용한 뒤 RLS 정책의 이름을 바꾸려면 drop policy가 필요합니다.
-- =======================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp" with schema extensions;


-- ─────────────────────────────────────────────────────────────────────
-- 1. PROFILES — auth.users 와 1:1
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null default '갓생러',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is '사용자 프로필. auth.users 와 1:1';


-- ─────────────────────────────────────────────────────────────────────
-- 2. TAGS — 사용자별 해시태그
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.tags (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (length(btrim(name)) between 1 and 20),
  color       text not null default 'custom'
                check (color in (
                  'school','part','hobby','friend','meal','custom',
                  'rose','red','coral','orange','amber','lime',
                  'emerald','teal','cyan','sky','indigo','violet',
                  'fuchsia','magenta'
                )),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists tags_user_idx on public.tags(user_id);

comment on table public.tags is '사용자가 만든 해시태그. 기본 5개 + 커스텀.';
comment on column public.tags.color is 'pastel palette key — globals.css의 --tag-* 와 매칭';


-- ─────────────────────────────────────────────────────────────────────
-- 3. PLANS — 일정/투두 한 줄
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.plans (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null check (length(btrim(content)) between 1 and 500),
  plan_date   date not null default current_date,
  is_done     boolean not null default false,
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Step 6: 시간 컬럼 (nullable). 기존 row 영향 없음.
alter table public.plans
  add column if not exists plan_time time;

comment on column public.plans.plan_time is 'KST wall-clock 시각 (HH:mm:ss). nullable. timezone 없음.';

create index if not exists plans_user_date_idx on public.plans(user_id, plan_date desc);
create index if not exists plans_user_done_idx on public.plans(user_id, is_done);

comment on table public.plans is '한 줄 플랜 / 투두';


-- ─────────────────────────────────────────────────────────────────────
-- 4. PLAN_TAGS — 다대다 연결
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.plan_tags (
  plan_id  uuid not null references public.plans(id) on delete cascade,
  tag_id   uuid not null references public.tags(id)  on delete cascade,
  primary key (plan_id, tag_id)
);

create index if not exists plan_tags_tag_idx on public.plan_tags(tag_id);


-- ─────────────────────────────────────────────────────────────────────
-- 4-2. POSTS — 공개 자랑 게시물 (그날 플랜 스냅샷 + 감상문)
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


-- ─────────────────────────────────────────────────────────────────────
-- 5. updated_at 공통 트리거
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.plans;
create trigger set_updated_at
  before update on public.plans
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────────────
-- 6. plans.is_done ↔ done_at 자동 동기화
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_plan_done_at()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT' and new.is_done is true)
     or (TG_OP = 'UPDATE' and new.is_done is true
         and (old.is_done is false or old.is_done is null)) then
    new.done_at = now();
  elsif new.is_done is false then
    new.done_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_plan_done_at on public.plans;
create trigger sync_plan_done_at
  before insert or update of is_done on public.plans
  for each row execute function public.handle_plan_done_at();


-- ─────────────────────────────────────────────────────────────────────
-- 7. 신규 유저 트리거 — 프로필 + 기본 5개 태그 자동 생성
--    SECURITY DEFINER 로 RLS 우회. EXCEPTION 으로 auth.users 인서트 보호.
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'preferred_username', ''),
      nullif(new.raw_user_meta_data->>'nickname', ''),
      nullif(split_part(coalesce(new.email,''), '@', 1), ''),
      '갓생러'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.tags (user_id, name, color, is_default) values
    (new.id, '학교', 'school', true),
    (new.id, '알바', 'part',   true),
    (new.id, '취미', 'hobby',  true),
    (new.id, '친구', 'friend', true),
    (new.id, '식사', 'meal',   true)
  on conflict (user_id, name) do nothing;

  return new;
exception when others then
  -- 어떤 이유로든 부가 작업이 실패해도 auth.users 인서트는 절대 막지 않음.
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────
-- 8. RLS — 모든 테이블 활성화
-- ─────────────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.tags      enable row level security;
alter table public.plans     enable row level security;
alter table public.plan_tags enable row level security;
alter table public.posts     enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────
-- SELECT 는 로그인된 모든 사용자 허용 (피드에서 닉네임/아바타 표시 위해)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- INSERT/DELETE는 트리거(SECURITY DEFINER)가 처리. 클라이언트 직접 차단.

-- ── tags ─────────────────────────────────────────────────────────────
drop policy if exists "tags_select_own" on public.tags;
create policy "tags_select_own"
  on public.tags for select
  using (auth.uid() = user_id);

drop policy if exists "tags_insert_own" on public.tags;
create policy "tags_insert_own"
  on public.tags for insert
  with check (auth.uid() = user_id);

drop policy if exists "tags_update_own" on public.tags;
create policy "tags_update_own"
  on public.tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tags_delete_own_custom" on public.tags;
create policy "tags_delete_own_custom"
  on public.tags for delete
  using (auth.uid() = user_id and is_default = false);
-- 기본 태그는 삭제 불가 — UX 일관성

-- ── plans ────────────────────────────────────────────────────────────
drop policy if exists "plans_select_own" on public.plans;
create policy "plans_select_own"
  on public.plans for select
  using (auth.uid() = user_id);

drop policy if exists "plans_insert_own" on public.plans;
create policy "plans_insert_own"
  on public.plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "plans_update_own" on public.plans;
create policy "plans_update_own"
  on public.plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "plans_delete_own" on public.plans;
create policy "plans_delete_own"
  on public.plans for delete
  using (auth.uid() = user_id);

-- ── plan_tags ────────────────────────────────────────────────────────
drop policy if exists "plan_tags_select_own" on public.plan_tags;
create policy "plan_tags_select_own"
  on public.plan_tags for select
  using (
    exists (
      select 1 from public.plans p
      where p.id = plan_tags.plan_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "plan_tags_insert_own" on public.plan_tags;
create policy "plan_tags_insert_own"
  on public.plan_tags for insert
  with check (
    exists (
      select 1 from public.plans p
      where p.id = plan_tags.plan_id and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.tags t
      where t.id = plan_tags.tag_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "plan_tags_delete_own" on public.plan_tags;
create policy "plan_tags_delete_own"
  on public.plan_tags for delete
  using (
    exists (
      select 1 from public.plans p
      where p.id = plan_tags.plan_id and p.user_id = auth.uid()
    )
  );

-- ── posts ────────────────────────────────────────────────────────────
drop policy if exists "posts_select_authenticated" on public.posts;
create policy "posts_select_authenticated"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "posts_insert_own_today" on public.posts;
create policy "posts_insert_own_today"
  on public.posts for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and posted_for = (now() at time zone 'Asia/Seoul')::date
  );

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────
-- 9. 기존 사용자 백필 — 트리거 적용 전에 가입한 유저가 있다면 보정
-- ─────────────────────────────────────────────────────────────────────
insert into public.profiles (id, nickname, avatar_url)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'name', ''),
    nullif(u.raw_user_meta_data->>'preferred_username', ''),
    nullif(u.raw_user_meta_data->>'nickname', ''),
    nullif(split_part(coalesce(u.email,''), '@', 1), ''),
    '갓생러'
  ),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
on conflict (id) do nothing;

insert into public.tags (user_id, name, color, is_default)
select u.id, t.name, t.color, true
from auth.users u
cross join (values
  ('학교','school'),
  ('알바','part'),
  ('취미','hobby'),
  ('친구','friend'),
  ('식사','meal')
) as t(name, color)
on conflict (user_id, name) do nothing;
