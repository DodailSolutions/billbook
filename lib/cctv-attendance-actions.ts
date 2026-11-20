'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CctvCamera {
    id: string
    user_id: string
    camera_name: string
    stream_url: string
    location: string
    direction_mode: 'in_only' | 'out_only' | 'bidirectional'
    is_active: boolean
    last_ping_at: string | null
    created_at: string
    updated_at: string
}

export interface PayrollShift {
    id: string
    user_id: string
    shift_name: string
    start_time: string
    end_time: string
    grace_period_mins: number
    min_full_day_hours: number
    min_half_day_hours: number
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface AttendanceMovement {
    id: string
    employee_id: string
    user_id: string
    timestamp: string
    event_type: 'IN' | 'OUT'
    camera_id: string | null
    confidence_score: number
    created_at: string
    employee_name?: string
    employee_code?: string
    camera_name?: string
    camera_location?: string
}

export interface EmployeeDailyAudit {
    employee_id: string
    employee_name: string
    employee_code: string
    department: string
    first_in: string | null
    last_out: string | null
    movements_count: number
    total_break_minutes: number
    total_effective_hours: number
    status: 'present' | 'half_day' | 'absent' | 'incomplete'
    is_late: boolean
    movements: AttendanceMovement[]
}

// -----------------------------------------------------------------------------
// CCTV Cameras Actions
// -----------------------------------------------------------------------------

export async function getCctvCameras(): Promise<CctvCamera[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('cctv_cameras')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching CCTV cameras:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('getCctvCameras exception:', err)
        return []
    }
}

export async function saveCctvCamera(input: {
    id?: string
    camera_name: string
    stream_url: string
    location: string
    direction_mode: 'in_only' | 'out_only' | 'bidirectional'
    is_active?: boolean
}): Promise<{ success: boolean; error?: string; camera?: CctvCamera }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized. Please sign in.' }

        const payload = {
            camera_name: input.camera_name.trim(),
            stream_url: input.stream_url.trim(),
            location: input.location.trim() || 'Main Entrance',
            direction_mode: input.direction_mode || 'bidirectional',
            is_active: input.is_active !== undefined ? input.is_active : true,
            user_id: user.id,
            updated_at: new Date().toISOString()
        }

        if (input.id) {
            const { data, error } = await supabase
                .from('cctv_cameras')
                .update(payload)
                .eq('id', input.id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) return { success: false, error: error.message }
            revalidatePath('/payroll/attendance/cctv')
            return { success: true, camera: data }
        } else {
            const { data, error } = await supabase
                .from('cctv_cameras')
                .insert([{ ...payload, last_ping_at: new Date().toISOString() }])
                .select()
                .single()

            if (error) return { success: false, error: error.message }
            revalidatePath('/payroll/attendance/cctv')
            return { success: true, camera: data }
        }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to save camera' }
    }
}

export async function toggleCameraStatus(id: string, is_active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { error } = await supabase
            .from('cctv_cameras')
            .update({ is_active, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath('/payroll/attendance/cctv')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update camera' }
    }
}

export async function deleteCctvCamera(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { error } = await supabase
            .from('cctv_cameras')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath('/payroll/attendance/cctv')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to delete camera' }
    }
}

// -----------------------------------------------------------------------------
// Shift Management Actions
// -----------------------------------------------------------------------------

export async function getPayrollShifts(): Promise<PayrollShift[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('payroll_shifts')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching shifts:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('getPayrollShifts exception:', err)
        return []
    }
}

