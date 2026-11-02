import LoginForm from './LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LoginPage(props: { 
    searchParams: Promise<{ message?: string, error?: string, error_description?: string, redirect?: string }> 
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    const searchParams = await props.searchParams
    const rawError = searchParams.error_description || searchParams.error || searchParams.message
    const errorMessage = rawError && rawError !== '{}' && rawError !== 'null' && rawError !== 'undefined' && rawError.trim() !== ''
        ? rawError
        : undefined
    return <LoginForm message={errorMessage} redirect={searchParams.redirect} />
}
