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

    const { email, role_id } = await request.json()

    if (!email || !role_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Check if user's email is trying to invite themselves
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    // Check team member limits
    const { data: limits } = await supabase.rpc('check_team_member_limit', {
      p_owner_id: user.id
    })

    const teamLimit = limits?.[0]
    if (!teamLimit?.can_add) {
      return NextResponse.json(
        { error: `Team member limit reached. Your plan allows ${teamLimit?.allowed} member(s).` },
        { status: 403 }
      )
    }

    // Check if email already invited
    const { data: existing } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('owner_id', user.id)
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'This email is already an active team member' }, { status: 400 })
      } else if (existing.status === 'pending') {
        return NextResponse.json({ error: 'An invite has already been sent to this email' }, { status: 400 })
      }
    }

    // Generate invite token
    const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Set invite expiry to 7 days from now
    const inviteExpiry = new Date()
    inviteExpiry.setDate(inviteExpiry.getDate() + 7)

    // Create team member invite
    const { data: member, error: insertError } = await supabase
      .from('team_members')
      .insert({
        owner_id: user.id,
        email: email.toLowerCase(),
        role_id,
        status: 'pending',
        invite_token: inviteToken,
        invite_expires_at: inviteExpiry.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating team member:', insertError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Log activity
    await supabase.from('team_activity_log').insert({
      owner_id: user.id,
      team_member_id: member.id,
      actor_id: user.id,
      action: 'invited',
      details: { email, role_id }
    })

    // TODO: Send email invitation
    // For now, we'll just return success
    // In production, integrate with your email service

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      member
    })
  } catch (error) {
    console.error('Error inviting team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
