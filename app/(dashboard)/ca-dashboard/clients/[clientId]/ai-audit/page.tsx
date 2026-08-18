import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCAClients } from '@/lib/gst-advanced-actions'
import { AIAuditDashboard } from './AIAuditDashboard'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Brain } from 'lucide-react'
import Link from 'next/link'

interface AIAuditPageProps {
  params: {
    clientId: string
  }
}

export default async function AIAuditPage({ params }: AIAuditPageProps) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const clients = await getCAClients()
  const client = clients.find(c => c.client_user_id === params.clientId)

  if (!client) {
    notFound()
  }

  // Get client's invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', params.clientId)
    .order('created_at', { ascending: false })

  // Get client's bank transactions
  const { data: bankTransactions } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('user_id', params.clientId)
    .order('transaction_date', { ascending: false })

  // Get client's inventory items
  const { data: inventoryItems } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', params.clientId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/ca-dashboard/clients/${params.clientId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            AI Transaction Audit Suite
          </h1>
          <p className="text-gray-600 mt-1">
            Auditing client: <span className="font-semibold text-gray-900 dark:text-white">{client.client_email}</span>
          </p>
        </div>
      </div>

      <AIAuditDashboard
        clientId={params.clientId}
        clientEmail={client.client_email}
        invoices={invoices || []}
        bankTransactions={bankTransactions || []}
        inventoryItems={inventoryItems || []}
      />
    </div>
  )
}
