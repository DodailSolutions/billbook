'use client'

import { useState, useMemo } from 'react'
import { 
    CreditCard, 
    Plus, 
    Check, 
    Star, 
    Edit, 
    Trash2, 
    Globe, 
    Sparkles, 
    Search, 
    Filter, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    Layers, 
    X, 
    SlidersHorizontal,
    TrendingUp,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { SubscriptionPlan } from '@/lib/types-admin'
import { 
    createPlan, 
    updatePlan, 
    togglePlanStatus, 
    togglePlanPopular, 
    deletePlan, 
    seedStandardRegionalPlans, 
    type PlanInput 
} from './actions'

interface PlansManagerProps {
    initialPlans: SubscriptionPlan[]
}

const REGION_OPTIONS = [
    { id: 'all', label: 'All Regions', flag: '🌍', currency: 'ALL' },
    { id: 'IN', label: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
    { id: 'AE', label: 'UAE & Middle East', flag: '🇦🇪', currency: 'AED', symbol: 'AED ' },
    { id: 'US', label: 'US & Global', flag: '🇺🇸', currency: 'USD', symbol: '$' }
]

export default function PlansManager({ initialPlans }: PlansManagerProps) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)
    const [selectedRegion, setSelectedRegion] = useState<string>('all')
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'popular'>('all')

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
    const [isSeeding, setIsSeeding] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<PlanInput>({
        name: '',
        slug: '',
        description: '',
        price: 0,
        currency: 'INR',
        billing_period: 'monthly',
        features: [],
        limits: { invoices_per_month: 999999, customers: 999999 },
        is_active: true,
        is_popular: false,
        sort_order: 1
    })
    const [featuresInput, setFeaturesInput] = useState('')

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 3500)
    }

    // Helper to identify plan region
    const getPlanRegion = (plan: SubscriptionPlan) => {
        const c = (plan.currency || '').toUpperCase()
        if (c === 'INR') return { code: 'IN', flag: '🇮🇳', label: 'India', symbol: '₹' }
        if (c === 'AED') return { code: 'AE', flag: '🇦🇪', label: 'UAE', symbol: 'AED ' }
        if (c === 'USD') return { code: 'US', flag: '🇺🇸', label: 'US & Global', symbol: '$' }
        if (c === 'EUR') return { code: 'EU', flag: '🇪🇺', label: 'Europe', symbol: '€' }
        if (c === 'GBP') return { code: 'GB', flag: '🇬🇧', label: 'UK', symbol: '£' }
        return { code: 'GL', flag: '🌐', label: c, symbol: `${c} ` }
    }

    // Filter plans
    const filteredPlans = useMemo(() => {
        return plans.filter(plan => {
            const planRegion = getPlanRegion(plan)

            // Region filter
            if (selectedRegion !== 'all' && planRegion.code !== selectedRegion) {
                return false
            }

            // Period filter
            if (selectedPeriod !== 'all' && plan.billing_period !== selectedPeriod) {
                return false
            }

            // Status filter
            if (statusFilter === 'active' && !plan.is_active) return false
            if (statusFilter === 'inactive' && plan.is_active) return false
            if (statusFilter === 'popular' && !plan.is_popular) return false

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                const matchName = plan.name.toLowerCase().includes(q)
                const matchSlug = plan.slug.toLowerCase().includes(q)
                const matchDesc = (plan.description || '').toLowerCase().includes(q)
                const matchFeature = (plan.features || []).some(f => f.toLowerCase().includes(q))
                if (!matchName && !matchSlug && !matchDesc && !matchFeature) return false
            }

            return true
        }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }, [plans, selectedRegion, selectedPeriod, statusFilter, searchQuery])

    // KPI stats
    const stats = {
        total: plans.length,
        active: plans.filter(p => p.is_active).length,
        india: plans.filter(p => p.currency === 'INR').length,
        uae: plans.filter(p => p.currency === 'AED').length,
        us: plans.filter(p => p.currency === 'USD').length,
        popular: plans.filter(p => p.is_popular).length
    }

    // Reset Form
    const openAddModal = (defaultCurrency = 'INR') => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            price: 299,
            currency: defaultCurrency,
            billing_period: 'monthly',
            features: [],
            limits: { invoices_per_month: 999999, customers: 999999 },
            is_active: true,
            is_popular: false,
            sort_order: (plans.length + 1)
        })
        setFeaturesInput('Unlimited invoices\nGST compliance\nPDF downloads\nCustomer management\nWhatsApp sharing')
        setIsAddModalOpen(true)
    }

    const openEditModal = (plan: SubscriptionPlan) => {
        setEditingPlan(plan)
        setFormData({
            name: plan.name,
            slug: plan.slug,
            description: plan.description || '',
            price: plan.price,
            currency: plan.currency || 'INR',
            billing_period: plan.billing_period,
            features: plan.features || [],
            limits: plan.limits || { invoices_per_month: 999999, customers: 999999 },
            is_active: plan.is_active,
            is_popular: plan.is_popular,
            sort_order: plan.sort_order || 1
        })
        setFeaturesInput(Array.isArray(plan.features) ? plan.features.join('\n') : '')
    }

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) return

        setIsSubmitting(true)

        const featuresArray = featuresInput
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)

        const payload: PlanInput = {
            ...formData,
            features: featuresArray,
            slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        }

        try {
            if (editingPlan) {
                const res = await updatePlan(editingPlan.id, payload)
                if (res.success) {
                    setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...payload } : p))
                    showToast(`Updated plan "${payload.name}"`)
                    setEditingPlan(null)
                } else {
                    alert(res.error || 'Failed to update plan')
                }
            } else {
                const res = await createPlan(payload)
                if (res.success && res.plan) {
                    setPlans(prev => [...prev, res.plan as SubscriptionPlan])
                    showToast(`Created new plan "${payload.name}"`)
                    setIsAddModalOpen(false)
                } else {
                    alert(res.error || 'Failed to create plan')
                }
            }
        } catch (err) {
            console.error('Error saving plan:', err)
            alert('An unexpected error occurred while saving the plan')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (plan: SubscriptionPlan) => {
        setActionLoadingId(plan.id)
        const nextState = !plan.is_active
        try {
            const res = await togglePlanStatus(plan.id, nextState)
            if (res.success) {
                setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: nextState } : p))
                showToast(`Plan "${plan.name}" is now ${nextState ? 'Active' : 'Inactive'}`)
            }
        } catch (err) {
            console.error('Failed to toggle status:', err)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleTogglePopular = async (plan: SubscriptionPlan) => {
        setActionLoadingId(plan.id)
        const nextState = !plan.is_popular
        try {
            const res = await togglePlanPopular(plan.id, nextState)
            if (res.success) {
                setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_popular: nextState } : p))
                showToast(`Popular badge ${nextState ? 'enabled' : 'removed'} for "${plan.name}"`)
            }
        } catch (err) {
            console.error('Failed to toggle popular:', err)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleDelete = async (plan: SubscriptionPlan) => {
        if (!confirm(`Are you sure you want to delete or deactivate "${plan.name}"?`)) return
        setActionLoadingId(plan.id)
        try {
            const res = await deletePlan(plan.id)
            if (res.success) {
                if (res.message) {
                    // Was deactivated instead of deleted
                    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: false } : p))
                    showToast(res.message)
                } else {
                    setPlans(prev => prev.filter(p => p.id !== plan.id))
                    showToast(`Deleted plan "${plan.name}"`)
                }
            } else {
                alert(res.error || 'Failed to delete plan')
            }
        } catch (err) {
            console.error('Error deleting plan:', err)
        } finally {
            setActionLoadingId(null)
        }
    }

    const handleSeedPlans = async () => {
        if (!confirm('This will synchronize all plans with official landing rates (Starter ₹299, Professional ₹599, Enterprise ₹999, Lifetime ₹9,999) and add all UAE and US regional plans. Proceed?')) return
        setIsSeeding(true)
        try {
            const res = await seedStandardRegionalPlans()
            if (res.success) {
                showToast(res.message || 'Regional plans synchronized')
                // Refresh full list from server
                window.location.reload()
            } else {
                alert(res.error || 'Failed to sync plans')
            }
        } catch (err) {
            console.error('Error syncing plans:', err)
        } finally {
            setIsSeeding(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Toast feedback */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Toolbar & Location Switcher */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs space-y-4">
                {/* Region Selector Pills */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {REGION_OPTIONS.map((region) => {
                            const isSelected = selectedRegion === region.id
                            const count = region.id === 'all' 
                                ? stats.total 
                                : region.id === 'IN' ? stats.india 
                                : region.id === 'AE' ? stats.uae 
                                : stats.us

                            return (
                                <button
                                    key={region.id}
                                    onClick={() => setSelectedRegion(region.id)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                                        isSelected
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{region.flag}</span>
                                    <span>{region.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                        isSelected 
                                            ? 'bg-blue-700/60 text-white' 
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSeedPlans}
                            disabled={isSeeding}
                            className="text-xs flex items-center gap-1.5 border-dashed"
                            title="Auto-sync and update plans to official rates"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isSeeding ? 'animate-spin' : ''}`} />
                            <span>{isSeeding ? 'Syncing...' : 'Sync Official Rates'}</span>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => openAddModal(selectedRegion === 'AE' ? 'AED' : selectedRegion === 'US' ? 'USD' : 'INR')}
                            className="bg-blue-600 hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 text-white shadow-xs"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Plan</span>
                        </Button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search plans by name, features, or slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Period Filter */}
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                            <option value="all">All Periods</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="lifetime">Lifetime</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                            <option value="popular">Popular Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => {
                    const region = getPlanRegion(plan)
                    const isBusy = actionLoadingId === plan.id

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                                plan.is_popular
                                    ? 'border-blue-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-blue-500/20'
                                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs'
                            } ${!plan.is_active ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/40' : ''}`}
                        >
                            {/* Card Top */}
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{region.flag}</span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            {region.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {plan.is_popular && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                                <Star className="h-2.5 w-2.5 fill-blue-600 text-blue-600" />
                                                Popular
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            plan.is_active 
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                                    {plan.description || 'No description provided'}
                                </p>

                                {/* Price block */}
                                <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {region.symbol}{Number(plan.price).toLocaleString()}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            / {plan.billing_period === 'lifetime' ? 'one-time' : plan.billing_period}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                            slug: {plan.slug}
                                        </span>
                                        {plan.limits?.invoices_per_month && (
                                            <span>• {plan.limits.invoices_per_month >= 999999 ? 'Unlimited' : plan.limits.invoices_per_month} inv/mo</span>
                                        )}
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="py-4 space-y-2">
                                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                        Included Features
                                    </p>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {Array.isArray(plan.features) && plan.features.length > 0 ? (
                                            plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                    <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                                                    <span className="leading-tight">{feature}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">No features listed</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleTogglePopular(plan)}
                                        disabled={isBusy}
                                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                            plan.is_popular
                                                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                        title={plan.is_popular ? 'Remove Popular Badge' : 'Set as Popular Plan'}
                                    >
                                        <Star className={`h-4 w-4 ${plan.is_popular ? 'fill-amber-500 text-amber-500' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(plan)}
                                        disabled={isBusy}
                                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                            plan.is_active
                                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30'
                                                : 'text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800'
                                        }`}
                                        title={plan.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                                    >
                                        {plan.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(plan)}
                                        disabled={isBusy}
                                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Edit Plan"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan)}
                                        disabled={isBusy}
                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                        title="Delete or Deactivate Plan"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredPlans.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 mx-auto mb-3">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        No subscription plans found
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        No plans match the selected filters. You can sync standard plans for India, UAE, and US or add a new custom plan.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Button size="sm" onClick={handleSeedPlans} variant="outline" className="text-xs">
                            Sync Regional Plans
                        </Button>
                        <Button size="sm" onClick={() => openAddModal()} className="bg-blue-600 text-white text-xs">
                            Create First Plan
                        </Button>
                    </div>
                </div>
            )}

            {/* Add / Edit Plan Modal */}
            {(isAddModalOpen || editingPlan) && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <form onSubmit={handleSavePlan}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                            {editingPlan ? `Edit "${editingPlan.name}"` : 'Create Subscription Plan'}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Configure pricing, billing cycle, and regional availability
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false)
                                        setEditingPlan(null)
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Plan Name *
                                        </label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Starter Pro"
                                            className="text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Plan Slug (URL identifier) *
                                        </label>
                                        <Input
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="e.g. starter-pro-ae"
                                            className="text-xs font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Currency & Region
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold"
                                        >
                                            <option value="INR">🇮🇳 INR (₹) - India</option>
                                            <option value="AED">🇦🇪 AED - UAE</option>
                                            <option value="USD">🇺🇸 USD ($) - US / Global</option>
                                            <option value="EUR">🇪🇺 EUR (€) - Europe</option>
                                            <option value="GBP">🇬🇧 GBP (£) - UK</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Price *
                                        </label>
                                        <Input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="text-xs font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Billing Period
                                        </label>
                                        <select
                                            value={formData.billing_period}
                                            onChange={(e) => setFormData({ ...formData, billing_period: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="lifetime">Lifetime Deal</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Description
                                    </label>
                                    <Input
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief summary for this plan tier"
                                        className="text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Features (one per line)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={featuresInput}
                                        onChange={(e) => setFeaturesInput(e.target.value)}
                                        placeholder="Unlimited invoices&#10;WhatsApp Sharing&#10;PDF downloads&#10;Custom branding"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Invoices / Month Limit
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.limits?.invoices_per_month ?? 999999}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                limits: { ...formData.limits, invoices_per_month: Number(e.target.value) }
                                            })}
                                            className="text-xs"
                                        />
                                        <span className="text-[10px] text-slate-400">Enter 999999 for unlimited</span>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Sort Display Order
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.sort_order ?? 1}
                                            onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Active (Visible to users)</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_popular}
                                            onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                            className="rounded text-amber-500 focus:ring-amber-400"
                                        />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Highlight as "Popular"</span>
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsAddModalOpen(false)
                                        setEditingPlan(null)
                                    }}
                                    disabled={isSubmitting}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                                >
                                    {isSubmitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
