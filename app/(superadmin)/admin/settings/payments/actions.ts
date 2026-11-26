'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'

export interface PaymentGatewaysConfigPayload {
  razorpay: {
    keyId: string
    keySecret: string
    webhookSecret: string
    mode: 'live' | 'test'
    enabled: boolean
  }
  cashfree: {
    appId: string
    secretKey: string
    webhookSecret: string
    mode: 'production' | 'sandbox'
    enabled: boolean
  }
  stripe: {
    publishableKey: string
    secretKey: string
    webhookSecret: string
    mode: 'live' | 'test'
    enabled: boolean
  }
  paypal: {
    clientId: string
    secretKey: string
    webhookId: string
    mode: 'live' | 'sandbox'
    enabled: boolean
  }
}

const MASK_PREFIX = '••••'

function maskSecret(secret?: string | null): string {
  if (!secret || !secret.trim()) return ''
  const trimmed = secret.trim()
  if (trimmed.length <= 4) return MASK_PREFIX
  return `${MASK_PREFIX}${trimmed.slice(-4)}`
}

function resolveSecret(incoming: string, existing?: string): string {
  const trimmed = (incoming || '').trim()
  if (trimmed.startsWith(MASK_PREFIX)) {
    return existing || ''
  }
  return trimmed
}

async function getSettingsClient() {
  const standard = await createClient()
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await createAdminClient()
    }
  } catch {
    // Fallback to standard client
  }
  return standard
}

export async function getMaskedPaymentGatewaysConfig(): Promise<PaymentGatewaysConfigPayload | null> {
  const isSuperAdmin = await checkSuperAdminAccess()
  if (!isSuperAdmin) {
    throw new Error('Unauthorized: Super admin access required')
  }

  const supabase = await getSettingsClient()
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'payment_gateways_config')
    .maybeSingle()

  if (!data?.value) return null

  const val = data.value as any
  return {
    razorpay: {
      keyId: val.razorpay?.keyId || '',
      keySecret: maskSecret(val.razorpay?.keySecret),
      webhookSecret: maskSecret(val.razorpay?.webhookSecret),
      mode: val.razorpay?.mode || 'live',
      enabled: val.razorpay?.enabled ?? true,
    },
    cashfree: {
      appId: val.cashfree?.appId || '',
      secretKey: maskSecret(val.cashfree?.secretKey),
      webhookSecret: maskSecret(val.cashfree?.webhookSecret),
      mode: val.cashfree?.mode || 'production',
      enabled: val.cashfree?.enabled ?? true,
    },
    stripe: {
      publishableKey: val.stripe?.publishableKey || '',
      secretKey: maskSecret(val.stripe?.secretKey),
      webhookSecret: maskSecret(val.stripe?.webhookSecret),
      mode: val.stripe?.mode || 'live',
      enabled: val.stripe?.enabled ?? true,
    },
    paypal: {
      clientId: val.paypal?.clientId || '',
      secretKey: maskSecret(val.paypal?.secretKey),
      webhookId: val.paypal?.webhookId || '',
      mode: val.paypal?.mode || 'live',
      enabled: val.paypal?.enabled ?? true,
    },
  }
}

export async function savePaymentGatewaysConfig(
  incoming: PaymentGatewaysConfigPayload
): Promise<{ success: boolean; masked: PaymentGatewaysConfigPayload }> {
  const isSuperAdmin = await checkSuperAdminAccess()
  if (!isSuperAdmin) {
    throw new Error('Unauthorized: Super admin access required')
  }

  const supabase = await getSettingsClient()
  const { data: existingRow } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'payment_gateways_config')
    .maybeSingle()

  const existing = (existingRow?.value as any) || {}

  const merged = {
    razorpay: {
      keyId: incoming.razorpay.keyId.trim(),
      keySecret: resolveSecret(incoming.razorpay.keySecret, existing.razorpay?.keySecret),
      webhookSecret: resolveSecret(incoming.razorpay.webhookSecret, existing.razorpay?.webhookSecret),
      mode: incoming.razorpay.mode,
      enabled: incoming.razorpay.enabled,
    },
    cashfree: {
      appId: incoming.cashfree.appId.trim(),
      secretKey: resolveSecret(incoming.cashfree.secretKey, existing.cashfree?.secretKey),
      webhookSecret: resolveSecret(incoming.cashfree.webhookSecret, existing.cashfree?.webhookSecret),
      mode: incoming.cashfree.mode,
      enabled: incoming.cashfree.enabled,
    },
    stripe: {
      publishableKey: incoming.stripe.publishableKey.trim(),
      secretKey: resolveSecret(incoming.stripe.secretKey, existing.stripe?.secretKey),
      webhookSecret: resolveSecret(incoming.stripe.webhookSecret, existing.stripe?.webhookSecret),
      mode: incoming.stripe.mode,
      enabled: incoming.stripe.enabled,
    },
    paypal: {
      clientId: incoming.paypal.clientId.trim(),
      secretKey: resolveSecret(incoming.paypal.secretKey, existing.paypal?.secretKey),
      webhookId: incoming.paypal.webhookId.trim(),
      mode: incoming.paypal.mode,
      enabled: incoming.paypal.enabled,
    },
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('system_settings').upsert(
    {
      key: 'payment_gateways_config',
      value: merged,
      description: 'Multi-Gateway API credentials and webhook secrets for Razorpay, Cashfree, Stripe, and PayPal',
    },
    { onConflict: 'key' }
  )

  if (error) {
    throw new Error(error.message || 'Failed to save payment gateway settings')
  }

  await createAuditLog('payment_gateways_updated', 'system_settings', 'payment_gateways_config', {
    updated_at: merged.updated_at,
  })

  return {
    success: true,
    masked: {
      razorpay: {
        ...merged.razorpay,
        keySecret: maskSecret(merged.razorpay.keySecret),
        webhookSecret: maskSecret(merged.razorpay.webhookSecret),
      },
      cashfree: {
        ...merged.cashfree,
        secretKey: maskSecret(merged.cashfree.secretKey),
        webhookSecret: maskSecret(merged.cashfree.webhookSecret),
      },
      stripe: {
        ...merged.stripe,
        secretKey: maskSecret(merged.stripe.secretKey),
        webhookSecret: maskSecret(merged.stripe.webhookSecret),
      },
      paypal: {
        ...merged.paypal,
        secretKey: maskSecret(merged.paypal.secretKey),
      },
    },
  }
}
