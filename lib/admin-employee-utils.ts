export interface EmployeeLookupInfo {
    employerId?: string
    designation?: string
    roleName?: string
}

export interface EmployeeLookupMaps {
    byUserId: Map<string, EmployeeLookupInfo>
    byEmail: Map<string, EmployeeLookupInfo>
}

export const EMPLOYEE_ROLES = new Set([
    'employee',
    'staff',
    'relationship_agent',
    'hr',
    'hr_executive',
    'manager',
    'client_relationship_manager'
])

export function isEmployeeRole(role?: string | null): boolean {
    return !!role && EMPLOYEE_ROLES.has(role.toLowerCase())
}

/**
 * Fetches team_members and employees records (non-fatal if tables/columns vary)
 * so Super Admin views can distinguish company employees from standalone business owners.
 */
export async function fetchEmployeeLookupMaps(dataClient: any): Promise<EmployeeLookupMaps> {
    const byUserId = new Map<string, EmployeeLookupInfo>()
    const byEmail = new Map<string, EmployeeLookupInfo>()

    try {
        const { data: teamMembers, error: tmError } = await dataClient
            .from('team_members')
            .select(`
                user_id,
                email,
                owner_id,
                status,
                designation,
                team_roles (
                    name,
                    slug
                )
            `)
            .neq('status', 'removed')

        if (!tmError && Array.isArray(teamMembers)) {
            teamMembers.forEach((tm: any) => {
                const roleObj = Array.isArray(tm.team_roles) ? tm.team_roles[0] : tm.team_roles
                if (roleObj?.slug === 'owner') return
                const info: EmployeeLookupInfo = {
                    employerId: tm.owner_id,
                    designation: tm.designation || undefined,
                    roleName: roleObj?.name || 'Employee'
                }
                if (tm.user_id) byUserId.set(tm.user_id, info)
                if (tm.email) byEmail.set(String(tm.email).toLowerCase(), info)
            })
        }
    } catch (tmErr) {
        console.warn('[fetchEmployeeLookupMaps] Non-fatal: could not fetch team_members:', tmErr)
    }

    try {
        const { data: employees, error: empError } = await dataClient
            .from('employees')
            .select('employee_user_id, user_id, email, designation, status')
            .neq('status', 'terminated')

        if (!empError && Array.isArray(employees)) {
            employees.forEach((emp: any) => {
                const info: EmployeeLookupInfo = {
                    employerId: emp.user_id,
                    designation: emp.designation || undefined,
                    roleName: 'Employee'
                }
                if (emp.employee_user_id && !byUserId.has(emp.employee_user_id)) {
                    byUserId.set(emp.employee_user_id, info)
                }
                if (emp.email && !byEmail.has(String(emp.email).toLowerCase())) {
                    byEmail.set(String(emp.email).toLowerCase(), info)
                }
            })
        }
    } catch (empErr) {
        console.warn('[fetchEmployeeLookupMaps] Non-fatal: could not fetch employees:', empErr)
    }

    return { byUserId, byEmail }
}

export function isEmployeeRecord(
    user: { id?: string | null; email?: string | null; business_email?: string | null; role?: string | null },
    maps: EmployeeLookupMaps
): boolean {
    if (isEmployeeRole(user.role)) return true
    if (user.id && maps.byUserId.has(user.id)) return true
    const email = (user.email || user.business_email || '').toLowerCase()
    if (email && maps.byEmail.has(email)) return true
    return false
}
