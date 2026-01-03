import { NextResponse } from 'next/server'
import { getRazorpayInstance } from '@/lib/razorpay'

// Force Node.js runtime for Razorpay SDK compatibility
export const runtime = 'nodejs'

export async function GET() {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            return NextResponse.json({
                configured: false,
                error: 'Razorpay credentials not set',
                keyId: !!keyId,
                keySecret: !!keySecret
            }, { status: 500 })
        }

        // Try to create instance
        const razorpay = getRazorpayInstance()

        return NextResponse.json({
            configured: true,
            message: 'Razorpay is properly configured',
            keyIdPrefix: keyId.substring(0, 8) + '...',
            isTestKey: keyId.startsWith('rzp_test_'),
            isLiveKey: keyId.startsWith('rzp_live_')
        })
    } catch (error) {
        console.error('Razorpay test error:', error)
        return NextResponse.json({
            configured: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
