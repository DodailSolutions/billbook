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
            // Open PDF HTML in new window
            const pdfWindow = window.open(`/api/invoices/${invoiceId}/pdf`, '_blank')
            
            if (!pdfWindow) {
                throw new Error('Failed to open window. Please allow popups for this site.')
            }
            
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert(error instanceof Error ? error.message : 'Failed to open print window. Please allow popups.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button 
            onClick={handleDownload} 
            disabled={isLoading}
            className="gap-2"
            title="Opens print dialog where you can save as PDF"
        >
            <Download className="h-4 w-4" />
            {isLoading ? 'Generating...' : 'Download PDF'}
        </Button>
    )
}
