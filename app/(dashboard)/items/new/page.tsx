import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { NewItemForm } from "./NewItemForm"

export default function NewItemPage() {
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
                    <CardTitle>Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <NewItemForm />
                </CardContent>
            </Card>
        </div>
    )
}
