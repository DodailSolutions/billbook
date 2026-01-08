import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl
    
    // Skip geo-detection for static files, API routes, and already on regional routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/ae') ||
        pathname.startsWith('/us') ||
        pathname.includes('.') // Skip files with extensions
    ) {
        return await updateSession(request)
    }

    // Get country from Vercel's geo-location headers
    const country = request.headers.get('x-vercel-ip-country')
    
    // Check if user searched for invoice-related terms
    const searchQuery = search.toLowerCase()
    const isInvoiceSearch = searchQuery.includes('invoice') || 
                            searchQuery.includes('billing') ||
                            searchQuery.includes('vat') ||
                            searchQuery.includes('tax') ||
                            searchQuery.includes('فاتورة') // Arabic for invoice

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
        // Add more countries as needed
    }

    // Auto-redirect to regional page (NO manual switching)
    if (country && regionRouting[country] && pathname === '/') {
        const targetPath = regionRouting[country]
        const url = request.nextUrl.clone()
        url.pathname = targetPath
        
        const response = NextResponse.redirect(url)
        
        // Set region cookie
        response.cookies.set('region-auto', country, {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/'
        })
        
        return response
    }

    // Redirect pricing/features to regional pages
    if (country && regionRouting[country] && (pathname === '/pricing' || pathname === '/features')) {
        const targetPath = regionRouting[country]
        const url = request.nextUrl.clone()
        url.pathname = `${targetPath}${pathname}`
        
        const response = NextResponse.redirect(url)
        
        response.cookies.set('region-auto', country, {
            maxAge: 60 * 60 * 24 * 365,
            path: '/'
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
