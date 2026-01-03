'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2, AlertCircle } from 'lucide-react'

interface InviteMemberModalProps {
  canAdd: boolean
  currentCount: number
  maxAllowed: number
  roles: Array<{
    id: string
    name: string
    slug: string
    description: string
  }>
}

export function InviteMemberModal({ canAdd, currentCount, maxAllowed, roles }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const handleInvite = async () => {
    if (!email || !selectedRole) {
      setError('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role_id: selectedRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      // Success - close modal and reload
      setOpen(false)
      setEmail('')
      setSelectedRole('')
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Filter out owner role from selection
  const availableRoles = roles.filter(r => r.slug !== 'owner')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={!canAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            {canAdd ? (
              `Send an invitation to join your team. ${currentCount} of ${maxAllowed} slots used.`
            ) : (
              <span className="text-red-600 dark:text-red-400">
                You&apos;ve reached your team member limit ({maxAllowed}). Upgrade your plan to add more members.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {canAdd && (
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{role.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 An email invitation will be sent to this address. The invite is valid for 7 days.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!canAdd && (
          <div className="py-4">
            <Button
              onClick={() => window.location.href = '/pricing'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Upgrade Plan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
