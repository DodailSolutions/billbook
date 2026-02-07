import { FileBarChart, UserPlus, Briefcase, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { GSTReportGenerator } from "./GSTReportGenerator"
import { AccountingReportGenerator } from "./AccountingReportGenerator"
import Link from 'next/link'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FileBarChart className="h-8 w-8 text-orange-500" />
                    Reports
                </h1>
                <p className="text-muted-foreground mt-2">
                    Generate and download reports for GST filing and accounting purposes
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* GST Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-blue-100  flex items-center justify-center">
                                <FileBarChart className="h-5 w-5 text-blue-600 text-blue-600" />
                            </div>
                            GST Report
                        </CardTitle>
                        <CardDescription>
                            Generate comprehensive GST reports for tax filing. Includes CGST, SGST, IGST breakdowns and reverse charge details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GSTReportGenerator />
                    </CardContent>
                </Card>

                {/* Accounting Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <FileBarChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            Accounting Report
                        </CardTitle>
                        <CardDescription>
                            Generate detailed accounting reports with revenue, expenses, and customer summaries for your accountant or CA.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AccountingReportGenerator />
                    </CardContent>
                </Card>
            </div>

            {/* Hire a CA Card */}
            <Card className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="shrink-0">
                            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Briefcase className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2 justify-center md:justify-start">
                                <UserPlus className="h-5 w-5" />
                                Need Professional Help?
                            </h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                                Hire a Chartered Accountant for GST filing, tax compliance, financial planning, and expert accounting services. Get matched with verified CAs in your area.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <Link href="/reports/hire-ca">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Hire a CA Now
                                    </Button>
                                </Link>
                                <Link href="/ca-marketplace">
                                    <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                        Browse CA Marketplace
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Access Management Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="shrink-0">
                            <div className="h-16 w-16 rounded-full bg-blue-100  flex items-center justify-center">
                                <Shield className="h-8 w-8 text-blue-600 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                                Manage CA Data Access
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                Review and approve data access requests from your hired CAs. Control what financial data they can access for GST filing, tax returns, and other services. Your data, your control.
                            </p>
                            <Link href="/reports/data-access">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Manage Data Access
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-50/20 border-gray-200">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileBarChart className="h-6 w-6 text-gray-600 text-gray-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900  mb-1">
                                Share Reports with Your CA or Accountant
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                All reports can be downloaded as PDF or Excel files and easily shared via email, WhatsApp, or any other platform. 
                                Reports include all necessary details for GST filing and accounting purposes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
