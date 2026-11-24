'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  MessageCircle, 
  Mail, 
  Phone, 
  UserCheck, 
  DollarSign, 
  Receipt, 
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { getClientPortalData, type ClientPortalData } from '../actions'
import Link from 'next/link'

export default function ClientPortalPage() {
  const params = useParams()
  const customerId = params.customerId as string

  const [data, setData] = useState<ClientPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!customerId) return
      setLoading(true)
      const res = await getClientPortalData(customerId)
      if (res) {
        setData(res)
      } else {
        setError('Client account or ledger not found. Please contact your account manager for an updated portal link.')
      }
      setLoading(false)
    }
    load()
  }, [customerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading your client portal...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">{error || 'Unable to load client portal'}</p>
        </Card>
      </div>
    )
  }

  const { customer, business, assignedRm, invoices, metrics } = data

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      {/* Top Banner / White-Label Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {business.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-2">
                {business.name}
                {business.isEnterprise && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Enterprise VIP
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">B2B Client Relationship Portal</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-900">{customer.name}</div>
            {customer.organization_name && (
              <div className="text-[11px] text-slate-500">{customer.organization_name}</div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome & Assigned Relationship Manager Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {customer.name}
            </h2>
            <p className="text-sm text-slate-600">
              Review your statement ledger, download verified invoices, and connect directly with your dedicated client manager.
            </p>
          </div>

          {/* Relationship Manager Contact Card */}
          <Card className="border-indigo-100 bg-linear-to-br from-indigo-50/50 via-white to-purple-50/30 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Your Relationship Manager
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <CardTitle className="text-base text-slate-900 mt-1">
                {assignedRm?.name || 'Senior Account Manager'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {assignedRm?.designation || 'Client Relationship Lead'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedRm?.whatsappLink && (
                <a
                  href={assignedRm.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message on WhatsApp
                </a>
              )}
              {assignedRm?.email && (
                <a
                  href={`mailto:${assignedRm.email}?subject=Question regarding account ${encodeURIComponent(customer.name)}`}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Email Manager
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Statement Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total Billed</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    ₹{metrics.totalInvoiced.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">{metrics.invoicesCount} total invoices</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Total Settled</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                    ₹{metrics.totalPaid.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-700 mt-3">Completed settlements</p>
            </CardContent>
          </Card>

          <Card className={metrics.totalOutstanding > 0 ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${metrics.totalOutstanding > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                    Current Dues
                  </p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${metrics.totalOutstanding > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    ₹{metrics.totalOutstanding.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metrics.totalOutstanding > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-[11px] mt-3 ${metrics.totalOutstanding > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>
                {metrics.unpaidCount > 0 ? `${metrics.unpaidCount} invoice(s) pending payment` : 'All dues fully settled'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Statement Ledger */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Invoice Statement & Documents
            </CardTitle>
            <CardDescription className="text-xs">
              View and download your official tax invoices, payment receipts, and settlement records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No invoices issued yet for this account.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{inv.invoice_number}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inv.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Issued: {new Date(inv.invoice_date).toLocaleDateString()}</span>
                        {inv.due_date && <span>Due: {new Date(inv.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          ₹{inv.total_amount.toLocaleString('en-IN')}
                        </div>
                        {inv.balance_amount > 0 ? (
                          <div className="text-xs text-amber-600 font-semibold">
                            Balance: ₹{inv.balance_amount.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <div className="text-xs text-emerald-600 font-medium">Fully Settled</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {inv.balance_amount > 0 && (
                          <a
                            href={`https://wa.me/?text=Hello,%20I%20would%20like%20to%20settle%20invoice%20${inv.invoice_number}%20for%20₹${inv.balance_amount}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                          >
                            Pay Dues
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer - Enterprise White-Labeling Filter */}
      <footer className="mt-16 border-t border-slate-200/80 py-8 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          {business.isEnterprise ? (
            <p className="font-medium text-slate-600">
              © {new Date().getFullYear()} {business.name}. All Rights Reserved. • Enterprise B2B Client Portal
            </p>
          ) : (
            <p>
              Powered by <span className="font-semibold text-slate-700">BillBooky</span> • Secure B2B Client Ledger
            </p>
          )}
          {business.gstin && <p className="text-[11px] text-slate-400">GSTIN: {business.gstin}</p>}
        </div>
      </footer>
    </div>
  )
}
