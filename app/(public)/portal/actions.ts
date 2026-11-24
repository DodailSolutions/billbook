'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface ClientPortalData {
  customer: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    gstin?: string | null
    organization_name?: string | null
    designation?: string | null
    assigned_rm_id?: string | null
    assigned_rm_name?: string | null
  }
  business: {
    name: string
    email?: string | null
    phone?: string | null
    gstin?: string | null
    city?: string | null
    logo_url?: string | null
    isEnterprise: boolean
  }
  assignedRm?: {
    name: string
    email?: string | null
    phone?: string | null
    designation?: string | null
    whatsappLink?: string | null
  } | null
  invoices: Array<{
    id: string
    invoice_number: string
    invoice_date: string
    due_date?: string | null
    total_amount: number
    paid_amount: number
    balance_amount: number
    status: string
    currency: string
  }>
  metrics: {
    totalInvoiced: number
    totalPaid: number
    totalOutstanding: number
    invoicesCount: number
    unpaidCount: number
  }
}

export async function getClientPortalData(customerId: string): Promise<ClientPortalData | null> {
  try {
    const admin = await createAdminClient()

    // 1. Fetch customer
    const { data: customer, error: custErr } = await admin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle()

    if (custErr || !customer) {
      console.error('[getClientPortalData] Customer not found:', custErr)
      return null
    }

    // 2. Fetch owner's business profile & plan
    const { data: profile } = await admin
      .from('user_profiles')
      .select('company_name, email, phone, gstin, city, logo_url, role, subscription_tier')
      .eq('id', customer.user_id)
      .maybeSingle()

    const isEnterprise = 
      profile?.role === 'super_admin' || 
      profile?.role === 'superadmin' || 
      (profile?.subscription_tier || '').toLowerCase().includes('enterprise')

    // 3. Fetch assigned RM details if assigned
    let assignedRm: ClientPortalData['assignedRm'] = null
    if (customer.assigned_rm_id) {
      const { data: rm } = await admin
        .from('team_members')
        .select('email, designation')
        .eq('id', customer.assigned_rm_id)
        .maybeSingle()

      if (rm) {
        const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : ''
        assignedRm = {
          name: customer.assigned_rm_name || rm.email,
          email: rm.email,
          designation: rm.designation || 'Client Relationship Manager',
          whatsappLink: cleanPhone ? `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(customer.name)},%20this%20is%20regarding%20your%20account.` : null
        }
      }
    }

    if (!assignedRm && customer.assigned_rm_name) {
      assignedRm = {
        name: customer.assigned_rm_name,
        designation: 'Client Relationship Manager',
        whatsappLink: null
      }
    }

    // 4. Fetch customer invoices
    const { data: invoicesData } = await admin
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('invoice_date', { ascending: false })

    const invoices = (invoicesData || []).map((inv: any) => {
      const total = Number(inv.total_amount || inv.total || 0)
      const paid = Number(inv.paid_amount || 0)
      const balance = Math.max(0, total - paid)
      return {
        id: inv.id,
        invoice_number: inv.invoice_number || `INV-${inv.id.substring(0, 6)}`,
        invoice_date: inv.invoice_date || inv.created_at,
        due_date: inv.due_date || null,
        total_amount: total,
        paid_amount: paid,
        balance_amount: balance,
        status: inv.status || (balance === 0 ? 'paid' : 'pending'),
        currency: inv.currency || 'INR'
      }
    })

    const totalInvoiced = invoices.reduce((acc: number, inv: any) => acc + inv.total_amount, 0)
    const totalPaid = invoices.reduce((acc: number, inv: any) => acc + inv.paid_amount, 0)
    const totalOutstanding = invoices.reduce((acc: number, inv: any) => acc + inv.balance_amount, 0)
    const unpaidCount = invoices.filter((inv: any) => inv.balance_amount > 0).length

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        gstin: customer.gstin,
        organization_name: customer.organization_name,
        designation: customer.designation,
        assigned_rm_id: customer.assigned_rm_id,
        assigned_rm_name: customer.assigned_rm_name
      },
      business: {
        name: profile?.company_name || 'Business Partner',
        email: profile?.email,
        phone: profile?.phone,
        gstin: profile?.gstin,
        city: profile?.city,
        logo_url: profile?.logo_url,
        isEnterprise
      },
      assignedRm,
      invoices,
      metrics: {
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        invoicesCount: invoices.length,
        unpaidCount
      }
    }
  } catch (err) {
    console.error('[getClientPortalData] Unexpected error:', err)
    return null
  }
}
