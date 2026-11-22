import { NextResponse } from 'next/server'
import { getRazorpayInstance } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for Razorpay SDK compatibility
export const runtime = 'nodejs'

export async function GET() {
    try {
        let keyId = process.env.RAZORPAY_KEY_ID
        let keySecret = process.env.RAZORPAY_KEY_SECRET
        let source = 'environment'

        if (!keyId || !keySecret) {
            try {
                const supabase = await createClient()
                const { data } = await supabase
                    .from('system_settings')
                    .select('value')
                    .eq('key', 'payment_gateways_config')
                    .maybeSingle()

                if (data?.value?.razorpay?.keyId && data?.value?.razorpay?.keySecret) {
                    keyId = data.value.razorpay.keyId
                    keySecret = data.value.razorpay.keySecret
                    source = 'superadmin_database'
                }
            } catch (e) {
                console.warn('Could not read from database:', e)
            }
        }

        if (!keyId || !keySecret) {
            return NextResponse.json({
                configured: false,
                error: 'Razorpay credentials not set. Configure them in Super Admin Settings (/admin/settings/payments) or via RAZORPAY_KEY_ID in .env.',
                keyId: !!keyId,
                keySecret: !!keySecret
            }, { status: 500 })
        }

        // Try to create instance
        const razorpay = getRazorpayInstance(keyId, keySecret)

        return NextResponse.json({
            configured: true,
            source,
            message: 'Razorpay is properly configured and operational',
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
