import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Create a server component client with service role key to bypass RLS
export const createServerClient = () => {
  return createServerComponentClient<Database>(
    { cookies },
    {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key to bypass RLS
    },
  )
}

// Create a server action client with service role key to bypass RLS
export const createActionClient = () => {
  return createServerActionClient<Database>(
    { cookies },
    {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key to bypass RLS
    },
  )
}
