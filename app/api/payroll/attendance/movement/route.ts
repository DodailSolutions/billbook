import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAttendanceMovement } from '@/lib/cctv-attendance-actions'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            employee_id,
            event_type,
            camera_id,
            confidence_score,
            timestamp,
            org_token
        } = body

        if (!employee_id || !event_type) {
            return NextResponse.json(
                { error: 'employee_id and event_type (IN/OUT) are required.' },
                { status: 400 }
            )
        }

        // Validate session or token
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Determine target user ID - priority: authenticated user > org_token (if valid UUID) > x-admin-token (if valid UUID)
        let targetUserId = user?.id

        if (!targetUserId) {
            // Try org_token from body
            if (org_token) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(org_token)
                if (isUuid) {
                    targetUserId = org_token
                }
            }
        }

        if (!targetUserId) {
            // Try Authorization header
            const authHeader = req.headers.get('authorization')
            const bearerToken = authHeader?.replace('Bearer ', '').trim()
            if (bearerToken) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bearerToken)
                if (isUuid) {
                    targetUserId = bearerToken
                }
            }
        }

        if (!targetUserId) {
            // Try x-admin-token header (for bridge-to-API calls)
            const adminToken = req.headers.get('x-admin-token')?.trim()
            if (adminToken) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminToken)
                if (isUuid) {
                    targetUserId = adminToken
                }
            }
        }

        // Final fallback: dev token check (only in development)
        if (!targetUserId && !user) {
            const envDevToken = process.env.CCTV_BRIDGE_TOKEN || 'billbook_local_dev_token'
            const providedToken = req.headers.get('x-admin-token') || org_token || ''
            if (providedToken !== envDevToken) {
                return NextResponse.json(
                    { error: 'Unauthorized: Invalid organization token' },
                    { status: 401 }
                )
            }
            // If dev token matches, we need a user_id - try to get from camera ownership
            // For now, return error asking for proper auth
            if (!user) {
                return NextResponse.json(
                    { error: 'Unauthorized: Please provide valid user authentication' },
                    { status: 401 }
                )
            }
        }

        // If we still don't have a targetUserId but have an authenticated user, use that
        if (!targetUserId && user) {
            targetUserId = user.id
        }

        if (!targetUserId) {
            return NextResponse.json(
                { error: 'Unauthorized: Could not determine organization' },
                { status: 401 }
            )
        }

        // Verify the employee belongs to this user's organization
        const { data: emp } = await supabase
            .from('employees')
            .select('id, user_id')
            .eq('id', employee_id)
            .eq('user_id', targetUserId)
            .single()

        if (!emp) {
            return NextResponse.json(
                { error: 'Employee not found or access denied' },
                { status: 403 }
            )
        }

        const result = await logAttendanceMovement({
            employee_id,
            event_type: event_type === 'OUT' ? 'OUT' : 'IN',
            camera_id: camera_id || undefined,
            confidence_score: typeof confidence_score === 'number' ? confidence_score : 0.90,
            timestamp: timestamp || new Date().toISOString()
        })

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to log movement' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            movement_id: result.movement_id,
            message: `Attendance punch '${event_type}' logged successfully.`
        })
    } catch (err: any) {
        console.error('API Error in /api/payroll/attendance/movement:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
