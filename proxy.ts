import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Skip middleware for static files, API routes, and already on regional routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/ae') ||
        pathname.startsWith('/us') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/dashboard') ||
        pathname.includes('.') // Skip files with extensions
    ) {
        return await updateSession(request)
    }

    // 1. Subdomain-based Routing (e.g. ae.billbooky.dodail.com, us.billbooky.dodail.com, app.billbooky.dodail.com)
    const host = request.headers.get('host') || ''
    const hostParts = host.split('.')
    let subdomain = ''
    if (hostParts.length >= 3) {
        subdomain = hostParts[0].toLowerCase()
    }

    // Subdomain: UAE (ae.*)
    if (subdomain === 'ae') {
        if (pathname === '/') {
            const url = request.nextUrl.clone()
            url.pathname = '/ae'
            const response = NextResponse.rewrite(url)
            response.cookies.set('region-preference', 'ae', {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
                sameSite: 'lax'
            })
            return response
        }
        if (pathname === '/pricing' || pathname === '/features') {
            const url = request.nextUrl.clone()
            url.pathname = `/ae${pathname}`
            return NextResponse.rewrite(url)
        }
    }

    // Subdomain: US & Global (us.*)
    if (subdomain === 'us') {
        if (pathname === '/') {
            const url = request.nextUrl.clone()
            url.pathname = '/us'
            const response = NextResponse.rewrite(url)
            response.cookies.set('region-preference', 'us', {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
                sameSite: 'lax'
            })
            return response
        }
        if (pathname === '/pricing' || pathname === '/features') {
            const url = request.nextUrl.clone()
            url.pathname = `/us${pathname}`
            return NextResponse.rewrite(url)
        }
    }

    // Subdomain: App Portal (app.*)
    if (subdomain === 'app' && pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url, 307)
    }

    // 2. Country detection from Vercel's geo-location headers
    const country = request.headers.get('x-vercel-ip-country')

    // Region mapping - automatically redirect based on country
    const regionRouting: Record<string, string> = {
        'AE': '/ae',  // UAE
        'US': '/us',  // United States
        'CA': '/us',  // Canada
        'AU': '/us',  // Australia
        'NZ': '/us',  // New Zealand
        'GB': '/us',  // United Kingdom
        'SG': '/us',  // Singapore
        'ZA': '/us',  // South Africa
        'IE': '/us',  // Ireland
        'MX': '/us',  // Mexico
        'BR': '/us',  // Brazil
        'JP': '/us',  // Japan
        'KR': '/us',  // South Korea
        'DE': '/us',  // Germany
        'FR': '/us',  // France
        'ES': '/us',  // Spain
        'IT': '/us',  // Italy
        'NL': '/us',  // Netherlands
        'SE': '/us',  // Sweden
        'NO': '/us',  // Norway
        'DK': '/us',  // Denmark
        'FI': '/us',  // Finland
        'CH': '/us',  // Switzerland
        'AT': '/us',  // Austria
        'BE': '/us',  // Belgium
        'PL': '/us',  // Poland
        'PT': '/us',  // Portugal
        'GR': '/us',  // Greece
        'CZ': '/us',  // Czech Republic
        'HU': '/us',  // Hungary
        'RO': '/us',  // Romania
        'BG': '/us',  // Bulgaria
        'HR': '/us',  // Croatia
        'SK': '/us',  // Slovakia
        'SI': '/us',  // Slovenia
        'LT': '/us',  // Lithuania
        'LV': '/us',  // Latvia
        'EE': '/us',  // Estonia
        'MY': '/us',  // Malaysia
        'TH': '/us',  // Thailand
        'PH': '/us',  // Philippines
        'ID': '/us',  // Indonesia
        'VN': '/us',  // Vietnam
        'HK': '/us',  // Hong Kong
        'TW': '/us',  // Taiwan
        'IL': '/us',  // Israel
        'TR': '/us',  // Turkey
        'SA': '/us',  // Saudi Arabia
        'QA': '/us',  // Qatar
        'KW': '/us',  // Kuwait
        'BH': '/us',  // Bahrain
        'OM': '/us',  // Oman
        'EG': '/us',  // Egypt
        'NG': '/us',  // Nigeria
        'KE': '/us',  // Kenya
        'GH': '/us',  // Ghana
        'UG': '/us',  // Uganda
        'TZ': '/us',  // Tanzania
        'AR': '/us',  // Argentina
        'CL': '/us',  // Chile
        'CO': '/us',  // Colombia
        'PE': '/us',  // Peru
        'VE': '/us',  // Venezuela
        'UY': '/us',  // Uruguay
        'EC': '/us',  // Ecuador
        'BO': '/us',  // Bolivia
        'CR': '/us',  // Costa Rica
        'PA': '/us',  // Panama
        'DO': '/us',  // Dominican Republic
        // India and unlisted countries default to India (/)
    }

    // Auto-redirect to regional page for root path
    if (country && regionRouting[country] && pathname === '/') {
        const targetPath = regionRouting[country]
        const url = request.nextUrl.clone()
        url.pathname = targetPath
        
        const response = NextResponse.redirect(url, 307) // Temporary redirect
        
        // Set region cookie to track auto-detection
        response.cookies.set('region-auto', country, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
            sameSite: 'lax'
        })
        
        return response
    }

    // Redirect pricing/features to regional pages
    if (country && regionRouting[country] && (pathname === '/pricing' || pathname === '/features')) {
        const targetPath = regionRouting[country]
        const url = request.nextUrl.clone()
        url.pathname = `${targetPath}${pathname}`
        
        const response = NextResponse.redirect(url, 307)
        
        response.cookies.set('region-auto', country, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
            sameSite: 'lax'
        })
        
        return response
    }

    return await updateSession(request)
}

// Export as middleware for Next.js
export { proxy as middleware }

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
