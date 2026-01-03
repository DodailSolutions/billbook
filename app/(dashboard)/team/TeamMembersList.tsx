'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Mail, UserX, Shield, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TeamMember {
  id: string
  email: string
  status: 'pending' | 'active' | 'suspended' | 'removed'
  invited_at: string
  joined_at?: string
  last_active_at?: string
  role: {
    id: string
    name: string
    slug: string
    description: string
  }
}

interface TeamMembersListProps {
  members: TeamMember[]
  roles: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function TeamMembersList({ members, roles }: TeamMembersListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleResendInvite = async (memberId: string, email: string) => {
    setLoading(memberId)
    setError('')

    try {
      const response = await fetch('/api/team/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId })
      })

      if (!response.ok) {
        throw new Error('Failed to resend invite')
      }

      alert(`Invite resent to ${email}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const handleChangeRole = async (memberId: string, newRoleId: string) => {
    setLoading(memberId)
    setError('')

    try {
      const response = await fetch('/api/team/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, role_id: newRoleId })
      })

      if (!response.ok) {
        throw new Error('Failed to change role')
      }

      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveMember = async (memberId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from your team?`)) {
      return
    }

    setLoading(memberId)
    setError('')

    try {
      const response = await fetch('/api/team/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId })
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Mail className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No team members yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Start by inviting your first team member to collaborate
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    <Shield className="h-3 w-3 mr-1" />
                    {member.role.name}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {member.joined_at 
                    ? formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {member.last_active_at 
                    ? formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  {loading === member.id ? (
                    <Loader2 className="h-4 w-4 animate-spin inline-block" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {member.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleResendInvite(member.id, member.email)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Invite
                          </DropdownMenuItem>
                        )}
                        
                        {member.role.slug !== 'owner' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => {}}
                              className="cursor-default hover:bg-transparent"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              <span className="text-xs text-gray-500">Change Role:</span>
                            </DropdownMenuItem>
                            {roles.filter(r => r.slug !== 'owner' && r.id !== member.role.id).map((role) => (
                              <DropdownMenuItem 
                                key={role.id}
                                onClick={() => handleChangeRole(member.id, role.id)}
                                className="pl-8"
                              >
                                {role.name}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member.id, member.email)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}
