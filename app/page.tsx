import Link from 'next/link'
import Image from 'next/image'
import dynamicImport from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { 
    FileText, Users, IndianRupee, Zap, CheckCircle, Shield, TrendingUp, 
    RefreshCw, Clock, Building2, ArrowRight, Star, Check, BarChart3, 
    Smartphone, Globe, Lock, Sparkles, BookOpen, ShoppingBag, DollarSign, 
    Bot, Layers, ChevronRight, ShieldCheck, Award, LayoutDashboard, PlusCircle,
    Video, Camera
} from 'lucide-react'
import { InteractiveFeaturePreview } from './_components/InteractiveFeaturePreview'
import { HomePricingSection } from './_components/HomePricingSection'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { PublicHeaderAuth } from '@/components/PublicHeaderAuth'
import { RegionSwitcher } from '@/components/RegionSwitcher'
import { getRegionalCMS } from './(superadmin)/admin/cms/actions'

export const dynamic = 'force-dynamic'

// Lazy load below-the-fold components for performance
const FAQSection = dynamicImport(() => import('./_components/FAQSection').then(mod => ({ default: mod.FAQSection })), {
    loading: () => <div className="py-20 text-center text-slate-400 font-medium">Loading FAQ...</div>,
})

const TestimonialCarousel = dynamicImport(() => import('./_components/TestimonialCarousel').then(mod => ({ default: mod.TestimonialCarousel })), {
    loading: () => <div className="py-20 text-center text-slate-400 font-medium">Loading testimonials...</div>,
})

const ALL_FEATURES = [
    { icon: Video, title: 'AI CCTV Touchless Attendance', desc: 'Connect office CCTV streams (CP Plus, Dahua, Hikvision, Tapo) for biometric face recognition check-ins with 100% DPDP compliance (zero raw video stored)', color: 'blue' },
    { icon: FileText, title: 'GST Compliant Invoicing', desc: 'Create CGST, SGST, IGST invoices with QR code payment in under 30 seconds', color: 'blue' },
    { icon: RefreshCw, title: 'Tally Prime 1-Click Sync', desc: 'Export full Daybook XML and Master Ledgers directly into Tally with zero manual re-entry', color: 'blue' },
    { icon: ShieldCheck, title: 'CA Client Delegation & Audit', desc: 'Securely grant your CA scoped, time-bounded access with instant 1-click revocation', color: 'black' },
    { icon: BookOpen, title: 'Double-Entry Bookkeeping', desc: 'Chart of Accounts, Trial Balance, P&L, Balance Sheet & Bank Reconciliation', color: 'blue' },
    { icon: Sparkles, title: 'CRM & Sales Pipeline', desc: 'Visual deal stages, activity timeline follow-ups, and win rate forecasts', color: 'black' },
    { icon: ShoppingBag, title: 'Purchase Orders', desc: 'Issue vendor POs, track partial deliveries, and auto-update stock inventory', color: 'black' },
    { icon: DollarSign, title: 'Payroll & Salary Slips', desc: 'Employee salary structures, PF/ESI/TDS deductions, and PDF payslips', color: 'blue' },
    { icon: Layers, title: 'Inventory Valuation', desc: 'Weighted average stock valuation, batch/lot tracking, and reorder alerts', color: 'black' },
    { icon: Bot, title: 'AI Accountant Assistant', desc: 'Ask natural language tax & finance questions powered by AI logic', color: 'blue' },
    { icon: Users, title: 'CA Marketplace & Network', desc: 'Connect with certified CAs for tax filing, audit reports, and advice', color: 'black' },
    { icon: Smartphone, title: 'WhatsApp Direct Share', desc: 'Send PDF invoice links directly to client WhatsApp numbers in 1 click', color: 'black' },
    { icon: Lock, title: 'Bank Grade Security', desc: '256-bit encryption, automated daily backups, and complete data privacy', color: 'black' },
]

