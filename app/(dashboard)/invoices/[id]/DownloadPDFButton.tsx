'use client'

import { useState } from "react"
import { Loader2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DownloadPDFButtonProps {
    invoiceId: string
}

export function DownloadPDFButton({ invoiceId }: DownloadPDFButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            // Fetch the invoice HTML
            const response = await fetch(`/api/invoices/${invoiceId}/pdf?mode=html`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch invoice')
            }
            
            const html = await response.text()
            
            // Extract invoice number from HTML if possible
            const invoiceNumberMatch = html.match(/Invoice[:\s#]*([A-Z0-9-]+)/i)
            const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : invoiceId
            
            // Create an isolated iframe to render the HTML without global CSS
            const iframe = document.createElement('iframe')
            iframe.style.position = 'absolute'
            iframe.style.left = '-9999px'
            iframe.style.width = '800px'
            iframe.style.height = '1200px'
            iframe.style.border = 'none'
            document.body.appendChild(iframe)
            
            // Write clean HTML to iframe without any global styles
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) {
                throw new Error('Failed to access iframe document')
            }
            
            iframeDoc.open()
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { background: white; padding: 40px; }
                    </style>
                </head>
                <body>${html}</body>
                </html>
            `)
            iframeDoc.close()
            
            const container = iframeDoc.body
            
            // Wait for images to load
            const images = container.getElementsByTagName('img')
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve()
                    return new Promise(resolve => {
                        img.onload = resolve
                        img.onerror = resolve
                    })
                })
            )
            
            // Convert to canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800,
                ignoreElements: (element) => {
                    // Ignore elements with problematic color formats
                    const style = window.getComputedStyle(element)
                    const bg = style.backgroundColor
                    const color = style.color
                    if (bg?.includes('lab') || bg?.includes('lch') || bg?.includes('oklch') ||
                        color?.includes('lab') || color?.includes('lch') || color?.includes('oklch')) {
                        return false // Don't ignore, but we've neutralized these
                    }
                    return false
                },
            })
            
            // Calculate dimensions for A4
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            
            const imgWidth = pdfWidth - 20 // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            
            let heightLeft = imgHeight
            let position = 10 // 10mm top margin
            
            // Add first page
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                10, // 10mm left margin
                position,
                imgWidth,
                imgHeight
            )
            
            heightLeft -= pdfHeight
            
            // Add additional pages if content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10
                pdf.addPage()
                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    10,
                    position,
                    imgWidth,
                    imgHeight
                )
                heightLeft -= pdfHeight
            }
            
            // Download the PDF
            pdf.save(`Invoice-${invoiceNumber}.pdf`)
            
            // Cleanup
            document.body.removeChild(iframe)
            
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert(error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="gap-2"
            title="Download PDF to your computer"
        >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="h-4 w-4" />
            )}
            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
    )
}
