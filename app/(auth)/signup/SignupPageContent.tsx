'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { SignupForm } from "./SignupForm"
import { ArrowLeft } from "lucide-react"

interface SignupPageContentProps {
    searchParams: { message?: string; plan?: string; redirect?: string; payment?: string }
}

export function SignupPageContent({ searchParams }: SignupPageContentProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    const selectedPlan = searchParams.plan || 'free'
    const redirectAfter = searchParams.redirect
    const paymentData = searchParams.payment

    return (
        <div className="w-full space-y-6" suppressHydrationWarning>
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-black transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>

            <SignupForm 
                selectedPlan={selectedPlan} 
                message={searchParams.message} 
                redirectAfter={redirectAfter} 
                paymentData={paymentData} 
            />

            <div className="pt-2 text-center text-xs text-slate-600 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-700 font-bold hover:underline">
                    Sign in to your account
                </Link>
            </div>
        </div>
    )
}
