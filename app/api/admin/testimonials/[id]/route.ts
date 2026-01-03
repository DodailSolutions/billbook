import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export async function PUT(
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

    const body = await request.json()
    const { id } = await params

    const { data, error } = await supabase
      .from('testimonials')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating testimonial:', error)
      return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in admin testimonials PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const { id } = await params

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting testimonial:', error)
      return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin testimonials DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
