import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-slate-200/80 bg-white text-slate-900 mt-16">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Product */}
          <div>
            <h3 className="font-bold text-slate-950 mb-4">Product</h3>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li><Link href="/#features" className="hover:text-emerald-600 transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
              <li><Link href="/#lifetime-deal" className="hover:text-emerald-600 transition-colors">Lifetime Deal</Link></li>
              <li><Link href="/enterprise" className="hover:text-emerald-600 transition-colors">Enterprise</Link></li>
            </ul>
          </div>

          {/* For CAs */}
          <div>
            <h3 className="font-bold text-slate-950 mb-4">For CAs</h3>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li><Link href="/ca-registration" className="hover:text-emerald-600 transition-colors">Register as CA</Link></li>
              <li><Link href="/hire-ca" className="hover:text-emerald-600 transition-colors">Hire a CA</Link></li>
              <li><Link href="/ca-marketplace" className="hover:text-emerald-600 transition-colors">CA Marketplace</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-slate-950 mb-4">Support</h3>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-emerald-600 transition-colors">Help Center</Link></li>
              <li><Link href="/docs" className="hover:text-emerald-600 transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-slate-950 mb-4">Legal</h3>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-emerald-600 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-slate-950 mb-4">Company</h3>
            <ul className="space-y-3 text-xs text-slate-600 font-medium">
              <li><Link href="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-emerald-600 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-emerald-600 transition-colors">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-950 text-base">BillBooky</span>
            <span>© 2026 BillBooky Inc. All rights reserved.</span>
          </div>
          <p className="text-slate-500">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
