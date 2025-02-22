export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      popular_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: number
          is_visible: boolean
          like_count: number | null
          permalink: string | null
          pk: string
          quote_count: number | null
          reply_count: number | null
          report_id: string | null
          repost_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: number
          is_visible?: boolean
          like_count?: number | null
          permalink?: string | null
          pk: string
          quote_count?: number | null
          reply_count?: number | null
          report_id?: string | null
          repost_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: number
          is_visible?: boolean
          like_count?: number | null
          permalink?: string | null
          pk?: string
          quote_count?: number | null
          reply_count?: number | null
          report_id?: string | null
          repost_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_report_top_3_posts_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          average_post_time: number | null
          crawled_post_count: number | null
          created_at: string
          id: string
          is_finished: boolean | null
          like_count: number | null
          post_density: number | null
          reply_count: number | null
          reply_density: number | null
          updated_at: string | null
          user_pkid: string | null
        }
        Insert: {
          average_post_time?: number | null
          crawled_post_count?: number | null
          created_at?: string
          id: string
          is_finished?: boolean | null
          like_count?: number | null
          post_density?: number | null
          reply_count?: number | null
          reply_density?: number | null
          updated_at?: string | null
          user_pkid?: string | null
        }
        Update: {
          average_post_time?: number | null
          crawled_post_count?: number | null
          created_at?: string
          id?: string
          is_finished?: boolean | null
          like_count?: number | null
          post_density?: number | null
          reply_count?: number | null
          reply_density?: number | null
          updated_at?: string | null
          user_pkid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_reports_user_pkid_fkey"
            columns: ["user_pkid"]
            isOneToOne: false
            referencedRelation: "threads_users"
            referencedColumns: ["pk_id"]
          },
        ]
      }
      threads_users: {
        Row: {
          created_at: string
          follower_count: number
          following_count: number
          full_name: string | null
          id: number
          pk_id: string
          profile_pic_url: string | null
          search_count: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id?: number
          pk_id: string
          profile_pic_url?: string | null
          search_count?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string
          follower_count?: number
          following_count?: number
          full_name?: string | null
          id?: number
          pk_id?: string
          profile_pic_url?: string | null
          search_count?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_expect_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_expected_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
