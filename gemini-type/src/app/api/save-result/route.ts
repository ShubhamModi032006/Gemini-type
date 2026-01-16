import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Create a Supabase client that can read the user's cookie
    const supabase = await createClient()

    // 2. Get the authenticated user from the server's session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 3. If no user is logged in, block the request
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Get the test data from the request
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // 5. Securely insert the data
    //    We use user.id from the server, not from the body
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        user_id: user.id, // This is the secure part
        wpm: body.wpm,
        accuracy: body.accuracy,
        error_count: body.errorCount,
        test_level: body.testLevel,
        test_duration: body.duration, 
      })
      .select()

    // 6. If Supabase had an error, send it back
    if (error) {
      console.error('Supabase Insert Error:', error.message)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    // 7. Success!
    return NextResponse.json({ success: true, data: data[0] }, { status: 200 })

  } catch (e) {
    console.error('Error processing request:', e)
    // Ensure we always return JSON, even on unexpected errors
    return NextResponse.json(
      { error: 'Internal server error', message: e instanceof Error ? e.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}