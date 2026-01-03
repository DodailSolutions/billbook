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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Invoices</h2>
                <div className="flex gap-2 flex-wrap">
                    <Link href="/invoices/settings" className="flex-1 sm:flex-none">
                        <Button variant="outline" className="gap-2 w-full">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Template Settings</span>
                            <span className="sm:hidden">Settings</span>
                        </Button>
                    </Link>
                    <Link href="/invoices/new" className="flex-1 sm:flex-none">
                        <Button className="gap-2 w-full">
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
