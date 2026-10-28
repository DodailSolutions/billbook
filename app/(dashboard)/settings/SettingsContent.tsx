'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User, Lock, Mail, Phone, Save, Key, Shield, Bell,
    CheckCircle2, AlertCircle, Camera, Globe, Clock,
    Crown, Zap, Eye, EyeOff, Building2, FileText, Check,
    Sparkles, ArrowRight, RotateCcw, Copy, CheckCheck, Loader2,
    Trash2, UploadCloud
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfile, updateAvatar, changePassword, updateEmail, type UserProfile, type UpdateProfileInput } from './actions'
import { getPlanStatus } from '@/app/(dashboard)/plan-actions'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages'
import type { PlanStatus } from '@/lib/plan-utils'

interface SettingsContentProps {
    initialProfile: UserProfile | null
    planStatus?: PlanStatus | null
}

type TabType = 'profile' | 'business' | 'security' | 'notifications'

const TIMEZONE_OPTIONS = [
    { value: 'Asia/Kolkata', label: '🇮🇳 India (IST • GMT+5:30)' },
    { value: 'Asia/Dubai', label: '🇦🇪 Dubai (GST • GMT+4:00)' },
    { value: 'America/New_York', label: '🇺🇸 New York (EST • GMT-5:00)' },
    { value: 'America/Los_Angeles', label: '🇺🇸 Los Angeles (PST • GMT-8:00)' },
    { value: 'Europe/London', label: '🇬🇧 London (GMT • GMT+0:00)' },
    { value: 'Asia/Singapore', label: '🇸🇬 Singapore (SGT • GMT+8:00)' },
    { value: 'Australia/Sydney', label: '🇦🇺 Sydney (AEST • GMT+10:00)' },
    { value: 'Europe/Berlin', label: '🇩🇪 Berlin (CET • GMT+1:00)' }
]

const BUSINESS_TYPE_OPTIONS = [
    'Sole Proprietorship',
    'Private Limited (Pvt Ltd)',
    'Limited Liability Partnership (LLP)',
    'Partnership Firm',
    'Freelancer / Individual',
    'Public Limited Company',
    'Non-Profit / Society'
]

