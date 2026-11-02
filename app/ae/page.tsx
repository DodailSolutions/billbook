import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { 
  DollarSign, Globe, FileText, BarChart3, Users, Zap, CheckCircle2, 
  ArrowRight, Sparkles, Shield, Building2, CreditCard, Clock, 
  Receipt, Briefcase, ChevronRight, Check, Star, RefreshCw, 
  Layers, Lock, ShoppingBag, Bot, PhoneCall, LayoutDashboard, PlusCircle, MessageSquare
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { RegionSwitcher } from '@/components/RegionSwitcher'
import { PublicHeaderAuth } from '@/components/PublicHeaderAuth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'BillBooky UAE - VAT-Compliant Invoicing, CRM & Accounting Software',
  description: 'The complete business operating system for UAE and Middle East businesses. 5% UAE VAT calculations, TRN validation, bilingual Arabic/English tax invoices, 9% Corporate Tax records, and WhatsApp delivery.',
  keywords: 'UAE invoicing software, FTA VAT invoice generator, Dubai accounting software, bilingual Arabic invoice, UAE corporate tax software, TRN validation billbook'
}

const UAE_FEATURES = [
  {
    icon: FileText,
    title: 'FTA-Compliant 5% VAT Invoicing',
    desc: 'Instant 5% UAE VAT rate calculations, zero-rated exports, exempt supplies, and FTA tax audit file (FAF) export compatibility.',
    badge: 'FTA Compliant'
  },
  {
    icon: Shield,
    title: 'Instant TRN Validation',
    desc: 'Real-time format and checksum verification for 15-digit UAE Tax Registration Numbers (TRN) to prevent submission errors.',
    badge: 'TRN Verified'
  },
  {
    icon: Building2,
    title: 'Bilingual Arabic & English Invoices',
    desc: 'Generate elegant side-by-side bilingual Arabic (RTL) and English tax invoice PDFs meeting all Federal Tax Authority guidelines.',
    badge: 'Arabic & English'
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp 1-Click Invoice Delivery',
    desc: 'Send interactive PDF invoice links and automated payment reminders straight to your clients’ WhatsApp numbers with one tap.',
    badge: 'WhatsApp CRM'
  },
  {
    icon: Receipt,
    title: '9% UAE Corporate Tax Ledgers',
    desc: 'Track taxable income towards the AED 375,000 threshold, categorize deductible commercial expenses, and maintain audit-proof ledgers.',
    badge: 'Corporate Tax'
  },
  {
    icon: Globe,
    title: 'Multi-Currency (AED, USD, EUR, SAR)',
    desc: 'Base accounting in AED with live exchange rates for cross-border GCC and international trade (Saudi Riyal, US Dollar, Euro).',
    badge: 'Multi-Currency'
  },
  {
    icon: Sparkles,
    title: 'CRM & Commercial Sales Pipelines',
    desc: 'Manage sales deals across stages, record client meeting notes, automate quote-to-invoice conversion, and forecast pipeline revenue.',
    badge: 'Visual CRM'
  },
  {
    icon: BarChart3,
    title: 'Double-Entry Accounting & P&L',
    desc: 'Full Chart of Accounts, General Ledger, Profit & Loss, Balance Sheets, and bank reconciliation compliant with IFRS standards.',
    badge: 'IFRS Ready'
  },
  {
    icon: ShoppingBag,
    title: 'Multi-Location Inventory & POs',
    desc: 'Track stock across Mainland and Free Zone warehouses, issue vendor POs, receive stock lots, and calculate weighted average cost.',
    badge: 'Inventory'
  },
  {
    icon: Users,
    title: 'WPS-Ready Staff Payroll & Pay Slips',
    desc: 'Manage employee compensation (Basic + Housing + Transport allowances), track leave balances, and generate monthly PDF payslips.',
    badge: 'Payroll'
  },
  {
    icon: CreditCard,
    title: 'Card & Bank Payment Integration',
    desc: 'Accept card payments via Stripe, Tap, and direct UAE bank IBAN transfer with instant receipt generation and auto-reconciliation.',
    badge: 'Instant Pay'
  },
  {
    icon: Bot,
    title: '24/7 AI UAE Tax Copilot',
    desc: 'Get immediate guidance on FTA VAT decrees, deductible expenses, Free Zone Qualifying Income rules, and tax compliance.',
    badge: 'AI Assistant'
  }
]

