export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          category: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          public_url: string
          size_in_bytes: number
          storage_path: string
          title: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          category?: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          public_url: string
          size_in_bytes: number
          storage_path: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          public_url?: string
          size_in_bytes?: number
          storage_path?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
      }
      image_views: {
        Row: {
          id: string
          image_id: string
          ip_address: string | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          image_id: string
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          image_id?: string
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
