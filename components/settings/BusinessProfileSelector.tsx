'use client'

import React, { useState } from 'react'
import { Check, Sparkles, AlertCircle, ArrowRight, RefreshCw, ShieldCheck, Lock, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BUSINESS_VERTICALS } from '@/lib/business-profile-types'
import type { BusinessType } from '@/lib/business-profile-types'
import { updateBusinessProfile } from '@/lib/business-profile-actions'

interface BusinessProfileSelectorProps {
    initialType?: BusinessType
    isSuperAdmin?: boolean
    onUpdated?: (newType: BusinessType) => void
}

export function BusinessProfileSelector({ initialType = 'retail', isSuperAdmin = false, onUpdated }: BusinessProfileSelectorProps) {
    const [selectedType, setSelectedType] = useState<BusinessType>(initialType)
    const [activeSavedType, setActiveSavedType] = useState<BusinessType>(initialType)
    const [isSaving, setIsSaving] = useState(false)
    const [seedCatalog, setSeedCatalog] = useState(true)
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const isLocked = !isSuperAdmin
    const verticals = Object.values(BUSINESS_VERTICALS).filter(v => v.id !== 'standard')

    const handleSave = async () => {
        if (!isSuperAdmin) {
            setStatusMessage({
                type: 'error',
                text: 'Business type cannot be changed once set. Please contact a Super Administrator.'
            })
            return
        }

        setIsSaving(true)
        setStatusMessage(null)

        try {
            const res = await updateBusinessProfile(selectedType, {}, seedCatalog)
            if (res.success) {
                setActiveSavedType(selectedType)
                setStatusMessage({
                    type: 'success',
                    text: `Successfully switched workspace to ${BUSINESS_VERTICALS[selectedType].name}! All terminology and workflows have adapted.`
                })
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('billbook:vertical-changed', { detail: selectedType }))
                }
                if (onUpdated) onUpdated(selectedType)
            } else {
                setStatusMessage({ type: 'error', text: res.error || 'Failed to switch industry' })
            }
        } catch {
            setStatusMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>Industry & Business Vertical</span>
                        {isSuperAdmin ? (
                            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> SUPER ADMIN
                            </span>
                        ) : (
                            <span className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> LOCKED
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {isLocked 
                            ? 'Your business type determines invoicing formats, terminology, and workflows.' 
                            : 'Select a business vertical below to reassign this organization.'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isSuperAdmin ? (
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || selectedType === activeSavedType}
                            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                        >
                            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Apply Industry Setup
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Locked for Organization</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Lock Notice for Regular Users */}
            {isLocked && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 rounded-2xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-700 dark:text-amber-300 shrink-0">
                        <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs">
                        <p className="font-bold text-amber-950 dark:text-amber-200">
                            Business Type is Protected ({BUSINESS_VERTICALS[activeSavedType]?.name || activeSavedType})
                        </p>
                        <p className="text-amber-800/90 dark:text-amber-400 leading-relaxed">
                            Once configured, the business type cannot be modified by organization members to prevent unexpected accounting disruptions and template resets. If you need to transition your business to another vertical, please contact a <strong>Super Administrator</strong>.
                        </p>
                    </div>
                </div>
            )}

            {statusMessage && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                    statusMessage.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                }`}>
                    {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            {/* Vertical Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {verticals.map((vert) => {
                    const isSelected = selectedType === vert.id
                    const isActive = activeSavedType === vert.id

                    return (
                        <Card
                            key={vert.id}
                            onClick={() => {
                                if (isSuperAdmin) {
                                    setSelectedType(vert.id)
                                }
                            }}
                            className={`transition-all border-2 relative overflow-hidden ${
                                isLocked ? 'cursor-default' : 'cursor-pointer'
                            } ${
                                isActive
                                    ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                                    : isSelected
                                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md' 
                                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    ACTIVE
                                </div>
                            )}

                            <CardContent className="p-4 space-y-2.5">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                                        {vert.icon}
                                    </div>
                                    <div className="flex-1 pr-6">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                                            {vert.name}
                                        </h4>
                                        <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                                            {vert.tagline}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {vert.description}
                                </p>

                                <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        Client: {vert.customFieldLabels.customer}
                                    </span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        Items: {vert.customFieldLabels.items}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Options Footer for Super Admin */}
            {isSuperAdmin && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={seedCatalog}
                            onChange={(e) => setSeedCatalog(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                            Auto-populate industry starter items & services if my item catalog is empty
                        </span>
                    </label>

                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || selectedType === activeSavedType}
                        className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shrink-0"
                    >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save Industry Profile
                    </Button>
                </div>
            )}
        </div>
    )
}
