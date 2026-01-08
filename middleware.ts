import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  
  // Skip middleware for static files, API routes, and already on /ae routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/ae') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Check if user has manually set a region preference
  const regionPreference = request.cookies.get('region-preference')?.value
  if (regionPreference === 'in') {
    return NextResponse.next()
  }

  // Get country from Vercel's geo-location headers
  const country = request.headers.get('x-vercel-ip-country')
  
  // Check if user searched for invoice-related terms
  const searchQuery = search.toLowerCase()
  const isInvoiceSearch = searchQuery.includes('invoice') || 
                          searchQuery.includes('billing') ||
                          searchQuery.includes('vat') ||
                          searchQuery.includes('فاتورة') // Arabic for invoice

  // Redirect UAE users or invoice searchers to /ae
  const isUAEUser = country === 'AE'
  
  if ((isUAEUser || isInvoiceSearch) && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/ae'
    
    const response = NextResponse.redirect(url)
    
    // Set a cookie to remember they were redirected (can be overridden)
    response.cookies.set('auto-redirected', 'true', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })
    
    return response
  }

  // Redirect other UAE traffic to /ae for pricing and features pages
  if (isUAEUser && (pathname === '/pricing' || pathname === '/features')) {
    const url = request.nextUrl.clone()
    url.pathname = `/ae${pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
