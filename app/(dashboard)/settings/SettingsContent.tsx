'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    User, Lock, Mail, Phone, Save, Key, Shield, Bell,
    CheckCircle, AlertCircle, Camera, Globe, Clock,
    Crown, Zap, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfile, changePassword, updateEmail, type UserProfile } from './actions'
import { getPlanStatus } from '@/app/(dashboard)/plan-actions'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages'
import type { PlanStatus } from '@/lib/plan-utils'

interface SettingsContentProps {
    initialProfile: UserProfile | null
    planStatus: PlanStatus | null
}

type TabType = 'profile' | 'security' | 'notifications'

export default function SettingsContent({ initialProfile, planStatus: initialPlanStatus }: SettingsContentProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [planStatus, setPlanStatus] = useState<PlanStatus | null>(initialPlanStatus)

    // Refresh plan status client-side (same as PlanBanner) for accuracy
    useEffect(() => {
        getPlanStatus().then(setPlanStatus).catch(() => {})
    }, [])

    // Profile form state
    const [fullName, setFullName] = useState(initialProfile?.full_name || '')
    const [phone, setPhone] = useState(initialProfile?.phone || '')
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata')

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [showConfirmPw, setShowConfirmPw] = useState(false)

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

    // Password strength calculation
    const passwordStrength = (() => {
        if (!newPassword) return 0
        let score = 0
        if (newPassword.length >= 8) score++
        if (newPassword.length >= 12) score++
        if (/[A-Z]/.test(newPassword)) score++
        if (/[0-9]/.test(newPassword)) score++
        if (/[^A-Za-z0-9]/.test(newPassword)) score++
        return score
    })()

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordStrength]
    const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][passwordStrength]

    const isPro = planStatus?.hasActivePlan && planStatus.planSlug !== 'free'
    const isLifetime = planStatus?.isLifetime
    const planLabel = isLifetime ? 'Lifetime Pro' : isPro ? planStatus?.planName : 'Free'

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: User },
        { id: 'security' as TabType, label: 'Security', icon: Shield },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    ]

    const daysActive = initialProfile?.created_at
        ? Math.floor((Date.now() - new Date(initialProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0

    const memberSince = initialProfile?.created_at
        ? new Date(initialProfile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : ''

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your profile, security, and notification preferences</p>
            </div>

            {/* Toast Message */}
            {message && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm ${
                    message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {message.type === 'success'
                        ? <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                        : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
                    {message.text}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Sidebar card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Banner */}
                            <div className="h-20 bg-linear-to-r from-blue-500 to-purple-600" />

                            {/* Avatar + info */}
                            <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-lg">
                                        {(fullName || initialProfile?.email || 'U')[0].toUpperCase()}
                                    </div>
                                    <button
                                        type="button"
                                        title="Change avatar"
                                        className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <Camera className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                </div>

                                <p className="text-base font-semibold text-gray-900 leading-tight">
                                    {fullName || 'Your Name'}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 mb-3">
                                    {initialProfile?.email}
                                </p>

                                {/* Plan badge */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                    isLifetime
                                        ? 'bg-linear-to-r from-amber-400 to-orange-500 text-white shadow-sm'
                                        : isPro
                                        ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {isLifetime || isPro
                                        ? <Crown className="h-3 w-3" />
                                        : <Zap className="h-3 w-3" />}
                                    {planLabel}
                                </div>

                                {/* Stats row */}
                                <div className="w-full mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">{daysActive}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Days Active</p>
                                    </div>
                                    <div className="border-l border-gray-100">
                                        <p className="text-xl font-bold text-gray-900">
                                            {isLifetime ? '∞' : isPro ? 'Pro' : 'Free'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">Plan</p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 mt-4">Member since {memberSince}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Update your personal details and preferences</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="px-6 py-5 space-y-5">
                                {/* Email (read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={initialProfile?.email || ''}
                                            disabled
                                            className="w-full pl-9 pr-24 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                                            Verified
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        Change your email in the Security tab
                                    </p>
                                </div>

                                {/* Name + Phone */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="John Doe"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Language + Timezone */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-gray-400" />Language</span>
                                        </label>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {SUPPORTED_LANGUAGES.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.nativeName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />Timezone</span>
                                        </label>
                                        <select
                                            value={selectedTimezone}
                                            onChange={(e) => setSelectedTimezone(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Asia/Kolkata">🇮🇳 India (IST)</option>
                                            <option value="America/New_York">🇺🇸 New York (EST)</option>
                                            <option value="Europe/London">🇬🇧 London (GMT)</option>
                                            <option value="Asia/Dubai">🇦🇪 Dubai (GST)</option>
                                            <option value="Asia/Singapore">🇸🇬 Singapore (SGT)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFullName(initialProfile?.full_name || '')
                                            setPhone(initialProfile?.phone || '')
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5"
                                    >
                                        <Save className="h-4 w-4" />
                                        {loading ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
                <div className="space-y-5">
                    {/* Status cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { icon: CheckCircle, label: 'Password', value: 'Strong', bg: 'bg-green-50', ring: 'bg-green-100', iconColor: 'text-green-600', border: 'border-green-100' },
                            { icon: Shield, label: 'Email', value: 'Verified', bg: 'bg-blue-50', ring: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-100' },
                            { icon: Key, label: 'Last Changed', value: '30d ago', bg: 'bg-purple-50', ring: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-100' },
                        ].map((card) => (
                            <div key={card.label} className={`flex items-center gap-4 p-4 rounded-xl border ${card.border} ${card.bg}`}>
                                <div className={`p-2.5 rounded-full ${card.ring}`}>
                                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{card.label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-blue-600" /> Change Password
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">Update your password to keep your account secure</p>
                            </div>
                            <span className="hidden sm:block text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                                Recommended every 90 days
                            </span>
                        </div>

                        <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
                            {/* Current password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="pr-10"
                                    />
                                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* New password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPw ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {newPassword && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex gap-1">
                                                {[1,2,3,4,5].map((i) => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500">Strength: <span className="font-medium text-gray-700">{strengthLabel}</span></p>
                                        </div>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        {[
                                            { check: newPassword.length >= 8, label: 'At least 8 characters' },
                                            { check: /[A-Z]/.test(newPassword), label: 'One uppercase letter' },
                                            { check: /[0-9]/.test(newPassword), label: 'One number' },
                                        ].map(({ check, label }) => (
                                            <p key={label} className={`text-xs flex items-center gap-1 transition-colors ${check ? 'text-green-600' : 'text-gray-400'}`}>
                                                <CheckCircle className="h-3 w-3" /> {label}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPw ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                            className="pr-10"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && (
                                        <p className={`text-xs mt-2 flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                            {newPassword === confirmPassword
                                                ? <><CheckCircle className="h-3 w-3" /> Passwords match</>
                                                : <><AlertCircle className="h-3 w-3" /> Passwords do not match</>}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button"
                                    onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <Button type="submit" disabled={loading || (!!confirmPassword && newPassword !== confirmPassword)}
                                    className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5">
                                    <Key className="h-4 w-4" />
                                    {loading ? 'Changing…' : 'Change Password'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Change Email */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-purple-600" /> Change Email Address
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm text-gray-500">Current:</span>
                                <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                    {initialProfile?.email}
                                </span>
                                <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Verified
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateEmail} className="px-6 py-5 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Email Address</label>
                                    <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="newemail@example.com" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm with Password</label>
                                    <Input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)}
                                        placeholder="••••••••" required />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                                A confirmation link will be sent to the new address. Verify it to complete the change.
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button"
                                    onClick={() => { setNewEmail(''); setEmailPassword('') }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <Button type="submit" disabled={loading}
                                    className="flex items-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5">
                                    <Mail className="h-4 w-4" />
                                    {loading ? 'Updating…' : 'Update Email'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <Bell className="h-4 w-4 text-blue-600" /> Notification Preferences
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">Choose which events you want to be notified about</p>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {[
                                { id: 'invoice_created', label: 'Invoice Created', description: 'When a new invoice is created', icon: '📄', color: 'from-blue-500 to-cyan-500' },
                                { id: 'invoice_paid', label: 'Invoice Paid', description: 'When an invoice is marked as paid', icon: '💰', color: 'from-green-500 to-emerald-500' },
                                { id: 'invoice_overdue', label: 'Invoice Overdue', description: 'When an invoice becomes overdue', icon: '⏰', color: 'from-orange-500 to-red-500' },
                                { id: 'reminder_sent', label: 'Reminder Sent', description: 'When payment reminders are sent', icon: '🔔', color: 'from-purple-500 to-pink-500' },
                                { id: 'new_customer', label: 'New Customer', description: 'When a new customer is added', icon: '👤', color: 'from-indigo-500 to-purple-500' },
                            ].map((n) => (
                                <div key={n.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg bg-linear-to-br ${n.color} flex items-center justify-center text-base shadow-sm`}>
                                            {n.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{n.label}</p>
                                            <p className="text-xs text-gray-500">{n.description}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:border-white" />
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex gap-2">
                                <button type="button"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                                    <CheckCircle className="h-3.5 w-3.5" /> Enable All
                                </button>
                                <button type="button"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                                    <AlertCircle className="h-3.5 w-3.5" /> Disable All
                                </button>
                            </div>
                            <Button type="button"
                                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 self-end sm:self-auto">
                                <Save className="h-4 w-4" /> Save Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

