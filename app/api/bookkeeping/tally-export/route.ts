import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTallyXml } from '@/lib/tally-export'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const fromDate = searchParams.get('fromDate') || undefined
        const toDate = searchParams.get('toDate') || undefined
        const clientId = searchParams.get('clientId') || undefined

        const xml = await generateTallyXml({
            clientId,
            fromDate,
            toDate,
            includeMasters: true,
            includeVouchers: true
        })

        const filename = `Tally_Prime_Export_${fromDate || 'all'}_to_${toDate || 'today'}.xml`

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })
    } catch (error: any) {
        console.error('Tally export error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to generate Tally XML' },
            { status: 500 }
        )
    }
}
