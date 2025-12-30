import { Bell, Calendar, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { getUpcomingReminders } from './actions'
import ReminderActions from './ReminderActions'
import { formatDate } from '@/lib/utils'

export default async function RemindersPage() {
    const reminders = await getUpcomingReminders(30) // Next 30 days

    const groupedReminders = reminders.reduce((acc, reminder) => {
        const date = reminder.reminder_date
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(reminder)
        return acc
    }, {} as Record<string, typeof reminders>)

    const sortedDates = Object.keys(groupedReminders).sort()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Payment Reminders
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Upcoming payment reminders for the next 30 days
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {reminders.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Bell className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                                No upcoming reminders
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You&apos;re all caught up! No payment reminders in the next 30 days.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map((date) => {
                        const dateReminders = groupedReminders[date]
                        const dateObj = new Date(date)
                        const isToday = date === new Date().toISOString().split('T')[0]
                        const isPast = dateObj < new Date(new Date().toISOString().split('T')[0])

                        return (
                            <div key={date} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h2>
                                    {isPast && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                            Overdue
                                        </span>
                                    )}
                                    {isToday && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            Today
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {dateReminders.map((reminder) => (
                                        <Card 
                                            key={reminder.id} 
                                            className={`hover:shadow-lg transition-all ${
                                                isPast ? 'border-red-200' : isToday ? 'border-blue-200' : ''
                                            }`}
                                        >
                                            <div className="p-5 space-y-3">
                                                {/* Reminder Type Badge */}
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        reminder.reminder_type === 'overdue' 
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                                            : reminder.reminder_type === 'due_date'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                                                    }`}>
                                                        {reminder.reminder_type.replace('_', ' ')}
                                                    </span>
                                                    {isPast && (
                                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    )}
                                                </div>

                                                {/* Invoice Details */}
                                                {reminder.invoice && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {reminder.invoice.invoice_number}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                ₹{reminder.invoice.total.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            Due: {formatDate(reminder.invoice.due_date || '')}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Recurring Invoice Details */}
                                                {reminder.recurring_invoice && (
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            Recurring Invoice
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            Next: {formatDate(reminder.recurring_invoice.next_invoice_date)}
                                                        </div>
                                                        <div className="text-xs text-purple-600 dark:text-purple-400 capitalize">
                                                            {reminder.recurring_invoice.frequency}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Message */}
                                                {reminder.message && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-2">
                                                        {reminder.message}
                                                    </p>
                                                )}

                                                {/* Days Before */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Bell className="h-3 w-3" />
                                                    <span>{reminder.days_before} days notice</span>
                                                </div>

                                                {/* Actions */}
                                                <ReminderActions reminder={reminder} />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
