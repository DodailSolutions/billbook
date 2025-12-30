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
            // Open PDF in new window
            const pdfWindow = window.open(`/api/invoices/${invoiceId}/pdf`, '_blank')
            
            // Trigger print dialog after a short delay
            if (pdfWindow) {
                setTimeout(() => {
                    pdfWindow.print()
                }, 500)
            }
        } catch (error) {
            console.error('Error opening PDF:', error)
            alert('Failed to generate PDF')
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
