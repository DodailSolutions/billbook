'use client'

import { useState, useEffect } from 'react'
import { MoreVertical, Edit, Ban, CheckCircle, Trash2, Crown } from 'lucide-react'
import type { UserWithDetails } from '@/lib/types-admin'
import { updateUserStatus, updateUserRole } from './actions'
import { UpgradePlanModal } from './UpgradePlanModal'

interface UserManagementTableProps {
    users: UserWithDetails[]
    getRoleBadgeColor: (role: string) => string
    getStatusBadgeColor: (status: string) => string
}

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  billing_period: string
}

export default function UserManagementTable({ 
    users, 
    getRoleBadgeColor, 
    getStatusBadgeColor 
}: UserManagementTableProps) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [upgradeModalUser, setUpgradeModalUser] = useState<{id: string, email: string, currentPlan?: string} | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])

    useEffect(() => {
        // Fetch available plans
        fetch('/api/admin/users/upgrade-plan')
          .then(res => res.json())
          .then(data => {
            if (data.plans) {
              setPlans(data.plans)
            }
          })
          .catch(err => console.error('Failed to fetch plans:', err))
    }, [])

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
        setLoading(true)
        try {
            await updateUserStatus(userId, newStatus)
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setLoading(false)
            setSelectedUser(null)
        }
    }

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
        setLoading(true)
        try {
            await updateUserRole(userId, newRole)
        } catch (error) {
            console.error('Error updating role:', error)
        } finally {
            setLoading(false)
            setSelectedUser(null)
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left">
                        <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">User</th>
                        <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Role</th>
                        <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Subscription</th>
                        <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Joined</th>
                        <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {user.business_name || 'Unnamed User'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.email || 'No email'}
                                    </p>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {user.subscription?.plan?.name || 'Free'}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </td>
                            <td className="py-4 text-right">
                                <div className="relative inline-block">
                                    <button
                                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        disabled={loading}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                    
                                    {selectedUser === user.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <Ban className="h-4 w-4 text-red-600" />
                                                            Suspend User
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            Activate User
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(user.id, user.role === 'user' ? 'admin' : 'user')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Change Role
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUpgradeModalUser({
                                                            id: user.id,
                                                            email: user.email || 'No email',
                                                            currentPlan: user.subscription?.plan?.name
                                                        })
                                                        setSelectedUser(null)
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-emerald-600"
                                                >
                                                    <Crown className="h-4 w-4" />
                                                    Upgrade Plan
                                                </button>
                                                <button
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete User
                                                </button>

            {/* Upgrade Modal */}
            {upgradeModalUser && (
                <UpgradePlanModal
                    userId={upgradeModalUser.id}
                    userEmail={upgradeModalUser.email}
                    currentPlan={upgradeModalUser.currentPlan}
                    plans={plans}
                    onClose={() => setUpgradeModalUser(null)}
                    onSuccess={() => {
                        window.location.reload()
                    }}
                />
            )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No users found
                </div>
            )}
        </div>
    )
}
