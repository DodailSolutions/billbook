'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, CheckCircle, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RazorpayOptions {
    key: string | undefined
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => Promise<void>
    prefill: {
        name: string
        email: string
    }
    theme: {
        color: string
    }
    modal: {
        ondismiss: () => void
    }
}

const PLAN_DETAILS: Record<string, { name: string; amount: number; currency: string }> = {
    starter: { name: 'Starter Plan', amount: 299, currency: 'INR' },
    professional: { name: 'Professional Plan', amount: 599, currency: 'INR' },
    enterprise: { name: 'Enterprise Plan', amount: 999, currency: 'INR' },
    lifetime: { name: 'Lifetime Professional', amount: 9999, currency: 'INR' }
}

export function CheckoutHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const checkoutPlan = searchParams.get('checkout')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userInfo, setUserInfo] = useState({ name: '', email: '', contact: '' })

    useEffect(() => {
        const fetchUserInfo = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                // Fetch user profile for name and phone
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('owner_name, business_name, business_phone')
                    .eq('id', user.id)
                    .single()

                setUserInfo({
                    name: profile?.owner_name || profile?.business_name || user.email?.split('@')[0] || '',
                    email: user.email || '',
                    contact: profile?.business_phone || ''
                })
            }
        }

        if (checkoutPlan) {
            fetchUserInfo()
        }
    }, [checkoutPlan])
    const handleCheckout = async () => {
        if (!checkoutPlan) return

        const planDetails = PLAN_DETAILS[checkoutPlan]
        if (!planDetails) {
            setError('Invalid plan selected')
            return
        }

        try {
            setLoading(true)
            setError(null)

            // Create Razorpay order
            const response = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: planDetails.amount,
                    currency: planDetails.currency,
                    notes: { plan: checkoutPlan }
                })
            })

            if (!response.ok) {
                throw new Error('Failed to create order')
            }

            const { order } = await response.json()

            // Load Razorpay checkout
            const options: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'BillBooky',
                description: planDetails.name,
                order_id: order.id,
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    // Verify payment
                    const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: checkoutPlan
                        })
                    })

                    if (verifyResponse.ok) {
                        router.push('/dashboard?payment=success')
                    } else {
                        setError('Payment verification failed')
                        setLoading(false)
                    }
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                    contact: userInfo.contact,
                },
                theme: {
                    color: '#10b981'
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false)
                    }
                }
            }

            const razorpay = new (window as Window & { Razorpay: new (options: RazorpayOptions) => { open: () => void } }).Razorpay(options)
            razorpay.open()
        } catch (err) {
            console.error('Checkout error:', err)
            setError('Failed to initiate checkout. Please try again.')
            setLoading(false)
        }
    }

    if (!checkoutPlan) return null

    const planDetails = PLAN_DETAILS[checkoutPlan]
    if (!planDetails) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        Upgrade to {planDetails.name}
                    </CardTitle>
                    <CardDescription>
                        Complete your purchase to unlock premium features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Plan</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{planDetails.name}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600 dark:text-gray-400">Amount</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                ₹{planDetails.amount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Secure payment via Razorpay</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Instant activation after payment</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>14-day money-back guarantee</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => router.push('/pricing')}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Proceed to Payment'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
