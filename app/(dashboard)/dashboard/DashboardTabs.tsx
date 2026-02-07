'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { DollarSign, FileText, CheckCircle, Clock } from "lucide-react"

interface DashboardStats {
    totalRevenue: number
    totalInvoices: number
    paidInvoices: number
    pendingInvoices: number
}

interface DashboardTabsProps {
    stats: DashboardStats
}

export function DashboardTabs({ stats }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'recent'>('dashboard')

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header with Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Dashboard
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
                            Overview of your business metrics and performance
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                            activeTab === 'dashboard'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Dashboard
                        {activeTab === 'dashboard' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('recent')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                            activeTab === 'recent'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Recent Updates
                        {activeTab === 'recent' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                                ₹{stats.totalRevenue.toFixed(2)}
                            </div>
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
                            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {stats.totalInvoices}
                            </div>
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
                            <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats.paidInvoices}
                            </div>
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
                            <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {stats.pendingInvoices}
                            </div>
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
                            {/* Recent activity items */}
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
