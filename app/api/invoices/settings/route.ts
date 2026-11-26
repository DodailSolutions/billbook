import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInvoiceSettings } from '@/app/(dashboard)/invoices/settings/actions'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const settings = await getInvoiceSettings()
        return NextResponse.json({ settings })
    } catch (error) {
        console.error('Error fetching invoice settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoice settings' },
            { status: 500 }
        )
    }
}
