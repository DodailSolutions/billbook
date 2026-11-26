import Link from 'next/link'
import { ArrowLeft, Shield, FileClock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import AuditLogsClientView, { type AuditLogRow } from './AuditLogsClientView'

export const dynamic = 'force-dynamic'

export default async function AdminAuditLogsPage() {
    const hasAccess = await checkSuperAdminAccess().catch(() => false)

    if (!hasAccess) {
        return (
            <div className="min-h-[70vh] p-4 flex items-center justify-center">
                <Card className="max-w-md w-full border-rose-200 dark:border-rose-900">
                    <CardHeader className="text-center">
                        <Shield className="h-8 w-8 text-rose-600 mx-auto mb-2" />
                        <CardTitle>Super Admin Access Required</CardTitle>
                        <CardDescription>You need super administrator privileges to inspect audit logs.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">Return to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const supabase = await createClient()
    let logs: AuditLogRow[] = []
    let loadError: string | null = null

    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(250)

        if (error) {
            loadError = error.message
        } else if (Array.isArray(data)) {
            logs = data as AuditLogRow[]
        }
    } catch (err) {
        loadError = err instanceof Error ? err.message : 'Unable to load audit logs'
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 mb-2">
                            <ArrowLeft className="h-4 w-4" /> Admin Console
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <FileClock className="h-6 w-6 text-blue-600" />
                        Platform Audit Logs
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Chronological governance trail of administrative actions, cron verifications, and security events.
                    </p>
                </div>
            </div>

            {loadError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    Notice: {loadError}
                </div>
            )}

            <AuditLogsClientView logs={logs} />
        </div>
    )
}
