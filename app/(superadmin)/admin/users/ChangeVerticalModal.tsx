'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Building2, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { 
  BUSINESS_VERTICALS, 
  type BusinessType, 
  type BusinessVerticalConfig 
} from '@/lib/business-profile-types'
import { updateUserBusinessType } from './actions'

interface ChangeVerticalModalProps {
  userId: string
  userName: string
  userEmail: string
  currentVertical?: BusinessType | string
  onClose: () => void
  onSuccess: (newVertical: BusinessType) => void
}

export function ChangeVerticalModal({
  userId,
  userName,
  userEmail,
  currentVertical = 'retail',
  onClose,
  onSuccess
}: ChangeVerticalModalProps) {
  const [selectedVertical, setSelectedVertical] = useState<BusinessType>(
    (currentVertical as BusinessType) in BUSINESS_VERTICALS 
      ? (currentVertical as BusinessType) 
      : 'retail'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'services' | 'commerce' | 'healthcare' | 'hospitality' | 'automotive'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  const allVerticals = Object.values(BUSINESS_VERTICALS) as BusinessVerticalConfig[]

  const filteredVerticals = allVerticals.filter(v => {
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery = !q || 
      v.name.toLowerCase().includes(q) || 
      v.id.toLowerCase().includes(q) || 
      v.tagline.toLowerCase().includes(q) || 
      v.description.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })

  const currentConfig = BUSINESS_VERTICALS[currentVertical as BusinessType] || {
    id: currentVertical,
    name: currentVertical,
    icon: '🏢',
    tagline: 'Standard Business Profile'
  }

  const handleUpdate = async () => {
    if (selectedVertical === currentVertical) {
      setError('Customer is already assigned to this industry vertical')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      await updateUserBusinessType(userId, selectedVertical)
      setSuccessMsg(`Successfully updated business vertical to ${BUSINESS_VERTICALS[selectedVertical]?.name || selectedVertical}!`)
      setTimeout(() => {
        onSuccess(selectedVertical)
      }, 700)
    } catch (err: any) {
      console.error('Failed to change business vertical:', err)
      setError(err?.message || 'Failed to update business vertical. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Switch Business Vertical / Category</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Super Admin
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reassign <span className="font-semibold text-slate-700 dark:text-slate-300">{userName}</span> ({userEmail}) to another industry vertical
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current vs Target Preview Banner */}
        <div className="shrink-0 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Vertical:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
              <span>{currentConfig.icon}</span>
              <span>{currentConfig.name}</span>
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Target Vertical:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
              <span>{BUSINESS_VERTICALS[selectedVertical]?.icon || '🏢'}</span>
              <span>{BUSINESS_VERTICALS[selectedVertical]?.name || selectedVertical}</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by industry title, category, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
              {(['all', 'services', 'commerce', 'healthcare', 'hospitality', 'automotive'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                    categoryFilter === cat 
                      ? 'bg-purple-600 text-white font-semibold' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All (14)' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Industry Grid Selection */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[220px]">
          {filteredVerticals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No business verticals matched your query &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredVerticals.map(vert => {
                const isSelected = selectedVertical === vert.id
                const isCurrent = currentVertical === vert.id

                return (
                  <div
                    key={vert.id}
                    onClick={() => setSelectedVertical(vert.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-left flex items-start gap-3 ${
                      isSelected 
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 ring-2 ring-purple-500/20 shadow-xs' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="text-2xl shrink-0 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-100 dark:border-slate-700">
                      {vert.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {vert.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {vert.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 capitalize">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{vert.category}</span>
                        <span>•</span>
                        <span>{vert.customFieldLabels.customer} / {vert.customFieldLabels.items}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Changes apply instantly across dashboard navigation, custom fields, and catalog presets.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isLoading || selectedVertical === currentVertical}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Updating Category...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Confirm & Switch Vertical
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
