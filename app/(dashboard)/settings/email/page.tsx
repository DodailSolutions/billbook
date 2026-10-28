import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getEmailSettingsAndTemplates,
  getCustomersAndInvoicesForEmail,
} from './actions'
import EmailSettingsClient from './EmailSettingsClient'

export const metadata = {
  title: 'Email Configuration & Templates | BillBook',
  description: 'Configure custom email SMTP and customize invoice and reminder email templates.',
}

export default async function ClientEmailSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [data, contextData] = await Promise.all([
    getEmailSettingsAndTemplates(),
    getCustomersAndInvoicesForEmail(),
  ])

  if (!data) {
    redirect('/login')
  }

  return (
    <div className="max-w-6xl mx-auto py-2">
      <EmailSettingsClient
        initialSettings={data.settings}
        initialTemplates={data.templates}
        companyInfo={data.companyInfo}
        customers={contextData.customers}
        invoices={contextData.invoices}
      />
    </div>
  )
}
