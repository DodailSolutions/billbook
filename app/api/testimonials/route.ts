import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching testimonials:', error)
      // Return empty array instead of error if table doesn't exist
      // This prevents 500 errors before migration is run
      return NextResponse.json([])
    }

    return NextResponse.json(testimonials || [])
  } catch (error) {
    console.error('Error in testimonials API:', error)
    // Return empty array instead of error to prevent breaking the page
    return NextResponse.json([])
  }
}
