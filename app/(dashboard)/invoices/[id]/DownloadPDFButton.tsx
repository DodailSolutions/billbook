'use client'

import { useState } from "react"
import { Download, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface DownloadPDFButtonProps {
    invoiceId: string
}

export function DownloadPDFButton({ invoiceId }: DownloadPDFButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const handlePreview = async () => {
        setIsLoading(true)
        try {
            // Open PDF preview in new window
            const pdfWindow = window.open(`/api/invoices/${invoiceId}/pdf?mode=preview`, '_blank')
            
            if (!pdfWindow) {
                throw new Error('Failed to open window. Please allow popups for this site.')
            }
            
        } catch (error) {
            console.error('Error opening preview:', error)
            alert(error instanceof Error ? error.message : 'Failed to open preview window. Please allow popups.')
        } finally {
            setTimeout(() => setIsLoading(false), 500)
        }
    }

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            // Open PDF in download mode (auto-triggers print dialog)
            const pdfWindow = window.open(`/api/invoices/${invoiceId}/pdf?mode=download`, '_blank')
            
            if (!pdfWindow) {
                throw new Error('Failed to open window. Please allow popups for this site.')
            }
            
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert(error instanceof Error ? error.message : 'Failed to open print window. Please allow popups.')
        } finally {
            setTimeout(() => setIsDownloading(false), 500)
        }
    }

    return (
        <div className="flex gap-2">
            <Button 
                onClick={handlePreview} 
                disabled={isLoading || isDownloading}
                variant="outline"
                className="gap-2"
                title="Preview invoice before downloading"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
                {isLoading ? 'Loading...' : 'Preview'}
            </Button>
            <Button 
                onClick={handleDownload} 
                disabled={isLoading || isDownloading}
                className="gap-2"
                title="Download invoice as PDF"
            >
                {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                {isDownloading ? 'Generating...' : 'Download PDF'}
            </Button>
        </div>
    )
}
