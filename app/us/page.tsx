import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { 
  DollarSign, Globe, FileText, BarChart3, Users, Zap, CheckCircle2, 
  ArrowRight, Sparkles, Shield, Building2, CreditCard, Clock, 
  Receipt, Briefcase, ChevronRight, Check, Star, RefreshCw, 
  Layers, Lock, ShoppingBag, Bot, PhoneCall, LayoutDashboard, PlusCircle
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { RegionSwitcher } from '@/components/RegionSwitcher'
import { PublicHeaderAuth } from '@/components/PublicHeaderAuth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'BillBooky USA & Global - Accounting, Invoicing, CRM & Payroll',
  description: 'The all-in-one business operating system for US and global businesses. Sales tax compliance across 50 states, IRS 1099 tracking, multi-currency invoicing, double-entry bookkeeping, and staff payroll.',
  keywords: 'US invoicing software, 50 states sales tax, 1099 contractor tracking, international bookkeeping, small business accounting USA, multi-currency invoice generator'
}

const GLOBAL_FEATURES = [
  {
    icon: FileText,
    title: '50-State Sales Tax Invoicing',
    desc: 'Auto-calculate destination & origin-based sales tax across all 50 US states with resale certificate storage and exemption tagging.',
    color: 'blue',
    badge: 'US Compliance'
  },
  {
    icon: Receipt,
    title: 'IRS 1099 Contractor Management',
    desc: 'Track independent contractor payouts, archive W-9 documents, and export 1099-NEC summaries ready for tax season.',
    color: 'indigo',
    badge: 'Tax Ready'
  },
  {
    icon: Globe,
    title: 'Multi-Currency Global Billing',
    desc: 'Invoice international clients seamlessly in USD ($), EUR (€), GBP (£), CAD ($), and AUD ($) with automated real-time exchange rates.',
    color: 'teal',
    badge: 'Multi-Currency'
  },
  {
    icon: Sparkles,
    title: 'Visual CRM & Deal Pipelines',
    desc: 'Track sales deals through customizable stages, schedule client follow-ups, record meeting notes, and forecast revenue.',
    color: 'amber',
    badge: 'Built-In CRM'
  },
  {
    icon: BarChart3,
    title: 'Double-Entry GAAP Bookkeeping',
    desc: 'Complete Chart of Accounts, General Ledger, real-time Profit & Loss (P&L), Balance Sheets, and bank reconciliation.',
    color: 'emerald',
    badge: 'Accounting'
  },
  {
    icon: ShoppingBag,
    title: 'Purchase Orders & Inventory',
    desc: 'Issue vendor purchase orders, receive inventory lots, track stock levels across locations, and calculate weighted average cost.',
    color: 'rose',
    badge: 'Inventory'
  },
  {
    icon: RefreshCw,
    title: 'Recurring Billing & Retainers',
    desc: 'Automate monthly and annual retainer invoicing with client credit card auto-charge, payment reminders, and customer portal.',
    color: 'sky',
    badge: 'Automation'
  },
  {
    icon: Users,
    title: 'Global Staff Payroll & Paystubs',
    desc: 'Generate downloadable PDF paystubs for salaried & hourly employees, track payroll deductions, and monitor PTO balances.',
    color: 'purple',
    badge: 'Payroll'
  },
  {
    icon: CreditCard,
    title: 'Stripe, PayPal & ACH Payments',
    desc: 'Embed 1-click payment links on invoices. Accept credit cards, Apple Pay, Google Pay, and bank ACH with zero platform markup.',
    color: 'blue',
    badge: 'Instant Pay'
  },
  {
    icon: Bot,
    title: 'AI Financial Assistant',
    desc: 'Ask your AI Accountant questions about deductible expenses, cash runway projections, and tax optimization 24/7.',
    color: 'violet',
    badge: 'AI Powered'
  },
  {
    icon: Layers,
    title: 'Multi-User Team Roles',
    desc: 'Delegate access to Owners, Admins, Bookkeepers, and Staff with fine-grained permissions and tamper-proof audit trails.',
    color: 'slate',
    badge: 'Collaboration'
  },
  {
    icon: Lock,
    title: 'Bank-Grade 256-Bit Security',
    desc: 'SOC-2 compliant architecture, end-to-end SSL encryption, automated off-site backups, and strict privacy standards.',
    color: 'slate',
    badge: 'Enterprise Security'
  }
]

