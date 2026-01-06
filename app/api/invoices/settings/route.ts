import { NextResponse } from 'next/server'
import { getInvoiceSettings } from '@/app/(dashboard)/invoices/settings/actions'

export async function GET() {
    try {
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
