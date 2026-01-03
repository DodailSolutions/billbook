import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { member_id } = await request.json()

    if (!member_id) {
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 })
    }

    // Verify ownership and get member
    const { data: member } = await supabase
      .from('team_members')
      .select('*, role:team_roles(*)')
      .eq('id', member_id)
      .eq('owner_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Prevent removing owner
    if (member.role.slug === 'owner') {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 403 })
    }

    // Update status to removed
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ status: 'removed' })
      .eq('id', member_id)

    if (updateError) {
      console.error('Error removing member:', updateError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      owner_id: user.id,
      team_member_id: member_id,
      actor_id: user.id,
      action: 'removed',
      details: { email: member.email }
    })

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully'
    })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
