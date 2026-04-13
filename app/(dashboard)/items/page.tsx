import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getSavedItems } from "./actions"
import { ItemsList } from "./ItemsList"

export default async function ItemsPage() {
    const items = await getSavedItems()

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Items</h2>
                    <p className="text-sm text-muted-foreground mt-1">Save reusable products and services to add to invoices quickly.</p>
                </div>
                <Link href="/items/new" className="w-full sm:w-auto">
                    <Button className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </Link>
            </div>

            {items.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No saved items yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Save your frequently used products or services here. They'll appear as quick-add chips when creating invoices.
                        </p>
                        <Link href="/items/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <ItemsList items={items} />
            )}
        </div>
    )
}
