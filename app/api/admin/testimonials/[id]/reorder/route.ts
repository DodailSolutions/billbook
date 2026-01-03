import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check admin access
    const isAdmin = await checkSuperAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { direction } = await request.json()
    const { id } = await params

    // Get current testimonial
    const { data: current, error: currentError } = await supabase
      .from('testimonials')
      .select('display_order')
      .eq('id', id)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Get all testimonials to swap
    const { data: all, error: allError } = await supabase
      .from('testimonials')
      .select('id, display_order')
      .order('display_order', { ascending: true })

    if (allError || !all) {
      return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }

    const currentIndex = all.findIndex(t => t.id === id)
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    let swapIndex = -1
    if (direction === 'up' && currentIndex > 0) {
      swapIndex = currentIndex - 1
    } else if (direction === 'down' && currentIndex < all.length - 1) {
      swapIndex = currentIndex + 1
    }

    if (swapIndex === -1) {
      return NextResponse.json({ error: 'Cannot move in that direction' }, { status: 400 })
    }

    // Swap display_order
    const currentOrder = all[currentIndex].display_order
    const swapOrder = all[swapIndex].display_order

    await supabase
      .from('testimonials')
      .update({ display_order: swapOrder })
      .eq('id', id)

    await supabase
      .from('testimonials')
      .update({ display_order: currentOrder })
      .eq('id', all[swapIndex].id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering testimonial:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
