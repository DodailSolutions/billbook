import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CRITICAL_TABLES = ['user_profiles', 'invoices', 'customers', 'payments', 'employees'] as const

export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        const supabase = await createClient()
        const counts: Record<string, number> = {}

        for (const table of CRITICAL_TABLES) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
            counts[table] = error ? -1 : (count ?? 0)
        }

        const verifiedAt = new Date().toISOString()

        // Log verification in audit_logs (non-blocking if table/RLS restricts)
        await supabase.from('audit_logs').insert([
            {
                action: 'backup_verify',
                entity_type: 'database',
                entity_id: 'daily_snapshot',
                details: { verified_at: verifiedAt, table_counts: counts },
            },
        ])

        return NextResponse.json({
            status: 'verified',
            verified_at: verifiedAt,
            table_counts: counts,
        })
    } catch (error) {
        return NextResponse.json(
            { status: 'error', message: error instanceof Error ? error.message : 'Verification failed' },
            { status: 500 }
        )
    }
}
