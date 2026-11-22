import type { Metadata } from 'next'
import Link from 'next/link'
import { 
    Code2, 
    Check, 
    Zap, 
    ArrowRight, 
    ShieldCheck, 
    Clock, 
    Layers, 
    TrendingUp, 
    DollarSign, 
    FileText, 
    RefreshCw, 
    GitBranch, 
    Sparkles, 
    CheckCircle2, 
    HelpCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Footer from '@/components/Footer'
import { PublicHeaderAuth } from '@/components/PublicHeaderAuth'
import { IndustryPricingWidget } from '@/app/_components/IndustryPricingWidget'

export const metadata: Metadata = {
    title: 'Software Agency & IT Services Operating System | BillBook',
    description: 'All-in-one billing, project management, and developer profitability software for IT consultancies and software agencies. Milestone sprints, dev cost rates, LUT export invoicing, and zero scope creep change orders.',
    keywords: [
        'software agency billing software',
        'IT consultancy invoicing',
        'milestone sprint billing',
        'developer cost rate profitability',
        'scope creep change order software',
        'LUT export invoice India',
        'software project management billing',
        'timesheet to invoice software'
    ],
    openGraph: {
        title: 'BillBook for Software Companies & IT Consultancies',
        description: 'Stop paying for 5 disconnected SaaS tools. Run sprints, manage developer margins, and issue milestone invoices in one place.',
        type: 'website',
        locale: 'en_US'
    }
}

export default function SoftwareCompaniesLandingPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                'name': 'BillBook for Software Companies',
                'applicationCategory': 'BusinessApplication',
                'operatingSystem': 'Web, Cloud, Mobile',
                'offers': {
                    '@type': 'AggregateOffer',
                    'priceCurrency': 'INR',
                    'lowPrice': '1999',
                    'highPrice': '3999'
                },
                'description': 'End-to-end ERP and billing solution for software agencies and IT consultancies featuring milestone sprint tranches, dev cost profitability, and LUT export invoicing.'
            },
            {
                '@type': 'FAQPage',
                'mainEntity': [
                    {
                        '@type': 'Question',
                        'name': 'How does BillBook prevent scope creep for software projects?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'BillBook features a 1-Click Change Order Generator. When a client requests extra features outside the original Statement of Work (SOW), Project Managers generate a digital change order specifying delta hours, cost, and deadline impact. The client signs digitally, automatically creating a supplemental billing milestone.'
                        }
                    },
                    {
                        '@type': 'Question',
                        'name': 'Does BillBook support zero-rated export invoices under LUT for overseas IT clients?',
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': 'Yes. BillBook generates GST-compliant export invoices under Letter of Undertaking (LUT) with mandatory statutory declarations in USD, EUR, GBP, AED, and AUD, with built-in FIRC remittance tracking.'
                        }
                    }
                ]
            }
        ]
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Public Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                            B
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                            BillBook<span className="text-indigo-600">.pe</span>
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 ml-1">
                            FOR SOFTWARE & IT
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900">
                            Sign In
                        </Link>
                        <Link href="/signup?vertical=software_it">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide border border-indigo-200 dark:border-indigo-800 shadow-xs">
                        <Code2 className="w-4 h-4" />
                        <span>PURPOSE-BUILT FOR TECH STUDIOS & IT AGENCIES</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
                        Stop Losing 20% Net Margin to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Scope Creep</span> & SaaS Sprawl.
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Replace Jira, Harvest, Copilot, and QuickBooks with one unified operating platform. Milestone sprint tranches, real-time developer gross margins, and instant LUT export invoicing.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/signup?vertical=software_it">
                            <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-6 shadow-md gap-2">
                                <span>Start 14-Day Free Trial</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="#features">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold py-6 border-slate-300 dark:border-slate-700">
                                Explore Dev Features
                            </Button>
                        </a>
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-6 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            No credit card required
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                            LUT & GST compliant
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            Setup in 60 seconds
                        </span>
                    </div>
                </div>
            </section>

            {/* Fragmentation Comparison Table */}
            <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 mb-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            Why Software Companies Switch to BillBook
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                            Compare running your agency across 5 disconnected tools vs. BillBook’s unified architecture.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-3 p-4 bg-slate-100 dark:bg-slate-800/60 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                            <div>Capability</div>
                            <div className="text-rose-600">The Fragmented Stack ($550/mo)</div>
                            <div className="text-indigo-600">BillBook ($49 - $99/mo)</div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            <div className="grid grid-cols-3 p-4 items-center">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">Sprint Tranche Invoicing</span>
                                <span className="text-slate-500">Manual calculation in Excel</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> 1-Click Milestone Lock
                                </span>
                            </div>
                            <div className="grid grid-cols-3 p-4 items-center">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">Scope Creep Defense</span>
                                <span className="text-slate-500">Unbilled email threads</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> 1-Click Change Order E-Sign
                                </span>
                            </div>
                            <div className="grid grid-cols-3 p-4 items-center">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">Dev Cost Margins</span>
                                <span className="text-slate-500">Blind estimates / No real-time data</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Live Cost vs. Bill Rate %
                                </span>
                            </div>
                            <div className="grid grid-cols-3 p-4 items-center">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">International Export Tax</span>
                                <span className="text-slate-500">Requires manual CA reconciliation</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Automated LUT Zero-Rated
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section id="features" className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            ENGINEERED FOR MODERN TECH COMPANIES
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Every Tool You Need to Build, Bill & Scale
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                                <GitBranch className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Sprint Milestone Invoicing</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Bind invoice tranches to product milestones (Architecture 25%, Alpha MVP 35%, Production UAT 40%). Client approval automatically generates the tax invoice.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Real-Time Gross Margin Engine</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Track developer internal cost rate against client billing rates in real time. Know your exact project profitability before sprint kickoff.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">1-Click Change Orders</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Client requested an unexpected feature? Generate a digital Change Order with delta hours and cost in 10 seconds. Client signs on mobile to unlock work.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Universal Capacity Radar</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                40h/week allocation radar with automatic bench warnings (&lt;50%) and burnout alerts (&gt;100%). Keep engineers productive without overworking them.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero-Rated LUT Export Invoicing</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Bill global clients in USD, EUR, GBP, or AED under Letter of Undertaking with 0% tax liability and automated FIRC bank reconciliation tracking.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Subcontractor TDS 194J</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Seamlessly handle 10% / 2% TDS deductions on freelance dev contracts with automated quarterly summaries for Form 26Q compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section with Dynamic Country Switcher */}
            <section id="pricing" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            TRANSPARENT, MULTI-CURRENCY PRICING
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Pick the Plan Tailored for Your Dev Team
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Switch regions below to view localized pricing with regional tax compliance for India (INR), UAE (AED), or the US & Global (USD).
                        </p>
                    </div>

                    <IndustryPricingWidget defaultVertical="software_it" showVerticalTabs={false} />
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}
