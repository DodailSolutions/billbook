import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function parseCsvLine(line: string) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index]
        const next = line[index + 1]

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"'
                index += 1
            } else {
                inQuotes = !inQuotes
            }
            continue
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
            continue
        }

        current += char
    }

    values.push(current.trim())
    return values
}

function parseNumber(value: string | undefined, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'CSV file is required' }, { status: 400 })
        }

        const text = await file.text()
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV must include a header row and at least one data row' }, { status: 400 })
        }

        const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase())
        const required = ['name']
        const missing = required.filter((header) => !headers.includes(header))

        if (missing.length > 0) {
            return NextResponse.json({ error: `Missing required columns: ${missing.join(', ')}` }, { status: 400 })
        }

        const headerIndex = new Map(headers.map((header, index) => [header, index]))
        const payload = lines.slice(1).map((line) => {
            const values = parseCsvLine(line)
            const get = (name: string) => values[headerIndex.get(name) ?? -1]

            return {
                user_id: user.id,
                name: (get('name') || '').trim(),
                sku: (get('sku') || '').trim() || null,
                description: (get('description') || '').trim() || null,
                unit: (get('unit') || 'pcs').trim() || 'pcs',
                current_stock: parseNumber(get('current_stock')),
                reorder_level: parseNumber(get('reorder_level')),
                purchase_price: parseNumber(get('purchase_price')),
                selling_price: parseNumber(get('selling_price')),
                location: (get('location') || '').trim() || null,
                is_active: ['true', '1', 'yes'].includes((get('is_active') || 'true').trim().toLowerCase()),
            }
        }).filter((item) => item.name)

        if (payload.length === 0) {
            return NextResponse.json({ error: 'No valid inventory rows found in CSV' }, { status: 400 })
        }

        const { error } = await supabase.from('inventory_items').insert(payload)

        if (error) {
            console.error('Inventory import failed:', error)
            return NextResponse.json({ error: 'Failed to import inventory CSV' }, { status: 500 })
        }

        return NextResponse.json({ success: true, importedCount: payload.length })
    } catch (error) {
        console.error('Inventory import failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
