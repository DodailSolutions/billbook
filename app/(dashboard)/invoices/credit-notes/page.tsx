import Link from 'next/link'
import { ArrowLeft, FileMinus2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CreditNotesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let notes: any[] = []
    let schemaNotice: string | null = null

    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('id, invoice_number, invoice_date, total, status, document_type, customer:customers(name)')
            .eq('user_id', user.id)
            .in('document_type', ['credit_note', 'debit_note'])
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            schemaNotice = 'Run supabase-phase25-27-additive-migration.sql to enable Credit/Debit Note storage.'
        } else if (Array.isArray(data)) {
            notes = data
        }
    } catch {
        schemaNotice = 'Run supabase-phase25-27-additive-migration.sql to enable Credit/Debit Note storage.'
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <Link href="/invoices">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 mb-1">
                            <ArrowLeft className="h-4 w-4" /> Invoices
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileMinus2 className="h-6 w-6 text-indigo-600" />
                        Credit &amp; Debit Notes
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Issue GST-compliant returns, refunds, and post-sale price adjustments linked to tax invoices.
                    </p>
                </div>
                <Link href="/invoices/new?type=credit_note">
                    <Button className="gap-1.5">
                        <Plus className="h-4 w-4" /> New Credit Note
                    </Button>
                </Link>
            </div>

            {schemaNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    {schemaNotice}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Issued Credit &amp; Debit Notes</CardTitle>
                    <CardDescription>All adjustments automatically reflect in GSTR-1 CDNR and Client Portal balances.</CardDescription>
                </CardHeader>
                <CardContent>
                    {notes.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            No Credit or Debit Notes issued yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 uppercase">
                                        <th className="py-2.5 px-3">Note #</th>
                                        <th className="py-2.5 px-3">Type</th>
                                        <th className="py-2.5 px-3">Customer</th>
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {notes.map((n) => (
                                        <tr key={n.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3 font-semibold text-indigo-600">
                                                <Link href={`/invoices/${n.id}`}>{n.invoice_number}</Link>
                                            </td>
                                            <td className="py-2.5 px-3 capitalize">{(n.document_type || 'credit_note').replace('_', ' ')}</td>
                                            <td className="py-2.5 px-3">{n.customer?.name || 'Customer'}</td>
                                            <td className="py-2.5 px-3">{formatDate(n.invoice_date)}</td>
                                            <td className="py-2.5 px-3 text-right font-semibold">₹{Number(n.total || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
