import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // Enable XSS filter
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Permissions policy
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )
    
    // Content Security Policy (CSP)
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co https://api.razorpay.com wss://*.supabase.co",
        "frame-src 'self' https://api.razorpay.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; ')
    
    response.headers.set('Content-Security-Policy', csp)
    
    // Strict Transport Security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        )
    }
    
    return response
}

export async function updateSession(request: NextRequest) {
    try {
        let supabaseResponse = NextResponse.next({
            request,
        })

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables')
            return addSecurityHeaders(supabaseResponse)
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Protect /dashboard
        if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return addSecurityHeaders(NextResponse.redirect(url))
        }

        // Redirect to dashboard if logged in and trying to access auth pages (but allow POST for forms)
        if ((request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')) && user && request.method === 'GET') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return addSecurityHeaders(NextResponse.redirect(url))
        }

        return addSecurityHeaders(supabaseResponse)
    } catch (error) {
        console.error('Middleware error:', error)
        return addSecurityHeaders(NextResponse.next({
            request,
        }))
    }
}
