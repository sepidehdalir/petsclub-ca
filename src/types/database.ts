/**
 * Typed contract for the PostgreSQL schema defined in `supabase/migrations`.
 *
 * This file is hand-maintained for Milestone 1 so the repository stays
 * buildable without a live Supabase project. Once a project is provisioned it
 * can be regenerated verbatim with:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public \
 *     > src/types/database.ts
 *
 * Keep it in step with the migrations; it is the type boundary every Supabase
 * client in `src/lib/supabase` is parameterised by.
 */

export type UserRole = "member" | "expert" | "moderator" | "admin";
export type ContentStatus = "published" | "locked" | "hidden" | "deleted";

/** Canadian province and territory codes used by `profiles.province`. */
export const PROVINCE_CODES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
] as const;

export type ProvinceCode = (typeof PROVINCE_CODES)[number];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          province: ProvinceCode | null;
          city: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          province?: ProvinceCode | null;
          city?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          province?: ProvinceCode | null;
          city?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          parent_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      threads: {
        Row: {
          id: string;
          author_id: string | null;
          category_id: string;
          title: string;
          slug: string;
          body: string;
          status: ContentStatus;
          reply_count: number;
          view_count: number;
          last_activity_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          category_id: string;
          title: string;
          slug: string;
          body: string;
          status?: ContentStatus;
        };
        Update: {
          title?: string;
          body?: string;
          status?: ContentStatus;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          thread_id: string;
          author_id: string | null;
          body: string;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          author_id: string;
          body: string;
          status?: ContentStatus;
        };
        Update: {
          body?: string;
          status?: ContentStatus;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      /** Returns true when the current JWT belongs to a moderator or admin. */
      is_moderator: {
        Args: Record<never, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Thread = Tables<"threads">;
export type Post = Tables<"posts">;
