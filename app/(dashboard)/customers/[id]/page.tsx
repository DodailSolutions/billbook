import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { getCustomer, updateCustomer } from "../actions"
import { getOrganizations } from "../../organizations/actions"

export default async function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [customer, organizations] = await Promise.all([
        getCustomer(id),
        getOrganizations().catch(() => [])
    ])

    if (!customer) {
        notFound()
    }

    const updateCustomerWithId = updateCustomer.bind(null, id)

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
                    <CardTitle>Edit Customer</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateCustomerWithId} className="space-y-4">
                        {/* Organization Section */}
                        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                            <label htmlFor="organization_id" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                Linked Organization / Company
                            </label>
                            <select
                                id="organization_id"
                                name="organization_id"
                                defaultValue={customer.organization_id || ""}
                                className="flex h-10 w-full rounded-lg border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                            >
                                <option value="">-- No Organization (Individual B2C) --</option>
                                {organizations.map((org: any) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name} {org.city ? `(${org.city})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={customer.name}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="designation" className="text-sm font-medium">
                                Designation / Role (Optional)
                            </label>
                            <Input
                                id="designation"
                                name="designation"
                                placeholder="e.g. Accounts Lead, Procurement, Managing Director"
                                defaultValue={customer.designation || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={customer.email || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                                Phone
                            </label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={customer.phone || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="gstin" className="text-sm font-medium">
                                GSTIN
                            </label>
                            <Input
                                id="gstin"
                                name="gstin"
                                placeholder="22AAAAA0000A1Z5"
                                maxLength={15}
                                defaultValue={customer.gstin || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="address" className="text-sm font-medium">
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                defaultValue={customer.address || ""}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                                Update Customer
                            </Button>
                            <Link href="/customers" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
