'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login error:', error)
            return redirect('/login?message=Could not authenticate user')
        }

        revalidatePath('/', 'layout')
        return redirect('/dashboard')
    } catch (error) {
        console.error('Login exception:', error)
        return redirect('/login?message=An error occurred during login')
    }
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient()

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        })

        if (error) {
            console.error('Signup error:', error)
            return redirect('/signup?message=' + error.message)
        }

        revalidatePath('/', 'layout')
        return redirect('/dashboard')
    } catch (error) {
        console.error('Signup exception:', error)
        return redirect('/signup?message=An error occurred during signup')
    }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
