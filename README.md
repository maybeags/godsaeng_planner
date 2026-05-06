# 갓생 플래너 — God-saeng Planner

20대 대학생을 위한 **# 태그 한 줄 플래너 & 회고**.

> Stack: Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase · Zustand · Recharts · Vercel

---

## ✅ Step 1 완료 (현재)

- Next.js 14 + App Router + TypeScript 프로젝트 골격
- Tailwind v3 + shadcn/ui 베이스 (Button / Card)
- 다크모드 기본, Linear/Notion 스타일 디자인 토큰 + 파스텔 태그 팔레트
- Supabase Auth (`@supabase/ssr`) — 브라우저/서버/미들웨어 클라이언트
- **카카오톡으로 시작하기** 로그인 페이지 (`/login`) + OAuth 콜백 (`/auth/callback`)
- 보호 라우트 미들웨어 (비로그인 → `/login`, 로그인 상태로 `/login` 접근 → `/home`)
- 반응형 셸 레이아웃
  - 모바일: 상단 미니 헤더 + **하단 탭바**(홈/플래너/리포트/프로필) + 안전영역(notch) 대응
  - 태블릿/PC: **사이드바** + 그리드 본문
- 4개 섹션 placeholder 페이지 (Step 2~4에서 채울 자리)

---

## 🚀 시작하기

### 1) 의존성 설치

```bash
npm install
```

### 2) Supabase 프로젝트 만들기

1. https://supabase.com 에서 프로젝트 생성
2. **Authentication → Providers → Kakao** 활성화
   - Kakao Developers (https://developers.kakao.com) 에서 앱 생성
   - REST API 키 + Client Secret을 Supabase에 입력
   - **Redirect URI**: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (배포 후 실제 도메인으로 교체)
   - Redirect URLs: `http://localhost:3000/auth/callback` 추가

### 3) 환경변수

`.env.local.example` → `.env.local` 복사 후 값 채우기:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4) 개발 서버

```bash
npm run dev
```

http://localhost:3000 → 미인증 시 `/login` 으로 자동 이동.

---

## 📁 폴더 구조

```
app/
  (app)/                  # 인증 필요한 보호 영역
    layout.tsx            # 사이드바 + 하단탭 셸
    home/                 # 홈 (대시보드 요약)
    planner/              # 플래너 (Step 3)
    dashboard/            # 리포트 (Step 4)
    profile/              # 프로필 + 로그아웃
  auth/
    callback/route.ts     # OAuth code → session 교환
    error/page.tsx
  login/page.tsx          # 카카오 로그인
  globals.css             # 다크모드 + 파스텔 태그 토큰
  layout.tsx              # ThemeProvider (dark default)

components/
  auth/
    kakao-login-button.tsx
    logout-button.tsx
  layout/
    sidebar.tsx           # md+
    bottom-nav.tsx        # mobile only
    mobile-header.tsx
  theme/theme-provider.tsx
  ui/                     # shadcn/ui (button, card)

lib/
  supabase/
    client.ts             # 브라우저 클라이언트
    server.ts             # 서버 컴포넌트/액션
    middleware.ts         # 세션 자동 갱신 + 보호 라우트
  nav-items.ts            # 사이드바/탭바 공통 메뉴
  utils.ts                # cn(), getSiteUrl()

middleware.ts             # 루트 미들웨어
```

---

## 🗺️ 다음 단계

- **Step 2**: Supabase 스키마 (`profiles`, `plans`, `tags`, `plan_tags`) + RLS
- **Step 3**: # 태그 스마트 입력창, 태그 필터 투두 리스트
- **Step 4**: Recharts 기반 주간/월간 성취율 리포트
