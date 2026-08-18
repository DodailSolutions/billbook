import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCAClients } from '@/lib/gst-advanced-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, AlertTriangle, FileText, IndianRupee, Activity, Shield, Brain } from 'lucide-react'
import Link from 'next/link'

interface ClientDetailsPageProps {
  params: {
    clientId: string
  }
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
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
    .limit(10)

  // Get client's alerts
  const { data: alerts } = await supabase
    .from('gst_mismatch_alerts')
    .select('*')
    .eq('user_id', params.clientId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return 'text-green-600 bg-green-100 dark:bg-green-900/50'
    if (grade?.startsWith('B')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50'
    if (grade?.startsWith('C')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50'
    if (grade?.startsWith('D')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50'
    return 'text-red-600 bg-red-100 dark:bg-red-900/50'
  }

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
    if (risk === 'medium') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ca-dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {client.client_email}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client.access_status === 'active' ? 'default' : 'secondary'}>
                {client.access_status}
              </Badge>
              <Badge className="text-xs">
                Access: {client.access_level}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {client.health_score || 'N/A'}
              </div>
              {client.health_grade && (
                <Badge className={getGradeColor(client.health_grade)}>
                  {client.health_grade}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.risk_level ? (
              <Badge className={getRiskColor(client.risk_level)}>
                {client.risk_level.toUpperCase()}
              </Badge>
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Open Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {client.open_alerts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Access Until
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-900 dark:text-white">
              {client.valid_until ? new Date(client.valid_until).toLocaleDateString() : 'No expiry'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Returns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>GSTR-1 Status</CardTitle>
            <CardDescription>Outward supply returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="text-2xl font-bold text-orange-600">
                {client.pending_gstr1}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GSTR-3B Status</CardTitle>
            <CardDescription>Monthly summary returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="text-2xl font-bold text-orange-600">
                {client.pending_gstr3b}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="h-5 w-5" />
              Open Alerts
            </CardTitle>
            <CardDescription>
              Issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {alert.alert_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {alert.alert_message}
                  </p>
                  {alert.resolution_steps && (
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.resolution_steps}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices from this client</CardDescription>
            </div>
            <Link href={`/ca-dashboard/clients/${params.clientId}/invoices`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!invoices || invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoice_number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {invoice.total_amount.toLocaleString('en-IN')}
                    </div>
                    <Badge
                      variant={invoice.payment_status === 'paid' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {invoice.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Link href={`/ca-dashboard/clients/${params.clientId}/ai-audit`}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600">
                <Brain className="h-4 w-4 mr-2" />
                AI Transaction Audit
              </Button>
            </Link>
            <Link href={`/ca-dashboard/clients/${params.clientId}/reports`}>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href={`/ca-dashboard/clients/${params.clientId}/gst`}>
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                GST Returns
              </Button>
            </Link>
            <Link href={`/ca-dashboard/clients/${params.clientId}/activity`}>
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Activity Log
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
