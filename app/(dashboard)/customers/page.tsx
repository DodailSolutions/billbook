import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getCustomers } from "./actions"
import { CustomersList } from "./CustomersList"

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                <Link href="/customers/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            {customers.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No customers yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Get started by creating your first customer.
                        </p>
                        <Link href="/customers/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <CustomersList customers={customers} />
            )}
        </div>
    )
}
