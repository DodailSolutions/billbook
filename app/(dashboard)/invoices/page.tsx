import Link from "next/link"
import { Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getInvoices } from "./actions"
import { InvoicesList } from "./InvoicesList"

export default async function InvoicesPage() {
    const invoices = await getInvoices()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                <div className="flex gap-2">
                    <Link href="/invoices/settings">
                        <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Template Settings
                        </Button>
                    </Link>
                    <Link href="/invoices/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {invoices.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No invoices yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Create your first invoice to get started.
                        </p>
                        <Link href="/invoices/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Invoice
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <InvoicesList invoices={invoices} />
            )}
        </div>
    )
}
