import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { createCustomer } from "../actions"

export default function NewCustomerPage() {
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
                    <form action={createCustomer} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name <span className="text-destructive">*</span>
                            </label>
                            <Input id="name" name="name" required />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input id="email" name="email" type="email" />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                                Phone
                            </label>
                            <Input id="phone" name="phone" type="tel" />
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
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                                Create Customer
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
