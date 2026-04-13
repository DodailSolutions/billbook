import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { getSavedItem, updateSavedItem } from "../../actions"

export default async function EditItemPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const item = await getSavedItem(id)

    if (!item) {
        notFound()
    }

    const updateWithId = updateSavedItem.bind(null, id)

    return (
        <div className="space-y-4 max-w-2xl">
            <Link href="/items">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Items
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateWithId} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Item Label <span className="text-destructive">*</span>
                            </label>
                            <Input id="name" name="name" defaultValue={item.name} placeholder="e.g. Web Design, Monthly Retainer" required />
                            <p className="text-xs text-muted-foreground">A short name to find this item quickly.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Invoice Line Description <span className="text-destructive">*</span>
                            </label>
                            <Input id="description" name="description" defaultValue={item.description} placeholder="e.g. Website design and development services" required />
                            <p className="text-xs text-muted-foreground">This text appears on the invoice line item.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="item_details" className="text-sm font-medium">
                                Additional Details
                            </label>
                            <textarea
                                id="item_details"
                                name="item_details"
                                rows={2}
                                defaultValue={item.item_details || ''}
                                placeholder="Optional notes or sub-description for the line item"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="unit_price" className="text-sm font-medium">
                                    Unit Price (₹) <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    id="unit_price"
                                    name="unit_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={item.unit_price}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="default_quantity" className="text-sm font-medium">
                                    Default Quantity
                                </label>
                                <Input
                                    id="default_quantity"
                                    name="default_quantity"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    defaultValue={item.default_quantity}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="hsn_sac_code" className="text-sm font-medium">
                                    HSN / SAC Code
                                </label>
                                <Input
                                    id="hsn_sac_code"
                                    name="hsn_sac_code"
                                    maxLength={8}
                                    defaultValue={item.hsn_sac_code || ''}
                                    placeholder="e.g. 998314"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="hsn_sac_type" className="text-sm font-medium">
                                    Type
                                </label>
                                <select
                                    id="hsn_sac_type"
                                    name="hsn_sac_type"
                                    defaultValue={item.hsn_sac_type || 'SAC'}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="SAC">SAC (Service)</option>
                                    <option value="HSN">HSN (Goods)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="gst_rate" className="text-sm font-medium">
                                    GST Rate (%)
                                </label>
                                <Input
                                    id="gst_rate"
                                    name="gst_rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    defaultValue={item.gst_rate ?? ''}
                                    placeholder="e.g. 18"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                                Update Item
                            </Button>
                            <Link href="/items" className="flex-1">
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