export async function savePayrollShift(input: {
    id?: string
    shift_name: string
    start_time: string
    end_time: string
    grace_period_mins: number
    min_full_day_hours?: number
    min_half_day_hours?: number
    is_default?: boolean
}): Promise<{ success: boolean; error?: string; shift?: PayrollShift }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        // If setting as default, clear other defaults first
        if (input.is_default) {
            await supabase
                .from('payroll_shifts')
                .update({ is_default: false })
                .eq('user_id', user.id)
        }

        const payload = {
            shift_name: input.shift_name.trim(),
            start_time: input.start_time,
            end_time: input.end_time,
            grace_period_mins: Number(input.grace_period_mins) || 15,
            min_full_day_hours: Number(input.min_full_day_hours) || 8.0,
            min_half_day_hours: Number(input.min_half_day_hours) || 4.0,
            is_default: Boolean(input.is_default),
            user_id: user.id,
            updated_at: new Date().toISOString()
        }

        if (input.id) {
            const { data, error } = await supabase
                .from('payroll_shifts')
                .update(payload)
                .eq('id', input.id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) return { success: false, error: error.message }
            revalidatePath('/payroll/settings/shifts')
            return { success: true, shift: data }
        } else {
            const { data, error } = await supabase
                .from('payroll_shifts')
                .insert([payload])
                .select()
                .single()

            if (error) return { success: false, error: error.message }
            revalidatePath('/payroll/settings/shifts')
            return { success: true, shift: data }
        }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to save shift' }
    }
}

export async function deletePayrollShift(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { error } = await supabase
            .from('payroll_shifts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath('/payroll/settings/shifts')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to delete shift' }
    }
}

// -----------------------------------------------------------------------------
// Face Vector Enrollment Actions
// -----------------------------------------------------------------------------

export async function saveEmployeeFaceEmbedding(input: {
    employee_id: string
    embedding: number[] // 512 float values
    reference_photo_url?: string
}): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        if (!Array.isArray(input.embedding) || input.embedding.length === 0) {
            return { success: false, error: 'Invalid mathematical embedding vector' }
        }

        // Validate embedding dimension - must be 512-D for face recognition
        const EXPECTED_DIMENSION = 512
        if (input.embedding.length !== EXPECTED_DIMENSION) {
            return {
                success: false,
                error: `Face embedding must be exactly ${EXPECTED_DIMENSION} dimensions (received ${input.embedding.length}). Please use a 512-D face encoder (e.g., ArcFace, FaceNet, or InsightFace).`
            }
        }

        // Validate all values are finite numbers
        const hasInvalidValues = input.embedding.some(v => !Number.isFinite(v))
        if (hasInvalidValues) {
            return { success: false, error: 'Face embedding contains invalid values (NaN or Infinity)' }
        }

        // Validate vector is normalized (approximately unit length for cosine similarity)
        const norm = Math.sqrt(input.embedding.reduce((sum, v) => sum + v * v, 0))
        if (norm < 0.1 || norm > 10) {
            // Warn but don't fail - some encoders output unnormalized vectors
            console.warn(`Face embedding norm is ${norm.toFixed(4)}, expected ~1.0 for normalized vectors`)
        }

        const { error } = await supabase
            .from('employee_face_embeddings')
            .upsert({
                employee_id: input.employee_id,
                user_id: user.id,
                embedding: input.embedding,
                reference_photo_url: input.reference_photo_url || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'employee_id'
            })

        if (error) return { success: false, error: error.message }
        revalidatePath('/payroll/employees')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to save face vector' }
    }
}

export async function getEnrolledFaceStatus(): Promise<Record<string, { enrolled: boolean; enrolled_at?: string; dimension?: number }>> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return {}

        const { data, error } = await supabase
            .from('employee_face_embeddings')
            .select('employee_id, created_at, embedding')
            .eq('user_id', user.id)

        if (error) {
            console.error('Error fetching face embeddings status:', error)
            return {}
        }

        const map: Record<string, { enrolled: boolean; enrolled_at?: string; dimension?: number }> = {}
        data?.forEach((row: any) => {
            map[row.employee_id] = {
                enrolled: true,
                enrolled_at: row.created_at,
                dimension: Array.isArray(row.embedding) ? row.embedding.length : undefined
            }
        })
        return map
    } catch (err) {
        return {}
    }
}

// -----------------------------------------------------------------------------
// Attendance Movement Logs & Vision Ingestion
// -----------------------------------------------------------------------------

