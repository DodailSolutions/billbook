'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, Phone, Save, Key, Shield, Bell, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { updateProfile, changePassword, updateEmail, type UserProfile } from './actions'

interface SettingsContentProps {
    initialProfile: UserProfile | null
}

type TabType = 'profile' | 'security' | 'notifications'

export default function SettingsContent({ initialProfile }: SettingsContentProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Profile form state
    const [fullName, setFullName] = useState(initialProfile?.full_name || '')
    const [phone, setPhone] = useState(initialProfile?.phone || '')

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Email form state
    const [newEmail, setNewEmail] = useState('')
    const [emailPassword, setEmailPassword] = useState('')

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateProfile({ full_name: fullName, phone })
            showMessage('success', 'Profile updated successfully!')
            router.refresh()
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (newPassword !== confirmPassword) {
            showMessage('error', 'New passwords do not match')
            return
        }

        if (newPassword.length < 8) {
            showMessage('error', 'Password must be at least 8 characters long')
            return
        }

        setLoading(true)

        try {
            await changePassword(currentPassword, newPassword)
            showMessage('success', 'Password changed successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!newEmail || !emailPassword) {
            showMessage('error', 'Please fill in all fields')
            return
        }

        setLoading(true)

        try {
            const result = await updateEmail(newEmail, emailPassword)
            showMessage('success', result.message)
            setNewEmail('')
            setEmailPassword('')
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to update email')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ]

    return (
        <div className="space-y-6">
            {/* Message Banner */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0" />
                    )}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <Card>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Personal Information
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Update your personal details and contact information
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <Mail className="h-4 w-4 inline mr-1" />
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={initialProfile?.email || ''}
                                    disabled
                                    className="bg-gray-50 dark:bg-gray-800"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Email cannot be changed here. Use the Security tab to update.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <User className="h-4 w-4 inline mr-1" />
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    Phone Number
                                </label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="pt-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Member since: {new Date(initialProfile?.created_at || '').toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    {/* Change Password */}
                    <Card>
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Change Password
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Update your password to keep your account secure
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Current Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Must be at least 8 characters long
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Confirm New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <Key className="h-4 w-4" />
                                    {loading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Change Email */}
                    <Card>
                        <form onSubmit={handleUpdateEmail} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    Change Email Address
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Current email: <span className="font-medium text-gray-900 dark:text-gray-100">{initialProfile?.email}</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        New Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Enter new email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Confirm Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={emailPassword}
                                        onChange={(e) => setEmailPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        For security, please enter your password to change email
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    {loading ? 'Updating...' : 'Update Email'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <Card>
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Notification Preferences
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage how you receive notifications
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'invoice_created', label: 'Invoice Created', description: 'Get notified when a new invoice is created' },
                                { id: 'invoice_paid', label: 'Invoice Paid', description: 'Get notified when an invoice is marked as paid' },
                                { id: 'invoice_overdue', label: 'Invoice Overdue', description: 'Get notified when an invoice becomes overdue' },
                                { id: 'reminder_sent', label: 'Reminder Sent', description: 'Get notified when payment reminders are sent' },
                                { id: 'new_customer', label: 'New Customer', description: 'Get notified when a new customer is added' },
                            ].map((notification) => (
                                <div key={notification.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {notification.label}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {notification.description}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
