import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCADashboard, getCAProfile } from '@/lib/gst-advanced-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Users, AlertTriangle, FileText, TrendingUp, Clock, CheckCircle2, Activity } from 'lucide-react'
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
            <Link href="/settings/ca-profile">
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
              Unable to load CA dashboard data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CA Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboard.total_clients}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Returns Filed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dashboard.pending_returns || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Pending Returns
            </p>
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
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_activity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <Activity className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.activity_description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.performed_at).toLocaleString()}
                      </span>
                      {activity.ip_address && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
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
