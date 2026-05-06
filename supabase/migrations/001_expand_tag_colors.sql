-- Migration: tags.color 팔레트 6 → 20 확장
-- 적용: Supabase Dashboard → SQL Editor 에서 전체 실행
-- Idempotent: 여러 번 실행해도 안전하도록 작성

alter table public.tags drop constraint if exists tags_color_check;

alter table public.tags
  add constraint tags_color_check
  check (color in (
    'school','part','hobby','friend','meal','custom',
    'rose','red','coral','orange','amber','lime',
    'emerald','teal','cyan','sky','indigo','violet',
    'fuchsia','magenta'
  ));
