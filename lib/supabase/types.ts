// 갓생 플래너 — Supabase Database 타입
// 나중에 `supabase gen types typescript --project-id <id>` 로 자동 생성된 결과로 교체 가능.
// 그때까지는 supabase/schema.sql 와 손으로 동기화 유지.

export type TagColor =
  | "school"
  | "part"
  | "hobby"
  | "friend"
  | "meal"
  | "custom"
  | "rose"
  | "red"
  | "coral"
  | "orange"
  | "amber"
  | "lime"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "indigo"
  | "violet"
  | "fuchsia"
  | "magenta";

export type DefaultTagSeed = { name: string; color: TagColor };

/** 신규 가입 시 자동 시드되는 기본 태그 (handle_new_user 트리거와 일치) */
export const DEFAULT_TAGS: readonly DefaultTagSeed[] = [
  { name: "학교", color: "school" },
  { name: "알바", color: "part" },
  { name: "취미", color: "hobby" },
  { name: "친구", color: "friend" },
  { name: "식사", color: "meal" },
] as const;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname?: string;
          avatar_url?: string | null;
        };
        Update: {
          nickname?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: TagColor;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: TagColor;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          color?: TagColor;
        };
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          plan_date: string; // YYYY-MM-DD
          plan_time: string | null; // HH:mm:ss (KST wall-clock) or null
          is_done: boolean;
          done_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          plan_date?: string;
          plan_time?: string | null;
          is_done?: boolean;
        };
        Update: {
          content?: string;
          plan_date?: string;
          plan_time?: string | null;
          is_done?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "plans_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      plan_tags: {
        Row: { plan_id: string; tag_id: string };
        Insert: { plan_id: string; tag_id: string };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "plan_tags_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          reflection: string;
          posted_for: string; // YYYY-MM-DD
          items_json: PostItem[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reflection: string;
          posted_for: string;
          items_json: PostItem[];
        };
        Update: {
          reflection?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// 편의 별칭
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type PlanTag = Database["public"]["Tables"]["plan_tags"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];

/** 태그가 함께 로드된 plan — 플래너/리포트에서 자주 쓰임 */
export type PlanWithTags = Plan & { tags: Tag[] };

/** posts.items_json 안의 단일 플랜 스냅샷 */
export type PostItem = {
  content: string;
  plan_time: string | null; // HH:mm:ss
  is_done: boolean;
  tags: { name: string; color: TagColor }[];
};

/** 피드 카드 렌더 시 작성자 정보 함께 로드 */
export type PostWithAuthor = Post & {
  author: { nickname: string; avatar_url: string | null };
};
