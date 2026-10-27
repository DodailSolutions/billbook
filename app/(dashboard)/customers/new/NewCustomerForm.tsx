'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createCustomerAction } from '../actions'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export function NewCustomerForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                </label>
                <Input id="name" name="name" placeholder="Customer or Company Name" required disabled={loading} />
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
                    placeholder="Billing street address, city, state, pincode"
                    disabled={loading}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Customer...
                        </>
                    ) : (
                        'Create Customer'
                    )}
                </Button>
                <Link href="/customers" className="flex-1">
                    <Button type="button" variant="outline" disabled={loading} className="w-full">
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
