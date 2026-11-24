import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { NewCustomerForm } from "./NewCustomerForm"
import { getOrganizations } from "../../organizations/actions"

export default async function NewCustomerPage() {
    const organizations = await getOrganizations().catch(() => [])

    return (
        <div className="space-y-4 max-w-2xl">
            <Link href="/customers">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Customers
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Customer</CardTitle>
                </CardHeader>
                <CardContent>
                    <NewCustomerForm organizations={organizations} />
                </CardContent>
            </Card>
        </div>
    )
}
