import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function BNPLPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch BNPL applications
  const { data: applications } = await supabase
    .from('bnpl_applications')
    .select(`
      *,
      invoices:invoice_id (invoice_number, total),
      customers:customer_id (name, email)
    `)
    .order('created_at', { ascending: false })

  // Get stats
  const pendingCount = applications?.filter(a => a.status === 'pending').length || 0
  const approvedCount = applications?.filter(a => a.status === 'approved').length || 0
  const activeCount = applications?.filter(a => a.status === 'active').length || 0
  const rejectedCount = applications?.filter(a => a.status === 'rejected').length || 0
  const completedCount = applications?.filter(a => a.status === 'completed').length || 0

  const totalApproved = applications
    ?.filter(a => a.status === 'approved' || a.status === 'active')
    .reduce((sum, a) => sum + Number(a.approved_amount || a.requested_amount), 0) || 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'active': return <TrendingUp className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'defaulted': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200'
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200'
      case 'active': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/50'
      case 'completed': return 'bg-gray-100 text-gray-700 '
      case 'defaulted': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-700 '
    }
  }

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      flexmoney: 'FlexMoney',
      zestmoney: 'ZestMoney',
      lazypay: 'LazyPay',
      simpl: 'Simpl',
      custom: 'Custom Provider'
    }
    return names[provider] || provider
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Buy Now Pay Later (BNPL)
          </h1>
          <p className="text-gray-600 mt-1">
            Flexible payment options for your MSME customers
          </p>
        </div>
        <Link href="/payments/advanced/bnpl/apply">
          <Button>
            New BNPL Application
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingCount}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Under review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {activeCount}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedCount}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{totalApproved.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {rejectedCount} rejected • {completedCount} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BNPL Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Integrated BNPL Providers</CardTitle>
          <CardDescription>
            Partner providers for flexible payment options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['flexmoney', 'zestmoney', 'lazypay', 'simpl'].map((provider) => (
              <div 
                key={provider}
                className="p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-3">
                  <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {getProviderName(provider)}
                </h4>
                <p className="text-xs text-gray-600">
                  Instant approval
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {applications && applications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>BNPL Applications</CardTitle>
            <CardDescription>
              All BNPL applications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1">{app.status.toUpperCase()}</span>
                        </Badge>
                        <Badge variant="outline">
                          {getProviderName(app.provider)}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {app.customers && typeof app.customers === 'object' && 'name' in app.customers ? (app.customers as { name: string }).name : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Invoice</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {app.invoices && typeof app.invoices === 'object' && 'invoice_number' in app.invoices ? (app.invoices as { invoice_number: string }).invoice_number : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">
                            Requested Amount
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {app.approved_amount && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                              Approved Amount
                            </p>
                            <p className="font-bold text-green-600">
                              ₹{Number(app.approved_amount).toLocaleString('en-IN')}
                            </p>
                          </div>
                        )}
                        {app.tenure_months && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                              Tenure
                            </p>
                            <p className="font-bold text-blue-600">
                              {app.tenure_months} months
                            </p>
                          </div>
                        )}
                      </div>
                      {app.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-700 dark:text-red-300">
                            <strong>Rejection Reason:</strong> {app.rejection_reason}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-3">
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                        {app.approval_date && ` • Approved on ${new Date(app.approval_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Link href={`/payments/advanced/bnpl/${app.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No BNPL Applications Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first BNPL application to offer flexible payment options
            </p>
            <Link href="/payments/advanced/bnpl/apply">
              <Button>
                Create First Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* How BNPL Works */}
      <Card>
        <CardHeader>
          <CardTitle>How BNPL Works for MSMEs</CardTitle>
          <CardDescription>
            Flexible payment options for your business customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-3">
                <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                1. Apply for BNPL
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Submit application with invoice and customer details
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                2. Instant Approval
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get approval within minutes based on credit assessment
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                3. Flexible Repayment
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customer pays in installments over agreed tenure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
