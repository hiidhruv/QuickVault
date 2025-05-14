export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          title: string | null
          description: string | null
          storage_path: string
          public_url: string
          content_type: string
          size_in_bytes: number
          created_at: string
          updated_at: string
          user_id: string | null
          view_count: number
          is_public: boolean
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          storage_path: string
          public_url: string
          content_type: string
          size_in_bytes: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
          is_public?: boolean
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          storage_path?: string
          public_url?: string
          content_type?: string
          size_in_bytes?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
          is_public?: boolean
        }
      }
      image_views: {
        Row: {
          id: string
          image_id: string
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          image_id: string
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          image_id?: string
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
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
