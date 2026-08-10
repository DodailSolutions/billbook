'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle, ClipboardCopy, Check, Database } from 'lucide-react'
import { checkMigrationStatus } from '@/lib/payroll-actions'

export function MigrationBanner() {
    const [migrationRequired, setMigrationRequired] = useState(false)
    const [sql, setSql] = useState('')
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkMigrationStatus().then(res => {
            setMigrationRequired(res.migrationRequired)
            setSql(res.sql)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(sql)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading || !migrationRequired) return null

    return (
        <Card className="border-amber-200 bg-amber-50/50 shadow-md max-w-5xl mx-auto mb-6 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 text-amber-800 rounded-xl mt-1">
                        <AlertTriangle className="h-6 w-6 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-amber-900 text-base sm:text-lg flex items-center gap-2">
                            <Database className="h-5 w-5" /> Database Migration Required
                        </h3>
                        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                            The Supabase database tables for Attendance, Leaves, and Salary Revisions are not set up yet. 
                            To enable the Attendance Tracking and Payroll features, please run the SQL queries below in your Supabase SQL Editor.
                        </p>
                    </div>
                </div>

                {sql && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                                SQL Script (supabase-erp-upgrade-migration.sql)
                            </span>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleCopy}
                                className="h-8 text-xs gap-1.5 border-amber-300 text-amber-850 hover:bg-amber-100/50 bg-white"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCopy className="h-3.5 w-3.5" /> Copy SQL Query
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="relative">
                            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-60 border border-slate-800 shadow-inner scrollbar-thin select-all">
                                {sql}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
