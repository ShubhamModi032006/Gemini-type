import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Debug Insert Started ===')
    
    const body = await request.json()
    const { wpm, accuracy, errorCount, testLevel, userId } = body
    
    const supabase = createClient()
    
    // Test 1: Try insert without user_id
    console.log('Test 1: Insert without user_id')
    const testData1 = {
      wpm: Math.round(wpm),
      accuracy: parseFloat(accuracy.toFixed(2)),
      error_count: parseInt(errorCount.toString()),
      test_level: testLevel.toString(),
    }
    
    const { data: data1, error: error1 } = await supabase
      .from('test_results')
      .insert([testData1])
      .select()
    
    console.log('Test 1 result:', { data1, error1 })
    
    // Test 2: Try insert with user_id
    console.log('Test 2: Insert with user_id')
    const testData2 = {
      user_id: userId,
      wpm: Math.round(wpm),
      accuracy: parseFloat(accuracy.toFixed(2)),
      error_count: parseInt(errorCount.toString()),
      test_level: testLevel.toString(),
    }
    
    const { data: data2, error: error2 } = await supabase
      .from('test_results')
      .insert([testData2])
      .select()
    
    console.log('Test 2 result:', { data2, error2 })
    
    return NextResponse.json({
      success: true,
      tests: {
        withoutUserId: {
          success: !error1,
          error: error1?.message,
          data: data1
        },
        withUserId: {
          success: !error2,
          error: error2?.message,
          data: data2
        }
      }
    })
    
  } catch (error) {
    console.error('Debug insert error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
