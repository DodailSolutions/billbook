import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getDashboardStats } from "./actions"
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react"

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Dashboard</h2>
                <p className="text-muted-foreground mt-2">Overview of your business metrics</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-green-500 hover:scale-105 transition-transform duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">₹{stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From paid invoices
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:scale-105 transition-transform duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Invoices
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalInvoices}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All invoices created
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 hover:scale-105 transition-transform duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Paid Invoices
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.paidInvoices}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully paid
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:scale-105 transition-transform duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Invoices
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting payment
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
