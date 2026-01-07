import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getClientCAAccess } from '@/lib/gst-advanced-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { UserPlus, Shield, Clock, XCircle, CheckCircle2, Eye, Edit, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function CAAccessPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const caAccessList = await getClientCAAccess()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
      case 'revoked':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
      case 'expired':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
    }
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view_only':
        return <Eye className="h-4 w-4" />
      case 'edit':
        return <Edit className="h-4 w-4" />
      case 'full':
        return <Shield className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            CA Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Chartered Accountant access to your GST data
          </p>
        </div>
        <Link href="/settings/ca-access/grant">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Grant CA Access
          </Button>
        </Link>
      </div>

      {/* Active Access */}
      <Card>
        <CardHeader>
          <CardTitle>Active CA Access</CardTitle>
          <CardDescription>
            Chartered Accountants who currently have access to your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {caAccessList.filter(ca => ca.status === 'active').length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active CA access</p>
              <p className="text-sm mt-2">
                Grant access to your CA for seamless collaboration
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {caAccessList
                .filter(ca => ca.status === 'active')
                .map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          CA Access
                        </h3>
                        <Badge className={getStatusColor(access.status)}>
                          {access.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getAccessLevelIcon(access.access_level)}
                          {access.access_level.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Valid until: {access.valid_until ? new Date(access.valid_until).toLocaleDateString() : 'No expiry'}
                          </span>
                          {access.accepted_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              Accepted: {new Date(access.accepted_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {access.allowed_modules.map((module) => (
                            <Badge key={module} variant="secondary" className="text-xs">
                              {module.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                        {access.client_notes && (
                          <p className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                            📝 {access.client_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/settings/ca-access/${access.id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {caAccessList.filter(ca => ca.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              CA access invitations awaiting acceptance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caAccessList
                .filter(ca => ca.status === 'pending')
                .map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-4 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Invitation Sent
                        </h3>
                        <Badge className={getStatusColor(access.status)}>
                          PENDING
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sent: {new Date(access.invitation_sent_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Resend Invitation
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revoked/Expired Access */}
      {caAccessList.filter(ca => ca.status === 'revoked' || ca.status === 'expired').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Access</CardTitle>
            <CardDescription>
              Previously granted access that has been revoked or expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caAccessList
                .filter(ca => ca.status === 'revoked' || ca.status === 'expired')
                .map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg opacity-60"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(access.status)}>
                          {access.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {access.status === 'revoked' && access.revoked_at
                            ? `Revoked on ${new Date(access.revoked_at).toLocaleDateString()}`
                            : `Expired on ${new Date(access.valid_until!).toLocaleDateString()}`}
                        </span>
                      </div>
                      {access.revocation_reason && (
                        <p className="text-xs text-gray-500 mt-1">
                          Reason: {access.revocation_reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            About CA Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>✓ Grant your CA secure access to specific modules and data</p>
          <p>✓ Control access levels: View Only, Edit, or Full access</p>
          <p>✓ Set validity periods and revoke access anytime</p>
          <p>✓ All CA activities are logged in the audit trail</p>
          <p>✓ Your data remains secure with granular permissions</p>
        </CardContent>
      </Card>
    </div>
  )
}
