import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getCustomers } from "../../customers/actions"
import { getSavedItems } from "../../items/actions"
import { ImprovedInvoiceForm } from "./ImprovedInvoiceForm"
import { checkInvoiceLimit } from '@/lib/plan-utils'

export default async function NewInvoicePage() {
    const [customers, savedItems, limitStatus] = await Promise.all([
        getCustomers(),
        getSavedItems(),
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

                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                            <CardTitle className="text-red-900">Invoice Limit Reached</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {limitStatus.limit > 0 ? (
                            <>
                                <p className="text-red-800">
                                    You've reached the limit of {limitStatus.limit} invoices on the Free plan. 
                                    Upgrade to continue creating unlimited invoices.
                                </p>
                                <div className="bg-white border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        <strong>Current usage:</strong> {limitStatus.count} / {limitStatus.limit} invoices
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-red-800">
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

                        <div className="pt-4 border-t border-red-200">
                            <p className="text-xs text-gray-600">
                                💡 <strong>Pro tip:</strong> Get lifetime access for just ₹9,999 and never worry about limits again!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
            <ImprovedInvoiceForm customers={customers} savedItems={savedItems} />
        </div>
    )
}
