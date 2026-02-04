import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
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

    if (code) {
        const supabase = await createClient()
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError)
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(exchangeError.message || 'Authentication failed. Please try again.')}`, request.url)
            )
        }

        // Check if this is a password recovery session
        if (data?.session) {
            const { data: { user } } = await supabase.auth.getUser()
            
            // Check if user needs to reset password (recovery flow)
            // In Supabase, when a user clicks the reset password link, they get a recovery token
            // We should redirect them to the reset password page
            if (requestUrl.searchParams.get('type') === 'recovery' || next.includes('reset-password')) {
                return NextResponse.redirect(new URL('/reset-password', request.url))
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(next, request.url))
}
