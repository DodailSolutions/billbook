import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCADashboard, getCAProfile } from '@/lib/gst-advanced-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import {
  Users,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  Shield,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default async function CADashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const caProfile = await getCAProfile()
  
  if (!caProfile) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>CA Profile Not Found</CardTitle>
            <CardDescription>
              You need to set up your CA profile to access this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ca-profile">
              <Button>Set Up CA Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dashboard = await getCADashboard()

  if (!dashboard) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Dashboard</CardTitle>
            <CardDescription>
              Unable to load CA dashboard data right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/ca-dashboard">
              <Button>Try Again</Button>
            </Link>
            <Link href="/ca-profile">
              <Button variant="outline">Review CA Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onboardingChecks = [
    Boolean(caProfile.ca_name?.trim()),
    Boolean(caProfile.ca_firm_name?.trim()),
    Boolean(caProfile.specializations?.length),
    Boolean(caProfile.phone?.trim()),
    Boolean(caProfile.address?.trim()),
    Boolean(caProfile.is_verified),
  ]

  const onboardingCompletion = Math.round(
    (onboardingChecks.filter(Boolean).length / onboardingChecks.length) * 100
  )

  const returnsFiled = dashboard.clients_summary.reduce((sum, client) => {
    const filedGSTR1 = client.pending_gstr1 === 0 ? 1 : 0
    const filedGSTR3B = client.pending_gstr3b === 0 ? 1 : 0
    return sum + filedGSTR1 + filedGSTR3B
  }, 0)

  const urgentClients = dashboard.clients_summary.filter(
    (client) => client.open_alerts > 0 || client.risk_level === 'high'
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CA Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {caProfile.ca_name} • {caProfile.ca_firm_name || 'Independent CA'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/ca-dashboard/clients">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              All Clients
            </Button>
          </Link>
          <Link href="/ca-dashboard/activity">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Activity Log
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-blue-200 bg-linear-to-r from-blue-50 via-white to-emerald-50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant={onboardingCompletion === 100 ? 'default' : 'secondary'}>
                Profile setup {onboardingCompletion}%
              </Badge>
              <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                Stay visible and ready for the next client request
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Complete your contact, specialization, and verification details to build trust and improve your matching quality.
              </p>
              <div className="mt-4 h-2 w-full max-w-xl overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${onboardingCompletion}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/ca-profile">
                  <Button>
                    Complete Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/ca-marketplace">
                  <Button variant="outline">View Marketplace Listing</Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: 'Identity added', done: Boolean(caProfile.ca_name?.trim()) },
                { label: 'Firm details added', done: Boolean(caProfile.ca_firm_name?.trim()) },
                { label: 'Specializations selected', done: Boolean(caProfile.specializations?.length) },
                { label: 'Contact and verification ready', done: Boolean(caProfile.phone?.trim()) && Boolean(caProfile.address?.trim()) && Boolean(caProfile.is_verified) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-sm">
                  <CheckCircle2 className={`h-4 w-4 ${item.done ? 'text-emerald-600' : 'text-gray-300'}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboard.total_clients}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {dashboard.active_clients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {dashboard.critical_alerts}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {dashboard.total_alerts} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pending Returns
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {dashboard.pending_returns}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Returns Filed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {returnsFiled}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              GSTR cycles currently clear
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Focus for today
            </CardTitle>
            <CardDescription>
              Recommended actions to keep your onboarding and client work moving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Onboarding</p>
                <p className="mt-1 text-lg font-semibold">{100 - onboardingCompletion}% left</p>
                <p className="mt-1 text-sm text-gray-600">Add missing profile details to improve visibility.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Critical alerts</p>
                <p className="mt-1 text-lg font-semibold text-red-600">{dashboard.critical_alerts}</p>
                <p className="mt-1 text-sm text-gray-600">Prioritize clients with compliance risks.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-500">Pending returns</p>
                <p className="mt-1 text-lg font-semibold text-orange-600">{dashboard.pending_returns}</p>
                <p className="mt-1 text-sm text-gray-600">Follow up on open GSTR submissions.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Clients requiring the fastest follow-up.</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentClients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                No urgent client issues right now.
              </div>
            ) : (
              <div className="space-y-3">
                {urgentClients.slice(0, 3).map((client) => (
                  <Link key={client.client_user_id} href={`/ca-dashboard/clients/${client.client_user_id}`} className="block rounded-xl border border-gray-200 p-3 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{client.client_email}</p>
                        <p className="text-xs text-gray-500">{client.open_alerts} alerts • {client.pending_gstr1 + client.pending_gstr3b} pending returns</p>
                      </div>
                      <Badge variant={client.risk_level === 'high' ? 'destructive' : 'secondary'}>
                        {(client.risk_level || 'watch').toUpperCase()}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clients Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
          <CardDescription>
            Health scores and pending actions for all clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.clients_summary.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No clients yet</p>
                <p className="text-sm mt-2">
                  Ask your clients to grant you access from their account
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.clients_summary.map((client) => (
                  <Link
                    key={client.client_user_id}
                    href={`/ca-dashboard/clients/${client.client_user_id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {client.client_email}
                            </h3>
                            <Badge variant={client.access_status === 'active' ? 'default' : 'secondary'}>
                              {client.access_status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Health: {client.health_score || 'N/A'}
                              {client.health_grade && ` (${client.health_grade})`}
                            </span>
                            {client.risk_level && (
                              <Badge
                                variant={
                                  client.risk_level === 'high' ? 'destructive' :
                                  client.risk_level === 'medium' ? 'default' : 'secondary'
                                }
                              >
                                {client.risk_level.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        {client.pending_gstr1 > 0 && (
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">
                              {client.pending_gstr1}
                            </div>
                            <div className="text-xs text-gray-500">GSTR-1</div>
                          </div>
                        )}
                        {client.pending_gstr3b > 0 && (
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">
                              {client.pending_gstr3b}
                            </div>
                            <div className="text-xs text-gray-500">GSTR-3B</div>
                          </div>
                        )}
                        {client.open_alerts > 0 && (
                          <div className="text-center">
                            <div className="font-semibold text-red-600">
                              {client.open_alerts}
                            </div>
                            <div className="text-xs text-gray-500">Alerts</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions on client accounts</CardDescription>
            </div>
            <Link href="/ca-dashboard/activity">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {dashboard.recent_activity.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_activity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <Activity className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.activity_description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        {new Date(activity.performed_at).toLocaleString()}
                      </span>
                      {activity.ip_address && (
                        <span className="text-xs text-gray-400">
                          • IP: {activity.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
