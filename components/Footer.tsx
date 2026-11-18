import Link from 'next/link'
import Image from 'next/image'
import { RegionSwitcher } from './RegionSwitcher'

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-slate-200/80 bg-white text-slate-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & Subtitle */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo-full.svg" 
                alt="BillBooky" 
                width={136} 
                height={38}
                className="h-9 w-auto"
                priority
              />
            </Link>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs">
              Professional invoicing, CRM, double-entry bookkeeping, purchase orders & payroll for modern businesses.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h5 className="font-bold text-slate-950 mb-4 text-sm">Product</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h5 className="font-bold text-slate-950 mb-4 text-sm">Company</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h5 className="font-bold text-slate-950 mb-4 text-sm">Legal</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-blue-600 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar matching screenshot */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2.5">
            <Image 
              src="/logo-icon.svg" 
              alt="BillBooky" 
              width={20} 
              height={20} 
              className="w-5 h-5 shrink-0"
            />
            <span className="font-extrabold text-slate-950 text-sm tracking-tight">
              Bill<span className="text-blue-600">Booky</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-xs">
              © {new Date().getFullYear()} BillBooky Inc. All rights reserved.
            </span>
          </div>
          <RegionSwitcher variant="footer" />
        </div>
      </div>
    </footer>
  )
}

export { Footer as AppFooter }
