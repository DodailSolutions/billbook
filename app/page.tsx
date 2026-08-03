import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { 
    FileText, Users, IndianRupee, Zap, CheckCircle, Shield, TrendingUp, 
    RefreshCw, Clock, Building2, ArrowRight, Star, Check, BarChart3, 
    Smartphone, Globe, Lock, Sparkles, BookOpen, ShoppingBag, DollarSign, 
    Bot, Layers, ChevronRight, ShieldCheck, Award
} from 'lucide-react'
import { InteractiveFeaturePreview } from './_components/InteractiveFeaturePreview'

// Lazy load below-the-fold components for performance
const FAQSection = dynamic(() => import('./_components/FAQSection').then(mod => ({ default: mod.FAQSection })), {
    loading: () => <div className="py-20 text-center text-slate-400 font-medium">Loading FAQ...</div>,
})

const TestimonialCarousel = dynamic(() => import('./_components/TestimonialCarousel').then(mod => ({ default: mod.TestimonialCarousel })), {
    loading: () => <div className="py-20 text-center text-slate-400 font-medium">Loading testimonials...</div>,
})

const ALL_FEATURES = [
    { icon: FileText, title: 'GST Compliant Invoicing', desc: 'Create CGST, SGST, IGST invoices with QR code payment in under 30 seconds', color: 'emerald' },
    { icon: Sparkles, title: 'CRM & Sales Pipeline', desc: 'Visual deal stages, activity timeline follow-ups, and win rate forecasts', color: 'black' },
    { icon: BookOpen, title: 'Double-Entry Bookkeeping', desc: 'Chart of Accounts, Trial Balance, P&L, Balance Sheet & Bank Reconciliation', color: 'emerald' },
    { icon: ShoppingBag, title: 'Purchase Orders', desc: 'Issue vendor POs, track partial deliveries, and auto-update stock inventory', color: 'black' },
    { icon: DollarSign, title: 'Payroll & Salary Slips', desc: 'Employee salary structures, PF/ESI/TDS deductions, and PDF payslips', color: 'emerald' },
    { icon: Layers, title: 'Inventory Valuation', desc: 'Weighted average stock valuation, batch/lot tracking, and reorder alerts', color: 'black' },
    { icon: Bot, title: 'AI Accountant Assistant', desc: 'Ask natural language tax & finance questions powered by AI logic', color: 'emerald' },
    { icon: Users, title: 'CA Marketplace & Audit', desc: 'Connect with certified CAs for tax filing, audit reports, and advice', color: 'black' },
    { icon: RefreshCw, title: 'Recurring Subscriptions', desc: 'Automate monthly and annual invoice generation with auto reminders', color: 'emerald' },
    { icon: Smartphone, title: 'WhatsApp Direct Share', desc: 'Send PDF invoice links directly to client WhatsApp numbers in 1 click', color: 'black' },
    { icon: ShieldCheck, title: 'Multi-User Team Roles', desc: 'Assign Owner, Admin, Manager, and Accountant access permissions', color: 'emerald' },
    { icon: Lock, title: 'Bank Grade Security', desc: '256-bit encryption, automated daily backups, and complete data privacy', color: 'black' },
]

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-950 selection:bg-emerald-500 selection:text-white font-sans antialiased">
            {/* Apple-style Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
                                <Image 
                                    src="/logo-icon.svg" 
                                    alt="BillBooky" 
                                    width={36} 
                                    height={36}
                                    priority
                                />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                                BillBooky<span className="text-emerald-600">.</span>
                            </span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                            <Link href="#features" className="hover:text-black transition-colors">Features</Link>
                            <Link href="#showcase" className="hover:text-black transition-colors">Live Preview</Link>
                            <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
                            <Link href="/ca-marketplace" className="hover:text-black transition-colors">CA Services</Link>
                            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="ghost" className="text-slate-700 hover:text-black hover:bg-slate-100 font-bold min-h-[44px] rounded-full px-5">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="bg-black hover:bg-slate-900 text-white font-bold shadow-md shadow-black/10 min-h-[44px] px-6 rounded-full transition-all duration-300 hover:scale-105">
                                    Get Started Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Apple Hero Section */}
            <section className="relative pt-12 sm:pt-20 pb-20 md:pb-28 overflow-hidden bg-white">
                {/* Subtle Apple gradient aura */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-gradient-to-tr from-emerald-500/10 via-emerald-400/5 to-slate-200/20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
                        {/* Apple Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                            <span className="text-xs sm:text-sm font-bold text-emerald-800 tracking-wide uppercase">
                                All-In-One Business Operating System
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 -tracking-tight leading-[1.08]">
                            Accounting, Invoicing, CRM & Payroll.{' '}
                            <span className="bg-gradient-to-r from-slate-950 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                                Simple. Fast. Compliant.
                            </span>
                        </h1>

                        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                            Create GST invoices, track CRM sales pipelines, manage double-entry books, issue vendor POs, and run monthly staff payroll — all in one elegant workspace.
                        </p>

                        {/* Apple Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-slate-900 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px] gap-2">
                                    Start Free Account
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#showcase" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-slate-100/90 hover:bg-slate-200 text-slate-900 font-bold px-8 py-4 rounded-full border border-slate-200/80 hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px]">
                                    Explore Features
                                </Button>
                            </Link>
                        </div>

                        {/* Ratings & Social Proof */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-600 font-semibold">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                                ))}
                                <span className="font-bold text-slate-950 ml-1.5">4.9/5 Rating</span>
                            </div>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <div className="flex items-center gap-1.5 text-slate-700">
                                <CheckCircle className="w-4 h-4 text-emerald-600" /> 100% GST Compliant
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
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                            <div className="text-3xl sm:text-4xl font-black text-slate-950 font-mono">500+</div>
                            <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">Active Businesses</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">₹10Cr+</div>
                            <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">Invoices Processed</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                            <div className="text-3xl sm:text-4xl font-black text-black font-mono">100%</div>
                            <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">GST Audit Ready</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">6-in-1</div>
                            <div className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">Enterprise Modules</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Live Feature Preview Section */}
            <section id="showcase" className="py-20 sm:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200/80">
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
                                    className="bg-white p-7 rounded-[24px] border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-2xl shadow-slate-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <Icon className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-emerald-600 transition-colors">
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

            {/* Apple Style Pricing Section */}
            <section id="pricing" className="py-20 sm:py-28 bg-white border-t border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                            Transparent Pricing
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 -tracking-tight">
                            Simple, predictable plans
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base font-medium">
                            Start 100% free with no credit card required. Upgrade as your company grows.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 space-y-6 flex flex-col justify-between hover:shadow-xl transition-all shadow-xs">
                            <div className="space-y-4">
                                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block">Free Plan</span>
                                <div>
                                    <span className="text-4xl font-black text-slate-950">₹0</span>
                                    <span className="text-slate-400 text-xs font-semibold"> / forever</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Ideal for freelancers and new startups.</p>
                                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 50 Invoices / Month</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> GST Tax Compliance</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Customer & Items Directory</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Basic Financial Reports</li>
                                </ul>
                            </div>
                            <Link href="/signup">
                                <Button className="w-full bg-black hover:bg-slate-900 text-white font-bold min-h-[44px] rounded-full">
                                    Get Started Free
                                </Button>
                            </Link>
                        </div>

                        {/* Pro Starter Plan */}
                        <div className="bg-white p-8 rounded-[28px] border-2 border-emerald-600 space-y-6 flex flex-col justify-between shadow-2xl relative">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                                MOST POPULAR
                            </div>
                            <div className="space-y-4">
                                <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider block">Pro Starter</span>
                                <div>
                                    <span className="text-4xl font-black text-slate-950">₹299</span>
                                    <span className="text-slate-500 text-xs font-semibold"> / month</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Everything growing SMBs need.</p>
                                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> <strong>Unlimited</strong> Invoices & Quotes</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Full CRM & Deal Pipeline</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Bookkeeping & General Ledger</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Vendor Purchase Orders</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> WhatsApp Direct Sharing</li>
                                </ul>
                            </div>
                            <Link href="/signup">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold min-h-[44px] rounded-full shadow-lg shadow-emerald-600/25">
                                    Start 14-Day Free Trial
                                </Button>
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 space-y-6 flex flex-col justify-between hover:shadow-xl transition-all shadow-xs">
                            <div className="space-y-4">
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider block">Enterprise Suite</span>
                                <div>
                                    <span className="text-4xl font-black text-slate-950">₹599</span>
                                    <span className="text-slate-500 text-xs font-semibold"> / month</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Complete suite with AI & Payroll.</p>
                                <ul className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-black shrink-0" /> Everything in Pro Starter</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-black shrink-0" /> Full Payroll & Payslip Engine</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-black shrink-0" /> AI Accountant Assistant</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-black shrink-0" /> Multi-User Team Roles</li>
                                    <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-black shrink-0" /> Certified CA Marketplace Access</li>
                                </ul>
                            </div>
                            <Link href="/signup">
                                <Button className="w-full bg-black hover:bg-slate-900 text-white font-bold min-h-[44px] rounded-full">
                                    Get Enterprise Plan
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

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
                    <Link href="/signup" className="inline-block">
                        <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-500 font-black px-8 py-4 rounded-full shadow-xl text-base min-h-[52px] gap-2 hover:scale-105 transition-all duration-300">
                            Create Free Account Now
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Apple Footer */}
            <footer className="py-12 bg-white border-t border-slate-200 text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 text-base">BillBooky</span>
                        <span>© 2026 BillBooky Inc. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6 font-medium">
                        <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                        <Link href="/refund" className="hover:text-black transition-colors">Refund Policy</Link>
                        <Link href="/contact" className="hover:text-black transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
