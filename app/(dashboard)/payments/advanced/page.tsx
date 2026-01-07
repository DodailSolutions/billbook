import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { 
  Smartphone, 
  MessageCircle, 
  RefreshCw, 
  CreditCard, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { getUPIDetails, getUnreconciledTransactions, getFailedPayments } from '@/lib/advanced-payment-actions'

export default async function AdvancedPaymentsPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch payment data
  const upiDetails = await getUPIDetails()
  const unreconciledTransactions = await getUnreconciledTransactions()
  const failedPayments = await getFailedPayments()

  // Get stats
  const { data: installmentStats } = await supabase
    .from('payment_installments')
    .select('status, amount')
    .eq('status', 'pending')

  const totalPendingInstallments = installmentStats?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

  const { data: bnplStats } = await supabase
    .from('bnpl_applications')
    .select('status')

  const activeBNPL = bnplStats?.filter(b => b.status === 'active').length || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            UPI, WhatsApp Pay, Auto-reconciliation, BNPL & Late Fees
          </p>
        </div>
        <Link href="/payments/advanced/settings">
          <Button>
            Payment Settings
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Active UPI IDs
            </CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {upiDetails.filter(u => u.is_active).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {upiDetails.filter(u => u.is_primary).length} primary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Unreconciled
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {unreconciledTransactions.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Transactions pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Failed Payments
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {failedPayments.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Active BNPL
            </CardTitle>
            <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeBNPL}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* UPI Payments */}
        <Link href="/payments/advanced/upi">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                  Active
                </Badge>
              </div>
              <CardTitle>UPI Payments</CardTitle>
              <CardDescription>
                Native UPI integration with QR codes and intent links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Multiple UPI IDs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Auto QR generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  UPI intent links
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* WhatsApp Pay */}
        <Link href="/payments/advanced/whatsapp">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <CardTitle>WhatsApp Pay</CardTitle>
              <CardDescription>
                One-click payment links via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Payment link generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Click tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Auto-expiry management
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Auto-Reconciliation */}
        <Link href="/payments/advanced/reconciliation">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                {unreconciledTransactions.length > 0 && (
                  <Badge variant="destructive">
                    {unreconciledTransactions.length} pending
                  </Badge>
                )}
              </div>
              <CardTitle>Auto-Reconciliation</CardTitle>
              <CardDescription>
                AI-powered invoice matching with bank transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Bank statement import
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Smart invoice matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Confidence scoring
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Installments */}
        <Link href="/payments/advanced/installments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200">
                  Active
                </Badge>
              </div>
              <CardTitle>Installment Plans</CardTitle>
              <CardDescription>
                Partial payments and flexible installments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Weekly/Monthly/Quarterly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Auto-payment tracking
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  ₹{totalPendingInstallments.toLocaleString('en-IN')} pending
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* BNPL */}
        <Link href="/payments/advanced/bnpl">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                  BNPL
                </Badge>
              </div>
              <CardTitle>Buy Now Pay Later</CardTitle>
              <CardDescription>
                BNPL integrations for MSME customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  4 Provider integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Instant approval
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  {activeBNPL} active applications
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Late Fees */}
        <Link href="/payments/advanced/late-fees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
                  Automation
                </Badge>
              </div>
              <CardTitle>Late Fee Automation</CardTitle>
              <CardDescription>
                Auto-calculate and apply late fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Tiered/Fixed/Percentage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Grace period support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Auto-notification
                </li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      {failedPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              Failed Payments Requiring Attention
            </CardTitle>
            <CardDescription>
              Recent payment failures that need recovery actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {payment.failure_reason || 'Payment failed'}
                      {payment.retry_count > 0 && ` • ${payment.retry_count} retries`}
                    </p>
                  </div>
                  <Link href={`/payments/advanced/recovery?id=${payment.id}`}>
                    <Button size="sm" variant="outline">
                      Retry
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
