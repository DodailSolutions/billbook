'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Ban, 
    CheckCircle, 
    Trash2, 
    Crown, 
    Shield, 
    Copy, 
    Check, 
    Building2, 
    Mail, 
    Phone, 
    ChevronLeft, 
    ChevronRight, 
    RefreshCw, 
    Sparkles, 
    UserCheck, 
    SlidersHorizontal,
    ArrowUpDown,
    Download
} from 'lucide-react'
import type { UserWithDetails } from '@/lib/types-admin'
import { BUSINESS_VERTICALS, type BusinessType } from '@/lib/business-profile-types'
import { updateUserStatus, updateUserRole, deleteUser } from './actions'
import { UpgradePlanModal } from './UpgradePlanModal'
import { ChangeVerticalModal } from './ChangeVerticalModal'

interface UserManagementTableProps {
    users?: UserWithDetails[]
    initialUsers?: UserWithDetails[]
}

interface Plan {
    id: string
    name: string
    slug: string
    price: number
    currency?: string
    billing_period: string
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A'
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return 'N/A'
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    } catch {
        return 'N/A'
    }
}

export default function UserManagementTable({ 
    users: legacyUsers,
    initialUsers 
}: UserManagementTableProps) {
    const searchParams = useSearchParams()
    const filterParam = searchParams.get('filter') || searchParams.get('status')
    const roleParam = searchParams.get('role')
    const verticalParam = searchParams.get('vertical')
    const initialStatus = (filterParam === 'inactive' || filterParam === 'active' || filterParam === 'trial' || filterParam === 'suspended')
        ? filterParam
        : 'all'
    const initialRole = (roleParam === 'user' || roleParam === 'employee' || roleParam === 'admin' || roleParam === 'super_admin')
        ? roleParam
        : 'all'

    const rawUsers = initialUsers ?? legacyUsers ?? []
    const [userList, setUserList] = useState<UserWithDetails[]>(rawUsers)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'employee' | 'admin' | 'super_admin'>(initialRole)
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended' | 'inactive'>(initialStatus)

    useEffect(() => {
        setStatusFilter(initialStatus)
        setRoleFilter(initialRole)
        setCurrentPage(1)
    }, [initialStatus, initialRole])
    const [planFilter, setPlanFilter] = useState<string>('all')
    const [verticalFilter, setVerticalFilter] = useState<string>(verticalParam || 'all')
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)

    // Action menu & Modal states
    const [selectedUserMenu, setSelectedUserMenu] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [upgradeModalUser, setUpgradeModalUser] = useState<{ id: string; email: string; currentPlan?: string } | null>(null)
    const [verticalModalUser, setVerticalModalUser] = useState<{ id: string; name: string; email: string; currentVertical?: BusinessType | string } | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])

    // Update internal userList when props change
    useEffect(() => {
        setUserList(rawUsers)
    }, [rawUsers])

    // Fetch subscription plans for upgrade modal
    useEffect(() => {
        fetch('/api/admin/users/upgrade-plan')
            .then(res => res.json())
            .then(data => {
                if (data?.plans) {
                    setPlans(data.plans)
                }
            })
            .catch(err => console.warn('Failed to fetch subscription plans:', err))
    }, [])

    // Clear toast message after 3 seconds
    useEffect(() => {
        if (!toastMessage) return
        const timer = setTimeout(() => setToastMessage(null), 3000)
        return () => clearTimeout(timer)
    }, [toastMessage])

    // Close actions dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.user-action-menu')) {
                setSelectedUserMenu(null)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleCopy = (id: string, textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 1800)
    }

    const showToast = (msg: string) => {
        setToastMessage(msg)
    }

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
        setActionLoading(userId)
        setSelectedUserMenu(null)
        try {
            await updateUserStatus(userId, newStatus)
            setUserList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
            showToast(`User marked as ${newStatus}`)
        } catch (error) {
            console.error('Error updating status:', error)
            showToast('Failed to update user status')
        } finally {
            setActionLoading(null)
        }
    }

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
        setActionLoading(userId)
        setSelectedUserMenu(null)
        try {
            await updateUserRole(userId, newRole)
            setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
            showToast(`Role updated to ${newRole.replace('_', ' ')}`)
        } catch (error) {
            console.error('Error updating role:', error)
            showToast('Failed to update role')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to deactivate this user account?')) return
        setActionLoading(userId)
        setSelectedUserMenu(null)
        try {
            await deleteUser(userId)
            setUserList(prev => prev.map(u => u.id === userId ? { ...u, status: 'inactive' } : u))
            showToast('User has been deactivated')
        } catch (error) {
            console.error('Error deactivating user:', error)
            showToast('Failed to deactivate user')
        } finally {
            setActionLoading(null)
        }
    }

    // Role badge styles
    const getRoleBadge = (role?: string, user?: UserWithDetails) => {
        switch (role) {
            case 'super_admin':
                return {
                    label: 'Super Admin',
                    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }
            case 'admin':
                return {
                    label: 'Admin',
                    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }
            default:
                if (user?.is_employee || (role && role !== 'user')) {
                    return {
                        label: user?.employee_role || 'Employee',
                        className: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    }
                }
                // Primary account creators who register workspaces are the Workspace Owners
                return {
                    label: 'Workspace Owner',
                    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }
        }
    }

    // Status badge styles
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active':
                return {
                    label: 'Active',
                    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                }
            case 'suspended':
                return {
                    label: 'Suspended',
                    className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }
            case 'inactive':
                return {
                    label: 'Inactive',
                    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }
            default:
                return {
                    label: status || 'Unknown',
                    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }
        }
    }

    // Unique plans for filter dropdown
    const availablePlanNames = useMemo(() => {
        const names = new Set<string>()
        userList.forEach(u => {
            const planName = u.subscription?.plan?.name
            if (planName) names.add(planName)
        })
        return Array.from(names)
    }, [userList])

    // Filtering & Sorting
    const filteredUsers = useMemo(() => {
        return userList.filter(user => {
            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                const name = (user.business_name || '').toLowerCase()
                const owner = (user.owner_name || '').toLowerCase()
                const email = (user.email || '').toLowerCase()
                const bizId = (user.business_id || '').toLowerCase()
                const gstin = (user.gstin || '').toLowerCase()
                const phone = (user.business_phone || '').toLowerCase()

                if (!name.includes(q) && !owner.includes(q) && !email.includes(q) && !bizId.includes(q) && !gstin.includes(q) && !phone.includes(q)) {
                    return false
                }
            }

            // Role filter
            if (roleFilter !== 'all') {
                if (roleFilter === 'employee') {
                    if (!user.is_employee && (user.role === 'user' || user.role === 'admin' || user.role === 'super_admin')) {
                        return false
                    }
                } else if (roleFilter === 'user') {
                    if (user.role !== 'user' || user.is_employee) return false
                } else if (user.role !== roleFilter) {
                    return false
                }
            }

            // Status filter
            if (statusFilter !== 'all') {
                const isTrial = user.subscription?.status === 'trial'
                if (statusFilter === 'trial') {
                    if (!isTrial) return false
                } else if (user.status !== statusFilter) {
                    return false
                }
            }

            // Plan / User Type filter
            if (planFilter !== 'all') {
                const targetPlan = planFilter.toLowerCase()
                if (targetPlan === 'employee') {
                    if (!user.is_employee) return false
                } else if (targetPlan === 'free') {
                    // Exclude company employees from Free accounts
                    if (user.is_employee) return false
                    const currentPlan = user.subscription?.plan?.name?.toLowerCase() || 'free'
                    if (currentPlan !== 'free') return false
                } else {
                    const currentPlan = user.subscription?.plan?.name?.toLowerCase() || 'free'
                    if (currentPlan !== targetPlan) return false
                }
            }

            // Industry Vertical filter
            if (verticalFilter !== 'all') {
                const rawType = (user.business_type as string) || 'retail'
                if (rawType !== verticalFilter) return false
            }

            return true
        }).sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            }
            if (sortBy === 'oldest') {
                return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            }
            if (sortBy === 'name') {
                const nameA = a.business_name || a.owner_name || a.email || ''
                const nameB = b.business_name || b.owner_name || b.email || ''
                return nameA.localeCompare(nameB)
            }
            return 0
        })
    }, [userList, searchQuery, roleFilter, statusFilter, planFilter, verticalFilter, sortBy])

    // Pagination calculations
    const totalCount = filteredUsers.length
    const totalPages = Math.ceil(totalCount / pageSize) || 1
    const safeCurrentPage = Math.min(currentPage, totalPages)
    const startIndex = (safeCurrentPage - 1) * pageSize
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

    // User initials generator
    const getInitials = (name?: string, email?: string) => {
        if (name && name.trim()) {
            const parts = name.trim().split(/\s+/)
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase()
            }
            return name.substring(0, 2).toUpperCase()
        }
        if (email && email.includes('@')) {
            return email.substring(0, 2).toUpperCase()
        }
        return 'BB'
    }

    return (
        <div className="space-y-4">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Filter & Search Toolbar */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, business ID or GSTIN..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value as any)
                                setCurrentPage(1)
                            }}
                            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Workspace Owner</option>
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as any)
                                setCurrentPage(1)
                            }}
                            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="trial">Free Trial</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Plan Filter */}
                    <div className="relative">
                        <select
                            value={planFilter}
                            onChange={(e) => {
                                setPlanFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">All Plans / Types</option>
                            <option value="free">Free</option>
                            <option value="employee">Employee</option>
                            {availablePlanNames.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Vertical Filter */}
                    <div className="relative">
                        <select
                            value={verticalFilter}
                            onChange={(e) => {
                                setVerticalFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="all">All Verticals ({Object.keys(BUSINESS_VERTICALS).length})</option>
                            {Object.entries(BUSINESS_VERTICALS).map(([k, cfg]) => (
                                <option key={k} value={k}>
                                    {cfg.icon} {cfg.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export CSV */}
                    <button
                        type="button"
                        onClick={() => {
                            const headers = ['ID', 'Email', 'Owner Name', 'Business Name', 'Role', 'Status', 'Plan', 'Vertical', 'Created At']
                            const rows = filteredUsers.map(u => [
                                u.id,
                                `"${u.email || ''}"`,
                                `"${u.owner_name || ''}"`,
                                `"${u.business_name || ''}"`,
                                u.is_employee ? 'employee' : (u.role || 'user'),
                                u.status || '',
                                `"${u.subscription?.plan?.name || 'Free'}"`,
                                u.business_type || '',
                                u.created_at || ''
                            ])
                            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `billbook-users-${new Date().toISOString().split('T')[0]}.csv`
                            a.click()
                            URL.revokeObjectURL(url)
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </button>

                    {/* Sort Order */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>

                    {/* Reset Filters */}
                    {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || planFilter !== 'all' || verticalFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setRoleFilter('all')
                                setStatusFilter('all')
                                setPlanFilter('all')
                                setVerticalFilter('all')
                                setCurrentPage(1)
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <th className="py-3.5 px-4">User & Business</th>
                            <th className="py-3.5 px-4">Role</th>
                            <th className="py-3.5 px-4">Vertical</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Subscription</th>
                            <th className="py-3.5 px-4">Joined</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => {
                                const roleBadge = getRoleBadge(user.role, user)
                                const statusBadge = getStatusBadge(user.status)
                                const isEmployeeAccount = !!user.is_employee && !user.subscription?.plan?.name
                                const planName = user.subscription?.plan?.name || (user.is_employee ? 'Employee' : 'Free')
                                const isActionBusy = actionLoading === user.id
                                const isMenuOpen = selectedUserMenu === user.id

                                return (
                                    <tr 
                                        key={user.id} 
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        {/* User Details & Business Info */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                                                    {getInitials(user.business_name || user.owner_name, user.email)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[280px]">
                                                            {user.business_name || user.owner_name || 'Unnamed Business'}
                                                        </span>
                                                        {user.business_id && (
                                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono px-1.5 py-0.5 rounded shrink-0">
                                                                {user.business_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        <span className="flex items-center gap-1 truncate max-w-[220px]">
                                                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                                            {user.email || 'No email registered'}
                                                        </span>
                                                        {user.business_phone && (
                                                            <span className="hidden sm:flex items-center gap-1 text-[11px]">
                                                                <Phone className="h-2.5 w-2.5 text-slate-400" />
                                                                {user.business_phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.className}`}>
                                                {roleBadge.label}
                                            </span>
                                        </td>

                                        {/* Industry Vertical */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            {(() => {
                                                const rawType = (user.business_type as BusinessType) || 'retail'
                                                const vert = BUSINESS_VERTICALS[rawType]
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setVerticalModalUser({
                                                                id: user.id,
                                                                name: user.business_name || user.owner_name || 'Business',
                                                                email: user.email || '',
                                                                currentVertical: rawType
                                                            })
                                                        }}
                                                        title="Click to switch business category/vertical"
                                                        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer text-left"
                                                    >
                                                        <span className="text-sm">{vert?.icon || '🏢'}</span>
                                                        <span>{vert?.name || rawType}</span>
                                                        <Edit className="h-3 w-3 text-slate-400 group-hover:text-purple-600 transition-colors ml-0.5 opacity-60 group-hover:opacity-100" />
                                                    </button>
                                                )
                                            })()}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                                                    user.status === 'active' ? 'bg-emerald-500' : 
                                                    user.status === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'
                                                }`} />
                                                {statusBadge.label}
                                            </span>
                                        </td>

                                        {/* Subscription Plan / Account Type */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {isEmployeeAccount ? (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-900/40 text-xs font-semibold">
                                                            <Building2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                                            <span>Employee</span>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/40 text-xs font-semibold">
                                                            <Crown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                            <span>{planName}</span>
                                                        </div>
                                                    )}
                                                    {user.subscription?.status === 'trial' && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/80">
                                                            Trial
                                                        </span>
                                                    )}
                                                </div>
                                                {user.is_employee && user.employer_name && (
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]" title={user.employer_name}>
                                                        {user.employer_name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Joined Date */}
                                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                            {formatDate(user.created_at)}
                                        </td>

                                        {/* Actions Dropdown */}
                                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                            <div className="relative inline-block user-action-menu">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedUserMenu(isMenuOpen ? null : user.id)
                                                    }}
                                                    disabled={isActionBusy}
                                                    aria-label="User actions"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                >
                                                    {isActionBusy ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                                                    ) : (
                                                        <MoreVertical className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {isMenuOpen && (
                                                    <div 
                                                        className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-30 py-1 text-left animate-in fade-in zoom-in-95 duration-150"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* User ID copy */}
                                                        <button
                                                            onClick={() => handleCopy(user.id, user.id)}
                                                            className="w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {copiedId === user.id ? (
                                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                                )}
                                                                <span>Copy User ID</span>
                                                            </span>
                                                            {copiedId === user.id && (
                                                                <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                                                            )}
                                                        </button>

                                                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                                        {/* Status Toggle */}
                                                        <button
                                                            onClick={() => handleStatusChange(
                                                                user.id, 
                                                                user.status === 'active' ? 'suspended' : 'active'
                                                            )}
                                                            className="w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                                        >
                                                            {user.status === 'active' ? (
                                                                <>
                                                                    <Ban className="h-3.5 w-3.5 text-rose-500" />
                                                                    <span>Suspend Account</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                                                    <span>Activate Account</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Role Toggle */}
                                                        <button
                                                            onClick={() => handleRoleChange(
                                                                user.id, 
                                                                user.role === 'admin' ? 'user' : 'admin'
                                                            )}
                                                            className="w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Shield className="h-3.5 w-3.5 text-indigo-500" />
                                                            <span>
                                                                {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                            </span>
                                                        </button>

                                                        {/* Upgrade Plan */}
                                                        <button
                                                            onClick={() => {
                                                                setUpgradeModalUser({
                                                                    id: user.id,
                                                                    email: user.email || user.business_name || 'User',
                                                                    currentPlan: planName
                                                                })
                                                                setSelectedUserMenu(null)
                                                            }}
                                                            className="w-full px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 transition-colors font-medium"
                                                        >
                                                            <Crown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                            <span>Upgrade / Change Plan</span>
                                                        </button>

                                                        {/* Switch Business Category / Vertical */}
                                                        <button
                                                            onClick={() => {
                                                                setVerticalModalUser({
                                                                    id: user.id,
                                                                    name: user.business_name || user.owner_name || 'Business',
                                                                    email: user.email || '',
                                                                    currentVertical: (user.business_type as BusinessType) || 'retail'
                                                                })
                                                                setSelectedUserMenu(null)
                                                            }}
                                                            className="w-full px-3 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 transition-colors font-medium"
                                                        >
                                                            <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                            <span>Switch Industry Vertical</span>
                                                        </button>

                                                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                                        {/* Deactivate User */}
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span>Deactivate Account</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-slate-400">
                                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-3">
                                            <UserCheck className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                            No users matched your filters
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Try adjusting your search terms or filter criteria.
                                        </p>
                                        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || planFilter !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    setRoleFilter('all')
                                                    setStatusFilter('all')
                                                    setPlanFilter('all')
                                                }}
                                                className="mt-4 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Clear All Filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Status Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 px-1">
                <div>
                    Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredUsers.length > 0 ? startIndex + 1 : 0}</span> to{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {Math.min(startIndex + pageSize, totalCount)}
                    </span> of{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount}</span> users
                </div>

                <div className="flex items-center gap-3">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-1.5">
                        <span>Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safeCurrentPage <= 1}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {safeCurrentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage >= totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Upgrade Plan Modal */}
            {upgradeModalUser && (
                <UpgradePlanModal
                    userId={upgradeModalUser.id}
                    userEmail={upgradeModalUser.email}
                    currentPlan={upgradeModalUser.currentPlan}
                    plans={plans}
                    onClose={() => setUpgradeModalUser(null)}
                    onSuccess={() => {
                        showToast('Plan upgraded successfully')
                        // Refetch or update user list in place
                        setUserList(prev => prev.map(u => {
                            if (u.id === upgradeModalUser.id) {
                                return {
                                    ...u,
                                    subscription: {
                                        ...(u.subscription as any),
                                        plan: { name: 'Upgraded' } as any
                                    }
                                }
                            }
                            return u
                        }))
                    }}
                />
            )}

            {/* Change Business Category / Vertical Modal */}
            {verticalModalUser && (
                <ChangeVerticalModal
                    userId={verticalModalUser.id}
                    userName={verticalModalUser.name}
                    userEmail={verticalModalUser.email}
                    currentVertical={verticalModalUser.currentVertical}
                    onClose={() => setVerticalModalUser(null)}
                    onSuccess={(newVertical) => {
                        const vertName = BUSINESS_VERTICALS[newVertical]?.name || newVertical
                        showToast(`Business vertical switched to ${vertName}`)
                        setUserList(prev => prev.map(u => {
                            if (u.id === verticalModalUser.id) {
                                return {
                                    ...u,
                                    business_type: newVertical
                                }
                            }
                            return u
                        }))
                        setVerticalModalUser(null)
                    }}
                />
            )}
        </div>
    )
}
