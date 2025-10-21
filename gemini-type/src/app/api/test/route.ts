import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('=== Test API Route Called ===')
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    }
    
    console.log('Environment check:', envCheck)
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        envCheck
      }, { status: 500 })
    }
    
    // Test Supabase connection
    const supabase = createClient()
    console.log('Supabase client created')
    
    // Try to query the test_results table
    const { data, error } = await supabase
      .from('test_results')
      .select('count')
      .limit(1)
    
    console.log('Supabase query result:', { data, error })
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      envCheck,
      supabaseConnection: error ? 'Failed' : 'Success',
      supabaseError: error?.message || null
    })
    
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
