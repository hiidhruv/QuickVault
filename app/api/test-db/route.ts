import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from('images')
      .select('id')
      .limit(1)

    if (tablesError) {
      return NextResponse.json({ 
        success: false, 
        error: "Database connection failed",
        details: tablesError
      })
    }

    console.log("Step 1: Testing insert without category...");

    // Step 1: Insert without category (bypass schema cache issue)
    const { data: testData, error: insertError } = await supabase
      .from('images')
      .insert({
        title: 'TEST',
        storage_path: 'test',
        public_url: 'test',
        content_type: 'test',
        size_in_bytes: 123
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        error: "Basic insert failed",
        details: insertError
      })
    }

    console.log("Step 1 successful, now testing category update...");

    // Step 2: Update with category using direct SQL
    const updateQuery = `UPDATE images SET category = 'test-category' WHERE id = '${testData.id}';`;
    
    const { error: updateError } = await supabase.rpc('sql', { 
      query: updateQuery 
    });

    let categoryUpdateSuccess = !updateError;
    if (updateError) {
      console.log("Category update failed:", updateError);
    } else {
      console.log("Category update successful!");
      // Update the test data to reflect the category
      testData.category = 'test-category';
    }

    // Clean up test data
    if (testData) {
      await supabase.from('images').delete().eq('id', testData.id)
    }

    return NextResponse.json({ 
      success: true,
      message: "Two-step insert approach working!",
      testRecord: testData,
      basicInsertWorked: true,
      categoryUpdateWorked: categoryUpdateSuccess,
      note: categoryUpdateSuccess ? "Categories fully functional!" : "Basic upload works, category update needs work"
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "API error",
      details: error instanceof Error ? error.message : String(error)
    })
  }
} 