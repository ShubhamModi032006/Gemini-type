import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    console.log('=== Test Insert Started ===')
    
    const supabase = createClient()
    console.log('Supabase client created')
    
    // Test insert with the exact column names from the dashboard
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      wpm: 50,
      accuracy: 0.95,
      error_count: 2,
      test_level: 'Test'
    }
    
    console.log('Attempting insert with data:', testData)
    
    const { data, error } = await supabase
      .from('test_results')
      .insert([testData])
      .select()
    
    console.log('Insert result:', { data, error })
    
    if (error) {
      console.error('Insert error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      return NextResponse.json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Insert successful',
      data: data
    })
    
  } catch (error) {
    console.error('Test insert error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
