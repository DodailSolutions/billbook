import Link from 'next/link'
import { ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getGspConfigStatus, isValidGstin } from '@/lib/gst-gsp'
import { getInvoiceSettings } from '@/app/(dashboard)/invoices/settings/actions'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function GstComplianceSettingsPage() {
    const [gsp, settings] = await Promise.all([
        Promise.resolve(getGspConfigStatus()),
        getInvoiceSettings(),
    ])
    const sellerGstin = settings?.company_gstin || ''
    const gstinValid = isValidGstin(sellerGstin)

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div>
                <Link href="/gst-health">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 mb-1">
                        <ArrowLeft className="h-4 w-4" /> GST Health
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    Live GST &amp; IRP E-Invoicing Settings
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Configure GSP API connectivity for IRN generation, government-signed QR codes, and E-Way Bills.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">GSP API Connection</CardTitle>
                        <CardDescription>Server environment status (`GSP_CLIENT_ID` / `GSP_CLIENT_SECRET`)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            {gsp.configured ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                    <CheckCircle2 className="h-4 w-4" /> Connected ({gsp.mode.toUpperCase()})
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                                    <AlertTriangle className="h-4 w-4" /> Pending Env Keys ({gsp.mode.toUpperCase()})
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 font-mono text-[11px]">{gsp.baseUrl}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Seller GSTIN Readiness</CardTitle>
                        <CardDescription>Validated from Invoice Settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        {gstinValid ? (
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="font-mono">{sellerGstin}</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                                    <AlertTriangle className="h-4 w-4" /> {sellerGstin ? 'Invalid GSTIN format' : 'No Seller GSTIN set'}
                                </span>
                                <div>
                                    <Link href="/invoices/settings" className="text-indigo-600 font-semibold hover:underline">
                                        Update in Invoice Settings →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