export default async function UAELandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white" dir="ltr">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800">
        <span>🇦🇪 <strong>UAE Special:</strong> Full FTA 5% VAT & 9% Corporate Tax Suite. </span>
        <Link href="/ae/pricing" className="underline font-bold text-blue-400 hover:text-blue-300 ml-1">
          Plans from AED 49/month or Lifetime Deal →
        </Link>
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/ae" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 transition-transform group-hover:scale-105">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky UAE" 
                width={40} 
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5">
                BillBooky
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                  🇦🇪 UAE
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#vat-compliance" className="hover:text-blue-600 transition-colors">FTA VAT & Tax</Link>
            <Link href="#compare" className="hover:text-blue-600 transition-colors">Comparison</Link>
            <Link href="/ae/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>🇦🇪 UAE FEDERAL TAX AUTHORITY & CORPORATE TAX COMPLIANT</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.08] max-w-5xl mx-auto mb-4">
            Bilingual VAT Invoicing, CRM & Accounting.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Built for UAE Businesses.
            </span>
          </h1>

          {/* Arabic Subtitle */}
          <p className="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-300 mb-6 font-arabic" dir="rtl">
            الفاتورة الإلكترونية والمحاسبة الضريبية المتوافقة مع الهيئة الاتحادية للضرائب وضريبة الشركات 9٪
          </p>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium mb-10">
            Generate bilingual English and Arabic tax invoices with TRN validation, 5% UAE VAT calculations, 9% Corporate Tax ledgers, multi-currency billing (AED, USD, EUR, GBP), and WhatsApp delivery.
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
                <Link href="/signup?plan=starter-ae&trial=true" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-extrabold px-8 py-4 rounded-full shadow-lg shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px] gap-2">
                    Start 14-Day Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/ae/pricing" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-8 py-4 rounded-full border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 transition-all duration-300 text-base min-h-[52px]">
                    View AED Plans
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">AED 49</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Starter Monthly or AED 490/yr</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">5% VAT</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">FTA Compliant & TRN Checked</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Bilingual</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">English & Arabic Side-by-Side</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">9% CT</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Corporate Tax Threshold Track</div>
            </div>
          </div>

        </div>
      </section>

      {/* UAE Features Grid */}
      <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Tailored for UAE & GCC Market
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mt-2">
            Everything Required to Operate in Dubai & UAE
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            From Freelancers in Sharjah to Trading Establishments in Dubai Mainland & Free Zones — BillBooky handles all regulatory nuances out of the box.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {UAE_FEATURES.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section (BillBooky UAE vs Zoho vs QuickBooks) */}
      <section id="compare" className="py-16 sm:py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Honest Local Comparison
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 text-white">
              Why UAE Businesses Choose BillBooky Over Legacy Tools
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Avoid high monthly fees in US Dollars. Get native AED pricing, bilingual Arabic support, WhatsApp invoicing, and lifetime license deals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4 font-bold">Feature / Capability</th>
                  <th className="py-4 px-4 font-black text-emerald-400 text-sm bg-emerald-950/40 rounded-t-xl">BillBooky UAE</th>
                  <th className="py-4 px-4 font-bold">Zoho Books UAE</th>
                  <th className="py-4 px-4 font-bold">QuickBooks Online</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Starting Monthly Price</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-400 bg-emerald-950/40 text-base">AED 49 / month</td>
                  <td className="py-4 px-4 text-slate-400">AED 75 - AED 290 / mo</td>
                  <td className="py-4 px-4 text-slate-400">~$35 / mo (USD only)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Lifetime Founder Deal</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-400 bg-emerald-950/40">✅ AED 499 Lifetime</td>
                  <td className="py-4 px-4 text-rose-400">❌ Recurring monthly only</td>
                  <td className="py-4 px-4 text-rose-400">❌ Recurring monthly only</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Bilingual Arabic & English PDFs</td>
                  <td className="py-4 px-4 font-bold text-white bg-emerald-950/40">✅ Included natively</td>
                  <td className="py-4 px-4 text-slate-400">Partial customization</td>
                  <td className="py-4 px-4 text-rose-400">❌ Poor Arabic support</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">WhatsApp Direct PDF Share</td>
                  <td className="py-4 px-4 font-bold text-white bg-emerald-950/40">✅ 1-Click WhatsApp</td>
                  <td className="py-4 px-4 text-rose-400">❌ Third party add-on</td>
                  <td className="py-4 px-4 text-rose-400">❌ Not available</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">9% Corporate Tax Ledger</td>
                  <td className="py-4 px-4 font-bold text-white bg-emerald-950/40">✅ Included</td>
                  <td className="py-4 px-4 text-slate-400">Requires top tier plan</td>
                  <td className="py-4 px-4 text-rose-400">❌ Generic US/UK model</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-slate-300 font-bold">Visual CRM & Sales Deal Stages</td>
                  <td className="py-4 px-4 font-bold text-white bg-emerald-950/40 rounded-b-xl">✅ Built-in CRM</td>
                  <td className="py-4 px-4 text-rose-400">❌ Separate Zoho CRM subscription</td>
                  <td className="py-4 px-4 text-rose-400">❌ Not available</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <Link href="/ae/pricing">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-emerald-600/30 text-sm">
                Explore Full UAE AED Pricing Tiers →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* UAE FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight mt-2">
            Answers for UAE Companies & Free Zones
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              Are BillBooky invoices legally accepted by the Federal Tax Authority (FTA)?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes. All BillBooky tax invoices fulfill every mandatory requirement stipulated by UAE Federal Decree-Law No. (8) on Value Added Tax, including Tax Invoice heading, seller/buyer TRN, 5% line item breakdowns, and sequential numbering.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              How does the 9% Corporate Tax ledger work?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              BillBooky tracks your net accounting profit in real time against the AED 375,000 threshold, allowing you to clearly differentiate non-deductible expenses and prepare accurate reports for your annual corporate tax return filing.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-2">
              Can I use BillBooky in UAE Free Zones (DMCC, DIFC, Shams, IFZA, DAFZA)?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes. You can manage Free Zone designated zones with zero-rated VAT rules, commercial export invoices in USD/EUR, and multi-currency bank account reconciliation with UAE banks like Emirates NBD, ADCB, Mashreq, and Wio.
            </p>
          </div>
        </div>
      </section>

      {/* UAE Call to Action */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-blue-700 p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
              Upgrade Your UAE Business to BillBooky Today
            </h2>
            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto mb-8 font-medium">
              Start your 14-day free trial in under 60 seconds. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/signup?plan=starter-ae&trial=true" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-slate-100 font-extrabold px-8 py-4 rounded-full shadow-lg text-base min-h-[52px]">
                  Start 14-Day Free Trial →
                </Button>
              </Link>
              <Link href="/ae/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-full text-base min-h-[52px]">
                  View All AED Plans
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
                <Image src="/logo-icon.svg" alt="BillBooky UAE" width={28} height={28} />
                <span className="text-base font-black text-slate-950 dark:text-white">BillBooky UAE</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                FTA VAT-compliant invoicing and business operating system for UAE & Middle East enterprises.
              </p>
              <RegionSwitcher variant="footer" />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Product</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li><Link href="/ae/pricing" className="hover:text-emerald-600">AED Pricing Plans</Link></li>
                <li><Link href="/features" className="hover:text-emerald-600">Feature Suite</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-600">Create Account</Link></li>
                <li><Link href="/login" className="hover:text-emerald-600">Client Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Regions</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li><Link href="/ae" className="hover:text-emerald-600">🇦🇪 UAE & Middle East (AED)</Link></li>
                <li><Link href="/us" className="hover:text-emerald-600">🇺🇸 United States & Global (USD)</Link></li>
                <li><Link href="/" className="hover:text-emerald-600">🇮🇳 India (GST Ready - INR)</Link></li>
                <li><Link href="/ae/pricing" className="hover:text-emerald-600">🇦🇪 UAE Lifetime Deals</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Legal & Compliance</h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <li><Link href="/ae/terms" className="hover:text-emerald-600">UAE Terms of Service</Link></li>
                <li><Link href="/ae/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-emerald-600">Refund Policy</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600">Support & Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} BillBooky UAE. Dodail Solutions. All rights reserved.</p>
            <p>FTA VAT 5% Compliant • 9% Corporate Tax Ready • Bilingual Arabic/English</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
