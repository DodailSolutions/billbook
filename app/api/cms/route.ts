import { NextRequest, NextResponse } from 'next/server'
import { getRegionalCMS, getSubdomainConfig } from '@/app/(superadmin)/admin/cms/actions'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        let region = (searchParams.get('region') || '').toUpperCase()

        // If no explicit region, check host header for subdomain
        if (!region || !['IN', 'AE', 'US'].includes(region)) {
            const host = request.headers.get('host') || ''
            if (host.startsWith('ae.') || host.includes('ae-')) {
                region = 'AE'
            } else if (host.startsWith('us.') || host.includes('us-')) {
                region = 'US'
            } else {
                region = 'IN'
            }
        }

        const [cmsData, routingConfig] = await Promise.all([
            getRegionalCMS(region as 'IN' | 'AE' | 'US'),
            getSubdomainConfig()
        ])

        return NextResponse.json({
            success: true,
            region,
            announcement: cmsData.announcement,
            hero: cmsData.hero,
            contact: cmsData.contact,
            faqs: cmsData.faqs.filter(f => f.is_active),
            subdomains: routingConfig.subdomains.filter(s => s.isActive)
        })
    } catch (error) {
        console.error('Error serving CMS API:', error)
        return NextResponse.json(
            { error: 'Failed to fetch CMS content' },
            { status: 500 }
        )
    }
}
