import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { getDashboardStats } from "./actions"
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react"
import { DashboardTabs } from "./DashboardTabs"

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <DashboardTabs stats={stats} />
    )
}
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total Revenue
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:bg-green-900/30 flex items-center justify-center shadow-sm">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">₹{stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            From paid invoices
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total Invoices
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalInvoices}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            All invoices created
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Paid Invoices
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.paidInvoices}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Successfully paid
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pending Invoices
                        </CardTitle>
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-orange-100 to-amber-100 dark:bg-orange-900/30 flex items-center justify-center shadow-sm">
                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingInvoices}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Awaiting payment
                        </p>
                    </CardContent>
                </Card>
            </div>
            )}

            {/* Recent Updates Tab Content */}
            {activeTab === 'recent' && (
                <Card className="p-8 bg-white dark:bg-slate-800">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                        
                        <div className="space-y-4">
                            {/* Recent activity items would go here */}
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">New invoice created</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice #INV-001 for ₹10,000</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">Payment received</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">₹5,000 received for Invoice #INV-002</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 hours ago</p>
                                </div>
                            </div>

                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>No more recent updates</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
