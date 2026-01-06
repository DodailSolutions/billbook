'use client'

import { useState } from 'react'
import { Download, Share2, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function GSTReportGenerator() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [reportUrl, setReportUrl] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates')
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/reports/gst', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate })
            })

            if (!response.ok) {
                throw new Error('Failed to generate report')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            setReportUrl(url)
        } catch (error) {
            console.error('Error generating GST report:', error)
            alert('Failed to generate GST report. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (reportUrl) {
            const link = document.createElement('a')
            link.href = reportUrl
            link.download = `GST-Report-${startDate}-to-${endDate}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleShare = async () => {
        if (!reportUrl) return

        try {
            const response = await fetch(reportUrl)
            const blob = await response.blob()
            const file = new File([blob], `GST-Report-${startDate}-to-${endDate}.pdf`, { type: 'application/pdf' })

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'GST Report',
                    text: `GST Report from ${startDate} to ${endDate}`,
                    files: [file]
                })
            } else {
                // Fallback: just download
                handleDownload()
            }
        } catch (error) {
            console.error('Error sharing:', error)
            handleDownload()
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Report Period
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-muted-foreground">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Start Date"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="End Date"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                    <p className="font-medium">Report includes:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        <li>CGST, SGST, IGST breakdown</li>
                        <li>Intra-state and Inter-state supplies</li>
                        <li>Reverse charge transactions</li>
                        <li>Invoice-wise GST details</li>
                    </ul>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !startDate || !endDate}
                    className="flex-1"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Generate Report
                        </>
                    )}
                </Button>
            </div>

            {reportUrl && (
                <div className="flex gap-2 pt-2 border-t">
                    <Button onClick={handleDownload} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            )}
        </div>
    )
}
