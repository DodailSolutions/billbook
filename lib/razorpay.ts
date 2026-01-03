import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance
let razorpayInstance: Razorpay | null = null

export function getRazorpayInstance(): Razorpay {
    if (!razorpayInstance) {
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET

        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials not configured')
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        })
    }

    return razorpayInstance
}

export interface CreateOrderOptions {
    amount: number // in rupees
    currency?: string
    receipt?: string
    notes?: Record<string, string>
}

export interface RazorpayOrder {
    id: string
    entity: string
    amount: number
    amount_paid: number
    amount_due: number
    currency: string
    receipt: string
    status: string
    attempts: number
    notes: Record<string, string>
    created_at: number
}

export interface RazorpayPayment {
    id: string
    entity: string
    amount: number
    currency: string
    status: string
    order_id: string
    invoice_id: string | null
    international: boolean
    method: string
    amount_refunded: number
    refund_status: string | null
    captured: boolean
    description: string
    card_id: string | null
    bank: string | null
    wallet: string | null
    vpa: string | null
    email: string
    contact: string
    notes: Record<string, unknown>
    fee: number
    tax: number
    error_code: string | null
    error_description: string | null
    error_source: string | null
    error_step: string | null
    error_reason: string | null
    created_at: number
}

export interface RefundOptions {
    amount?: number // Amount to refund in paise (if partial refund)
    speed?: 'normal' | 'optimum'
    notes?: Record<string, string>
    receipt?: string
}

export interface RazorpayRefund {
    id: string
    entity: string
    amount: number
    currency: string
    payment_id: string
    notes: Record<string, string>
    receipt: string | null
    acquirer_data: {
        arn: string | null
    }
    created_at: number
    batch_id: string | null
    status: string
    speed_processed: string
    speed_requested: string
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(options: CreateOrderOptions): Promise<RazorpayOrder> {
    try {
        const razorpay = getRazorpayInstance()
        
        const orderOptions = {
            amount: Math.round(options.amount * 100), // Convert to paise
            currency: options.currency || 'INR',
            receipt: options.receipt || `receipt_${Date.now()}`,
            notes: options.notes || {},
        }

        const order = await razorpay.orders.create(orderOptions)
        return order as RazorpayOrder
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        throw new Error('Failed to create payment order')
    }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        if (!keySecret) {
            throw new Error('Razorpay key secret not configured')
        }

        const text = `${orderId}|${paymentId}`
        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(text)
            .digest('hex')

        return generatedSignature === signature
    } catch (error) {
        console.error('Error verifying payment signature:', error)
        return false
    }
}

/**
 * Load Razorpay SDK script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        // Check if script already loaded
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
    try {
        const razorpay = getRazorpayInstance()
        const payment = await razorpay.payments.fetch(paymentId)
        return payment as RazorpayPayment
    } catch (error) {
        console.error('Error fetching payment details:', error)
        throw new Error('Failed to fetch payment details')
    }
}

/**
 * Create a refund
 */
export async function createRefund(
    paymentId: string,
    options?: RefundOptions
): Promise<RazorpayRefund> {
    try {
        const razorpay = getRazorpayInstance()
        
        const refundOptions: Record<string, unknown> = {
            speed: options?.speed || 'normal',
        }

        if (options?.amount) {
            refundOptions.amount = Math.round(options.amount * 100) // Convert to paise
        }

        if (options?.notes) {
            refundOptions.notes = options.notes
        }

        if (options?.receipt) {
            refundOptions.receipt = options.receipt
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions)
        return refund as RazorpayRefund
    } catch (error) {
        console.error('Error creating refund:', error)
        throw new Error('Failed to create refund')
    }
}

/**
 * Fetch refund details
 */
export async function fetchRefundDetails(
    paymentId: string,
    refundId: string
): Promise<RazorpayRefund> {
    try {
        const razorpay = getRazorpayInstance()
        const refund = await razorpay.payments.fetchRefund(paymentId, refundId)
        return refund as RazorpayRefund
    } catch (error) {
        console.error('Error fetching refund details:', error)
        throw new Error('Failed to fetch refund details')
    }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string
): boolean {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex')

        return expectedSignature === signature
    } catch (error) {
        console.error('Error verifying webhook signature:', error)
        return false
    }
}
