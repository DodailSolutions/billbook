import { HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { SupportForm } from "./SupportForm"
import { FAQSection } from "./FAQSection"

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-cyan-500" />
                    Support
                </h1>
                <p className="text-muted-foreground mt-2">
                    Need help? Raise a support ticket or check our frequently asked questions
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Support Form - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Raise a Support Ticket</CardTitle>
                            <CardDescription>
                                Having an issue or need assistance? Fill out the form below and our team will get back to you as soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SupportForm />
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Help - Takes 1 column */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Help</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1 text-sm">
                                    📧 Email Support
                                </h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    support@billbooky.com
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1 text-sm">
                                    💬 WhatsApp Support
                                </h4>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    Available Mon-Fri, 9 AM - 6 PM IST
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1 text-sm">
                                    ⏱️ Response Time
                                </h4>
                                <p className="text-xs text-purple-700 dark:text-purple-300">
                                    We typically respond within 24 hours
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Common Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                                    <span className="text-muted-foreground">Invoice generation issues</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                                    <span className="text-muted-foreground">GST calculation questions</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                                    <span className="text-muted-foreground">Payment tracking</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                                    <span className="text-muted-foreground">Report generation</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                                    <span className="text-muted-foreground">Account & billing</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* FAQ Section */}
            <FAQSection />
        </div>
    )
}
