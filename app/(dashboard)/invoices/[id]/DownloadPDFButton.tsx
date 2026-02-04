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
            
            // Create a temporary container
            const container = document.createElement('div')
            container.innerHTML = html
            container.style.position = 'absolute'
            container.style.left = '-9999px'
            container.style.width = '800px' // Fixed width for consistent rendering
            container.style.background = 'white'
            container.style.padding = '40px'
            
            // Add style to convert oklch colors to rgb (html2canvas doesn't support oklch)
            const style = document.createElement('style')
            style.textContent = `
                * {
                    color-scheme: light !important;
                }
                [style*="oklch"], [style*="lab"], [style*="lch"] {
                    color: inherit !important;
                }
            `
            container.appendChild(style)
            document.body.appendChild(container)
            
            // Convert all oklch/lab/lch colors to rgb for html2canvas compatibility
            const allElements = container.querySelectorAll('*')
            allElements.forEach((el: Element) => {
                const htmlEl = el as HTMLElement
                const computedStyle = window.getComputedStyle(htmlEl)
                
                // Force recompute colors to rgb
                if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    htmlEl.style.backgroundColor = computedStyle.backgroundColor
                }
                if (computedStyle.color) {
                    htmlEl.style.color = computedStyle.color
                }
                if (computedStyle.borderColor) {
                    htmlEl.style.borderColor = computedStyle.borderColor
                }
            })
            
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
            document.body.removeChild(container)
            
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
