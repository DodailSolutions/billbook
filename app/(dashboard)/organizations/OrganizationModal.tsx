'use client'

import { useState, useEffect } from 'react'
import { X, Building2, Globe, Mail, Phone, MapPin, FileText, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Organization } from '@/lib/types'
import { createOrganizationAction, updateOrganizationAction } from './actions'

interface OrganizationModalProps {
    isOpen: boolean
    onClose: () => void
    organization?: Organization | null
    onSuccess: (org: Organization) => void
}

const INDUSTRIES = [
    'Software & IT Services',
    'Consulting & Professional Services',
    'Manufacturing & Industrial',
    'Retail & E-commerce',
    'Healthcare & Pharmaceuticals',
    'Real Estate & Construction',
    'Financial & Accounting Services',
    'Marketing & Advertising',
    'Logistics & Supply Chain',
    'Hospitality & Tourism',
    'Education & Training',
    'Other'
]

export function OrganizationModal({ isOpen, onClose, organization, onSuccess }: OrganizationModalProps) {
    const isEdit = !!organization

    const [name, setName] = useState('')
    const [legalName, setLegalName] = useState('')
    const [gstin, setGstin] = useState('')
    const [pan, setPan] = useState('')
    const [website, setWebsite] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [industry, setIndustry] = useState('')
    const [billingAddress, setBillingAddress] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [country, setCountry] = useState('India')
    const [pincode, setPincode] = useState('')
    const [currency, setCurrency] = useState('INR')
    const [notes, setNotes] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (organization) {
            setName(organization.name || '')
            setLegalName(organization.legal_name || '')
            setGstin(organization.gstin || '')
            setPan(organization.pan || '')
            setWebsite(organization.website || '')
            setEmail(organization.email || '')
            setPhone(organization.phone || '')
            setIndustry(organization.industry || '')
            setBillingAddress(organization.billing_address || '')
            setShippingAddress(organization.shipping_address || '')
            setCity(organization.city || '')
            setState(organization.state || '')
            setCountry(organization.country || 'India')
            setPincode(organization.pincode || '')
            setCurrency(organization.currency || 'INR')
            setNotes(organization.notes || '')
        } else {
            setName('')
            setLegalName('')
            setGstin('')
            setPan('')
            setWebsite('')
            setEmail('')
            setPhone('')
            setIndustry('Software & IT Services')
            setBillingAddress('')
            setShippingAddress('')
            setCity('')
            setState('')
            setCountry('India')
            setPincode('')
            setCurrency('INR')
            setNotes('')
        }
        setError(null)
    }, [organization, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Organization name is required')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const payload = {
                name: name.trim(),
                legal_name: legalName.trim() || undefined,
                gstin: gstin.trim().toUpperCase() || undefined,
                pan: pan.trim().toUpperCase() || undefined,
                website: website.trim() || undefined,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                industry: industry.trim() || undefined,
                billing_address: billingAddress.trim() || undefined,
                shipping_address: shippingAddress.trim() || undefined,
                city: city.trim() || undefined,
                state: state.trim() || undefined,
                country: country.trim() || 'India',
                pincode: pincode.trim() || undefined,
                currency: currency.trim() || 'INR',
                notes: notes.trim() || undefined
            }

            let res
            if (isEdit && organization) {
                res = await updateOrganizationAction(organization.id, payload)
            } else {
                res = await createOrganizationAction(payload)
            }

            if (res.success && res.organization) {
                onSuccess(res.organization)
                onClose()
            } else {
                setError(res.error || 'Failed to save organization')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {isEdit ? `Edit "${organization.name}"` : 'New Organization Account'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    B2B entity profile for invoicing, multi-contacts, and CRM deals
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content Form */}
                    <div className="p-5 sm:p-6 space-y-4 text-xs">
                        {error && (
                            <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Organization / Company Name *
                                </label>
                                <Input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Acme Corporation Pvt Ltd"
                                    className="text-xs font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Trade Name / Legal Entity
                                </label>
                                <Input
                                    value={legalName}
                                    onChange={(e) => setLegalName(e.target.value)}
                                    placeholder="e.g. Acme Technologies Group"
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    GSTIN / Tax ID
                                </label>
                                <Input
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                    placeholder="e.g. 27AABCA1234F1Z5"
                                    className="text-xs font-mono uppercase"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    PAN Number
                                </label>
                                <Input
                                    value={pan}
                                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                                    placeholder="e.g. AABCA1234F"
                                    className="text-xs font-mono uppercase"
                                    maxLength={10}
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Industry Vertical
                                </label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-medium"
                                >
                                    {INDUSTRIES.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Official Email
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="billing@acme.com"
                                    className="text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Phone / Switchboard
                                </label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Website
                                </label>
                                <Input
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://acme.com"
                                    className="text-xs"
                                />
                            </div>
                        </div>

                        {/* Address Block */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Billing Address
                            </label>
                            <textarea
                                rows={2}
                                value={billingAddress}
                                onChange={(e) => setBillingAddress(e.target.value)}
                                placeholder="Plot 42, Cyber City, Phase 2..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    City
                                </label>
                                <Input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Mumbai"
                                    className="text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    State
                                </label>
                                <Input
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Maharashtra"
                                    className="text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Country
                                </label>
                                <Input
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="India"
                                    className="text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Pincode / ZIP
                                </label>
                                <Input
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="400001"
                                    className="text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Internal Notes & Relationship Summary
                            </label>
                            <Input
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Key vendor agreement, preferred payment terms, NDA signed..."
                                className="text-xs"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="text-xs"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    {isEdit ? 'Update Organization' : 'Create Organization'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
