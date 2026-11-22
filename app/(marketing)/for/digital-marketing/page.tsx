import type { Metadata } from 'next'
import Link from 'next/link'
import { 
    Megaphone, 
    Check, 
    ArrowRight, 
    ShieldCheck, 
    TrendingUp, 
    DollarSign, 
    FileText, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle,
    Calendar,
    Users,
    Instagram
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Footer from '@/components/Footer'
import { IndustryPricingWidget } from '@/app/_components/IndustryPricingWidget'

export const metadata: Metadata = {
    title: 'Digital Marketing Agency Billing & Client Approval OS | BillBook',
    description: 'Protect your agency from the Ad Spend GST Trap. Separate 0% pass-through media disbursements from 18% agency fees, manage client creative approvals, and automate retainer overages in BillBook.',
    keywords: [
        'digital marketing agency billing software',
        'ad spend pass through invoice',
        'social media client approval tool',
        'marketing agency client portal',
        'agency retainer overage billing',
        'Rule 33 pure agent GST billing',
        'subcontractor TDS 194J agency software'
    ],
    openGraph: {
        title: 'BillBook for Digital Marketing & Creative Agencies',
        description: 'Separate 0% pass-through ad spend from taxable agency fees. Client portals, creative approvals, and automated retainer overages in one platform.',
        type: 'website',
        locale: 'en_US'
    }
}

export default function DigitalMarketingLandingPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                'name': 'BillBook for Digital Marketing Agencies',
                'applicationCategory': 'BusinessApplication',
                'operatingSystem': 'Web, Cloud, Mobile',
                'offers': {
                    '@type': 'AggregateOffer',
                    'priceCurrency': 'INR',
                    'lowPrice': '1999',
                    'highPrice': '3999'
                },
                'description': 'Unified agency management platform featuring dual-nature ad spend invoicing, white-label client approval portals, and retainer overage tracking.'
            }
        ]
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                            B
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                            BillBook<span className="text-purple-600">.pe</span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 ml-1">
                            FOR DIGITAL AGENCIES
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900">
                            Sign In
                        </Link>
                        <Link href="/signup?vertical=digital_marketing">
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-white dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide border border-purple-200 dark:border-purple-800 shadow-xs">
                        <Megaphone className="w-4 h-4" />
                        <span>PURPOSE-BUILT FOR PERFORMANCE & CREATIVE AGENCIES</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
                        Never Get Audited for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Ad Spend</span> Again.
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Dual-nature invoicing separates 0% tax pass-through ad budgets from taxable agency fees. Plus branded client portals for 1-click creative approvals and automatic monthly retainer overages.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/signup?vertical=digital_marketing">
                            <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-8 py-6 shadow-md gap-2">
                                <span>Start Agency Trial (14 Days)</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="#tax-guard">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold py-6 border-slate-300 dark:border-slate-700">
                                See Ad Spend Protection
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* The Ad Spend Tax Trap Callout */}
            <section id="tax-guard" className="py-16 bg-amber-50/60 dark:bg-amber-950/20 border-y border-amber-200/80 dark:border-amber-900/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl border border-amber-300 dark:border-amber-800 shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                The Lethal "Ad Spend Tax Trap" That Destroys Marketing Agencies
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                When you bill a client ₹5,00,000 (₹4,00,000 for Meta/Google ads and ₹1,00,000 for your fee), standard invoicing software applies 18% GST on the entire ₹5,00,000—costing you ₹90,000 in output tax!
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                🛡️ <strong>BillBook’s Rule 33 Pure Agent Engine</strong> legally isolates the ₹4,00,000 ad disbursement at 0% tax, applying 18% GST strictly to your ₹1,00,000 fee (₹18,000 tax). You save ₹72,000 in tax leakage per client, per month.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agency Feature Suite */}
            <section className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            COMPLETE AGENCY WORKSPACE
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Everything You Need to Run Client Accounts
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Dual-Nature Tax Invoices</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Seamlessly combine non-taxable ad spend reimbursements with 18% taxable creative & management fees (SAC 998361) on one itemized invoice.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Client Creative Approval Deck</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Stop chasing client approvals in WhatsApp. Clients preview scheduled posts and Reels in their branded portal and click "Approve" in 1 tap.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Retainer Quota & Overage Counter</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Set included monthly deliverables (e.g., 16 creatives + 4 reels). Extra requests automatically bill as overages on the next monthly cycle.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Subcontractor TDS 194J/194C</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Automated TDS deduction tracking for freelance videographers, copywriters, and influencers with instant Form 26Q export.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Client Content Hub</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Switch between client brands with one click. Manage social calendars, creative assets, and performance reach from one dashboard.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Media Buyer Capacity Radar</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Track account manager and media buyer capacity across client retainers, ensuring healthy margins and zero team burnout.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            TRANSPARENT AGENCY PRICING
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Plans Built to Scale with Your Client Roster
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Available in INR (₹) for India, AED for UAE agencies, and USD ($) for international shops.
                        </p>
                    </div>

                    <IndustryPricingWidget defaultVertical="digital_marketing" showVerticalTabs={false} />
                </div>
            </section>

            <Footer />
        </div>
    )
}
