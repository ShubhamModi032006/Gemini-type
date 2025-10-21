import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('=== Database Diagnosis ===')
    
    const supabase = createClient()
    
    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Checking Supabase connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('test_results')
      .select('count')
      .limit(1)
    
    console.log('Connection test result:', { connectionTest, connectionError })
    
    // Test 2: Check table structure
    console.log('Test 2: Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'test_results' })
      .catch(() => ({ data: null, error: { message: 'RPC function not available' } }))
    
    console.log('Table info result:', { tableInfo, tableError })
    
    // Test 3: Try a simple select
    console.log('Test 3: Testing simple select...')
    const { data: selectTest, error: selectError } = await supabase
      .from('test_results')
      .select('*')
      .limit(1)
    
    console.log('Select test result:', { selectTest, selectError })
    
    // Test 4: Check if we can insert (with proper data types)
    console.log('Test 4: Testing insert with proper data types...')
    const testInsertData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      wpm: 50,
      accuracy: 0.95,
      error_count: 2,
      test_level: 'Test'
    }
    
    const { data: insertTest, error: insertError } = await supabase
      .from('test_results')
      .insert([testInsertData])
      .select()
    
    console.log('Insert test result:', { insertTest, insertError })
    
    // Test 5: Check RLS policies
    console.log('Test 5: Checking RLS status...')
    const { data: rlsInfo, error: rlsError } = await supabase
      .rpc('get_rls_status', { table_name: 'test_results' })
      .catch(() => ({ data: null, error: { message: 'RPC function not available' } }))
    
    console.log('RLS info result:', { rlsInfo, rlsError })
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: {
          success: !connectionError,
          error: connectionError?.message,
          data: connectionTest
        },
        tableStructure: {
          success: !tableError,
          error: tableError?.message,
          data: tableInfo
        },
        select: {
          success: !selectError,
          error: selectError?.message,
          data: selectTest
        },
        insert: {
          success: !insertError,
          error: insertError?.message,
          data: insertTest,
          testData: testInsertData
        },
        rls: {
          success: !rlsError,
          error: rlsError?.message,
          data: rlsInfo
        }
      }
    })
    
  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
