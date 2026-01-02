'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { markReminderAsSent, deleteReminder } from './actions'
import type { ReminderWithDetails } from '@/lib/types'

interface ReminderActionsProps {
    reminder: ReminderWithDetails
}

export default function ReminderActions({ reminder }: ReminderActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleMarkAsSent = async () => {
        setIsLoading(true)
        try {
            const result = await markReminderAsSent(reminder.id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Failed to mark reminder as sent')
            }
        } catch (err) {
            console.error('Error marking reminder as sent:', err)
            alert('Failed to mark reminder as sent')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDismiss = async () => {
        if (confirm('Dismiss this reminder?')) {
            setIsLoading(true)
            try {
                const result = await deleteReminder(reminder.id)
                if (result.success) {
                    router.refresh()
                } else {
                    alert(result.error || 'Failed to dismiss reminder')
                }
            } catch (err) {
                console.error('Error dismissing reminder:', err)
                alert('Failed to dismiss reminder')
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsSent}
                disabled={isLoading}
                className="flex-1"
            >
                <Check className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                Mark Sent
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                disabled={isLoading}
            >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
        </div>
    )
}
