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

        // If not logged in via cookie, allow authorization via bearer/org token or dev token
        let targetUserId = user?.id

        if (!targetUserId) {
            const authHeader = req.headers.get('authorization')
            const token = authHeader?.replace('Bearer ', '') || org_token || req.headers.get('x-admin-token')

            if (token) {
                // If token provided, query system settings or use token as user_id if valid UUID
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
                if (isUuid) {
                    targetUserId = token
                }
            }
        }

        if (!targetUserId && !user) {
            // Check for service role / fallback in local development
            const envDevToken = process.env.CCTV_BRIDGE_TOKEN || 'billbook_local_dev_token'
            const providedToken = req.headers.get('x-admin-token') || org_token
            if (providedToken !== envDevToken) {
                return NextResponse.json(
                    { error: 'Unauthorized: Invalid organization token' },
                    { status: 401 }
                )
            }
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
