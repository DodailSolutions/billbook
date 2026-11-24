'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createCustomerAction } from '../actions'
import { Loader2, AlertCircle, Building2, Briefcase } from 'lucide-react'

interface NewCustomerFormProps {
    organizations?: any[]
}

export function NewCustomerForm({ organizations = [] }: NewCustomerFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrgId, setSelectedOrgId] = useState('')
    const [gstin, setGstin] = useState('')
    const [address, setAddress] = useState('')

    const handleOrgChange = (orgId: string) => {
        setSelectedOrgId(orgId)
        if (orgId) {
            const org = organizations.find((o: any) => o.id === orgId)
            if (org) {
                if (org.gstin && !gstin) {
                    setGstin(org.gstin)
                }
                const parts = [org.address, org.city, org.state, org.pincode].filter(Boolean)
                if (parts.length > 0 && !address) {
                    setAddress(parts.join(', '))
                }
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const res = await createCustomerAction(formData)

            if (res.success) {
                router.push('/customers')
                router.refresh()
            } else {
                setError(res.error || 'Failed to create customer.')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                </div>
            )}

            {/* Organization / Company Selector */}
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <label htmlFor="organization_id" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Linked Organization / Company
                </label>
                <select
                    id="organization_id"
                    name="organization_id"
                    value={selectedOrgId}
                    onChange={(e) => handleOrgChange(e.target.value)}
                    disabled={loading}
                    className="flex h-10 w-full rounded-lg border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                    <option value="">-- No Organization (Individual B2C) --</option>
                    {organizations.map((org: any) => (
                        <option key={org.id} value={org.id}>
                            {org.name} {org.city ? `(${org.city})` : ''}
                        </option>
                    ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                    Link this customer to a company to inherit corporate GSTIN and invoice billing details.
                </p>
            </div>

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                </label>
                <Input id="name" name="name" placeholder="Customer or Contact Name" required disabled={loading} />
            </div>

            {/* Designation / Role */}
            <div className="space-y-2">
                <label htmlFor="designation" className="text-sm font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                    Designation / Role
                </label>
                <Input
                    id="designation"
                    name="designation"
                    placeholder="e.g. Accounts Manager, Director, Billing Contact"
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <Input id="email" name="email" type="email" placeholder="billing@client.com" disabled={loading} />
            </div>

            <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                </label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" disabled={loading} />
            </div>

            <div className="space-y-2">
                <label htmlFor="gstin" className="text-sm font-medium">
                    GSTIN
                </label>
                <Input
                    id="gstin"
                    name="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    className="uppercase font-mono"
                    disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground">Optional 15-digit GST Identification Number</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                    Address
                </label>
                <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Billing street address, city, state, pincode"
                    disabled={loading}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Customer...
                        </>
                    ) : (
                        'Create Customer'
                    )}
                </Button>
                <Link href="/customers" className="flex-1">
                    <Button variant="outline" type="button" className="w-full" disabled={loading}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
