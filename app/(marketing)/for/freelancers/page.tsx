import type { Metadata } from 'next'
import Link from 'next/link'
import { 
    User, 
    Check, 
    ArrowRight, 
    ShieldCheck, 
    DollarSign, 
    FileText, 
    Sparkles, 
    CheckCircle2, 
    Lock,
    Smartphone,
    TrendingUp,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Footer from '@/components/Footer'
import { IndustryPricingWidget } from '@/app/_components/IndustryPricingWidget'

export const metadata: Metadata = {
    title: 'Freelancer Invoicing, 1-Page Scope Contracts & 50% Deposit OS | BillBook',
    description: 'Stop working for free. 1-page mobile scope contracts with touchscreen e-sign, automated 50% advance deposit invoices, and ₹20 Lakh GST turnover radar for independent freelancers.',
    keywords: [
        'freelancer invoice generator',
        '1-page freelance contract e-sign',
        '50% advance deposit invoice software',
        'freelance GST 20 lakh radar India',
        'invoice software for solo freelancers',
        'freelance payment link UPI',
        'contractor billing app'
    ],
    openGraph: {
        title: 'BillBook for Freelancers & Indie Creators',
        description: 'Get paid upfront. Send 1-page mobile scope contracts with e-sign, collect 50% deposits, and track GST thresholds in one place.',
        type: 'website',
        locale: 'en_US'
    }
}

export default function FreelancersLandingPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                'name': 'BillBook for Freelancers',
                'applicationCategory': 'BusinessApplication',
                'operatingSystem': 'Web, Cloud, Mobile',
                'offers': {
                    '@type': 'AggregateOffer',
                    'priceCurrency': 'INR',
                    'lowPrice': '499',
                    'highPrice': '1499'
                },
                'description': 'Mobile-first scope agreements, advance deposit collection, and GST compliance software tailored for independent contractors and freelancers.'
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
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                            B
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                            BillBook<span className="text-emerald-600">.pe</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 ml-1">
                            FOR FREELANCERS
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900">
                            Sign In
                        </Link>
                        <Link href="/signup?vertical=freelancer">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4">
                                Start for ₹499/mo
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide border border-emerald-200 dark:border-emerald-800 shadow-xs">
                        <User className="w-4 h-4" />
                        <span>ZERO BUREAUCRACY FOR SOLO CONTRACTORS</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
                        Never Deliver Work Before the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Deposit Clears</span>.
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Send 1-page mobile scope contracts with touchscreen signatures. Automate 50% upfront deposits via instant UPI / Card, and stay protected with our ₹20 Lakh GST turnover radar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/signup?vertical=freelancer">
                            <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-6 shadow-md gap-2">
                                <span>Get Started Free (14 Days)</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <a href="#how-it-works">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold py-6 border-slate-300 dark:border-slate-700">
                                How It Works
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* 3 Step Workflow */}
            <section id="how-it-works" className="py-16 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 mb-12">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                            The Ironclad 3-Step Freelancer Workflow
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                            Built to guarantee you never get ghosted or lose money on unbilled revisions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 font-black text-lg mx-auto flex items-center justify-center">
                                1
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">1-Page Scope Contract</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Draft deliverables, revision limits (e.g. 2 rounds), and payment tranches in 60 seconds. Client signs directly on their phone screen.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 font-black text-lg mx-auto flex items-center justify-center">
                                2
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">50% Upfront Deposit Gate</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Work status stays locked until the 50% deposit clears via instant UPI QR, Card, or Bank Transfer. You get notified the instant funds arrive.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 font-black text-lg mx-auto flex items-center justify-center">
                                3
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Final Release & Balance Pay</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Deliver files in the client portal. Client pays the remaining 50% balance in 1 click to unlock raw downloads and tax receipts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            FREELANCER SURVIVAL TOOLKIT
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Keep More of What You Earn
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">₹20 Lakh GST Radar</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Proactive warning radar alerts you at ₹15L and ₹18L before you cross the mandatory Indian GST registration threshold.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Mobile Touchscreen E-Sign</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                No clunky DocuSign logins. Send a WhatsApp link; your client signs with their finger in 10 seconds with IP timestamp verification.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">Instant UPI QR on Invoices</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Embeds dynamic UPI QR codes (GPay, PhonePe, Paytm) right on the PDF. Clients scan and pay instantly with zero gateway fees.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            AFFORDABLE SOLO PRICING
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Starts at Just ₹499 / Month ($19 Global)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Full invoice freedom and cash flow protection without enterprise price tags.
                        </p>
                    </div>

                    <IndustryPricingWidget defaultVertical="freelancer" showVerticalTabs={false} />
                </div>
            </section>

            <Footer />
        </div>
    )
}
