'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2, AlertCircle, Shield, Briefcase, Users, UserCheck } from 'lucide-react'

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
  const [designation, setDesignation] = useState('')

  // Built-in 4-tier roles hierarchy
  const defaultRoles = [
    { 
      id: 'manager', 
      name: 'Manager', 
      slug: 'manager', 
      description: 'Manage sales, clients, inventory, and approve team attendance.',
      icon: Briefcase
    },
    { 
      id: 'hr', 
      name: 'HR Executive', 
      slug: 'hr', 
      description: 'Dedicated access to Payroll, Attendance, Leaves, Shifts & CCTV camera streams.',
      icon: Users
    },
    { 
      id: 'employee', 
      name: 'Employee', 
      slug: 'employee', 
      description: 'Self-service portal to view payslips, daily movements, and apply for leaves.',
      icon: UserCheck
    },
    { 
      id: 'admin', 
      name: 'Admin', 
      slug: 'admin', 
      description: 'Full organizational access across invoicing, banking, payroll, and settings.',
      icon: Shield
    }
  ]

  // Merge database roles with default hierarchy
  const availableRoles = defaultRoles.map(def => {
    const existing = roles?.find(r => r.slug === def.slug)
    return existing ? { ...def, id: existing.id } : def
  })

  const handleInvite = async () => {
    if (!email || !selectedRole) {
      setError('Please fill in all fields')
      return
    }

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
        body: JSON.stringify({ email, role_id: selectedRole, designation })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setOpen(false)
      setEmail('')
      setSelectedRole('')
      setDesignation('')
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={!canAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Invite Team Member</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {canAdd ? (
              `Send an invitation to join your workspace. ${currentCount} of ${maxAllowed} team seats used.`
            ) : (
              <span className="text-rose-600">
                You have reached your team seat limit ({maxAllowed}). Upgrade your plan to add more members.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {canAdd && (
          <div className="space-y-4 py-3">
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Work Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="text-sm rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Organizational Role *
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
                <SelectTrigger className="h-auto py-2.5 rounded-lg border-slate-200">
                  <SelectValue placeholder="Select member role..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="py-2 cursor-pointer">
                      <div className="flex items-start gap-2.5 text-left">
                        <role.icon className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-xs text-slate-900">{role.name}</p>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="designation" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Functional Title / Designation <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </Label>
              <Input
                id="designation"
                type="text"
                placeholder="e.g. Tech Lead, Media Buyer, Full-Stack Dev"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                disabled={loading}
                className="text-sm rounded-lg"
              />
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900">
              <p className="font-medium">
                💡 Members receive an instant email invitation link valid for 7 days to access their dedicated role portal.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 border-slate-200 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Upgrade Plan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
