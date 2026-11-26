'use client'

import { useState, useEffect } from "react"
import { Loader2, FileDown, Printer, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import type { InvoiceCopyType } from "@/lib/pdf-utils"

interface DownloadPDFButtonProps {
    invoiceId: string
    isPaid?: boolean
    initialShowBankDetails?: boolean
}

export function DownloadPDFButton({
    invoiceId,
    isPaid = false,
    initialShowBankDetails = false,
}: DownloadPDFButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [showBankDetails, setShowBankDetails] = useState(initialShowBankDetails)
    const [copyType, setCopyType] = useState<InvoiceCopyType>('original')
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const handler = (e: any) => {
            if (e.detail?.invoiceId === invoiceId) {
                setShowBankDetails(Boolean(e.detail.show))
            }
        }
        window.addEventListener('invoice_payment_details_toggle', handler)
        return () => window.removeEventListener('invoice_payment_details_toggle', handler)
    }, [invoiceId])

    const handleDownload = async (selectedCopy: InvoiceCopyType = copyType) => {
        setIsDownloading(true)
        setMenuOpen(false)
        let iframe: HTMLIFrameElement | null = null
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ])

            // Fetch the invoice HTML with paid bank details toggle
            const queryParams = new URLSearchParams({ mode: 'html', copy: selectedCopy })
            if (isPaid) {
                queryParams.set('show_bank_details_when_paid', String(showBankDetails))
            }
            const response = await fetch(`/api/invoices/${invoiceId}/pdf?${queryParams.toString()}`)
            
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
            const fallbackParams = new URLSearchParams({ mode: 'download' })
            if (isPaid) {
                fallbackParams.set('show_bank_details_when_paid', String(showBankDetails))
            }
            window.open(`/api/invoices/${invoiceId}/pdf?${fallbackParams.toString()}`, '_blank')
        } finally {
            if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe)
            }
            setIsDownloading(false)
        }
    }

    const handleThermalPrint = () => {
        setMenuOpen(false)
        const params = new URLSearchParams({ mode: 'download', format: 'thermal_80mm', copy: copyType })
        if (isPaid) {
            params.set('show_bank_details_when_paid', String(showBankDetails))
        }
        window.open(`/api/invoices/${invoiceId}/pdf?${params.toString()}`, '_blank')
    }

    return (
        <div className="relative inline-flex items-center">
            <Button
                onClick={() => handleDownload(copyType)}
                disabled={isDownloading}
                className="gap-2 rounded-r-none"
                title="Download PDF to your computer"
            >
                {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FileDown className="h-4 w-4" />
                )}
                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button
                type="button"
                variant="default"
                disabled={isDownloading}
                onClick={() => setMenuOpen(prev => !prev)}
                className="px-2 rounded-l-none border-l border-white/20"
                title="Copy label & Thermal 80mm options"
            >
                <ChevronDown className="h-4 w-4" />
            </Button>

            {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50 p-1.5 text-sm">
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Download Copy
                    </div>
                    {(['original', 'duplicate', 'triplicate'] as InvoiceCopyType[]).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => {
                                setCopyType(c)
                                handleDownload(c)
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                                copyType === c
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            {c === 'original' ? 'Original for Recipient' : c === 'duplicate' ? 'Duplicate for Transporter' : 'Triplicate for Supplier'}
                        </button>
                    ))}
                    <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                    <button
                        type="button"
                        onClick={handleThermalPrint}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Thermal 80mm Receipt
                    </button>
                </div>
            )}
        </div>
    )
}
