import Link from 'next/link'
import Image from 'next/image'
import { RegionSwitcher } from './RegionSwitcher'
import { Shield, Sparkles, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-16 sm:pb-14">
        {/* Apple Style Top Brand & Value Proposition */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="space-y-2 max-w-md">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src="/logo-icon.svg" 
                  alt="BillBooky" 
                  width={32} 
                  height={32}
                  priority
                />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Bill<span className="text-blue-600">Booky</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              The unified financial operating system for high-growth businesses, startups, and certified Chartered Accountants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              100% GST &amp; Tax Compliant
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Tally Prime XML Certified
            </span>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
          {/* Column 1: Core Modules */}
          <div>
            <h5 className="font-bold text-slate-950 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Operating Modules
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/invoices" className="hover:text-blue-600 transition-colors">GST Invoicing</Link></li>
              <li><Link href="/bookkeeping" className="hover:text-blue-600 transition-colors">Double-Entry Books</Link></li>
              <li><Link href="/crm" className="hover:text-blue-600 transition-colors">CRM &amp; Sales Pipeline</Link></li>
              <li><Link href="/purchase-orders" className="hover:text-blue-600 transition-colors">Purchase Orders &amp; Stock</Link></li>
              <li><Link href="/payroll" className="hover:text-blue-600 transition-colors">Payroll &amp; Payslips</Link></li>
            </ul>
          </div>

          {/* Column 2: CA Ecosystem */}
          <div>
            <h5 className="font-bold text-slate-950 dark:text-white mb-3 text-xs uppercase tracking-wider">
              CA Ecosystem
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/ca-marketplace" className="hover:text-blue-600 transition-colors">CA Marketplace</Link></li>
              <li><Link href="/hire-ca" className="hover:text-blue-600 transition-colors">Hire a Verified CA</Link></li>
              <li><Link href="/ca-registration" className="hover:text-blue-600 transition-colors">Register as Chartered Accountant</Link></li>
              <li><Link href="/for-cas" className="hover:text-blue-600 transition-colors">BillBooky for CAs</Link></li>
              <li><Link href="/gst-health" className="hover:text-blue-600 transition-colors">GST Health Audit Guard</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h5 className="font-bold text-slate-950 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Platform
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/#features" className="hover:text-blue-600 transition-colors">All Features</Link></li>
              <li><Link href="/#showcase" className="hover:text-blue-600 transition-colors">Interactive Live Preview</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Plans &amp; Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-blue-600 transition-colors">FAQ &amp; Knowledge Base</Link></li>
              <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Accounting &amp; Tax Blog</Link></li>
            </ul>
          </div>

          {/* Column 4: Company & Support */}
          <div>
            <h5 className="font-bold text-slate-950 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Company
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Dodail</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Enterprise Team</Link></li>
              <li><Link href="/support" className="hover:text-blue-600 transition-colors">Help Desk &amp; Tickets</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition-colors">Sign In to Workspace</Link></li>
              <li><Link href="/signup" className="hover:text-blue-600 transition-colors">Start Free Account</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal & Trust */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h5 className="font-bold text-slate-950 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Trust &amp; Legal
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-blue-600 transition-colors">Refund &amp; Cancellation</Link></li>
              <li><span className="text-slate-400 dark:text-slate-500 text-[11px] block pt-1">256-Bit SSL Encryption</span></li>
            </ul>
          </div>
        </div>
        
        {/* Apple Style Bottom Bar */}
        <div className="pt-8 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Dodail Solutions Private Limited. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>Crafted with Apple-grade precision for global commerce.</span>
          </div>
          <RegionSwitcher variant="footer" />
        </div>
      </div>
    </footer>
  )
}

export { Footer as AppFooter }
