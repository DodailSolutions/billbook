import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & Subtitle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/logo-icon.svg" 
                  alt="BillBooky Logo" 
                  width={32} 
                  height={32}
                />
              </div>
              <h4 className="text-xl font-black text-slate-950 tracking-tight">
                BillBooky<span className="text-emerald-600">.</span>
              </h4>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs">
              Professional invoicing, CRM, double-entry bookkeeping, purchase orders & payroll for Indian businesses.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h5 className="font-bold text-slate-950 mb-4 text-sm">Product</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/features" className="hover:text-emerald-600 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h5 className="font-bold text-slate-950 mb-4 text-sm">Company</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link></li>
              <li><Link href="/support" className="hover:text-emerald-600 transition-colors">Support</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h5 className="font-bold text-slate-950 mb-4 text-sm">Legal</h5>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-emerald-600 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar matching screenshot */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-950 text-base">BillBooky</span>
            <span className="text-slate-500">© 2026 BillBooky Inc. All rights reserved.</span>
          </div>
          <p className="text-slate-500 font-medium">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer as AppFooter }
