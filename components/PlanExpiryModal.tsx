'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface PlanExpiryModalProps {
    isExpired: boolean
    daysUntilExpiry: number | null
    planName: string
}

export function PlanExpiryModal({ isExpired, daysUntilExpiry, planName }: PlanExpiryModalProps) {
    // Check if dismissed on initialization to avoid setState in effect
    const [isOpen, setIsOpen] = useState(() => {
        const dismissedUntil = localStorage.getItem('planExpiryDismissed')
        if (dismissedUntil) {
            const dismissedDate = new Date(dismissedUntil)
            if (dismissedDate > new Date()) {
                return false
            }
        }
        return isExpired || (daysUntilExpiry !== null && daysUntilExpiry <= 7)
    })

    const [dismissed, setDismissed] = useState(() => {
        const dismissedUntil = localStorage.getItem('planExpiryDismissed')
        if (dismissedUntil) {
            const dismissedDate = new Date(dismissedUntil)
            return dismissedDate > new Date()
        }
        return false
    })

    const handleDismiss = () => {
        setIsOpen(false)
        setDismissed(true)
        
        // Dismiss for 24 hours if expiring soon, or 1 hour if expired
        const hours = isExpired ? 1 : 24
        const dismissUntil = new Date()
        dismissUntil.setHours(dismissUntil.getHours() + hours)
        localStorage.setItem('planExpiryDismissed', dismissUntil.toISOString())
    }

    if (!isOpen || dismissed) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className={`p-6 ${isExpired ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${isExpired ? 'bg-red-100 dark:bg-red-800' : 'bg-amber-100 dark:bg-amber-800'} flex items-center justify-center`}>
                                <AlertTriangle className={`h-6 w-6 ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${isExpired ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'}`}>
                                    {isExpired ? 'Plan Expired' : 'Plan Expiring Soon'}
                                </h3>
                                <p className={`text-sm ${isExpired ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                    {isExpired 
                                        ? 'Your plan has expired'
                                        : `${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'} remaining`
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-gray-700 dark:text-gray-300">
                            {isExpired ? (
                                <>Your <span className="font-semibold">{planName}</span> plan has expired. Renew now to continue using premium features.</>
                            ) : (
                                <>Your <span className="font-semibold">{planName}</span> plan will expire in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}. Renew now to avoid service interruption.</>
                            )}
                        </p>
                    </div>

                    {isExpired && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                <strong>Limited Access:</strong> You currently have restricted access. Upgrade to continue creating invoices and using all features.
                            </p>
                        </div>
                    )}

                    {/* Upgrade Options */}
                    <div className="space-y-3">
                        {/* Current Plan Renewal */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                        Renew {planName} Plan
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                        Continue with your current plan features
                                    </p>
                                    <Link href="/pricing" className="w-full">
                                        <Button 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                        >
                                            Renew {planName} →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Lifetime Deal */}
                        <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                                        💎 Lifetime Professional Deal
                                    </p>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-1">
                                        Pay once, use forever. No monthly fees!
                                    </p>
                                    <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">
                                        <span className="line-through text-sm text-amber-700">₹15,999</span> ₹9,999
                                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">38% OFF</span>
                                    </p>
                                    <Link href="/pricing#lifetime-deal" className="w-full">
                                        <Button 
                                            className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg"
                                        >
                                            Get Lifetime Access →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dismiss Button */}
                    <Button 
                        variant="secondary"
                        onClick={handleDismiss}
                        className="w-full mt-3"
                    >
                        {isExpired ? 'Remind me in 1 hour' : 'Remind me later'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
