import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserPlanStatus } from '@/lib/plan-utils'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      email, 
      role_id, 
      designation, 
      allocated_hours, 
      hourly_cost_rate, 
      hourly_billing_rate 
    } = await request.json()

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
    const planStatus = await getUserPlanStatus()
    const isLifetimePlan = planStatus?.isLifetime ?? false
    const planSlug = (planStatus?.planSlug || '').toLowerCase()
    const isProOrAbove = planSlug.includes('pro') || planSlug.includes('professional') || planSlug.includes('enterprise') || isLifetimePlan
    const defaultAllowed = isProOrAbove ? (planSlug.includes('enterprise') ? 10 : 2) : 0

    let allowed = defaultAllowed
    let current = 0
    let canAdd = isProOrAbove ? true : false

    try {
      const { data: limits } = await supabase.rpc('check_team_member_limit', {
        p_owner_id: user.id
      })
      if (Array.isArray(limits) && limits[0]) {
        allowed = Math.max(limits[0].allowed || 0, defaultAllowed)
        current = limits[0].current || 0
        canAdd = isProOrAbove ? (current < allowed) : (limits[0].can_add ?? false)
      }
    } catch (e) {
      console.warn('RPC check_team_member_limit fallback in invite route:', e)
    }

    // Direct count of active/pending team members to ensure 100% accuracy
    try {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .in('status', ['active', 'pending'])

      if (typeof count === 'number') {
        current = count
        canAdd = isProOrAbove ? (current < allowed) : canAdd
      }
    } catch {}

    if (!canAdd) {
      return NextResponse.json(
        { error: `Team member limit reached (${current}/${allowed} used). Your plan allows ${allowed} member(s).` },
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

    // Use admin client to reliably query/create roles bypassing RLS
    let adminSupabase: any = null
    try {
      adminSupabase = await createAdminClient()
    } catch {
      adminSupabase = supabase
    }

    // Resolve role_id if a slug or UUID was provided
    let finalRoleId: string | null = null
    let roleSlug = typeof role_id === 'string' ? role_id.toLowerCase().trim() : 'employee'
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (uuidRegex.test(role_id)) {
      finalRoleId = role_id
      const { data: roleRow } = await adminSupabase
        .from('team_roles')
        .select('slug')
        .eq('id', role_id)
        .maybeSingle()
      if (roleRow?.slug) roleSlug = roleRow.slug
    } else {
      // Find or create role by slug or name
      const { data: roleRow } = await adminSupabase
        .from('team_roles')
        .select('id, slug')
        .or(`slug.eq.${roleSlug},name.ilike.${roleSlug}`)
        .maybeSingle()

      if (roleRow?.id && uuidRegex.test(roleRow.id)) {
        finalRoleId = roleRow.id
        roleSlug = roleRow.slug || roleSlug
      } else {
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
        const def = roleDefinitions[roleSlug] || { name: roleSlug, desc: `${roleSlug} role`, perms: [] }
        try {
          const { data: newRole } = await adminSupabase
            .from('team_roles')
            .insert({
              name: def.name,
              slug: roleSlug,
              description: def.desc,
              permissions: def.perms,
              is_system: true
            })
            .select('id, slug')
            .maybeSingle()

          if (newRole?.id && uuidRegex.test(newRole.id)) {
            finalRoleId = newRole.id
            roleSlug = newRole.slug
          }
        } catch (insertErr) {
          console.error('Failed to insert missing team_role:', insertErr)
        }
      }
    }

    // Safety fallback: If finalRoleId is still not a valid UUID, find any existing role in team_roles
    if (!finalRoleId || !uuidRegex.test(finalRoleId)) {
      const { data: fallbackRoles } = await adminSupabase
        .from('team_roles')
        .select('id, slug')
        .limit(1)

      if (fallbackRoles && fallbackRoles.length > 0 && uuidRegex.test(fallbackRoles[0].id)) {
        finalRoleId = fallbackRoles[0].id
        roleSlug = fallbackRoles[0].slug || 'employee'
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
    const insertPayload: any = {
      owner_id: user.id,
      email: email.toLowerCase(),
      status: 'pending',
      invite_token: inviteToken,
      invite_expires_at: inviteExpiry.toISOString()
    }
    // Only pass role_id if it is a strictly verified valid UUID to prevent Postgres errors
    if (finalRoleId && uuidRegex.test(finalRoleId)) {
      insertPayload.role_id = finalRoleId
    }
    if (roleSlug) insertPayload.role = roleSlug
    if (designation) insertPayload.designation = designation
    if (allocated_hours !== undefined) insertPayload.allocated_hours = Number(allocated_hours) || 40
    if (hourly_cost_rate !== undefined) insertPayload.hourly_cost_rate = Number(hourly_cost_rate) || 0
    if (hourly_billing_rate !== undefined) insertPayload.hourly_billing_rate = Number(hourly_billing_rate) || 0

    const { data: member, error: insertError } = await adminSupabase
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
