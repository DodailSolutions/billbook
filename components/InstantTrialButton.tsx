'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Zap, Loader2 } from 'lucide-react'
import { activatePlanTrial } from '@/app/(marketing)/pricing/actions'

interface InstantTrialButtonProps {
    planSlug?: string
    label?: string
    className?: string
}

export function InstantTrialButton({ 
    planSlug = 'starter', 
    label = 'Try 14 Days Free Instantly',
    className = 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
}: InstantTrialButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleActivate = async () => {
        setLoading(true)
        try {
            const res = await activatePlanTrial(planSlug)
            if (res.success || res.redirectUrl) {
                router.refresh()
            } else if (res.error) {
                alert(res.error)
            }
        } catch (err) {
            console.error('Error activating trial:', err)
            alert('Failed to activate trial. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleActivate}
            disabled={loading}
            className={`flex items-center gap-2 transition-all ${className}`}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating Trial...</span>
                </>
            ) : (
                <>
                    <Zap className="h-4 w-4 fill-current text-current" />
                    <span>{label}</span>
                </>
            )}
        </Button>
    )
}
