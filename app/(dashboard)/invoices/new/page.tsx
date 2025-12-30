import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getCustomers } from "../../customers/actions"
import { InvoiceForm } from "./InvoiceForm"

export default async function NewInvoicePage() {
    const customers = await getCustomers()

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
            <Link href="/invoices">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Invoices
                </Button>
            </Link>

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
