'use client'

import { useState } from "react"
import { Loader2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface DownloadPDFButtonProps {
    invoiceId: string
}

export function DownloadPDFButton({ invoiceId }: DownloadPDFButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        setIsDownloading(true)
        let iframe: HTMLIFrameElement | null = null
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ])

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
            // Positioned with slight opacity in viewport so html2canvas renders layout accurately
            iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.top = '0'
            iframe.style.left = '0'
            iframe.style.width = '800px'
            iframe.style.height = '1200px'
            iframe.style.opacity = '0.01'
            iframe.style.pointerEvents = 'none'
            iframe.style.zIndex = '-9999'
            iframe.style.border = 'none'
            document.body.appendChild(iframe)
            
            // Write clean HTML to iframe without any global styles
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) {
                throw new Error('Failed to access iframe document')
            }
            
            iframeDoc.open()
            iframeDoc.write(html.includes('<!DOCTYPE') ? html : `
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
            
            // Wait for images to load with max 2s timeout
            const images = container.getElementsByTagName('img')
            await Promise.race([
                Promise.all(
                    Array.from(images).map(img => {
                        if (img.complete) return Promise.resolve()
                        return new Promise(resolve => {
                            img.onload = resolve
                            img.onerror = resolve
                        })
                    })
                ),
                new Promise(resolve => setTimeout(resolve, 2000))
            ])
            
            // Convert to canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800,
                ignoreElements: (element) => {
                    const style = window.getComputedStyle(element)
                    const bg = style.backgroundColor
                    const color = style.color
                    if (bg?.includes('lab') || bg?.includes('lch') || bg?.includes('oklch') ||
                        color?.includes('lab') || color?.includes('lch') || color?.includes('oklch')) {
                        return false
                    }
                    return false
                },
            })
            
            // Calculate dimensions for A4
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            
            // Calculate with margins
            const maxWidth = pdfWidth - 20 // 10mm margin on each side
            const maxHeight = pdfHeight - 20 // 10mm margin top and bottom
            
            let imgWidth = maxWidth
            let imgHeight = (canvas.height * imgWidth) / (canvas.width || 1)
            
            // If content fits on one page, scale it to fit nicely
            if (imgHeight <= maxHeight) {
                const topMargin = (pdfHeight - imgHeight) / 2
                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    10,
                    topMargin,
                    imgWidth,
                    imgHeight
                )
            } else {
                let heightLeft = imgHeight
                let position = 10
                
                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    10,
                    position,
                    imgWidth,
                    imgHeight
                )
                
                heightLeft -= pdfHeight
                
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
            }
            
            // Download the PDF
            pdf.save(`Invoice-${invoiceNumber}.pdf`)
        } catch (error) {
            console.warn('Client-side jsPDF download failed, opening native print/PDF viewer:', error)
            // Fallback: open print dialog
            window.open(`/api/invoices/${invoiceId}/pdf?mode=download`, '_blank')
        } finally {
            if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe)
            }
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
