import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { RefreshCw, CheckCircle, Upload, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getUnreconciledTransactions } from '@/lib/advanced-payment-actions'

export default async function ReconciliationPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const unreconciledTransactions = await getUnreconciledTransactions()

  // Get reconciliation stats
  const { data: reconciledTransactions } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('reconciliation_status', 'reconciled')
    .order('transaction_date', { ascending: false })
    .limit(10)

  const { count: totalReconciled } = await supabase
    .from('bank_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('reconciliation_status', 'reconciled')

  const { count: totalUnreconciled } = await supabase
    .from('bank_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('reconciliation_status', 'pending')

  const reconciliationRate = totalReconciled && (totalReconciled + (totalUnreconciled || 0)) > 0
    ? ((totalReconciled / (totalReconciled + (totalUnreconciled || 0))) * 100).toFixed(1)
    : '0'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            Auto-Reconciliation
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered invoice matching with bank transactions
          </p>
        </div>
        <Link href="/payments/advanced/reconciliation/import">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Transactions
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Unreconciled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {totalUnreconciled || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Transactions pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Reconciled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalReconciled || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Successfully matched
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {reconciliationRate}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Auto-match accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unreconciled Transactions */}
      {unreconciledTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Unreconciled Transactions
                </CardTitle>
                <CardDescription>
                  Transactions that need to be matched with invoices
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Auto-Match All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreconciledTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={transaction.transaction_type === 'credit' ? 'default' : 'secondary'}>
                          {transaction.transaction_type.toUpperCase()}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{Number(transaction.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {transaction.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </span>
                        {transaction.reference_number && (
                          <span>Ref: {transaction.reference_number}</span>
                        )}
                        {transaction.upi_id && (
                          <span>UPI: {transaction.upi_id}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/payments/advanced/reconciliation/${transaction.id}/match`}>
                        <Button size="sm">
                          Match Invoice
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Reconciled */}
      {reconciledTransactions && reconciledTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recently Reconciled
            </CardTitle>
            <CardDescription>
              Successfully matched transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reconciledTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          ₹{Number(transaction.amount).toLocaleString('en-IN')}
                        </span>
                        {transaction.matched_invoice_id && (
                          <Badge variant="outline" className="text-xs">
                            Invoice Matched
                          </Badge>
                        )}
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {transaction.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(transaction.transaction_date).toLocaleDateString()} • 
                        Reconciled on {transaction.reconciled_at ? new Date(transaction.reconciled_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Auto-Reconciliation Works</CardTitle>
          <CardDescription>
            AI-powered matching for efficient payment tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-3">
                <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                1. Import Transactions
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload your bank statement or add transactions manually
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-3">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                2. AI Matching
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                System matches transactions with invoices using amount, date, and reference
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                3. Auto-Update
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Invoice status updates automatically when payment is confirmed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {unreconciledTransactions.length === 0 && (!reconciledTransactions || reconciledTransactions.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Transactions Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Import your bank transactions to start auto-reconciliation
            </p>
            <Link href="/payments/advanced/reconciliation/import">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import First Transaction
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