export default async function Home() {
    let starterPrice = 2999
    let proPrice = 4999
    let enterprisePrice = 10999
    let freePrice = 0
    let starterSlug = 'starter'
    let proSlug = 'professional'
    let enterpriseSlug = 'enterprise'
    let isAuthenticated = false
    let cms: any = null

    try {
        const [supabase, cmsData] = await Promise.all([
            createClient(),
            getRegionalCMS('IN').catch(() => null)
        ])
        cms = cmsData
        const { data: { user } } = await supabase.auth.getUser()
        isAuthenticated = !!user

        const { data: plans } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
        
        if (plans && Array.isArray(plans)) {
            const starter = plans.find(p => p.slug === 'starter')
            const pro = plans.find(p => p.slug === 'professional')
            const enterprise = plans.find(p => p.slug === 'enterprise')
            const free = plans.find(p => p.slug === 'free')
            if (starter && starter.price) {
                starterPrice = Number(starter.price)
                starterSlug = starter.slug
            }
            if (pro && pro.price) {
                proPrice = Number(pro.price)
                proSlug = pro.slug
            }
            if (enterprise && enterprise.price) {
                enterprisePrice = Number(enterprise.price)
                enterpriseSlug = enterprise.slug
            }
            if (free && free.price !== undefined) freePrice = Number(free.price)
        }
    } catch {
        // Fallback to official default rates
    }

    return (
        <div className="min-h-screen bg-white text-slate-950 selection:bg-blue-600 selection:text-white font-sans antialiased">
            {/* Dynamic Announcement Banner from CMS */}
            {cms?.announcement?.enabled && (
                <div className={`py-2 px-4 text-center text-xs font-semibold ${
                    cms.announcement.theme === 'emerald' ? 'bg-emerald-600 text-white' :
                    cms.announcement.theme === 'purple' ? 'bg-purple-600 text-white' :
                    cms.announcement.theme === 'amber' ? 'bg-amber-600 text-white' :
                    cms.announcement.theme === 'rose' ? 'bg-rose-600 text-white' :
                    'bg-blue-600 text-white'
                }`}>
                    <span>{cms.announcement.message}</span>
                    {cms.announcement.linkText && (
                        <Link href={cms.announcement.linkUrl || '#'} className="underline ml-2 font-bold hover:opacity-90">
                            {cms.announcement.linkText} →
                        </Link>
                    )}
                </div>
            )}

            {/* Apple-grade Sticky Navigation */}
            <nav className="apple-glass sticky top-0 z-50 border-b border-black/[0.06] transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 group-hover:scale-105">
                                <Image 
                                    src="/logo-icon.svg" 
                                    alt="BillBooky" 
                                    width={36} 
                                    height={36}
                                    priority
                                />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-sans">
                                Bill<span className="text-blue-600">Booky</span>
                            </span>
                        </Link>
                        
                        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] font-medium tracking-tight text-slate-600">
                            <Link href="#features" className="apple-nav-link hover:text-slate-950">Features</Link>
                            <Link href="#showcase" className="apple-nav-link hover:text-slate-950">Live Preview</Link>
                            <Link href="#pricing" className="apple-nav-link hover:text-slate-950">Pricing</Link>
                            <Link href="/ca-marketplace" className="apple-nav-link hover:text-slate-950">CA Services</Link>
                            <Link href="/ca-registration" className="apple-nav-link text-blue-600 font-semibold hover:text-blue-700">Register as CA</Link>
                            <Link href="/contact" className="apple-nav-link hover:text-slate-950">Contact</Link>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <RegionSwitcher />
                            <PublicHeaderAuth initialAuthenticated={isAuthenticated} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Apple Hero Section */}
            <section className="relative pt-12 sm:pt-20 pb-20 md:pb-28 overflow-hidden bg-white">
                {/* Subtle Apple gradient aura */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-blue-400/5 to-slate-200/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
                        {/* Apple Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 shadow-xs micro-float">
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                            <span className="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300 tracking-wide uppercase">
                                {isAuthenticated ? 'Welcome Back • Workspace Active' : (cms?.hero?.badge || '100% GST Compliant Invoice Generator & Operating System')}
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 -tracking-tight leading-[1.08] font-sans">
                            {cms?.hero?.headline || 'Accounting, Invoicing, CRM & Payroll. Simple. Fast. Compliant.'}
                        </h1>

                        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            {cms?.hero?.subheadline || 'Create GST invoices, track CRM sales pipelines, manage double-entry books, issue vendor POs, and run monthly staff payroll — all in one elegant workspace.'}
                        </p>

                        {/* Apple Action Buttons with Micro-motion */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                            {isAuthenticated ? (
                                <>
                                    <Link href="/dashboard" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-blue-600/25 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-base min-h-[52px] gap-2.5 shimmer-button">
                                            <LayoutDashboard className="h-5 w-5" />
                                            Go to Dashboard
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/invoices/new" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-8 py-4 rounded-full border border-slate-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-base min-h-[52px] gap-2">
                                            <PlusCircle className="h-5 w-5 text-blue-600" />
                                            Create New Invoice
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={cms?.hero?.primaryButtonUrl || '/signup'} className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-slate-900 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-base min-h-[52px] gap-2 shimmer-button">
                                            {cms?.hero?.primaryButtonText || 'Start Free Account'}
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href={cms?.hero?.secondaryButtonUrl || '#features'} className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-slate-100/90 hover:bg-slate-200 text-slate-900 font-bold px-8 py-4 rounded-full border border-slate-200/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-base min-h-[52px]">
                                            {cms?.hero?.secondaryButtonText || 'Explore Features'}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Ratings & Social Proof */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-600 font-semibold">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                                <span className="font-bold text-slate-950 ml-1.5">4.9/5 Rating</span>
                            </div>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <div className="flex items-center gap-1.5 text-slate-700">
                                <CheckCircle className="w-4 h-4 text-blue-600" /> 100% GST Compliant
                            </div>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <div className="flex items-center gap-1.5 text-slate-700">
                                <Shield className="w-4 h-4 text-black" /> 500+ Indian SMBs Trust Us
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Apple Minimalist Trust Metrics Bar */}
            <section className="py-10 bg-slate-50/60 border-y border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {(cms?.metrics || [
                            { value: '500+', label: 'Active Businesses' },
                            { value: '₹10Cr+', label: 'Invoices Processed' },
                            { value: '100%', label: 'GST Audit Ready' },
                            { value: '6-in-1', label: 'Enterprise Modules' }
                        ]).map((m: any, idx: number) => (
                            <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                                <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono">{m.value}</div>
                                <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Live Feature Preview Section */}
            <section id="showcase" className="py-20 sm:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/80">
                            Interactive Platform Preview
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 -tracking-tight">
                            Explore the Full Suite of Features
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base font-medium">
                            Click through the tabs below to test live interactive previews of each module.
                        </p>
                    </div>

                    <InteractiveFeaturePreview />
                </div>
            </section>

            {/* Flagship Innovation: AI CCTV Touchless Attendance Showcase */}
            <section className="py-20 sm:py-24 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50/40 border-t border-slate-200/60 overflow-hidden relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                            <Video className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                            Hardware-Free Attendance Innovation
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 -tracking-tight">
                            Touchless Attendance Powered by Your Existing Office CCTV
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                            No expensive biometric kiosks or card readers required. BillBooky links directly to your CP Plus, Dahua, Hikvision, or Tapo cameras for instant facial recognition check-ins and automated payroll calculation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-7 rounded-[24px] border border-slate-200/80 shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Camera className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Zero Hardware Setup</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Connect via P2P serial number or RTSP stream. Works with CP Plus EasyViewer, Dahua, Hikvision, and standard NVR systems in under 2 minutes.
                            </p>
                        </div>

                        <div className="bg-white p-7 rounded-[24px] border border-slate-200/80 shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">100% DPDP Act Compliant</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Strict employee data privacy. Face embeddings are computed in local RAM as 512-D vectors. Zero raw video feeds or images are ever stored.
                            </p>
                        </div>

                        <div className="bg-white p-7 rounded-[24px] border border-slate-200/80 shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Automated Shift & Payroll Sync</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Logs morning arrivals, tea/lunch breaks, and evening departures with grace periods. Automatically calculates net hours and monthly payroll deductions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comprehensive Feature Grid (Apple Style 12 Feature Suite) */}
            <section id="features" className="py-20 sm:py-28 bg-slate-50/40 border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider border border-slate-200">
                            Complete Feature Arsenal
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 -tracking-tight">
                            Everything your business needs to scale
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base font-medium">
                            No more juggling separate accounting software, CRM tools, or payroll spreadsheets.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ALL_FEATURES.map((feature, idx) => {
                            const Icon = feature.icon
                            return (
                                <div 
                                    key={idx}
                                    className="bg-white p-7 rounded-[24px] border border-slate-200/80 hover:border-blue-500/40 hover:shadow-2xl shadow-slate-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <Icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Apple Style Pricing Section with Pay or Try */}
            <HomePricingSection
                starterPrice={starterPrice}
                proPrice={proPrice}
                enterprisePrice={enterprisePrice}
                freePrice={freePrice}
                starterSlug={starterSlug}
                proSlug={proSlug}
                enterpriseSlug={enterpriseSlug}
                isAuthenticated={isAuthenticated}
                plans={plans || []}
            />

            {/* Testimonials */}
            <section className="py-20 bg-slate-50/50 border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <TestimonialCarousel />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FAQSection />
                </div>
            </section>

            {/* Final Apple CTA Banner */}
            <section className="py-20 bg-black text-white shadow-2xl relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-black text-white -tracking-tight">
                        Ready to streamline your financial operations?
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-medium">
                        Join 500+ Indian startups and SMBs managing invoicing, CRM, bookkeeping, and payroll on BillBooky.
                    </p>
                    {isAuthenticated ? (
                        <div className="space-y-4">
                            <Link href="/dashboard" className="inline-block">
                                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-black px-8 py-4 rounded-full shadow-xl text-base min-h-[52px] gap-2.5 hover:scale-105 transition-all duration-300">
                                    <LayoutDashboard className="h-5 w-5" />
                                    Open Your Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <p className="text-xs text-slate-400 font-medium">Direct instant access to your active invoices, CRM deals, and team bookkeeping.</p>
                        </div>
                    ) : (
                        <Link href="/signup" className="inline-block">
                            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-black px-8 py-4 rounded-full shadow-xl text-base min-h-[52px] gap-2 hover:scale-105 transition-all duration-300">
                                Create Free Account Now
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* Apple Footer */}
            <Footer />
        </div>
    )
}
