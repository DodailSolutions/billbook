'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Mail, Phone, Save, Key, Shield, Bell, CheckCircle, AlertCircle, Camera, Globe, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { updateProfile, changePassword, updateEmail, type UserProfile } from './actions'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages'

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
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata')

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
                <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm animate-in slide-in-from-top-4 duration-300 ${
                    message.type === 'success' 
                        ? 'bg-linear-to-r from-green-50 to-emerald-50  text-green-800  border border-green-200 ' 
                        : 'bg-linear-to-r from-red-50 to-rose-50  text-red-800  border border-red-200 '
                }`}>
                    <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-green-100 ' : 'bg-red-100 '}`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 shrink-0" />
                        )}
                    </div>
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200p-1">
                <div className="flex gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all duration-200 rounded-md ${
                                    activeTab === tab.id
                                        ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-[1.02]'
                                        : 'text-gray-600 hover:bg-gray-100  hover:text-gray-900 '
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Sidebar */}
                    <Card className="lg:col-span-1">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {(fullName || 'U')[0].toUpperCase()}
                                </div>
                                <button 
                                    type="button"
                                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-100 hover:scale-110 transition-transform"
                                    title="Change avatar"
                                >
                                    <Camera className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                            
                            {/* User Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {fullName || 'User'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {initialProfile?.email}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="w-full pt-4 border-t border-gray-200">
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {Math.floor((Date.now() - new Date(initialProfile?.created_at || '').getTime()) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-xs text-gray-600">Days Active</p>
                                    </div>
                                    <div className="border-l border-gray-200"></div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">Free</p>
                                        <p className="text-xs text-gray-600">Plan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="w-full pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                    Member since {new Date(initialProfile?.created_at || '').toLocaleDateString('en-IN', { 
                                        month: 'short', 
                                        year: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Profile Form */}
                    <Card className="lg:col-span-2">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Personal Information
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Update your personal details and preferences
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            value={initialProfile?.email || ''}
                                            disabled
                                            className="bg-gray-50/50 border-gray-200"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            Verified
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        Change email in Security tab
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Full Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="border-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="border-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Globe className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Language
                                    </label>
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {SUPPORTED_LANGUAGES.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.flag} {lang.nativeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Timezone
                                    </label>
                                    <select
                                        value={selectedTimezone}
                                        onChange={(e) => setSelectedTimezone(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Asia/Kolkata">India (IST)</option>
                                        <option value="America/New_York">New York (EST)</option>
                                        <option value="Europe/London">London (GMT)</option>
                                        <option value="Asia/Dubai">Dubai (GST)</option>
                                        <option value="Asia/Singapore">Singapore (SGT)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setFullName(initialProfile?.full_name || '')
                                        setPhone(initialProfile?.phone || '')
                                    }}
                                    className="border-gray-300"
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Save className="h-4 w-4" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    {/* Security Overview */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Password Strength</p>
                                    <p className="text-lg font-semibold text-gray-900">Strong</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email Verified</p>
                                    <p className="text-lg font-semibold text-gray-900">Yes</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                                    <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Changed</p>
                                    <p className="text-lg font-semibold text-gray-900">30d ago</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Change Password */}
                    <Card>
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-blue-600" />
                                        Change Password
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Update your password to keep your account secure
                                    </p>
                                </div>
                                <div className="hidden sm:block px-3 py-1 bg-blue-100 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                    Recommended every 90 days
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="border-gray-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        className="border-gray-200"
                                    />
                                    <div className="mt-2 space-y-1">
                                        <p className={`text-xs flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-600'}`}>
                                            <CheckCircle className="h-3 w-3" />
                                            At least 8 characters
                                        </p>
                                        <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                                            <CheckCircle className="h-3 w-3" />
                                            One uppercase letter
                                        </p>
                                        <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                                            <CheckCircle className="h-3 w-3" />
                                            One number
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        className="border-gray-200"
                                    />
                                    {confirmPassword && (
                                        <p className={`text-xs mt-2 flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                            {newPassword === confirmPassword ? (
                                                <><CheckCircle className="h-3 w-3" /> Passwords match</>
                                            ) : (
                                                <><AlertCircle className="h-3 w-3" /> Passwords do not match</>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setCurrentPassword('')
                                        setNewPassword('')
                                        setConfirmPassword('')
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || newPassword !== confirmPassword}
                                    className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                                <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    Change Email Address
                                </h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Current email:</span>
                                    <span className="font-medium text-gray-900 px-3 py-1 bg-gray-100 rounded-full">
                                        {initialProfile?.email}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="newemail@example.com"
                                        required
                                        className="border-gray-200"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm with Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={emailPassword}
                                        onChange={(e) => setEmailPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="border-gray-200"
                                    />
                                    <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        For security, enter your password to confirm
                                    </p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <p className="text-sm text-yellow-800 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>You will receive a confirmation email at your new address. Please verify it to complete the change.</span>
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setNewEmail('')
                                        setEmailPassword('')
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
                <div className="space-y-6">
                    <Card>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                Notification Preferences
                            </h2>
                            <p className="text-sm text-gray-600">
                                Manage how you receive notifications
                            </p>
                        </div>

                        <div className="space-y-1">
                            {[
                                { 
                                    id: 'invoice_created', 
                                    label: 'Invoice Created', 
                                    description: 'Get notified when a new invoice is created',
                                    icon: '📝',
                                    color: 'from-blue-500 to-cyan-500'
                                },
                                { 
                                    id: 'invoice_paid', 
                                    label: 'Invoice Paid', 
                                    description: 'Get notified when an invoice is marked as paid',
                                    icon: '💰',
                                    color: 'from-green-500 to-emerald-500'
                                },
                                { 
                                    id: 'invoice_overdue', 
                                    label: 'Invoice Overdue', 
                                    description: 'Get notified when an invoice becomes overdue',
                                    icon: '⏰',
                                    color: 'from-orange-500 to-red-500'
                                },
                                { 
                                    id: 'reminder_sent', 
                                    label: 'Reminder Sent', 
                                    description: 'Get notified when payment reminders are sent',
                                    icon: '🔔',
                                    color: 'from-purple-500 to-pink-500'
                                },
                                { 
                                    id: 'new_customer', 
                                    label: 'New Customer', 
                                    description: 'Get notified when a new customer is added',
                                    icon: '👤',
                                    color: 'from-indigo-500 to-purple-500'
                                },
                            ].map((notification) => (
                                <div
                                    key={notification.id}
                                    className="group flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 /50 transition-all duration-200 border border-transparent hover:border-gray-200dark:hover:border-gray-700"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${notification.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow`}>
                                            <span className="text-lg">{notification.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.label}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {notification.description}
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-linear-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    // Reset all checkboxes logic here
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                type="button"
                                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Save className="h-4 w-4" />
                                Save Preferences
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Quick Actions
                            </h3>
                            <p className="text-sm text-gray-600">
                                Quickly manage all your notifications at once
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                className="p-4 text-left rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Enable All</p>
                                        <p className="text-xs text-gray-600">Turn on all notifications</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                className="p-4 text-left rounded-lg border-2 border-dashed border-red-300 dark:border-red-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Disable All</p>
                                        <p className="text-xs text-gray-600">Turn off all notifications</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
