'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, CheckCircle, CreditCard, X } from 'lucide-react'
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
        contact: string
    }
    theme: {
        color: string
    }
    modal: {
        ondismiss: () => void
    }
}

const PLAN_DETAILS: Record<string, { name: string; amount: number; currency: string }> = {
    // India plans (INR)
    starter: { name: 'Starter Plan', amount: 2999, currency: 'INR' },
    'starter-yearly': { name: 'Starter Plan (Yearly)', amount: 29990, currency: 'INR' },
    professional: { name: 'Professional Plan', amount: 4999, currency: 'INR' },
    'professional-yearly': { name: 'Professional Plan (Yearly)', amount: 49990, currency: 'INR' },
    enterprise: { name: 'Enterprise Plan', amount: 10999, currency: 'INR' },
    'enterprise-yearly': { name: 'Enterprise Plan (Yearly)', amount: 109990, currency: 'INR' },
    lifetime: { name: 'Founder Lifetime Plan', amount: 9999, currency: 'INR' },
    'lifetime-professional': { name: 'Lifetime Professional Plan', amount: 9999, currency: 'INR' },
    'founder-lifetime': { name: 'Founder Lifetime Plan', amount: 9999, currency: 'INR' },
    'founder-yearly': { name: 'Founder Yearly Plan', amount: 2999, currency: 'INR' },
    founder: { name: 'Founder Yearly Plan', amount: 2999, currency: 'INR' },
    
    // UAE plans (AED)
    'starter-ae': { name: 'Starter Plan', amount: 49, currency: 'AED' },
    'starter-ae-yearly': { name: 'Starter Plan (Yearly)', amount: 490, currency: 'AED' },
    'growth-ae': { name: 'Growth Plan', amount: 99, currency: 'AED' },
    'growth-ae-yearly': { name: 'Growth Plan (Yearly)', amount: 990, currency: 'AED' },
    'pro-ae': { name: 'Pro Plan', amount: 199, currency: 'AED' },
    'pro-ae-yearly': { name: 'Pro Plan (Yearly)', amount: 1990, currency: 'AED' },
    'enterprise-ae': { name: 'Enterprise Plan', amount: 299, currency: 'AED' },
    'enterprise-ae-yearly': { name: 'Enterprise Plan (Yearly)', amount: 2990, currency: 'AED' },
    'lifetime-ae': { name: 'Lifetime Starter', amount: 499, currency: 'AED' },
    'lifetime-growth-ae': { name: 'Lifetime Growth', amount: 1299, currency: 'AED' },
    'lifetime-pro-ae': { name: 'Lifetime Pro', amount: 1999, currency: 'AED' },
    'lifetime-enterprise-ae': { name: 'Lifetime Enterprise', amount: 2499, currency: 'AED' },
    
    // US/International plans (USD)
    'starter-us': { name: 'Starter Plan', amount: 9, currency: 'USD' },
    'starter-us-yearly': { name: 'Starter Plan (Yearly)', amount: 49, currency: 'USD' },
    'growth-us': { name: 'Growth Plan', amount: 19, currency: 'USD' },
    'growth-us-yearly': { name: 'Growth Plan (Yearly)', amount: 99, currency: 'USD' },
    'pro-us': { name: 'Pro Plan', amount: 29, currency: 'USD' },
    'pro-us-yearly': { name: 'Pro Plan (Yearly)', amount: 179, currency: 'USD' },
    'business-us': { name: 'Business Plan', amount: 49, currency: 'USD' },
    'business-us-yearly': { name: 'Business Plan (Yearly)', amount: 299, currency: 'USD' },
    'lifetime-starter-us': { name: 'Lifetime Starter', amount: 149, currency: 'USD' },
    'lifetime-growth-us': { name: 'Lifetime Growth', amount: 249, currency: 'USD' },
    'lifetime-pro-us': { name: 'Lifetime Pro', amount: 399, currency: 'USD' },
    'lifetime-business-us': { name: 'Lifetime Business', amount: 599, currency: 'USD' }
}

interface CheckoutHandlerProps {
    basePath?: string
}

