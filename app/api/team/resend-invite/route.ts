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

    // Verify ownership
    const { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', member_id)
      .eq('owner_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    if (member.status !== 'pending') {
      return NextResponse.json({ error: 'Can only resend invites for pending members' }, { status: 400 })
    }

    // Generate new invite token
    const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Extend invite expiry to 7 days from now
    const inviteExpiry = new Date()
    inviteExpiry.setDate(inviteExpiry.getDate() + 7)

    // Update member with new token and expiry
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        invite_token: inviteToken,
        invite_expires_at: inviteExpiry.toISOString()
      })
      .eq('id', member_id)

    if (updateError) {
      console.error('Error updating invite:', updateError)
      return NextResponse.json({ error: 'Failed to resend invite' }, { status: 500 })
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      owner_id: user.id,
      team_member_id: member_id,
      actor_id: user.id,
      action: 'invite_resent',
      details: { email: member.email }
    })

    // TODO: Send email invitation
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully'
    })
  } catch (error) {
    console.error('Error resending invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
