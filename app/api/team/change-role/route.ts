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

    const { member_id, role_id } = await request.json()

    if (!member_id || !role_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ownership and get current member
    const { data: member } = await supabase
      .from('team_members')
      .select('*, role:team_roles(*)')
      .eq('id', member_id)
      .eq('owner_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Prevent changing owner role
    if (member.role.slug === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 403 })
    }

    // Verify new role exists and is not owner
    const { data: newRole } = await supabase
      .from('team_roles')
      .select('*')
      .eq('id', role_id)
      .single()

    if (!newRole) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (newRole.slug === 'owner') {
      return NextResponse.json({ error: 'Cannot assign owner role' }, { status: 403 })
    }

    // Update role
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ role_id })
      .eq('id', member_id)

    if (updateError) {
      console.error('Error updating role:', updateError)
      return NextResponse.json({ error: 'Failed to change role' }, { status: 500 })
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      owner_id: user.id,
      team_member_id: member_id,
      actor_id: user.id,
      action: 'role_changed',
      details: {
        old_role: member.role.name,
        new_role: newRole.name
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Role changed successfully'
    })
  } catch (error) {
    console.error('Error changing role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