export function CheckoutHandler({ basePath = '/pricing' }: CheckoutHandlerProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const checkoutPlan = searchParams.get('checkout')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userInfo, setUserInfo] = useState({ name: '', email: '', contact: '' })
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [dynamicPlan, setDynamicPlan] = useState<{ name: string; amount: number; currency: string } | null>(null)
    const [directGuestEmail, setDirectGuestEmail] = useState('')
    const [directGuestName, setDirectGuestName] = useState('')

    useEffect(() => {
        const fetchPlanFromDb = async () => {
            if (!checkoutPlan) return
            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from('subscription_plans')
                    .select('name, price, currency, slug')
                    .or(`slug.eq.${checkoutPlan},slug.eq.lifetime-professional,slug.eq.founder-yearly`)
                    .eq('is_active', true)

                if (data && data.length > 0) {
                    const matched = data.find(p => p.slug === checkoutPlan) ||
                        (checkoutPlan.includes('lifetime') ? data.find(p => p.slug === 'lifetime-professional' || p.slug === 'founder-lifetime') : null) ||
                        (checkoutPlan.includes('founder') ? data.find(p => p.slug === 'founder-yearly') : null) ||
                        data[0]

                    if (matched) {
                        setDynamicPlan({
                            name: matched.name,
                            amount: Number(matched.price),
                            currency: matched.currency
                        })
                    }
                }
            } catch (err) {
                console.warn('Could not fetch DB plan for checkout:', err)
            }
        }

        fetchPlanFromDb()
    }, [checkoutPlan])

    useEffect(() => {
        const fetchUserInfo = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                setIsAuthenticated(true)
                try {
                    const { data: profile, error } = await supabase
                        .from('user_profiles')
                        .select('owner_name, business_name, business_phone')
                        .eq('id', user.id)
                        .single()

                    if (!error && profile) {
                        setUserInfo({
                            name: profile.owner_name || profile.business_name || user.email?.split('@')[0] || '',
                            email: user.email || '',
                            contact: profile.business_phone || ''
                        })
                    } else {
                        setUserInfo({
                            name: user.email?.split('@')[0] || '',
                            email: user.email || '',
                            contact: ''
                        })
                    }
                } catch (err) {
                    console.warn('Failed to fetch user profile:', err)
                    setUserInfo({
                        name: user.email?.split('@')[0] || '',
                        email: user.email || '',
                        contact: ''
                    })
                }
            } else {
                setIsAuthenticated(false)
            }
        }

        if (checkoutPlan) {
            fetchUserInfo()
        }
    }, [checkoutPlan])

    const handleCheckout = async () => {
        if (!checkoutPlan) return

        const planDetails = dynamicPlan || PLAN_DETAILS[checkoutPlan] || {
            name: checkoutPlan.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            amount: 2999,
            currency: 'INR'
        }

        try {
            setLoading(true)
            setError(null)

            const emailToUse = userInfo.email || directGuestEmail
            const nameToUse = userInfo.name || directGuestName

            // Create Razorpay order
            const response = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: planDetails.amount,
                    currency: planDetails.currency,
                    notes: { 
                        plan: checkoutPlan,
                        plan_name: planDetails.name,
                        direct_checkout: 'true',
                        guest_email: emailToUse,
                        guest_name: nameToUse
                    }
                })
            })

            if (!response.ok) {
                throw new Error('Failed to create order')
            }

            const { order, keyId: serverKeyId } = await response.json()
            const keyToUse = serverKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

            if (!keyToUse) {
                throw new Error('Payment gateway key is missing. Please contact support.')
            }

            // Ensure Razorpay SDK is loaded
            if (typeof (window as any).Razorpay === 'undefined') {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script')
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                    script.async = true
                    script.onload = () => resolve()
                    script.onerror = () => reject(new Error('Failed to load Razorpay payment gateway'))
                    document.body.appendChild(script)
                })
            }

            // Load Razorpay checkout
            const options: RazorpayOptions = {
                key: keyToUse,
                amount: order.amount,
                currency: order.currency,
                name: 'BillBooky',
                description: planDetails.name,
                order_id: order.id,
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    if (isAuthenticated === false) {
                        const paymentData = btoa(JSON.stringify({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            plan: checkoutPlan,
                            email: emailToUse,
                            name: nameToUse
                        }))
                        router.push(`/signup?payment=${paymentData}&plan=${checkoutPlan}`)
                        return
                    }
                    
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
                    name: nameToUse,
                    email: emailToUse,
                    contact: userInfo.contact,
                },
                theme: {
                    color: '#005DEE'
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

    const planDetails = dynamicPlan || PLAN_DETAILS[checkoutPlan] || {
        name: checkoutPlan.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        amount: 2999,
        currency: 'INR'
    }

    const currencySymbol = planDetails.currency === 'AED' ? 'AED ' : planDetails.currency === 'USD' ? '$' : '₹'
    const localeCode = planDetails.currency === 'AED' ? 'en-AE' : planDetails.currency === 'USD' ? 'en-US' : 'en-IN'
    const formattedAmount = `${currencySymbol}${planDetails.amount.toLocaleString(localeCode)}`

    // Direct purchase modal for unauthenticated users
    if (isAuthenticated === false) {
        return (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={() => router.push(basePath)}
            >
                <Card 
                    className="max-w-md w-full shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => router.push(basePath)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Direct Checkout - {planDetails.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Instant activation. Pay securely online with card or local payment methods.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Selected Plan</span>
                                <span className="font-bold text-slate-900 dark:text-white">{planDetails.name}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Amount Due</span>
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                    {formattedAmount}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Your Email (for invoice receipt & login)
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={directGuestEmail}
                                    onChange={(e) => setDirectGuestEmail(e.target.value)}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Business / Individual Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Acme Corp"
                                    value={directGuestName}
                                    onChange={(e) => setDirectGuestName(e.target.value)}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm rounded-xl shadow-lg shadow-blue-600/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Initiating Secure Payment...
                                    </>
                                ) : (
                                    `Pay ${formattedAmount} Now`
                                )}
                            </Button>

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => router.push(basePath)}
                                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/signup?plan=${checkoutPlan}&redirect=checkout`)}
                                    className="text-xs text-blue-600 hover:underline font-semibold"
                                >
                                    Or create account first →
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isAuthenticated === null) {
        return null
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => router.push(basePath)}
        >
            <Card 
                className="max-w-md w-full shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => router.push(basePath)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Upgrade to {planDetails.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                        Complete your purchase to unlock premium features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
                            <span className="font-bold text-slate-900 dark:text-white">{planDetails.name}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Amount Due</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {formattedAmount}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm rounded-xl shadow-lg shadow-blue-600/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Opening Payment Window...
                                </>
                            ) : (
                                `Pay ${formattedAmount} with Razorpay`
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push(basePath)}
                            className="w-full text-xs text-slate-600 dark:text-slate-400"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
