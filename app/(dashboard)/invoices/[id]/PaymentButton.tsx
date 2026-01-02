'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Image from 'next/image'
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { createPaymentOrder, verifyAndCompletePayment } from '../payment-actions'

interface PaymentButtonProps {
    invoiceId: string
    invoiceNumber: string
    amount: number
    customerName: string
    customerEmail?: string
    customerPhone?: string
    disabled?: boolean
}

declare global {
    interface Window {
        Razorpay: unknown
    }
}

export default function PaymentButton({
    invoiceId,
    invoiceNumber,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    disabled = false
}: PaymentButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handlePayment = async () => {
        if (!scriptLoaded) {
            setMessage({ type: 'error', text: 'Payment system is loading. Please try again.' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            // Create payment order
            const orderData = await createPaymentOrder(invoiceId)

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'BillBooky',
                description: `Payment for Invoice ${invoiceNumber}`,
                order_id: orderData.orderId,
                prefill: {
                    name: customerName,
                    email: customerEmail || '',
                    contact: customerPhone || '',
                },
                theme: {
                    color: '#3B82F6',
                },
                handler: async function (response: {
                    razorpay_order_id: string
                    razorpay_payment_id: string
                    razorpay_signature: string
                }) {
                    try {
                        // Verify payment
                        await verifyAndCompletePayment({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        })

                        setMessage({ type: 'success', text: 'Payment successful!' })
                        
                        // Redirect after a short delay
                        setTimeout(() => {
                            router.refresh()
                        }, 1500)
                    } catch (error) {
                        console.error('Payment verification failed:', error)
                        setMessage({ 
                            type: 'error', 
                            text: 'Payment verification failed. Please contact support.' 
                        })
                    } finally {
                        setLoading(false)
                    }
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false)
                        setMessage({ type: 'error', text: 'Payment cancelled' })
                    }
                },
            }

            // @ts-expect-error Razorpay types not available
            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.error('Error initiating payment:', error)
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to initiate payment' 
            })
            setLoading(false)
        }
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setScriptLoaded(true)}
                onError={() => {
                    setMessage({ type: 'error', text: 'Failed to load payment system' })
                }}
            />

            <div className="space-y-4">
                {message && (
                    <Card className={`p-4 ${
                        message.type === 'success' 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <p className={`font-medium ${
                                message.type === 'success' 
                                    ? 'text-green-800 dark:text-green-300' 
                                    : 'text-red-800 dark:text-red-300'
                            }`}>
                                {message.text}
                            </p>
                        </div>
                    </Card>
                )}

                <Button
                    onClick={handlePayment}
                    disabled={disabled || loading || !scriptLoaded}
                    className="w-full gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-5 w-5" />
                            Pay ₹{amount.toFixed(2)}
                        </>
                    )}
                </Button>

                <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Image 
                        src="https://razorpay.com/assets/razorpay-glyph.svg" 
                        alt="Razorpay" 
                        width={20}
                        height={20}
                        className="h-5 w-5"
                    />
                    <span>Secured by Razorpay</span>
                </div>
            </div>
        </>
    )
}
