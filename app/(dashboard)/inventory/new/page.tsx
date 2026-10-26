import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { NewInventoryItemForm } from './NewInventoryItemForm'

export const dynamic = 'force-dynamic'

export default function NewInventoryItemPage() {
    return (
        <div className="space-y-4 max-w-3xl">
            <Link href="/inventory">
                <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inventory
                </Button>
            </Link>

            <Card className="shadow-md border border-gray-200 bg-white">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-xl text-gray-900">Add Inventory Item</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <NewInventoryItemForm />
                </CardContent>
            </Card>
        </div>
    )
}
