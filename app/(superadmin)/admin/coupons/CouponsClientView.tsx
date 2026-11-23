'use client'

import { useState } from 'react'
import { 
    Tag, 
    Plus, 
    TrendingUp, 
    Percent, 
    Copy, 
    Check, 
    Edit, 
    Trash2, 
    Search, 
    Calendar, 
    ShieldCheck, 
    X, 
    Loader2, 
    IndianRupee 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
    createCoupon, 
    updateCoupon, 
    toggleCouponStatus, 
    deleteCoupon, 
    CouponInput 
} from './actions'

interface Coupon {
    id: string
    code: string
    description?: string | null
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    currency?: string
    max_uses?: number | null
    uses_count: number
    min_purchase_amount?: number | null
    valid_from?: string
    valid_until?: string | null
    is_active: boolean
    created_at: string
}

interface CouponsClientViewProps {
    initialCoupons: Coupon[]
}

export default function CouponsClientView({ initialCoupons }: CouponsClientViewProps) {
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState<CouponInput>({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        currency: 'INR',
        max_uses: null,
        min_purchase_amount: null,
        valid_until: null,
        is_active: true
    })

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3500)
    }

    const handleCopy = (id: string, code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        showToast(`Coupon code ${code} copied!`)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const openCreateModal = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: 10,
            currency: 'INR',
            max_uses: null,
            min_purchase_amount: null,
            valid_until: null,
            is_active: true
        })
        setIsCreateOpen(true)
    }

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            currency: coupon.currency || 'INR',
            max_uses: coupon.max_uses ?? null,
            min_purchase_amount: coupon.min_purchase_amount ?? null,
            valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : null,
            is_active: coupon.is_active
        })
        setIsCreateOpen(true)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.code.trim()) {
            showToast('Please enter a coupon code', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            if (editingCoupon) {
                const res = await updateCoupon(editingCoupon.id, formData)
                if (res.success) {
                    setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...res.coupon } : c))
                    showToast('Coupon updated successfully!')
                    setIsCreateOpen(false)
                    setEditingCoupon(null)
                }
            } else {
                const res = await createCoupon(formData)
                if (res.success) {
                    setCoupons(prev => [res.coupon, ...prev])
                    showToast(`Coupon ${formData.code.toUpperCase()} created successfully!`)
                    setIsCreateOpen(false)
                }
            }
        } catch (err: any) {
            console.error('Error saving coupon:', err)
            showToast(err.message || 'Failed to save coupon', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (coupon: Coupon) => {
        setActionLoadingId(coupon.id)
        try {
            const newStatus = !coupon.is_active
            await toggleCouponStatus(coupon.id, newStatus)
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: newStatus } : c))
            showToast(`Coupon ${coupon.code} marked ${newStatus ? 'Active' : 'Inactive'}`)
        } catch (err: any) {
            showToast(err.message || 'Failed to update coupon status', 'error')
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return
        setActionLoadingId(id)
        try {
            await deleteCoupon(id)
            setCoupons(prev => prev.filter(c => c.id !== id))
            showToast(`Coupon ${code} deleted`)
        } catch (err: any) {
            showToast(err.message || 'Failed to delete coupon', 'error')
        } finally {
            setActionLoadingId(null)
        }
    }

    const filteredCoupons = coupons.filter(c => {
        const matchesStatus = statusFilter === 'all' 
            ? true 
            : statusFilter === 'active' 
                ? c.is_active 
                : !c.is_active
        const matchesSearch = !searchQuery.trim() || 
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesStatus && matchesSearch
    })

    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.is_active).length,
        totalUses: coupons.reduce((sum, c) => sum + (c.uses_count || 0), 0)
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`p-3.5 rounded-xl text-sm font-medium flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200 ${
                    toast.type === 'success' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-rose-600 text-white'
                }`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="opacity-80 hover:opacity-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Total Coupons
                        </CardTitle>
                        <Tag className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</div>
                        <p className="text-xs text-slate-400 mt-1">Configured promo discounts</p>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                            Active Codes
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-600">{stats.active}</div>
                        <p className="text-xs text-slate-400 mt-1">Currently redeemable by users</p>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-600">
                            Total Redemptions
                        </CardTitle>
                        <Percent className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-orange-600">{stats.totalUses}</div>
                        <p className="text-xs text-slate-400 mt-1">Times coupons were applied</p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search promo code or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['all', 'active', 'inactive'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                                    statusFilter === filter
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl h-9"
                    >
                        <Plus className="h-4 w-4" />
                        Create Coupon
                    </Button>
                </div>
            </div>

            {/* Coupons List Table */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
                <CardHeader className="bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 py-3.5 px-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                Coupon Catalogue ({filteredCoupons.length})
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Apply percentage or flat value discounts on subscription plans or checkout.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredCoupons.length === 0 ? (
                        <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                            <Tag className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                            <p>No coupons found matching your search.</p>
                            <Button size="sm" onClick={openCreateModal} variant="outline" className="text-xs">
                                Create your first coupon
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
                                        <th className="py-3 px-5">Promo Code</th>
                                        <th className="py-3 px-4">Discount</th>
                                        <th className="py-3 px-4">Min Spend</th>
                                        <th className="py-3 px-4">Usage Count</th>
                                        <th className="py-3 px-4">Validity</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {filteredCoupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        {coupon.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(coupon.id, coupon.code)}
                                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                                        title="Copy code"
                                                    >
                                                        {copiedId === coupon.id ? (
                                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {coupon.description && (
                                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                                        {coupon.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                                                {coupon.discount_type === 'percentage' 
                                                    ? `${coupon.discount_value}% OFF`
                                                    : `₹${coupon.discount_value.toLocaleString()} OFF`
                                                }
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                                                {coupon.min_purchase_amount ? `₹${coupon.min_purchase_amount.toLocaleString()}` : 'None'}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : '(Unlimited)'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                                {coupon.valid_until 
                                                    ? new Date(coupon.valid_until).toLocaleDateString()
                                                    : 'No expiration'
                                                }
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => handleToggleStatus(coupon)}
                                                    disabled={actionLoadingId === coupon.id}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                                        coupon.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-5 text-right space-x-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openEditModal(coupon)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(coupon.id, coupon.code)}
                                                    disabled={actionLoadingId === coupon.id}
                                                    className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo Code'}
                                </h3>
                            </div>
                            <button
                                onClick={() => { setIsCreateOpen(false); setEditingCoupon(null) }}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SUMMER50"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase font-mono font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Discount Type
                                    </label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                    >
                                        <option value="percentage">Percentage (%) OFF</option>
                                        <option value="fixed">Flat Amount (₹) OFF</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="any"
                                        placeholder={formData.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Min Order Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Optional (e.g. 999)"
                                        value={formData.min_purchase_amount || ''}
                                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Usage Limit (Max Uses)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Leave empty for unlimited"
                                        value={formData.max_uses || ''}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Valid Until (Expiration)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.valid_until || ''}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || null })}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Description / Campaign Note
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Internal notes or promo label shown to customers..."
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_active_toggle"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                                />
                                <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Make this coupon active immediately
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setIsCreateOpen(false); setEditingCoupon(null) }}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                                >
                                    {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
