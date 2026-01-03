import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getCustomers } from "../../customers/actions"
import { InvoiceForm } from "./InvoiceForm"
import { checkInvoiceLimit } from '@/lib/plan-utils'

export default async function NewInvoicePage() {
    const [customers, limitStatus] = await Promise.all([
        getCustomers(),
        checkInvoiceLimit()
    ])

    // Check if user can create invoices
    if (!limitStatus.canCreate) {
        return (
            <div className="space-y-4 max-w-2xl">
                <Link href="/invoices">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Invoices
                    </Button>
                </Link>

                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            <CardTitle className="text-red-900 dark:text-red-100">Invoice Limit Reached</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {limitStatus.limit > 0 ? (
                            <>
                                <p className="text-red-800 dark:text-red-200">
                                    You've reached the limit of {limitStatus.limit} invoices on the Free plan. 
                                    Upgrade to continue creating unlimited invoices.
                                </p>
                                <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Current usage:</strong> {limitStatus.count} / {limitStatus.limit} invoices
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-red-800 dark:text-red-200">
                                Your plan has expired or you don't have access to create invoices. 
                                Please upgrade to continue.
                            </p>
                        )}
                        
                        <div className="flex gap-3">
                            <Link href="/pricing">
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    View Plans & Upgrade
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-4 border-t border-red-200 dark:border-red-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                💡 <strong>Pro tip:</strong> Get lifetime access for just ₹9,999 and never worry about limits again!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (customers.length === 0) {
        return (
            <div className="space-y-4 max-w-2xl">
                <Link href="/invoices">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Invoices
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>No Customers Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            You need to create at least one customer before creating an invoice.
                        </p>
                        <Link href="/customers/new">
                            <Button>Add Customer</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Link href="/invoices">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Invoices
                    </Button>
                </Link>
                
                {limitStatus.limit > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {limitStatus.count} / {limitStatus.limit} invoices used
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                    <InvoiceForm customers={customers} />
                </CardContent>
            </Card>
        </div>
    )
}
