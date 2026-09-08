import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type') as EmailOtpType | null
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    // Handle errors from Supabase auth flow
    if (error || error_description) {
        console.error('Supabase auth callback error:', { error, error_description })
        const errorMessage = error_description || error || 'Authentication failed'
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
        )
    }

    const supabase = await createClient()

    // 1. Support token_hash verification (works cross-device without PKCE cookies)
    if (token_hash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!verifyError) {
            if (type === 'recovery' || next.includes('reset-password')) {
                return NextResponse.redirect(new URL('/reset-password', request.url))
            }
            return NextResponse.redirect(new URL(next, request.url))
        }

        console.error('Error verifying token hash:', verifyError)
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(verifyError.message || 'Verification failed. Please try logging in.')}`, request.url)
        )
    }

    // 2. Support PKCE code exchange
    if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError)

            // When user confirms email on a different device or browser than signup,
            // the PKCE code verifier cookie is absent on this browser.
            // However, Supabase's server already verified the email during the /auth/v1/verify hop!
            // Redirect to login with a friendly message instead of a technical error.
            if (exchangeError.message?.includes('PKCE') || exchangeError.message?.includes('code verifier')) {
                return NextResponse.redirect(
                    new URL('/login?message=' + encodeURIComponent('Email verified successfully! Please sign in with your password.'), request.url)
                )
            }

            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(exchangeError.message || 'Authentication failed. Please try again.')}`, request.url)
            )
        }

        // Check if this is a password recovery session
        if (data?.session) {
            const { data: { user } } = await supabase.auth.getUser()
            
            // Check if user needs to reset password (recovery flow)
            if (requestUrl.searchParams.get('type') === 'recovery' || next.includes('reset-password')) {
                return NextResponse.redirect(new URL('/reset-password', request.url))
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(next, request.url))
}
