import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getExpensesList, getExpenseCategoriesWithSeed, getVendorsList } from "./actions"
import { ExpensesList } from "./ExpensesList"

export default async function ExpensesPage() {
    const expenses = await getExpensesList()
    const categories = await getExpenseCategoriesWithSeed()
    const vendors = await getVendorsList()

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Expenses</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track and manage your business expenses, payouts, and bills.</p>
                </div>
                <Link href="/expenses/new" className="w-full sm:w-auto">
                    <Button className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add Expense
                    </Button>
                </Link>
            </div>

            {expenses.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No expenses found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Start tracking your business expenses. You can record payments to suppliers, rent, bills, office supplies, and more.
                        </p>
                        <Link href="/expenses/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <ExpensesList 
                    initialExpenses={expenses} 
                    categories={categories} 
                    vendors={vendors} 
                />
            )}
        </div>
    )
}
