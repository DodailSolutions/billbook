import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, ArrowLeft, Clock, Shield } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getCAActivityLog, getCAProfile } from '@/lib/gst-advanced-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function CAActivityPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const [caProfile, activityLog] = await Promise.all([getCAProfile(), getCAActivityLog()])

  if (!caProfile) {
    redirect('/ca-profile')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Client operations and compliance trail
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CA Activity Log</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review recent actions for {caProfile.ca_name} and stay on top of client work.
          </p>
        </div>
        <Link href="/ca-dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-blue-200 bg-linear-to-r from-blue-50 via-white to-slate-50">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Recent actions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activityLog.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last update</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activityLog[0] ? new Date(activityLog[0].performed_at).toLocaleString() : 'No activity yet'}
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-white/80 bg-white/80 p-3">
              <Shield className="mt-0.5 h-4 w-4 text-emerald-600" />
              <p className="text-sm text-gray-700">
                Use this timeline to track return filing, data access activity, and important client updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full activity timeline</CardTitle>
          <CardDescription>Latest 100 actions recorded for your CA account.</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLog.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-500">
              <Clock className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p className="font-medium">No activity yet</p>
              <p className="text-sm mt-1">Your audit trail will appear here once you start working with clients.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLog.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">{item.activity_description}</p>
                        <Badge variant="secondary">{item.activity_type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.performed_at).toLocaleString()}
                        {item.ip_address ? ` • IP ${item.ip_address}` : ''}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.entity_type ? `Entity: ${item.entity_type}` : 'General update'}
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
