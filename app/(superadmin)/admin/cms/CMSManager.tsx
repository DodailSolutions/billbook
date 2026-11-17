'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
    Globe, Bell, Sparkles, Phone, Mail, MapPin, HelpCircle, 
    Save, Check, Plus, Trash2, ExternalLink, CheckCircle2, 
    AlertCircle, RefreshCw, Layers, ArrowRight, Server, 
    Shield, Sliders, Eye, EyeOff, ArrowUp, ArrowDown, 
    Smartphone, Monitor, Tablet, FileText, BookOpen, Edit3,
    CheckCircle, Star, ShoppingCart, Zap, LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { RegionalCMSData, SubdomainConfig, BlogPost } from './types'
import { saveRegionalCMS, saveSubdomainConfig, saveBlogPosts } from './actions'

interface CMSManagerProps {
    initialContent: Record<string, RegionalCMSData>
    initialSubdomains: SubdomainConfig
    initialBlogs: BlogPost[]
}

const REGION_TABS = [
    { id: 'IN', label: 'India', flag: '🇮🇳', domain: 'billbooky.dodail.com', path: '/' },
    { id: 'AE', label: 'UAE & Middle East', flag: '🇦🇪', domain: 'ae.billbooky.dodail.com', path: '/ae' },
    { id: 'US', label: 'US & Global', flag: '🇺🇸', domain: 'us.billbooky.dodail.com', path: '/us' },
    { id: 'BLOG', label: 'Blog Engine', flag: '📝', domain: '/blog', path: '/blog' },
    { id: 'ROUTING', label: 'Subdomains & Routing', flag: '🔀', domain: 'DNS Gateways', path: 'settings' }
]

type DeviceViewport = 'desktop' | 'tablet' | 'mobile'

