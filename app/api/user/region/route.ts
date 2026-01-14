import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Get user's region
 * GET /api/user/region
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ region: 'IN' }) // Default to India
    }

    // Get user profile region
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('region')
      .eq('id', user.id)
      .single()

    const region = profile?.region || 'IN'

    return NextResponse.json({ region })
  } catch (error) {
    console.error('Error getting user region:', error)
    return NextResponse.json({ region: 'IN' }) // Default to India on error
  }
}
