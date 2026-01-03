import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check admin access
    const isAdmin = await checkSuperAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }

    return NextResponse.json(testimonials || [])
  } catch (error) {
    console.error('Error in admin testimonials API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check admin access
    const isAdmin = await checkSuperAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Get the highest display_order and add 1
    const { data: maxOrder } = await supabase
      .from('testimonials')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const newOrder = (maxOrder?.display_order ?? 0) + 1

    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        ...body,
        display_order: newOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in admin testimonials POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