const GLOBAL_COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', label: '50 States Sales Tax' },
  { name: 'Canada', flag: '🇨🇦', label: 'GST / HST / PST' },
  { name: 'United Kingdom', flag: '🇬🇧', label: 'HMRC 20% VAT' },
  { name: 'Australia', flag: '🇦🇺', label: 'ATO 10% GST' },
  { name: 'Singapore', flag: '🇸🇬', label: 'IRAS 9% GST' },
  { name: 'Germany', flag: '🇩🇪', label: '19% MwSt. (VAT)' },
  { name: 'Ireland', flag: '🇮🇪', label: 'Revenue 23% VAT' },
  { name: 'New Zealand', flag: '🇳🇿', label: 'IRD 15% GST' },
  { name: 'South Africa', flag: '🇿🇦', label: 'SARS 15% VAT' },
  { name: 'United Arab Emirates', flag: '🇦🇪', label: 'FTA 5% VAT' },
  { name: 'Japan', flag: '🇯🇵', label: '10% Consumption Tax' },
  { name: 'Worldwide', flag: '🌍', label: 'Custom Tax Rules' }
]

export default async function USInternationalLandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800">
        <span>🌍 <strong>Global Launch:</strong> BillBooky International is now live across USA, Canada, UK, Australia & 50+ countries. </span>
        <Link href="/us/pricing" className="underline font-bold text-blue-400 hover:text-blue-300 ml-1">
          Get Started from $9/mo →
        </Link>
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/us" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 transition-transform group-hover:scale-105">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky International" 
                width={40} 
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5">
                BillBooky
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                  Global
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#tax-compliance" className="hover:text-blue-600 transition-colors">Sales Tax & 1099</Link>
            <Link href="#compare" className="hover:text-blue-600 transition-colors">Comparison</Link>
            <Link href="/us/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-blue-600 transition-colors">FAQ</Link>
          </div>

          {/* Controls: Region Switcher + Theme Toggle + Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <RegionSwitcher />
            <ThemeToggle />
            <PublicHeaderAuth initialAuthenticated={isAuthenticated} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 bg-radial-[at_50%_0%] from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>🇺🇸 US & INTERNATIONAL BUSINESS OPERATING SYSTEM</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.08] max-w-5xl mx-auto mb-6">
            Accounting, Invoicing, CRM & Payroll.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Built for Global Growth.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium mb-10">
            Create sales tax-compliant invoices across 50 US states, track deals in visual CRM pipelines, manage GAAP-ready double-entry books, issue vendor POs, and run staff payroll — all in one modern workspace.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-14">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-blue-600/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px] gap-2.5">
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup?plan=starter-us&trial=true" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold px-8 py-4 rounded-full shadow-lg shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px] gap-2">
                    Start 14-Day Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/us/pricing" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-8 py-4 rounded-full border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px]">
                    View USD Plans
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">$9/mo</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Starter Plan or $49/yr</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">50 States</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">US Sales Tax Ready</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">10+ Currencies</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">USD, EUR, GBP, CAD, AUD</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">14 Days</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Free Trial • No Card Req.</div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive App Preview Showcase */}
      <section className="py-16 sm:py-24 bg-slate-50/60 dark:bg-slate-900/30 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Next-Gen Business Workspace
            </h2>
            <h3 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              One Unified Workspace to Run Your Entire Enterprise
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
              Say goodbye to juggling 6 disconnected tools and expensive per-user licenses. BillBooky combines invoicing, CRM, double-entry books, inventory, and payroll into one lightning-fast interface.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                US Sales Tax & 1099 Ready
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Automated rate calculation for all states and municipalities. Tag contractor expenses and generate clean 1099-NEC reports when tax season arrives.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Destination & origin tax calculation</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Resale certificates & exemption vaults</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Exportable 1099 summaries for IRS filing</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                Visual CRM & Deal Pipelines
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Turn leads into paying accounts. Drag deals across pipeline stages, automate reminders, record client call logs, and forecast your quarterly cash flows.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Visual Kanban sales deal boards</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 1-Click invoice generation from Won deals</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Activity history & customer timeline tracking</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                Double-Entry GAAP Accounting
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Full standard Chart of Accounts with debit/credit journal entries. Generate GAAP-compliant P&L, Balance Sheets, and Cash Flow statements in seconds.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Automatic double-entry ledger postings</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Bank reconciliation & transaction matching</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> CPA & Bookkeeper guest portal access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Full 12-Feature Grid */}
      <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Enterprise Grade Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mt-2">
            Engineered for Modern Global Teams
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            Every feature you need to scale from day one — without paying extra for add-ons or hidden per-seat fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {GLOBAL_FEATURES.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section (BillBooky vs Competitors) */}
      <section id="compare" className="py-16 sm:py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Clear Value Comparison
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 text-white">
              Why US Businesses Are Switching to BillBooky
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Traditional accounting software charges you per user, per company, and for essential add-ons like CRM, Inventory, and Payroll. BillBooky packages everything for a fraction of the price.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4 font-bold">Feature / Capability</th>
                  <th className="py-4 px-4 font-black text-blue-400 text-sm bg-blue-950/40 rounded-t-xl">BillBooky Global</th>
                  <th className="py-4 px-4 font-bold">QuickBooks Online</th>
                  <th className="py-4 px-4 font-bold">FreshBooks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Monthly Starting Price</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-400 bg-blue-950/40 text-base">$9 / month ($49/yr)</td>
                  <td className="py-4 px-4 text-slate-400">$35 - $90 / month</td>
                  <td className="py-4 px-4 text-slate-400">$19 - $60 / month</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">One-Time Lifetime Deal Option</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-400 bg-blue-950/40">✅ Yes ($149 Lifetime)</td>
                  <td className="py-4 px-4 text-rose-400">❌ Recurring subscription only</td>
                  <td className="py-4 px-4 text-rose-400">❌ Recurring subscription only</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Visual CRM & Sales Pipelines</td>
                  <td className="py-4 px-4 font-bold text-white bg-blue-950/40">✅ Included natively</td>
                  <td className="py-4 px-4 text-rose-400">❌ Requires external CRM</td>
                  <td className="py-4 px-4 text-rose-400">❌ Basic estimates only</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Staff Payroll & Paystubs</td>
                  <td className="py-4 px-4 font-bold text-white bg-blue-950/40">✅ Included</td>
                  <td className="py-4 px-4 text-rose-400">❌ Extra $45/mo + $6/employee</td>
                  <td className="py-4 px-4 text-rose-400">❌ Requires Gusto add-on</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Purchase Orders & Inventory Valuation</td>
                  <td className="py-4 px-4 font-bold text-white bg-blue-950/40">✅ Included</td>
                  <td className="py-4 px-4 text-slate-400">Requires Plus plan ($99/mo)</td>
                  <td className="py-4 px-4 text-rose-400">❌ Limited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">AI Accountant Copilot (24/7)</td>
                  <td className="py-4 px-4 font-bold text-white bg-blue-950/40 rounded-b-xl">✅ Built-in AI</td>
                  <td className="py-4 px-4 text-rose-400">❌ Extra fees</td>
                  <td className="py-4 px-4 text-rose-400">❌ Not available</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <Link href="/us/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-blue-600/30 text-sm">
                Explore Full USD Pricing Tiers →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Supported Countries Banner */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Global Readiness
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight mt-2 mb-3">
            Trusted by Entrepreneurs in 50+ Countries
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto mb-10">
            Configure flexible tax rules, currencies, address formats, and date conventions for any country or jurisdiction in seconds.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {GLOBAL_COUNTRIES.map((c, i) => (
              <div 
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center hover:border-blue-500/50 transition-colors"
              >
                <div className="text-2xl mb-1">{c.flag}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Testimonials */}
      <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Loved by Global Entrepreneurs
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
              Discover how businesses worldwide run smoothly with BillBooky.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6">
                  &ldquo;Handling multi-state sales tax for our US e-commerce store used to be a complete headache. BillBooky calculates state destination tax automatically and makes our quarterly filings seamless.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  SM
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Sarah Miller</div>
                  <div className="text-[11px] text-slate-500">Founder, Apex Commerce LLC • Austin, TX 🇺🇸</div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6">
                  &ldquo;We invoice clients in USD, EUR, and GBP. Having live exchange rates with Stripe 1-click checkout built directly onto the invoice increased our on-time payments by over 40%.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  DR
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">David Ross</div>
                  <div className="text-[11px] text-slate-500">Managing Director, CloudSphere Agency • Toronto 🇨🇦</div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6">
                  &ldquo;I bought the Lifetime Growth deal for $249 and never looked back. The visual CRM pipeline and double-entry books saved me over $800 every single year in SaaS subscriptions.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  LH
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Liam Hughes</div>
                  <div className="text-[11px] text-slate-500">CEO, Hughes Tech Consulting • London 🇬🇧</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight mt-2">
            Answers for US & International Clients
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              Does BillBooky support US state sales tax and exemption rules?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes. You can configure destination-based or origin-based sales tax rules for any state, county, or municipality. You can also mark specific customers as tax-exempt and store resale certificates securely.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              Can I invoice clients in foreign currencies like EUR, GBP, and CAD?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Absolutely. BillBooky features multi-currency invoicing with real-time conversion into your base accounting currency (USD), so your general ledger, P&L, and balance sheet stay 100% accurate.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              What payment gateways are supported for international invoice payments?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You can connect Stripe, PayPal, and ACH direct deposit. Clients receive an instant payment link on their invoice and can pay using credit card, debit card, Apple Pay, Google Pay, or direct bank transfer.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              How do the Lifetime Deals work?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our Lifetime Founder Deals ($149 Starter, $249 Growth, $399 Pro) grant you full access to BillBooky forever with zero monthly or annual recurring software fees. All future core updates are included.
            </p>
          </div>
        </div>
      </section>

      {/* Global Call to Action */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
              Ready to Upgrade Your Global Business?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto mb-8 font-medium">
              Join entrepreneurs in over 50 countries saving thousands on accounting software. Start your 14-day free trial in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/signup?plan=starter-us&trial=true" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-slate-100 font-extrabold px-8 py-4 rounded-full shadow-lg text-base min-h-[52px]">
                  Start 14-Day Free Trial →
                </Button>
              </Link>
              <Link href="/us/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-full text-base min-h-[52px]">
                  View All USD Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo-icon.svg" alt="BillBooky" width={28} height={28} />
                <span className="text-base font-black text-slate-950 dark:text-white">BillBooky Global</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                The all-in-one business operating system for modern international companies.
              </p>
              <RegionSwitcher variant="footer" />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Product</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li><Link href="/us/pricing" className="hover:text-blue-600">USD Pricing Plans</Link></li>
                <li><Link href="/features" className="hover:text-blue-600">Feature Suite</Link></li>
                <li><Link href="/signup" className="hover:text-blue-600">Create Account</Link></li>
                <li><Link href="/login" className="hover:text-blue-600">Client Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Regions</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li><Link href="/us" className="hover:text-blue-600">🇺🇸 United States & Global</Link></li>
                <li><Link href="/ae" className="hover:text-blue-600">🇦🇪 UAE & GCC (VAT Ready)</Link></li>
                <li><Link href="/" className="hover:text-blue-600">🇮🇳 India (GST Ready)</Link></li>
                <li><Link href="/us/pricing" className="hover:text-blue-600">🌍 International Currency Plans</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Company & Legal</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-blue-600">Refund Policy</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact & Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} BillBooky by Dodail Solutions Private Limited. All rights reserved.</p>
            <p>US & International Edition • SOC-2 & 256-Bit SSL Protected</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
