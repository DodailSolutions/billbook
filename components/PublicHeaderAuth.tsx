'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, ArrowRight, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface PublicHeaderAuthProps {
    initialAuthenticated?: boolean
    compact?: boolean
}

export function PublicHeaderAuth({ 
    initialAuthenticated = false,
    compact = false 
}: PublicHeaderAuthProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuthenticated)

    useEffect(() => {
        try {
            const supabase = createClient()
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    setIsAuthenticated(true)
                }
            })

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setIsAuthenticated(!!session?.user)
            })

            return () => subscription.unsubscribe()
        } catch (err) {
            console.warn('Could not initialize public auth listener:', err)
        }
    }, [])

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/invoices/new" className="hidden sm:inline-flex">
                    <Button 
                        variant="ghost" 
                        className="text-slate-700 hover:text-black hover:bg-slate-100 font-bold min-h-[40px] sm:min-h-[44px] rounded-full px-3.5 sm:px-4 gap-1.5 text-xs sm:text-sm"
                    >
                        <PlusCircle className="h-4 w-4 text-blue-600" />
                        <span>New Invoice</span>
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-600/20 min-h-[40px] sm:min-h-[44px] px-4 sm:px-6 rounded-full transition-all duration-300 hover:scale-105 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span>Dashboard</span>
                        <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
                <Button 
                    variant="ghost" 
                    className="text-slate-700 hover:text-black hover:bg-slate-100 font-bold min-h-[40px] sm:min-h-[44px] rounded-full px-3 sm:px-5 text-xs sm:text-sm"
                >
                    Sign In
                </Button>
            </Link>
            <Link href="/signup">
                <Button className="bg-black hover:bg-slate-900 text-white font-bold shadow-md shadow-black/10 min-h-[40px] sm:min-h-[44px] px-4 sm:px-6 rounded-full transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
                    {compact ? 'Sign Up' : 'Get Started Free'}
                </Button>
            </Link>
        </div>
    )
}