export async function logAttendanceMovement(input: {
    employee_id: string
    event_type: 'IN' | 'OUT'
    camera_id?: string
    confidence_score?: number
    timestamp?: string
}): Promise<{ success: boolean; error?: string; movement_id?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const eventTime = input.timestamp ? new Date(input.timestamp) : new Date()

        // Debounce: prevent duplicate punches within 2 minutes for the same employee
        const twoMinsAgo = new Date(eventTime.getTime() - 2 * 60 * 1000).toISOString()
        const { data: recentPunches } = await supabase
            .from('attendance_movements')
            .select('id, event_type, timestamp')
            .eq('employee_id', input.employee_id)
            .eq('event_type', input.event_type)
            .gte('timestamp', twoMinsAgo)
            .limit(1)

        if (recentPunches && recentPunches.length > 0) {
            return { 
                success: true, 
                movement_id: recentPunches[0].id, 
                error: 'Debounced duplicate detection within 2-minute window' 
            }
        }

        const { data, error } = await supabase
            .from('attendance_movements')
            .insert([{
                employee_id: input.employee_id,
                user_id: user.id,
                event_type: input.event_type,
                camera_id: input.camera_id || null,
                confidence_score: input.confidence_score || 0.95,
                timestamp: eventTime.toISOString()
            }])
            .select('id')
            .single()

        if (error) return { success: false, error: error.message }

        // Automatically update or create daily attendance row in attendance table
        await syncDailyAttendanceFromMovements(input.employee_id, eventTime, user.id, supabase)

        revalidatePath('/payroll/attendance')
        revalidatePath('/payroll/attendance/movements')
        return { success: true, movement_id: data?.id }
    } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to log movement' }
    }
}

// Automatically syncs first IN and last OUT into attendance table
async function syncDailyAttendanceFromMovements(
    employee_id: string, 
    date: Date, 
    user_id: string, 
    supabase: any
) {
    try {
        const dateStr = date.toISOString().split('T')[0]
        const startOfDay = `${dateStr}T00:00:00.000Z`
        const endOfDay = `${dateStr}T23:59:59.999Z`

        // Fetch all movements for this employee today
        const { data: movements } = await supabase
            .from('attendance_movements')
            .select('event_type, timestamp')
            .eq('employee_id', employee_id)
            .gte('timestamp', startOfDay)
            .lte('timestamp', endOfDay)
            .order('timestamp', { ascending: true })

        if (!movements || movements.length === 0) return

        const inEvents = movements.filter((m: any) => m.event_type === 'IN')
        const outEvents = movements.filter((m: any) => m.event_type === 'OUT')

        const firstIn = inEvents.length > 0 ? inEvents[0].timestamp : null
        const lastOut = outEvents.length > 0 ? outEvents[outEvents.length - 1].timestamp : null

        // Fetch user default shift
        const { data: defaultShift } = await supabase
            .from('payroll_shifts')
            .select('*')
            .eq('user_id', user_id)
            .eq('is_default', true)
            .maybeSingle()

        const fullDayHours = defaultShift?.min_full_day_hours || 8.0
        const halfDayHours = defaultShift?.min_half_day_hours || 4.0

        let status = 'present'
        if (firstIn && lastOut) {
            const diffHours = (new Date(lastOut).getTime() - new Date(firstIn).getTime()) / (1000 * 60 * 60)
            if (diffHours < halfDayHours) {
                status = 'half_day'
            } else if (diffHours < fullDayHours) {
                status = 'half_day'
            } else {
                status = 'present'
            }
        } else if (firstIn) {
            status = 'present'
        }

        // Upsert into attendance table
        await supabase
            .from('attendance')
            .upsert({
                employee_id,
                attendance_date: dateStr,
                status,
                user_id,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'employee_id,attendance_date'
            })
    } catch (err) {
        console.error('Error auto-syncing attendance:', err)
    }
}

