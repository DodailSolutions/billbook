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
      return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }

    return NextResponse.json(testimonials || [])
  } catch (error) {
    console.error('Error in testimonials API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
