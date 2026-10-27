import { Globe, ArrowLeft, Shield, Sparkles, Server } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getAllRegionalCMS, getSubdomainConfig } from './actions'
import CMSManager from './CMSManager'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export default async function CMSPage() {
    // 1. Super Admin Authorization
    let hasAccess = false
    try {
        hasAccess = await checkSuperAdminAccess()
    } catch (error) {
        console.error('Error verifying super admin access:', error)
    }

    if (!hasAccess) {
        return (
            <div className="min-h-[70vh] p-4 flex items-center justify-center">
                <Card className="max-w-md w-full border-rose-200 dark:border-rose-900 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 mb-2">
                            <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                            Super Admin Access Required
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                            You need super administrator privileges to manage platform landing pages, regional announcements, and subdomain routing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-center">
                        <Link href="/dashboard">
                            <Button variant="outline" className="text-xs">
                                Return to Client Dashboard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 2. Fetch CMS Data & Subdomain config
    const [content, subdomains] = await Promise.all([
        getAllRegionalCMS(),
        getSubdomainConfig()
    ])

    return (
        <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Command Center</span>
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">/</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Content Management</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                        <Globe className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        <span>Content Management System</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Control regional marketing content, promotional banners, contact details, FAQs, and subdomain gateways for India, UAE, and US.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/admin/plans">
                        <Button variant="outline" size="sm" className="text-xs">
                            Subscription Plans
                        </Button>
                    </Link>
                    <Link href="/admin/testimonials">
                        <Button variant="outline" size="sm" className="text-xs">
                            Testimonials
                        </Button>
                    </Link>
                </div>
            </div>

            {/* CMS Manager Suite */}
            <CMSManager 
                initialContent={content} 
                initialSubdomains={subdomains} 
            />
        </div>
    )
}
