import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('=== Simple Test Started ===')
    
    const supabase = createClient()
    console.log('Supabase client created')
    
    // Just try to select from the table
    console.log('Attempting to select from test_results...')
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .limit(1)
    
    console.log('Select result:', { data, error })
    
    if (error) {
      console.error('Error details:', {
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
      message: 'Table access successful',
      data: data
    })
    
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
