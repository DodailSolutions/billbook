import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAuditTrail } from '@/lib/gst-advanced-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Shield, Download, Filter, Eye, Edit, Trash2, FileUp, XCircle, CheckCircle2, Clock } from 'lucide-react'

export default async function AuditTrailPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const auditLogs = await getAuditTrail()

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <CheckCircle2 className="h-4 w-4 text-green-600 text-green-600" />
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600 text-blue-600" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'view':
        return <Eye className="h-4 w-4 text-gray-600 text-gray-600" />
      case 'export':
        return <Download className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case 'file':
        return <FileUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case 'cancel':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-600 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-200'
      case 'update':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 text-blue-900'
      case 'delete':
        return 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-200'
      case 'view':
        return 'bg-gray-100 text-gray-700 '
      case 'export':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-200'
      case 'file':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/80 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 '
    }
  }

  const getEntityIcon = (entity: string) => {
    // You can expand this with more specific icons
    return entity.toUpperCase()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            Audit Trail
          </h1>
          <p className="text-gray-600 text-gray-600 mt-1">
            Complete activity log with timestamp and IP tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 text-gray-600">
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {auditLogs.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Critical Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {auditLogs.filter(log => log.is_critical_action).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 text-blue-600">
              {auditLogs.filter(log => {
                const logDate = new Date(log.performed_at)
                const today = new Date()
                return logDate.toDateString() === today.toDateString()
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 text-green-600">
              {auditLogs.filter(log => {
                const logDate = new Date(log.performed_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return logDate >= weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            All actions are logged with timestamp, IP address, and details for compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs yet</p>
              <p className="text-sm mt-2">
                All actions will be tracked and displayed here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg ${
                    log.is_critical_action
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/30'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getActionIcon(log.action_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getActionColor(log.action_type)}>
                            {log.action_type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {getEntityIcon(log.entity_type)}
                          </Badge>
                          {log.is_critical_action && (
                            <Badge variant="destructive" className="text-xs">
                              CRITICAL
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {log.action_description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.performed_at).toLocaleString()}
                          </span>
                          {log.ip_address && (
                            <span>IP: {log.ip_address}</span>
                          )}
                          {log.performed_by_type && (
                            <Badge variant="secondary" className="text-xs">
                              {log.performed_by_type}
                            </Badge>
                          )}
                          {log.geolocation && (
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500 text-gray-600">📍</span>
                              {log.geolocation.city}, {log.geolocation.country}
                            </span>
                          )}
                        </div>
                        {log.user_agent && (
                          <p className="text-xs text-gray-500 text-gray-600 mt-1 truncate">
                            {log.user_agent}
                          </p>
                        )}
                        {(log.old_values || log.new_values) && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                              View Changes
                            </summary>
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs space-y-1">
                              {log.old_values && (
                                <div>
                                  <span className="font-semibold text-red-600">Before:</span>
                                  <pre className="mt-1 overflow-x-auto">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_values && (
                                <div>
                                  <span className="font-semibold text-green-600">After:</span>
                                  <pre className="mt-1 overflow-x-auto">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Note */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 text-blue-900 space-y-2">
          <p>✓ All audit logs are retained for 7 years as per compliance requirements</p>
          <p>✓ IP addresses and timestamps are recorded for all critical actions</p>
          <p>✓ Before/After state is captured for all modifications</p>
          <p>✓ Geolocation tracking enabled for security analysis</p>
        </CardContent>
      </Card>
    </div>
  )
}
