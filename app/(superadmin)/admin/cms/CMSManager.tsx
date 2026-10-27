'use client'

import { useState } from 'react'
import { 
    Globe, 
    Bell, 
    Sparkles, 
    Phone, 
    Mail, 
    MapPin, 
    HelpCircle, 
    Save, 
    Check, 
    Plus, 
    Trash2, 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    Layers, 
    ArrowRight,
    Server,
    Shield,
    Sliders,
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { RegionalCMSData, SubdomainConfig } from './types'
import { saveRegionalCMS, saveSubdomainConfig } from './actions'

interface CMSManagerProps {
    initialContent: Record<string, RegionalCMSData>
    initialSubdomains: SubdomainConfig
}

const REGION_TABS = [
    { id: 'IN', label: 'India', flag: '🇮🇳', domain: 'billbooky.dodail.com', path: '/' },
    { id: 'AE', label: 'UAE & Middle East', flag: '🇦🇪', domain: 'ae.billbooky.dodail.com', path: '/ae' },
    { id: 'US', label: 'US & Global', flag: '🇺🇸', domain: 'us.billbooky.dodail.com', path: '/us' },
    { id: 'ROUTING', label: 'Subdomains & Routing', flag: '🔀', domain: 'DNS Gateways', path: 'settings' }
]

export default function CMSManager({ initialContent, initialSubdomains }: CMSManagerProps) {
    const [activeTab, setActiveTab] = useState<string>('IN')
    const [contentByRegion, setContentByRegion] = useState<Record<string, RegionalCMSData>>(initialContent)
    const [subdomainConfig, setSubdomainConfig] = useState<SubdomainConfig>(initialSubdomains)
    const [isSaving, setIsSaving] = useState(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 3500)
    }

    const currentRegionContent = activeTab !== 'ROUTING' ? (contentByRegion[activeTab] || contentByRegion.IN) : null

    // Update field in current region
    const updateField = (section: keyof RegionalCMSData, field: string, value: any) => {
        if (!currentRegionContent) return
        setContentByRegion(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [section]: {
                    ...(prev[activeTab][section] as any),
                    [field]: value
                }
            }
        }))
    }

    // Save current active regional CMS
    const handleSaveRegion = async () => {
        if (!currentRegionContent) return
        setIsSaving(true)
        try {
            const res = await saveRegionalCMS(activeTab as any, currentRegionContent)
            if (res.success) {
                showToast(`Saved CMS content for ${activeTab === 'IN' ? 'India' : activeTab === 'AE' ? 'UAE' : 'US & Global'}!`)
            } else {
                alert(res.error || 'Failed to save content')
            }
        } catch (err) {
            console.error('Error saving CMS:', err)
            alert('An unexpected error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    // Save Subdomain routing
    const handleSaveRouting = async () => {
        setIsSaving(true)
        try {
            const res = await saveSubdomainConfig(subdomainConfig)
            if (res.success) {
                showToast('Subdomain routing configuration updated!')
            } else {
                alert(res.error || 'Failed to update routing')
            }
        } catch (err) {
            console.error('Error saving routing:', err)
            alert('An error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    // FAQ operations
    const handleAddFaq = () => {
        if (!currentRegionContent) return
        const newFaq = {
            id: `faq-${Date.now()}`,
            question: 'New Question?',
            answer: 'Detailed response for customers...',
            category: 'General',
            is_active: true
        }
        setContentByRegion(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                faqs: [...prev[activeTab].faqs, newFaq]
            }
        }))
    }

    const handleUpdateFaq = (index: number, field: string, val: any) => {
        if (!currentRegionContent) return
        const updated = [...currentRegionContent.faqs]
        updated[index] = { ...updated[index], [field]: val }
        setContentByRegion(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                faqs: updated
            }
        }))
    }

    const handleDeleteFaq = (index: number) => {
        if (!currentRegionContent) return
        const updated = currentRegionContent.faqs.filter((_, i) => i !== index)
        setContentByRegion(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                faqs: updated
            }
        }))
    }

    // Subdomain table operations
    const handleAddSubdomain = () => {
        const newSub = {
            subdomain: 'region.billbooky.dodail.com',
            targetRegion: 'IN' as const,
            label: 'New Regional Gateway',
            targetPath: '/',
            isActive: true,
            dnsStatus: 'configured' as const
        }
        setSubdomainConfig(prev => ({
            ...prev,
            subdomains: [...prev.subdomains, newSub]
        }))
    }

    const handleUpdateSubdomain = (index: number, field: string, val: any) => {
        const updated = [...subdomainConfig.subdomains]
        updated[index] = { ...updated[index], [field]: val }
        setSubdomainConfig(prev => ({ ...prev, subdomains: updated }))
    }

    const handleDeleteSubdomain = (index: number) => {
        setSubdomainConfig(prev => ({
            ...prev,
            subdomains: prev.subdomains.filter((_, i) => i !== index)
        }))
    }

    const themeColors = {
        blue: 'bg-blue-600 text-white',
        emerald: 'bg-emerald-600 text-white',
        purple: 'bg-purple-600 text-white',
        amber: 'bg-amber-600 text-white',
        rose: 'bg-rose-600 text-white'
    }

    return (
        <div className="space-y-6">
            {/* Toast message */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Location & Routing Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {REGION_TABS.map((tab) => {
                        const isSelected = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="text-sm">{tab.flag}</span>
                                <span>{tab.label}</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                    {tab.domain}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2 px-2">
                    {activeTab !== 'ROUTING' ? (
                        <>
                            <a
                                href={activeTab === 'AE' ? '/ae' : activeTab === 'US' ? '/us' : '/'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span>Preview Live Page</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <Button
                                size="sm"
                                onClick={handleSaveRegion}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                            >
                                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                <span>{isSaving ? 'Saving...' : 'Publish Content'}</span>
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            onClick={handleSaveRouting}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Routing Config</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* TAB CONTENT: Regional Location CMS (IN, AE, US) */}
            {activeTab !== 'ROUTING' && currentRegionContent && (
                <div className="space-y-6">
                    {/* 1. Announcement Banner */}
                    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Top Announcement & Promotional Banner
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400">
                                        Displayed across all pages for visitors browsing this region or subdomain
                                    </CardDescription>
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentRegionContent.announcement.enabled}
                                    onChange={(e) => updateField('announcement', 'enabled', e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {currentRegionContent.announcement.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </label>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Live Preview */}
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                    Live Banner Preview
                                </span>
                                <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs ${
                                    themeColors[currentRegionContent.announcement.theme] || themeColors.blue
                                }`}>
                                    <span>{currentRegionContent.announcement.message || 'Announcement message preview...'}</span>
                                    {currentRegionContent.announcement.linkText && (
                                        <span className="underline ml-2 whitespace-nowrap cursor-pointer">
                                            {currentRegionContent.announcement.linkText} →
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Announcement Message *
                                    </label>
                                    <Input
                                        value={currentRegionContent.announcement.message}
                                        onChange={(e) => updateField('announcement', 'message', e.target.value)}
                                        placeholder="e.g. 50% discount on yearly plans this month!"
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Banner Theme Color
                                    </label>
                                    <select
                                        value={currentRegionContent.announcement.theme}
                                        onChange={(e) => updateField('announcement', 'theme', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
                                    >
                                        <option value="blue">Royal Blue</option>
                                        <option value="emerald">Emerald Green (UAE/Success)</option>
                                        <option value="purple">Vibrant Purple</option>
                                        <option value="amber">Warm Amber</option>
                                        <option value="rose">Rose Red</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Button / Link Label (optional)
                                    </label>
                                    <Input
                                        value={currentRegionContent.announcement.linkText || ''}
                                        onChange={(e) => updateField('announcement', 'linkText', e.target.value)}
                                        placeholder="e.g. Claim Offer, View Pricing"
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Target URL / Destination
                                    </label>
                                    <Input
                                        value={currentRegionContent.announcement.linkUrl || ''}
                                        onChange={(e) => updateField('announcement', 'linkUrl', e.target.value)}
                                        placeholder="e.g. /pricing, /ae/pricing"
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Hero Section & Value Propositions */}
                    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Landing Page Hero & Regional Value Proposition
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400">
                                        Controls main heading, badges, and call-to-actions shown on this location's homepage
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Top Pill Badge Text
                                </label>
                                <Input
                                    value={currentRegionContent.hero.badge}
                                    onChange={(e) => updateField('hero', 'badge', e.target.value)}
                                    placeholder="e.g. 🇮🇳 100% GST Compliant Invoice Generator"
                                    className="text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Main Hero Headline *
                                </label>
                                <Input
                                    value={currentRegionContent.hero.headline}
                                    onChange={(e) => updateField('hero', 'headline', e.target.value)}
                                    placeholder="e.g. Create Professional Invoices in 10 Seconds"
                                    className="text-xs font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Subheadline & Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={currentRegionContent.hero.subheadline}
                                    onChange={(e) => updateField('hero', 'subheadline', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                        Primary Call-To-Action
                                    </label>
                                    <Input
                                        value={currentRegionContent.hero.primaryButtonText}
                                        onChange={(e) => updateField('hero', 'primaryButtonText', e.target.value)}
                                        placeholder="Button Text (e.g. Start Free)"
                                        className="text-xs"
                                    />
                                    <Input
                                        value={currentRegionContent.hero.primaryButtonUrl}
                                        onChange={(e) => updateField('hero', 'primaryButtonUrl', e.target.value)}
                                        placeholder="Button URL (e.g. /signup)"
                                        className="text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                        Secondary Call-To-Action
                                    </label>
                                    <Input
                                        value={currentRegionContent.hero.secondaryButtonText}
                                        onChange={(e) => updateField('hero', 'secondaryButtonText', e.target.value)}
                                        placeholder="Button Text (e.g. View Plans)"
                                        className="text-xs"
                                    />
                                    <Input
                                        value={currentRegionContent.hero.secondaryButtonUrl}
                                        onChange={(e) => updateField('hero', 'secondaryButtonUrl', e.target.value)}
                                        placeholder="Button URL (e.g. /pricing)"
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Regional Business & Contact Info */}
                    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Regional Contact & Operating Details
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400">
                                        Contact info shown in footer, invoices, and support pages for this jurisdiction
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Support Email
                                    </label>
                                    <Input
                                        value={currentRegionContent.contact.supportEmail}
                                        onChange={(e) => updateField('contact', 'supportEmail', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Support Phone
                                    </label>
                                    <Input
                                        value={currentRegionContent.contact.supportPhone}
                                        onChange={(e) => updateField('contact', 'supportPhone', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        WhatsApp Helpline
                                    </label>
                                    <Input
                                        value={currentRegionContent.contact.whatsappNumber || ''}
                                        onChange={(e) => updateField('contact', 'whatsappNumber', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Regional Office Address
                                    </label>
                                    <Input
                                        value={currentRegionContent.contact.officeAddress}
                                        onChange={(e) => updateField('contact', 'officeAddress', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Operating Hours & Timezone
                                    </label>
                                    <Input
                                        value={currentRegionContent.contact.operatingHours}
                                        onChange={(e) => updateField('contact', 'operatingHours', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Regional FAQs */}
                    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                                    <HelpCircle className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Location-Specific FAQs
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400">
                                        Questions & answers addressing regional tax compliance, payment methods, and features
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAddFaq}
                                className="text-xs flex items-center gap-1 border-dashed"
                            >
                                <Plus className="h-3.5 w-3.5 text-blue-600" />
                                <span>Add Question</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {currentRegionContent.faqs.map((faq, index) => (
                                <div 
                                    key={faq.id || index}
                                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <Input
                                                value={faq.question}
                                                onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                                                placeholder="Question title"
                                                className="text-xs font-bold bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={faq.category || ''}
                                                onChange={(e) => handleUpdateFaq(index, 'category', e.target.value)}
                                                placeholder="Category"
                                                className="text-xs w-28 bg-white dark:bg-slate-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFaq(index)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <textarea
                                            rows={2}
                                            value={faq.answer}
                                            onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                                            placeholder="Answer details..."
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ))}

                            {currentRegionContent.faqs.length === 0 && (
                                <p className="text-center py-6 text-xs text-slate-400">
                                    No FAQs added yet for this region. Click "Add Question" above.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bottom Save Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            onClick={handleSaveRegion}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm"
                        >
                            {isSaving ? 'Publishing Changes...' : 'Publish Content Updates'}
                        </Button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: Subdomain & Routing Engine */}
            {activeTab === 'ROUTING' && (
                <div className="space-y-6">
                    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                                    <Server className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Multi-Subdomain Mapping & Reverse Proxy Gateway
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400">
                                        Direct traffic by subdomain hostname to location-specific pricing and marketing routes
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAddSubdomain}
                                className="text-xs flex items-center gap-1 border-dashed"
                            >
                                <Plus className="h-3.5 w-3.5 text-blue-600" />
                                <span>Add Subdomain</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Visual Architecture */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Globe className="h-4 w-4 text-blue-600" />
                                    <span>Active Gateway Architecture</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                            <span>🇮🇳</span>
                                            <span>billbooky.dodail.com</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">Routes to India Portal (`/` & `/pricing`)</div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                            <span>🇦🇪</span>
                                            <span>ae.billbooky.dodail.com</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">Routes to UAE Portal (`/ae` & `/ae/pricing`)</div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                            <span>🇺🇸</span>
                                            <span>us.billbooky.dodail.com</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">Routes to Global Portal (`/us` & `/us/pricing`)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Subdomains Table */}
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-3">Host / Subdomain</th>
                                            <th className="p-3">Target Region</th>
                                            <th className="p-3">Path Mapping</th>
                                            <th className="p-3">DNS Status</th>
                                            <th className="p-3 text-right">Active</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {subdomainConfig.subdomains.map((sub, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="p-3">
                                                    <Input
                                                        value={sub.subdomain}
                                                        onChange={(e) => handleUpdateSubdomain(index, 'subdomain', e.target.value)}
                                                        className="text-xs font-mono bg-white dark:bg-slate-900"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <select
                                                        value={sub.targetRegion}
                                                        onChange={(e) => handleUpdateSubdomain(index, 'targetRegion', e.target.value)}
                                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                                                    >
                                                        <option value="IN">🇮🇳 India (INR)</option>
                                                        <option value="AE">🇦🇪 UAE (AED)</option>
                                                        <option value="US">🇺🇸 US (USD)</option>
                                                    </select>
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        value={sub.targetPath}
                                                        onChange={(e) => handleUpdateSubdomain(index, 'targetPath', e.target.value)}
                                                        className="text-xs font-mono bg-white dark:bg-slate-900"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        sub.dnsStatus === 'active' 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    }`}>
                                                        {sub.dnsStatus}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input
                                                        type="checkbox"
                                                        checked={sub.isActive}
                                                        onChange={(e) => handleUpdateSubdomain(index, 'isActive', e.target.checked)}
                                                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                    />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSubdomain(index)}
                                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Geo detection toggles */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={subdomainConfig.autoDetectGeo}
                                        onChange={(e) => setSubdomainConfig({ ...subdomainConfig, autoDetectGeo: e.target.checked })}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Auto-detect Visitor Country & redirect root requests to regional pages
                                    </span>
                                </label>

                                <Button
                                    onClick={handleSaveRouting}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                                >
                                    {isSaving ? 'Saving...' : 'Save Routing Rules'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* DNS Setup Instructions Card */}
                    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-emerald-600" />
                                <span>DNS Configuration Guide for Multiple Subdomains</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                            <p>To enable regional subdomains (e.g. <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">ae.billbooky.dodail.com</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">us.billbooky.dodail.com</code>) on Vercel or Cloudflare:</p>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>Add a <strong>CNAME</strong> record in your DNS provider for <code className="font-semibold text-slate-700 dark:text-slate-300">ae</code> pointing to <code className="font-semibold text-slate-700 dark:text-slate-300">cname.vercel-dns.com</code> (or your server IP).</li>
                                <li>Add a <strong>CNAME</strong> record for <code className="font-semibold text-slate-700 dark:text-slate-300">us</code> pointing to <code className="font-semibold text-slate-700 dark:text-slate-300">cname.vercel-dns.com</code>.</li>
                                <li>Add both domains in your Vercel Project Domains dashboard. Next.js edge proxy will automatically rewrite requests to the respective location paths.</li>
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
