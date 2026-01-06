import { FileBarChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { GSTReportGenerator } from "./GSTReportGenerator"
import { AccountingReportGenerator } from "./AccountingReportGenerator"

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
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileBarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileBarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Share Reports with Your CA or Accountant
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
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