export default function CMSManager({ initialContent, initialSubdomains, initialBlogs }: CMSManagerProps) {
    const [activeTab, setActiveTab] = useState<string>('IN')
    const [contentByRegion, setContentByRegion] = useState<Record<string, RegionalCMSData>>(initialContent)
    const [subdomainConfig, setSubdomainConfig] = useState<SubdomainConfig>(initialSubdomains)
    const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs || [])
    const [selectedBlogId, setSelectedBlogId] = useState<string | null>(initialBlogs?.[0]?.id || null)
    
    // Elementor Viewport controls
    const [viewport, setViewport] = useState<DeviceViewport>('desktop')
    const [showLivePreview, setShowLivePreview] = useState<boolean>(true)

    // Sections order & visibility
    const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({})
    const [sectionOrder, setSectionOrder] = useState<string[]>([
        'announcement',
        'hero',
        'metrics',
        'faqs',
        'contact'
    ])

    const [isSaving, setIsSaving] = useState(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 3500)
    }

    const currentRegionContent = ['IN', 'AE', 'US'].includes(activeTab) 
        ? (contentByRegion[activeTab] || contentByRegion.IN) 
        : null

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

    const updateMetric = (index: number, field: 'value' | 'label', val: string) => {
        if (!currentRegionContent) return
        const currentMetrics = [...(currentRegionContent.metrics || [
            { value: '500+', label: 'Active Businesses' },
            { value: '₹10Cr+', label: 'Invoices Processed' },
            { value: '99.9%', label: 'Platform Uptime' },
            { value: '4.9/5', label: 'Customer Rating' }
        ])]
        currentMetrics[index] = { ...currentMetrics[index], [field]: val }
        setContentByRegion(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                metrics: currentMetrics
            }
        }))
    }

    // Save active regional CMS
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

    // Move Section Up/Down (Elementor Ordering)
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= sectionOrder.length) return
        const newOrder = [...sectionOrder]
        const temp = newOrder[index]
        newOrder[index] = newOrder[targetIndex]
        newOrder[targetIndex] = temp
        setSectionOrder(newOrder)
    }

    const toggleSectionVisibility = (secId: string) => {
        setHiddenSections(prev => ({
            ...prev,
            [secId]: !prev[secId]
        }))
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

    // ================= BLOG OPERATIONS =================
    const handleAddBlog = () => {
        const newPost: BlogPost = {
            id: `post-${Date.now()}`,
            title: 'New Article Title',
            slug: `new-article-${Date.now()}`,
            excerpt: 'Brief overview of this topic...',
            content: 'Write comprehensive insights for your users here.',
            author: 'BillBooky Editorial',
            category: 'Guides',
            publishedAt: new Date().toISOString().split('T')[0],
            isPublished: true,
            readTime: '3 min read'
        }
        const updated = [newPost, ...blogs]
        setBlogs(updated)
        setSelectedBlogId(newPost.id)
    }

    const handleUpdateBlog = (field: keyof BlogPost, val: any) => {
        if (!selectedBlogId) return
        setBlogs(prev => prev.map(p => p.id === selectedBlogId ? { ...p, [field]: val } : p))
    }

    const handleDeleteBlog = (id: string) => {
        const updated = blogs.filter(p => p.id !== id)
        setBlogs(updated)
        if (selectedBlogId === id) {
            setSelectedBlogId(updated[0]?.id || null)
        }
    }

    const handleSaveBlogs = async () => {
        setIsSaving(true)
        try {
            const res = await saveBlogPosts(blogs)
            if (res.success) {
                showToast('Blog articles published successfully!')
            } else {
                alert(res.error || 'Failed to save blog posts')
            }
        } catch (err) {
            console.error('Error saving blog posts:', err)
            alert('Failed to save blogs')
        } finally {
            setIsSaving(false)
        }
    }

    // Subdomain routing save
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

    const themeColors = {
        blue: 'bg-blue-600 text-white',
        emerald: 'bg-emerald-600 text-white',
        purple: 'bg-purple-600 text-white',
        amber: 'bg-amber-600 text-white',
        rose: 'bg-rose-600 text-white'
    }

    const selectedBlog = blogs.find(p => p.id === selectedBlogId)

    return (
        <div className="space-y-6">
            {/* Toast message */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Elementor Pro Top Control Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
                {/* Region & Module Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {REGION_TABS.map((tab) => {
                        const isSelected = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-sm'
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

                {/* Elementor Viewport Switcher & Actions */}
                <div className="flex items-center gap-3">
                    {activeTab !== 'ROUTING' && activeTab !== 'BLOG' && (
                        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                            <button
                                type="button"
                                title="Desktop Preview"
                                onClick={() => setViewport('desktop')}
                                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                                    viewport === 'desktop' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Monitor className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Desktop</span>
                            </button>
                            <button
                                type="button"
                                title="Tablet Preview"
                                onClick={() => setViewport('tablet')}
                                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                                    viewport === 'tablet' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Tablet className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Tablet</span>
                            </button>
                            <button
                                type="button"
                                title="Mobile Preview"
                                onClick={() => setViewport('mobile')}
                                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                                    viewport === 'mobile' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Smartphone className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Mobile</span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'BLOG' ? (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleAddBlog}
                                variant="outline"
                                className="text-xs font-bold flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>New Article</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveBlogs}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                            >
                                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                <span>Publish All Blogs</span>
                            </Button>
                        </div>
                    ) : activeTab === 'ROUTING' ? (
                        <Button
                            size="sm"
                            onClick={handleSaveRouting}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Routing Config</span>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <a
                                href={activeTab === 'AE' ? '/ae' : activeTab === 'US' ? '/us' : '/'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span>Live Site</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <Button
                                size="sm"
                                onClick={handleSaveRegion}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                            >
                                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                <span>Publish Changes</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= TAB 1: REGIONAL LANDING PAGE BUILDER ================= */}
            {['IN', 'AE', 'US'].includes(activeTab) && currentRegionContent && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Inspector / Section Order Navigator */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Section Navigator Card */}
                        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-900 dark:text-white">
                                    <span className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-blue-600" />
                                        Page Layout Sections &amp; Ordering
                                    </span>
                                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                        Elementor Flow
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-500">
                                    Reorder sections on this country landing page or toggle visibility instantly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-3 divide-y divide-slate-100 dark:divide-slate-800">
                                {sectionOrder.map((secId, idx) => {
                                    const isHidden = !!hiddenSections[secId]
                                    const labelMap: Record<string, string> = {
                                        announcement: 'Top Announcement Banner',
                                        hero: 'Hero Section & Headline',
                                        metrics: 'Trust Counters & Metrics Bar',
                                        faqs: 'Frequently Asked Questions',
                                        contact: 'Contact & Legal Footer'
                                    }
                                    return (
                                        <div key={secId} className="py-2.5 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold text-slate-400 w-4">{idx + 1}.</span>
                                                <span className={`font-semibold ${isHidden ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {labelMap[secId] || secId}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveSection(idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 cursor-pointer"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveSection(idx, 'down')}
                                                    disabled={idx === sectionOrder.length - 1}
                                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 cursor-pointer"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSectionVisibility(secId)}
                                                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                                                        isHidden ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                                    title={isHidden ? 'Show Section' : 'Hide Section'}
                                                >
                                                    {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        {/* 1. Announcement Banner Inspector */}
                        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-blue-600" />
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Announcement Banner
                                    </CardTitle>
                                </div>
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={currentRegionContent.announcement.enabled}
                                        onChange={(e) => updateField('announcement', 'enabled', e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                    />
                                    <span>{currentRegionContent.announcement.enabled ? 'Enabled' : 'Disabled'}</span>
                                </label>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Banner Message
                                    </label>
                                    <Input
                                        value={currentRegionContent.announcement.message}
                                        onChange={(e) => updateField('announcement', 'message', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Button Text
                                        </label>
                                        <Input
                                            value={currentRegionContent.announcement.linkText || ''}
                                            onChange={(e) => updateField('announcement', 'linkText', e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Color Theme
                                        </label>
                                        <select
                                            value={currentRegionContent.announcement.theme}
                                            onChange={(e) => updateField('announcement', 'theme', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold"
                                        >
                                            <option value="blue">Royal Blue</option>
                                            <option value="emerald">Emerald Green</option>
                                            <option value="purple">Vibrant Purple</option>
                                            <option value="amber">Warm Amber</option>
                                            <option value="rose">Rose Red</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Hero Section Inspector */}
                        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        Hero Headline &amp; Buttons
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Top Pill Badge
                                    </label>
                                    <Input
                                        value={currentRegionContent.hero.badge}
                                        onChange={(e) => updateField('hero', 'badge', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Main Headline
                                    </label>
                                    <Input
                                        value={currentRegionContent.hero.headline}
                                        onChange={(e) => updateField('hero', 'headline', e.target.value)}
                                        className="text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Subheadline
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={currentRegionContent.hero.subheadline}
                                        onChange={(e) => updateField('hero', 'subheadline', e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Primary CTA Text
                                        </label>
                                        <Input
                                            value={currentRegionContent.hero.primaryButtonText}
                                            onChange={(e) => updateField('hero', 'primaryButtonText', e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Primary CTA URL
                                        </label>
                                        <Input
                                            value={currentRegionContent.hero.primaryButtonUrl}
                                            onChange={(e) => updateField('hero', 'primaryButtonUrl', e.target.value)}
                                            className="text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Trust Metrics Inspector */}
                        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                    Trust Counters (4 Metrics)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2.5">
                                {(currentRegionContent.metrics || [
                                    { value: '500+', label: 'Active Businesses' },
                                    { value: '₹10Cr+', label: 'Invoices Processed' },
                                    { value: '99.9%', label: 'Platform Uptime' },
                                    { value: '4.9/5', label: 'Customer Rating' }
                                ]).map((metric, mIdx) => (
                                    <div key={mIdx} className="grid grid-cols-2 gap-2 text-xs">
                                        <Input
                                            value={metric.value}
                                            onChange={(e) => updateMetric(mIdx, 'value', e.target.value)}
                                            placeholder="e.g. 500+"
                                            className="font-bold text-xs"
                                        />
                                        <Input
                                            value={metric.label}
                                            onChange={(e) => updateMetric(mIdx, 'label', e.target.value)}
                                            placeholder="Label"
                                            className="text-xs"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* 4. FAQs Inspector */}
                        <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-blue-600" />
                                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                        FAQs Accordion
                                    </CardTitle>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleAddFaq} className="text-xs gap-1">
                                    <Plus className="h-3 w-3" />
                                    <span>Add FAQ</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-3 space-y-3">
                                {currentRegionContent.faqs.map((faq, fIdx) => (
                                    <div key={faq.id || fIdx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="flex items-center justify-between gap-2">
                                            <Input
                                                value={faq.question}
                                                onChange={(e) => handleUpdateFaq(fIdx, 'question', e.target.value)}
                                                className="font-bold text-xs"
                                                placeholder="Question"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFaq(fIdx)}
                                                className="text-slate-400 hover:text-rose-500 p-1"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <textarea
                                            rows={2}
                                            value={faq.answer}
                                            onChange={(e) => handleUpdateFaq(fIdx, 'answer', e.target.value)}
                                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                            placeholder="Detailed answer..."
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Interactive Elementor Live Preview Canvas */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
                            <span className="flex items-center gap-1.5">
                                <Monitor className="h-4 w-4 text-blue-600" />
                                Elementor Interactive Canvas ({viewport.toUpperCase()} MODE)
                            </span>
                            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                Live Synchronized
                            </span>
                        </div>

                        {/* Device Frame */}
                        <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-center overflow-x-auto min-h-[700px]">
                            <div className={`transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col ${
                                viewport === 'mobile' ? 'w-[375px]' : viewport === 'tablet' ? 'w-[768px]' : 'w-full'
                            }`}>
                                {/* Canvas Top Bar Simulation */}
                                <div className="h-8 bg-slate-100 dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 px-3 flex items-center justify-between text-[10px] text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <span className="font-mono">{REGION_TABS.find(t => t.id === activeTab)?.domain}</span>
                                    <span>Live View</span>
                                </div>

                                <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                                    {/* 1. Announcement Preview */}
                                    {!hiddenSections['announcement'] && currentRegionContent.announcement.enabled && (
                                        <div className={`p-2.5 rounded-xl text-center text-xs font-semibold ${
                                            themeColors[currentRegionContent.announcement.theme] || themeColors.blue
                                        }`}>
                                            <span>{currentRegionContent.announcement.message}</span>
                                            {currentRegionContent.announcement.linkText && (
                                                <span className="ml-2 underline font-bold cursor-pointer">
                                                    {currentRegionContent.announcement.linkText} →
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* 2. Hero Section Preview */}
                                    {!hiddenSections['hero'] && (
                                        <div className="text-center py-6 sm:py-10 space-y-4">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                                                <span>{currentRegionContent.hero.badge}</span>
                                            </div>
                                            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white leading-tight">
                                                {currentRegionContent.hero.headline}
                                            </h1>
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                                                {currentRegionContent.hero.subheadline}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                                <button className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md">
                                                    {currentRegionContent.hero.primaryButtonText}
                                                </button>
                                                <button className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-900 font-semibold text-xs border border-slate-200">
                                                    {currentRegionContent.hero.secondaryButtonText}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Metrics Preview */}
                                    {!hiddenSections['metrics'] && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-y border-slate-100 dark:border-slate-800 text-center">
                                            {(currentRegionContent.metrics || [
                                                { value: '500+', label: 'Active Businesses' },
                                                { value: '₹10Cr+', label: 'Invoices Processed' },
                                                { value: '99.9%', label: 'Platform Uptime' },
                                                { value: '4.9/5', label: 'Customer Rating' }
                                            ]).map((m, i) => (
                                                <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                    <div className="text-base sm:text-xl font-black text-slate-950 dark:text-white font-mono">{m.value}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{m.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 4. FAQs Preview */}
                                    {!hiddenSections['faqs'] && currentRegionContent.faqs.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
                                            <div className="space-y-2">
                                                {currentRegionContent.faqs.map((faq, i) => (
                                                    <div key={i} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs bg-white dark:bg-slate-800">
                                                        <div className="font-bold text-slate-900 dark:text-white">{faq.question}</div>
                                                        <div className="text-slate-600 dark:text-slate-300 mt-1 text-[11px] leading-relaxed">{faq.answer}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB 2: BLOG POSTS ENGINE ================= */}
            {activeTab === 'BLOG' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Blog Articles List */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center justify-between pb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Articles ({blogs.length})</span>
                            <Button size="sm" onClick={handleAddBlog} className="text-xs gap-1 bg-blue-600 text-white">
                                <Plus className="h-3 w-3" />
                                <span>Create Article</span>
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                            {blogs.map((post) => {
                                const isSelected = post.id === selectedBlogId
                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => setSelectedBlogId(post.id)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'bg-blue-50/70 border-blue-300 shadow-xs dark:bg-blue-950/40 dark:border-blue-700' 
                                                : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">{post.category}</span>
                                            <span>{post.publishedAt}</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{post.excerpt}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Blog Article Editor */}
                    <div className="lg:col-span-8">
                        {selectedBlog ? (
                            <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Edit3 className="h-4 w-4 text-blue-600" />
                                            Editing: {selectedBlog.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs text-slate-400">
                                            Full Elementor article builder with markdown &amp; rich format support
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/blog/${selectedBlog.slug}`}
                                            target="_blank"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                                        >
                                            <span>View Page</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteBlog(selectedBlog.id)}
                                            className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Article Title *
                                            </label>
                                            <Input
                                                value={selectedBlog.title}
                                                onChange={(e) => handleUpdateBlog('title', e.target.value)}
                                                className="text-xs font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                URL Slug (e.g. gst-invoicing-guide)
                                            </label>
                                            <Input
                                                value={selectedBlog.slug}
                                                onChange={(e) => handleUpdateBlog('slug', e.target.value)}
                                                className="text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Category
                                            </label>
                                            <Input
                                                value={selectedBlog.category}
                                                onChange={(e) => handleUpdateBlog('category', e.target.value)}
                                                className="text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Author Name
                                            </label>
                                            <Input
                                                value={selectedBlog.author}
                                                onChange={(e) => handleUpdateBlog('author', e.target.value)}
                                                className="text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Estimated Read Time
                                            </label>
                                            <Input
                                                value={selectedBlog.readTime}
                                                onChange={(e) => handleUpdateBlog('readTime', e.target.value)}
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Short Summary / Meta Excerpt
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={selectedBlog.excerpt}
                                            onChange={(e) => handleUpdateBlog('excerpt', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Full Article Content (Markdown &amp; Rich Formatting)
                                        </label>
                                        <textarea
                                            rows={12}
                                            value={selectedBlog.content}
                                            onChange={(e) => handleUpdateBlog('content', e.target.value)}
                                            className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white leading-relaxed"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="p-12 text-center text-slate-400 border border-dashed rounded-2xl">
                                Select or create an article to start editing.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= TAB 3: SUBDOMAINS & ROUTING ================= */}
            {activeTab === 'ROUTING' && (
                <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                Regional Subdomain Gateway Routing
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-500">
                            Configure DNS routing rules that map subdomains to country-specific portals and landing pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 divide-y divide-slate-100 dark:divide-slate-800">
                        {subdomainConfig.subdomains.map((sub, sIdx) => (
                            <div key={sIdx} className="py-3 flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{sub.subdomain}</span>
                                    <p className="text-[11px] text-slate-500">{sub.label} &rarr; Target: <code>{sub.targetPath}</code></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {sub.dnsStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
