import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">BillBooky</h4>
            </div>
            <p className="text-sm text-gray-600">
              Professional invoicing for Indian businesses. GST-compliant, simple, and secure.
            </p>
          </div>
          
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Product</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/features" className="hover:text-emerald-600">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-600">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-600">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Company</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-emerald-600">About</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-600">Contact</Link></li>
              <li><Link href="/support" className="hover:text-emerald-600">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-gray-900 mb-4">Legal</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-emerald-600">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2025 BillBooky. Built with ❤️ for Indian businesses.</p>
          <p className="text-sm text-gray-600">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
