import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Test Save API Route Called ===')
    
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      wpm: 50,
      accuracy: 0.95,
      error_count: 2,
      test_level: 'Test',
    }

    console.log('Test data:', testData)

    const supabase = createClient()
    
    // Try to insert test data
    const { data, error } = await supabase
      .from('test_results')
      .insert([testData])
      .select()

    console.log('Test insert result:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test data inserted successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('Test save error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
