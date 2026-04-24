import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCsv(value: string | number | boolean | null | undefined) {
    const text = value == null ? '' : String(value)
    return `"${text.replace(/"/g, '""')}"`
}

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('inventory_items')
            .select('name, sku, description, unit, current_stock, reorder_level, purchase_price, selling_price, location, is_active')
            .eq('user_id', user.id)
            .order('name', { ascending: true })

        if (error) {
            return NextResponse.json({ error: 'Failed to export inventory' }, { status: 500 })
        }

        const headers = ['name', 'sku', 'description', 'unit', 'current_stock', 'reorder_level', 'purchase_price', 'selling_price', 'location', 'is_active']
        const rows = (data || []).map((item) => headers.map((key) => escapeCsv(item[key as keyof typeof item] as string | number | boolean | null)).join(','))
        const csv = [headers.join(','), ...rows].join('\n')

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="inventory-export.csv"',
            },
        })
    } catch (error) {
        console.error('Inventory export failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
