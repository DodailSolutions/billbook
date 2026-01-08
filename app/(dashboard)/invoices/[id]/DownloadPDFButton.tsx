'use client'

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface DownloadPDFButtonProps {
    invoiceId: string
}

export function DownloadPDFButton({ invoiceId }: DownloadPDFButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            // Open PDF HTML in new window and trigger print
            const pdfWindow = window.open(`/api/invoices/${invoiceId}/pdf`, '_blank')
            
            if (pdfWindow) {
                // Wait for content to load, then trigger print
                pdfWindow.onload = () => {
                    setTimeout(() => {
                        pdfWindow.focus()
                        pdfWindow.print()
                    }, 500)
                }
            } else {
                throw new Error('Failed to open print window. Please allow popups.')
            }
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert(error instanceof Error ? error.message : 'Failed to generate PDF. Please allow popups and try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button 
            onClick={handleDownload} 
            disabled={isLoading}
            className="gap-2"
        >
            <Download className="h-4 w-4" />
            {isLoading ? 'Generating...' : 'Download PDF'}
        </Button>
    )
}
