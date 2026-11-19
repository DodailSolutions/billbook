'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export interface BridgeDownloadRecord {
    id: string
    user_id: string
    user_email: string
    os: 'windows' | 'mac'
    downloaded_at: string
}

export interface BridgeDownloadMetrics {
    totalDownloads: number
    windowsDownloads: number
    macDownloads: number
    uniqueUsers: number
    userBreakdown: {
        email: string
        count: number
        lastDownloaded: string
        osBreakdown: { windows: number; mac: number }
    }[]
    recentDownloads: BridgeDownloadRecord[]
}

/**
 * Log an authenticated desktop vision bridge download.
 * Fails if the user is unauthenticated, enforcing private, logged-in downloads only.
 */
export async function logBridgeDownload(os: 'windows' | 'mac'): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { 
                success: false, 
                error: 'Authentication required. Please log in to download the Vision Bridge companion.' 
            }
        }

        const userEmail = user.email || 'Unknown User'

        // Record in audit_logs so superadmin can track downloads & usage
        const { error: insertError } = await supabase
            .from('audit_logs')
            .insert({
                user_id: user.id,
                action: 'vision_bridge_download',
                entity_type: 'vision_bridge',
                changes: {
                    os,
                    user_email: userEmail,
                    downloaded_at: new Date().toISOString()
                }
            })

        if (insertError) {
            console.error('Failed to log bridge download into audit_logs:', insertError)
            // Even if audit log fails, don't crash the user's download
        }

        return { success: true }
    } catch (err: any) {
        console.error('Error logging bridge download:', err)
        return { success: false, error: err?.message || 'Failed to log download' }
    }
}

/**
 * Retrieve Vision Bridge download metrics for Super Admin dashboard.
 */
export async function getBridgeDownloadMetrics(): Promise<BridgeDownloadMetrics | null> {
    try {
        const isSuperAdmin = await checkSuperAdminAccess()
        if (!isSuperAdmin) {
            return null
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('audit_logs')
            .select('id, user_id, changes, created_at')
            .eq('action', 'vision_bridge_download')
            .order('created_at', { ascending: false })

        if (error || !data) {
            console.error('Error fetching bridge download audit logs:', error)
            return {
                totalDownloads: 0,
                windowsDownloads: 0,
                macDownloads: 0,
                uniqueUsers: 0,
                userBreakdown: [],
                recentDownloads: []
            }
        }

        let windowsDownloads = 0
        let macDownloads = 0
        const userMap = new Map<string, { count: number; lastDownloaded: string; osBreakdown: { windows: number; mac: number } }>()
        const recentDownloads: BridgeDownloadRecord[] = []

        data.forEach((row) => {
            const changes = (row.changes || {}) as any
            const os: 'windows' | 'mac' = changes.os === 'mac' ? 'mac' : 'windows'
            const email: string = changes.user_email || 'Unknown'
            const timestamp: string = changes.downloaded_at || row.created_at || new Date().toISOString()

            if (os === 'windows') windowsDownloads++
            else macDownloads++

            const existing = userMap.get(email) || {
                count: 0,
                lastDownloaded: timestamp,
                osBreakdown: { windows: 0, mac: 0 }
            }
            existing.count++
            if (os === 'windows') existing.osBreakdown.windows++
            else existing.osBreakdown.mac++
            userMap.set(email, existing)

            if (recentDownloads.length < 20) {
                recentDownloads.push({
                    id: row.id,
                    user_id: row.user_id,
                    user_email: email,
                    os,
                    downloaded_at: timestamp
                })
            }
        })

        const userBreakdown = Array.from(userMap.entries()).map(([email, info]) => ({
            email,
            count: info.count,
            lastDownloaded: info.lastDownloaded,
            osBreakdown: info.osBreakdown
        })).sort((a, b) => b.count - a.count)

        return {
            totalDownloads: data.length,
            windowsDownloads,
            macDownloads,
            uniqueUsers: userMap.size,
            userBreakdown,
            recentDownloads
        }
    } catch (err) {
        console.error('Error calculating bridge download metrics:', err)
        return null
    }
}
