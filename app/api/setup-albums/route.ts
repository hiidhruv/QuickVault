import { NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/server"

const supabase = createDirectClient()

export async function POST() {
  try {
    console.log("Starting album tables setup...")

    // Test if albums table exists by trying to select from it
    const { error: testError } = await supabase
      .from('albums')
      .select('id')
      .limit(1)

    if (!testError) {
      return NextResponse.json({ 
        success: true, 
        message: "Album tables already exist",
        alreadyExists: true
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: "Please run the SQL schema manually in your Supabase SQL editor",
      instructions: [
        "1. Go to your Supabase Dashboard",
        "2. Navigate to SQL Editor",
        "3. Run the SQL schema from README.md (starting with 'CREATE TABLE albums...')",
        "4. This will create the albums and album_images tables with proper policies"
      ],
      sqlNeeded: `
-- Create albums table
CREATE TABLE albums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  share_code text UNIQUE NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create album_images junction table
CREATE TABLE album_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE,
  image_id uuid REFERENCES images(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(album_id, image_id)
);

-- Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public album access
CREATE POLICY "Public album read access" ON albums
  FOR SELECT USING (is_public = true);

CREATE POLICY "Public album_images read access" ON album_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_images.album_id 
      AND albums.is_public = true
    )
  );

-- Create policies for authenticated operations
CREATE POLICY "Authenticated album insert" ON albums
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated album update" ON albums
  FOR UPDATE USING (true);

CREATE POLICY "Authenticated album delete" ON albums
  FOR DELETE USING (true);

CREATE POLICY "Authenticated album_images insert" ON album_images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated album_images delete" ON album_images
  FOR DELETE USING (true);
      `
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 