'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { 
    updateRecurringInvoiceStatus, 
    deleteRecurringInvoice, 
    generateInvoiceFromRecurring 
} from './actions'
import type { RecurringInvoiceWithDetails } from '@/lib/types'

interface RecurringInvoiceActionsProps {
    recurringInvoice: RecurringInvoiceWithDetails
}

export default function RecurringInvoiceActions({ recurringInvoice }: RecurringInvoiceActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [action, setAction] = useState<string | null>(null)

    const handleToggleStatus = async () => {
        if (confirm(`Are you sure you want to ${recurringInvoice.is_active ? 'pause' : 'activate'} this recurring invoice?`)) {
            setIsLoading(true)
            setAction('toggle')
            try {
                await updateRecurringInvoiceStatus(recurringInvoice.id, !recurringInvoice.is_active)
                router.refresh()
            } catch (err) {
                console.error('Error toggling status:', err)
                alert('Failed to update status')
            } finally {
                setIsLoading(false)
                setAction(null)
            }
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this recurring invoice? This action cannot be undone.')) {
            setIsLoading(true)
            setAction('delete')
            try {
                await deleteRecurringInvoice(recurringInvoice.id)
                router.refresh()
            } catch (err) {
                console.error('Error deleting recurring invoice:', err)
                alert('Failed to delete recurring invoice')
            } finally {
                setIsLoading(false)
                setAction(null)
            }
        }
    }

    const handleGenerateNow = async () => {
        if (confirm('Generate an invoice now from this recurring template?')) {
            setIsLoading(true)
            setAction('generate')
            try {
                await generateInvoiceFromRecurring(recurringInvoice.id)
                alert('Invoice generated successfully!')
                router.push('/invoices')
            } catch (err) {
                console.error('Error generating invoice:', err)
                alert('Failed to generate invoice')
            } finally {
                setIsLoading(false)
                setAction(null)
            }
        }
    }

    return (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNow}
                disabled={isLoading}
                className="flex-1"
            >
                {isLoading && action === 'generate' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Generate Now
                    </>
                )}
            </Button>
            
            <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isLoading}
            >
                {isLoading && action === 'toggle' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : recurringInvoice.is_active ? (
                    <Pause className="h-4 w-4" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
            >
                {isLoading && action === 'delete' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                )}
            </Button>
        </div>
    )
}
