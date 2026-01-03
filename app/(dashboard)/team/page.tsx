import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlanStatus } from '@/lib/plan-utils'
import { Users, UserPlus, Shield, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'
import { TeamMembersList } from './TeamMembersList'
import { InviteMemberModal } from './InviteMemberModal'

export default async function TeamMembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check plan status and team member limits
  const planStatus = await getUserPlanStatus()
  const hasTeamAccess = planStatus && ['professional', 'lifetime', 'enterprise'].includes(planStatus.planSlug)

  // Get team member limits
  const { data: limits } = await supabase.rpc('check_team_member_limit', {
    p_owner_id: user.id
  })

  const teamLimit = limits?.[0] || { allowed: 1, current: 0, can_add: false }

  // Get team members
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      *,
      role:team_roles(*)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Get available roles
  const { data: roles } = await supabase
    .from('team_roles')
    .select('*')
    .order('name')

  if (!hasTeamAccess) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Team Members is a Premium Feature
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Upgrade to Professional, Lifetime, or Enterprise plan to invite team members and collaborate on your invoicing.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-3">Team Member Limits:</h3>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span><strong>Professional:</strong> Up to 2 team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span><strong>Lifetime:</strong> Up to 2 team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span><strong>Enterprise:</strong> Up to 10 team members</span>
                </li>
              </ul>
            </div>
            <Link href="/pricing">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                Upgrade Now →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-emerald-600" />
              Team Members
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Collaborate with your team • {teamLimit.current} of {teamLimit.allowed} members used
            </p>
          </div>
          <InviteMemberModal 
            canAdd={teamLimit.can_add}
            currentCount={teamLimit.current}
            maxAllowed={teamLimit.allowed}
            roles={roles || []}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamLimit.current}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {teamMembers?.filter(m => m.status === 'active').length || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Invites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {teamMembers?.filter(m => m.status === 'pending').length || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <UserPlus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMembersList 
              members={teamMembers || []} 
              roles={roles || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
