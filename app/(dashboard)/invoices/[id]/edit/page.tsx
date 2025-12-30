import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { InvoiceForm } from "../../new/InvoiceForm"
import { getInvoice } from "../../actions"
import { getCustomers } from "../../../customers/actions"

export default async function EditInvoicePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [invoice, customers] = await Promise.all([
        getInvoice(id),
        getCustomers()
    ])

    if (!invoice) {
        notFound()
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <Link href={`/invoices/${id}`}>
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Invoice
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Invoice {invoice.invoice_number}</CardTitle>
                </CardHeader>
                <CardContent>
                    <InvoiceForm customers={customers} invoice={invoice} mode="edit" />
                </CardContent>
            </Card>
        </div>
    )
}
