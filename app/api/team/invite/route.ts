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
    if (teamLimit && !teamLimit?.can_add) {
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
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'This email is already an active team member' }, { status: 400 })
      } else if (existing.status === 'pending') {
        return NextResponse.json({ error: 'An invite has already been sent to this email' }, { status: 400 })
      }
    }

    // Resolve role_id if a slug was provided
    let finalRoleId = role_id
    let roleSlug = role_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(role_id)) {
      // Find or create role by slug
      const { data: roleRow } = await supabase
        .from('team_roles')
        .select('id, slug')
        .eq('slug', role_id)
        .maybeSingle()

      if (!roleRow) {
        const roleDefinitions: Record<string, { name: string; desc: string; perms: string[] }> = {
          manager: {
            name: 'Manager',
            desc: 'Manage invoices, clients, inventory, and approve team attendance.',
            perms: ['invoices.*', 'customers.*', 'inventory.*', 'attendance.approve', 'reports.view']
          },
          hr: {
            name: 'HR Executive',
            desc: 'Manage payroll, employee records, shifts, and CCTV attendance streams.',
            perms: ['payroll.*', 'employees.*', 'attendance.*', 'cctv.*', 'shifts.*']
          },
          employee: {
            name: 'Employee',
            desc: 'Self-service portal to view payslips, punch attendance, and apply for leaves.',
            perms: ['employee.portal', 'attendance.punch', 'leaves.apply']
          },
          admin: {
            name: 'Admin',
            desc: 'Full access to invoicing, payroll, and settings.',
            perms: ['invoices.*', 'customers.*', 'team.*', 'settings.*', 'payroll.*']
          }
        }
        const def = roleDefinitions[role_id] || { name: role_id, desc: `${role_id} role`, perms: [] }
        const { data: newRole } = await supabase
          .from('team_roles')
          .insert({
            name: def.name,
            slug: role_id,
            description: def.desc,
            permissions: def.perms,
            is_system: true
          })
          .select('id, slug')
          .single()

        if (newRole) {
          finalRoleId = newRole.id
          roleSlug = newRole.slug
        }
      } else {
        finalRoleId = roleRow.id
        roleSlug = roleRow.slug
      }
    } else {
      // Get slug for the UUID
      const { data: roleRow } = await supabase
        .from('team_roles')
        .select('slug')
        .eq('id', role_id)
        .maybeSingle()
      if (roleRow) roleSlug = roleRow.slug
    }

    // Generate invite token
    const inviteToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Set invite expiry to 7 days from now
    const inviteExpiry = new Date()
    inviteExpiry.setDate(inviteExpiry.getDate() + 7)

    // Create team member invite
    const insertPayload: any = {
      owner_id: user.id,
      email: email.toLowerCase(),
      status: 'pending',
      invite_token: inviteToken,
      invite_expires_at: inviteExpiry.toISOString()
    }
    if (finalRoleId) insertPayload.role_id = finalRoleId
    if (roleSlug) insertPayload.role = roleSlug

    const { data: member, error: insertError } = await supabase
      .from('team_members')
      .insert(insertPayload)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating team member:', insertError)
      return NextResponse.json({ error: insertError.message || 'Failed to create invite' }, { status: 500 })
    }

    // Log activity
    try {
      await supabase.from('team_activity_log').insert({
        owner_id: user.id,
        team_member_id: member.id,
        actor_id: user.id,
        action: 'invited',
        details: { email, role: roleSlug }
      })
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      member
    })
  } catch (error: any) {
    console.error('Error inviting team member:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
