import { NextResponse } from 'next/server'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const SNAPSHOT_TABLES = ['user_profiles', 'invoices', 'customers', 'payments', 'employees'] as const

export async function GET(request: Request) {
    const hasAccess = await checkSuperAdminAccess().catch(() => false)
    if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const exportMode = url.searchParams.get('export')
    const supabase = await createClient()

    if (exportMode === 'json') {
        const snapshot: Record<string, any> = {
            exported_at: new Date().toISOString(),
            tables: {},
        }

        for (const table of SNAPSHOT_TABLES) {
            const { data, error } = await supabase.from(table).select('*').limit(5000)
            snapshot.tables[table] = error ? { error: error.message } : (data || [])
        }

        return new NextResponse(JSON.stringify(snapshot, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="billbook-emergency-snapshot-${new Date().toISOString().split('T')[0]}.json"`,
            },
        })
    }

    const counts: Record<string, number> = {}
    for (const table of SNAPSHOT_TABLES) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
        counts[table] = error ? 0 : (count ?? 0)
    }

    const { data: lastVerify } = await supabase
        .from('audit_logs')
        .select('created_at, details')
        .eq('action', 'backup_verify')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    return NextResponse.json({
        counts,
        last_verified_at: lastVerify?.created_at || null,
    })
}