export default function SettingsContent({ initialProfile, planStatus: initialPlanStatus }: SettingsContentProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [planStatus, setPlanStatus] = useState<PlanStatus | null>(initialPlanStatus ?? null)
    const [copiedEmail, setCopiedEmail] = useState(false)

    // Avatar state & upload ref
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '')
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    // Refresh plan status client-side for accuracy
    useEffect(() => {
        getPlanStatus().then(setPlanStatus).catch(() => {})
    }, [])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Please select a valid image file (PNG, JPG, WEBP)')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'Image size must be under 5MB')
            return
        }

        try {
            setIsUploadingAvatar(true)

            // Read and compress image using HTML5 Canvas to keep payload optimized and crisp
            const reader = new FileReader()
            reader.onload = async (event) => {
                const img = new window.Image()
                img.onload = async () => {
                    const canvas = document.createElement('canvas')
                    const size = 300 // High-DPI 300x300 square crop
                    canvas.width = size
                    canvas.height = size
                    const ctx = canvas.getContext('2d')

                    if (ctx) {
                        const minDim = Math.min(img.width, img.height)
                        const startX = (img.width - minDim) / 2
                        const startY = (img.height - minDim) / 2
                        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size)
                        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88)

                        setAvatarUrl(optimizedBase64)
                        try {
                            const res = await updateAvatar(optimizedBase64)
                            showMessage('success', res.message)
                            router.refresh()
                        } catch (err: unknown) {
                            showMessage('error', err instanceof Error ? err.message : 'Failed to update profile picture')
                        } finally {
                            setIsUploadingAvatar(false)
                        }
                    }
                }
                img.src = event.target?.result as string
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error('Avatar upload error:', err)
            showMessage('error', 'Failed to process selected image')
            setIsUploadingAvatar(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return
        try {
            setIsUploadingAvatar(true)
            await updateAvatar(null)
            setAvatarUrl('')
            showMessage('success', 'Profile picture removed')
            router.refresh()
        } catch (err: unknown) {
            showMessage('error', err instanceof Error ? err.message : 'Failed to remove profile picture')
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    // Personal Profile form state
    const [fullName, setFullName] = useState(initialProfile?.full_name || initialProfile?.owner_name || '')
    const [phone, setPhone] = useState(initialProfile?.phone || '')
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata')

    // Business Profile form state
    const [businessName, setBusinessName] = useState(initialProfile?.business_name || '')
    const [businessType, setBusinessType] = useState(initialProfile?.business_type || 'Sole Proprietorship')
    const [gstin, setGstin] = useState(initialProfile?.gstin || '')
    const [businessPhone, setBusinessPhone] = useState(initialProfile?.business_phone || initialProfile?.phone || '')
    const [businessEmail, setBusinessEmail] = useState(initialProfile?.business_email || initialProfile?.email || '')
    const [businessAddress, setBusinessAddress] = useState(initialProfile?.business_address || '')

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

    // Notification states
    const [notifications, setNotifications] = useState({
        invoice_created: true,
        invoice_paid: true,
        invoice_overdue: true,
        reminder_sent: true,
        new_customer: false
    })

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 5000)
    }

    const handleCopyEmail = () => {
        if (!initialProfile?.email) return
        navigator.clipboard.writeText(initialProfile.email)
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
    }

    // Save Personal Profile
    const handleUpdatePersonalProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateProfile({ 
                full_name: fullName, 
                phone 
            })
            showMessage('success', 'Personal profile updated successfully!')
            router.refresh()
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to update personal profile')
        } finally {
            setLoading(false)
        }
    }

    // Save Business Profile
    const handleUpdateBusinessProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateProfile({
                business_name: businessName,
                business_type: businessType,
                gstin: gstin.toUpperCase(),
                business_phone: businessPhone,
                business_email: businessEmail,
                business_address: businessAddress
            })
            showMessage('success', 'Business profile updated successfully!')
            router.refresh()
        } catch (error: unknown) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to update business profile')
        } finally {
            setLoading(false)
        }
    }

    // Password Change
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

    // Email Change
    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail || !emailPassword) {
            showMessage('error', 'Please fill in all email fields')
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

    // Save Notifications
    const handleSaveNotifications = () => {
        showMessage('success', 'Notification preferences saved successfully!')
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
    const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'][passwordStrength]

    const isPro = planStatus?.hasActivePlan && planStatus.planSlug !== 'free'
    const isLifetime = planStatus?.isLifetime || planStatus?.planSlug?.includes('lifetime')
    const planLabel = isLifetime ? 'Founder Lifetime Pro' : isPro ? planStatus?.planName : 'Free Plan'

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile & Personal', icon: User },
        { id: 'business' as TabType, label: 'Business Details', icon: Building2 },
        { id: 'security' as TabType, label: 'Security', icon: Shield },
        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    ]

    const daysActive = initialProfile?.created_at
        ? Math.max(1, Math.floor((Date.now() - new Date(initialProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 1

    const memberSince = initialProfile?.created_at
        ? new Date(initialProfile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : 'Recently'

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Account Settings
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your personal profile, business entity, security, and notification preferences.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/settings/email"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors shrink-0"
                    >
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span>Email &amp; Templates</span>
                    </Link>
                    <Link
                        href="/invoices/settings"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs sm:text-sm font-semibold border border-blue-200/60 dark:border-blue-800 shadow-2xs transition-colors shrink-0"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Invoice Template &rarr;</span>
                    </Link>
                </div>
            </div>

            {/* Notification Toast Message */}
            {message && (
                <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-sm transition-all ${
                    message.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {message.type === 'success'
                            ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />}
                        <span>{message.text}</span>
                    </div>
                    <button 
                        onClick={() => setMessage(null)}
                        className="text-xs opacity-70 hover:opacity-100 font-bold px-1.5 py-0.5"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Modern Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                                isActive
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Main Content Layout with items-start to prevent card stretching */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
                {/* ── Left Sidebar Profile Card ── */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        {/* Header Gradient */}
                        <div className="h-24 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                            <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-black/25 text-white backdrop-blur-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active
                                </span>
                            </div>
                        </div>

                        {/* Avatar & User Details */}
                        <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
                            {/* Hidden File Input for Avatar Upload */}
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarChange}
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                            />

                            <div className="relative mb-3 group">
                                {/* Interactive Avatar Circle */}
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all active:scale-95 group cursor-pointer block"
                                    title="Click to upload profile photo"
                                >
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile photo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                                            {(fullName || initialProfile?.business_name || initialProfile?.email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}

                                    {/* Hover overlay with Camera */}
                                    <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs">
                                        <Camera className="h-5 w-5 mb-0.5" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                                    </div>

                                    {/* Uploading Spinner Overlay */}
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                        </div>
                                    )}
                                </button>

                                {/* Camera Trigger Button */}
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-all hover:scale-110 cursor-pointer"
                                    title="Upload new profile picture"
                                >
                                    {isUploadingAvatar ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                                    ) : (
                                        <Camera className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </button>
                            </div>

                            {/* Remove photo option if custom avatar is set */}
                            {avatarUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    disabled={isUploadingAvatar}
                                    className="text-[11px] text-slate-400 hover:text-rose-600 underline font-medium transition-colors mb-2 -mt-1 cursor-pointer"
                                >
                                    Remove photo
                                </button>
                            )}

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {fullName || initialProfile?.business_name || 'Business Owner'}
                            </h3>
                            
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                                <span className="truncate max-w-[200px]">{initialProfile?.email}</span>
                                <button
                                    onClick={handleCopyEmail}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    title="Copy email address"
                                >
                                    {copiedEmail ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>

                            {/* Plan Badge */}
                            <div className="mb-4">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                                    isLifetime
                                        ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white'
                                        : isPro
                                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                    {isLifetime || isPro ? <Crown className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                                    <span>{planLabel}</span>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-center">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{daysActive}</p>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Days Active</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                                        {isLifetime ? 'Unlimited' : isPro ? 'Pro' : '50 Free'}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Invoicing Cap</p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                                Member since {memberSince}
                            </p>
                        </div>
                    </div>

                    {/* Quick Shortcuts Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            Quick Preferences
                        </p>
                        <Link
                            href="/settings/email"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <span className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                Custom SMTP &amp; Templates
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                        <Link
                            href="/invoices/settings"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-600" />
                                Invoice Color &amp; Branding
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                        <Link
                            href="/help"
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Priority Help &amp; Support
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                    </div>
                </div>

                {/* ── Right Content Panels (Tabs) ── */}
                <div className="lg:col-span-2">
                    {/* TAB 1: Profile & Personal */}
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Personal Information
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Update your name, primary contact details, and display preferences.
                                </p>
                            </div>

                            <form onSubmit={handleUpdatePersonalProfile} className="p-5 sm:p-6 space-y-5">
                                {/* Email Address (Locked & Verified) */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={initialProfile?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-24 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs sm:text-sm cursor-not-allowed font-medium"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                            <Check className="h-3 w-3 text-emerald-600" /> Verified
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                                        <Shield className="h-3 w-3 text-slate-400" />
                                        To update your email, switch to the{' '}
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('security')}
                                            className="text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-700"
                                        >
                                            Security tab
                                        </button>.
                                    </p>
                                </div>

                                {/* Full Name & Phone */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="e.g. Ravitej Mathurthi"
                                                className="pl-10 text-xs sm:text-sm rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="pl-10 text-xs sm:text-sm rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Language & Timezone */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <Globe className="h-4 w-4 text-slate-400" />
                                                Display Language
                                            </span>
                                        </label>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            {SUPPORTED_LANGUAGES.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.name} ({lang.nativeName})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                Timezone &amp; Regional Time
                                            </span>
                                        </label>
                                        <select
                                            value={selectedTimezone}
                                            onChange={(e) => setSelectedTimezone(e.target.value)}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            {TIMEZONE_OPTIONS.map((tz) => (
                                                <option key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Form Actions Footer */}
                                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFullName(initialProfile?.full_name || initialProfile?.owner_name || '')
                                            setPhone(initialProfile?.phone || '')
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Reset</span>
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Saving…</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: Business Details */}
                    {activeTab === 'business' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Business &amp; Company Details
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Configure your registered business name, legal entity structure, GSTIN, and official address.
                                </p>
                            </div>

                            <form onSubmit={handleUpdateBusinessProfile} className="p-5 sm:p-6 space-y-5">
                                {/* Business Name & Legal Structure */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Registered Business Name *
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="text"
                                                required
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="e.g. Dodail Solutions Pvt Ltd"
                                                className="pl-10 text-xs sm:text-sm rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Entity / Business Type
                                        </label>
                                        <select
                                            value={businessType}
                                            onChange={(e) => setBusinessType(e.target.value)}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            {BUSINESS_TYPE_OPTIONS.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* GSTIN & Business Phone */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            GSTIN / Tax Identification
                                        </label>
                                        <Input
                                            type="text"
                                            value={gstin}
                                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                            placeholder="e.g. 29AAAAA0000A1Z5"
                                            className="uppercase font-mono text-xs sm:text-sm rounded-xl"
                                        />
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                            15-character alphanumeric GSTIN for Indian businesses.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Official Billing Phone
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                type="tel"
                                                value={businessPhone}
                                                onChange={(e) => setBusinessPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="pl-10 text-xs sm:text-sm rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Email */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Public Business Email (for Invoices &amp; Receipts)
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="email"
                                            value={businessEmail}
                                            onChange={(e) => setBusinessEmail(e.target.value)}
                                            placeholder="billing@company.com"
                                            className="pl-10 text-xs sm:text-sm rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Business Address */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Registered Business Address
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={businessAddress}
                                        onChange={(e) => setBusinessAddress(e.target.value)}
                                        placeholder="Suite / Floor, Building Name, Street, City, State, PIN Code"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-medium"
                                    />
                                </div>

                                {/* Form Actions Footer */}
                                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBusinessName(initialProfile?.business_name || '')
                                            setBusinessType(initialProfile?.business_type || 'Sole Proprietorship')
                                            setGstin(initialProfile?.gstin || '')
                                            setBusinessPhone(initialProfile?.business_phone || '')
                                            setBusinessEmail(initialProfile?.business_email || '')
                                            setBusinessAddress(initialProfile?.business_address || '')
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Reset</span>
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Saving…</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Save Business Details</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 3: Security */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Security Status Overview */}
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    { icon: CheckCircle2, label: 'Password Security', value: 'Protected', bg: 'bg-emerald-50 dark:bg-emerald-950/40', ring: 'bg-emerald-100 dark:bg-emerald-900/60', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800' },
                                    { icon: Shield, label: 'Email Verification', value: 'Verified', bg: 'bg-blue-50 dark:bg-blue-950/40', ring: 'bg-blue-100 dark:bg-blue-900/60', iconColor: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-800' },
                                    { icon: Key, label: 'Authentication', value: 'Active Session', bg: 'bg-purple-50 dark:bg-purple-950/40', ring: 'bg-purple-100 dark:bg-purple-900/60', iconColor: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800' },
                                ].map((card) => (
                                    <div key={card.label} className={`flex items-center gap-3.5 p-3.5 rounded-2xl border ${card.border} ${card.bg}`}>
                                        <div className={`p-2.5 rounded-xl ${card.ring}`}>
                                            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
                                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{card.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Change Password Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-blue-600" />
                                            Change Password
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Update your password to keep your business account secure.
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-flex text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-800">
                                        Recommended every 90 days
                                    </span>
                                </div>

                                <form onSubmit={handleChangePassword} className="p-5 sm:p-6 space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Current Password *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPw ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="pr-10 text-xs sm:text-sm rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPw(!showCurrentPw)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password & Confirm Password */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                New Password *
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type={showNewPw ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={8}
                                                    className="pr-10 text-xs sm:text-sm rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPw(!showNewPw)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>

                                            {/* Password Strength bar */}
                                            {newPassword && (
                                                <div className="mt-2.5 space-y-1.5">
                                                    <div className="flex gap-1.5">
                                                        {[1, 2, 3, 4, 5].map((i) => (
                                                            <div 
                                                                key={i} 
                                                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                                    i <= passwordStrength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'
                                                                }`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        Strength: <span className="font-bold text-slate-800 dark:text-slate-200">{strengthLabel}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Confirm New Password *
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPw ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={8}
                                                    className="pr-10 text-xs sm:text-sm rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {confirmPassword && (
                                                <p className={`text-[11px] mt-1.5 flex items-center gap-1 font-semibold ${
                                                    newPassword === confirmPassword ? 'text-emerald-600' : 'text-rose-500'
                                                }`}>
                                                    {newPassword === confirmPassword
                                                        ? <><Check className="h-3.5 w-3.5" /> Passwords match</>
                                                        : <><AlertCircle className="h-3.5 w-3.5" /> Passwords do not match</>}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            type="submit"
                                            disabled={loading || !newPassword || !currentPassword || newPassword !== confirmPassword}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Key className="h-4 w-4" />
                                            <span>{loading ? 'Updating…' : 'Change Password'}</span>
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {/* Change Email Address Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-indigo-600" />
                                        Change Primary Email Address
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                        <span>Current Login Email:</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                            {initialProfile?.email}
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateEmail} className="p-5 sm:p-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                New Email Address *
                                            </label>
                                            <Input
                                                type="email"
                                                required
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="newemail@domain.com"
                                                className="text-xs sm:text-sm rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Confirm with Current Password *
                                            </label>
                                            <Input
                                                type="password"
                                                required
                                                value={emailPassword}
                                                onChange={(e) => setEmailPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="text-xs sm:text-sm rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                                        <span>
                                            A secure verification link will be dispatched to your new email. You must click that link to finalize the email change.
                                        </span>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            type="submit"
                                            disabled={loading || !newEmail || !emailPassword}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span>{loading ? 'Sending Link…' : 'Send Verification Email'}</span>
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                    Notification Preferences
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Control which system alerts, customer actions, and payment notices you receive.
                                </p>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { key: 'invoice_created', label: 'Invoice Generated', desc: 'Notify when an invoice or proforma is created or finalized', icon: '📄', color: 'from-blue-500 to-cyan-500' },
                                    { key: 'invoice_paid', label: 'Payment Received', desc: 'Immediate notification when a client pays via Razorpay or UPI', icon: '💰', color: 'from-emerald-500 to-green-600' },
                                    { key: 'invoice_overdue', label: 'Invoice Overdue Alert', desc: 'Alert when an invoice passes its due date without payment', icon: '⏰', color: 'from-amber-500 to-red-500' },
                                    { key: 'reminder_sent', label: 'Automated Reminders', desc: 'Confirmation when WhatsApp or email reminders are sent', icon: '🔔', color: 'from-purple-500 to-pink-500' },
                                    { key: 'new_customer', label: 'Customer Management Alerts', desc: 'Alerts when a client updates details or requests GST statement', icon: '👤', color: 'from-indigo-500 to-purple-500' }
                                ].map((item) => {
                                    const isChecked = notifications[item.key as keyof typeof notifications]
                                    return (
                                        <div key={item.key} className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <div className="flex items-center gap-3.5">
                                                <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center text-sm shadow-2xs shrink-0`}>
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                        {item.label}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNotifications({ invoice_created: true, invoice_paid: true, invoice_overdue: true, reminder_sent: true, new_customer: true })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                        <Check className="h-3.5 w-3.5" /> Enable All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNotifications({ invoice_created: false, invoice_paid: false, invoice_overdue: false, reminder_sent: false, new_customer: false })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        Disable All
                                    </button>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleSaveNotifications}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all self-end sm:self-auto"
                                >
                                    <Save className="h-4 w-4" /> Save Preferences
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