export async function getDailyMovementAudit(selectedDate?: string): Promise<EmployeeDailyAudit[]> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const dateStr = selectedDate || new Date().toISOString().split('T')[0]
        const startOfDay = `${dateStr}T00:00:00.000Z`
        const endOfDay = `${dateStr}T23:59:59.999Z`

        // 1. Fetch employees
        const { data: employees } = await supabase
            .from('employees')
            .select('id, name, employee_code, department')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('name', { ascending: true })

        if (!employees || employees.length === 0) return []

        // 2. Fetch movements today
        const { data: movements } = await supabase
            .from('attendance_movements')
            .select(`
                id,
                employee_id,
                user_id,
                timestamp,
                event_type,
                camera_id,
                confidence_score,
                created_at,
                cctv_cameras (
                    camera_name,
                    location
                )
            `)
            .eq('user_id', user.id)
            .gte('timestamp', startOfDay)
            .lte('timestamp', endOfDay)
            .order('timestamp', { ascending: true })

        // 3. Fetch default shift for late grace period check
        const { data: defaultShift } = await supabase
            .from('payroll_shifts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .maybeSingle()

        const shiftStartTime = defaultShift?.start_time || '09:30:00'
        const graceMins = defaultShift?.grace_period_mins || 15
        const fullDayHours = defaultShift?.min_full_day_hours || 8.0
        const halfDayHours = defaultShift?.min_half_day_hours || 4.0

        // Parse shift threshold today
        const [shHours, shMins] = shiftStartTime.split(':').map(Number)
        const shiftCutoff = new Date(dateStr)
        shiftCutoff.setHours(shHours, shMins + graceMins, 0, 0)

        // Group movements by employee
        const movementsByEmp: Record<string, AttendanceMovement[]> = {}
        movements?.forEach((m: any) => {
            if (!movementsByEmp[m.employee_id]) movementsByEmp[m.employee_id] = []
            movementsByEmp[m.employee_id].push({
                id: m.id,
                employee_id: m.employee_id,
                user_id: m.user_id,
                timestamp: m.timestamp,
                event_type: m.event_type,
                camera_id: m.camera_id,
                confidence_score: m.confidence_score,
                created_at: m.created_at,
                camera_name: m.cctv_cameras?.camera_name || 'Camera',
                camera_location: m.cctv_cameras?.location || 'Office'
            })
        })

        // Build audit reports
        const audits: EmployeeDailyAudit[] = employees.map(emp => {
            const empMovements = movementsByEmp[emp.id] || []
            const ins = empMovements.filter(m => m.event_type === 'IN')
            const outs = empMovements.filter(m => m.event_type === 'OUT')

            const first_in = ins.length > 0 ? ins[0].timestamp : null
            const last_out = outs.length > 0 ? outs[outs.length - 1].timestamp : null

            let is_late = false
            if (first_in) {
                is_late = new Date(first_in) > shiftCutoff
            }

            // Calculate breaks
            let total_break_minutes = 0
            if (ins.length > 1 && outs.length > 0) {
                for (let i = 0; i < outs.length; i++) {
                    const outTime = new Date(outs[i].timestamp).getTime()
                    // find matching subsequent IN
                    const nextIn = ins.find(x => new Date(x.timestamp).getTime() > outTime)
                    if (nextIn) {
                        const nextInTime = new Date(nextIn.timestamp).getTime()
                        const breakDiff = (nextInTime - outTime) / (1000 * 60)
                        if (breakDiff > 0 && breakDiff < 180) { // Max 3 hours break
                            total_break_minutes += Math.round(breakDiff)
                        }
                    }
                }
            }

            // Calculate effective hours
            let total_effective_hours = 0
            let status: 'present' | 'half_day' | 'absent' | 'incomplete' = 'absent'

            if (first_in && last_out) {
                const totalSpanHours = (new Date(last_out).getTime() - new Date(first_in).getTime()) / (1000 * 60 * 60)
                const breakHours = total_break_minutes / 60
                total_effective_hours = Math.max(0, parseFloat((totalSpanHours - breakHours).toFixed(2)))

                if (total_effective_hours >= fullDayHours) {
                    status = 'present'
                } else if (total_effective_hours >= halfDayHours) {
                    status = 'half_day'
                } else {
                    status = 'half_day'
                }
            } else if (first_in) {
                status = 'incomplete' // Currently on premise
            }

            return {
                employee_id: emp.id,
                employee_name: emp.name,
                employee_code: emp.employee_code || '-',
                department: emp.department || 'General',
                first_in,
                last_out,
                movements_count: empMovements.length,
                total_break_minutes,
                total_effective_hours,
                status,
                is_late,
                movements: empMovements
            }
        })

        return audits
    } catch (err) {
        console.error('getDailyMovementAudit error:', err)
        return []
    }
}
