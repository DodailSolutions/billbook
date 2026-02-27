'use client'

import { useState } from 'react'
import { Share2, Mail, Copy, Check, Printer, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ShareInvoiceButtonProps {
    invoiceId: string
    invoiceNumber: string
    customerName: string
    customerPhone?: string
    total: number
}

export function ShareInvoiceButton({ 
    invoiceId, 
    invoiceNumber, 
    customerName,
    customerPhone,
    total 
}: ShareInvoiceButtonProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const invoiceUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invoices/${invoiceId}`

    const generatePDFBlob = async (): Promise<Blob> => {
        setIsGenerating(true)
        try {
            // Fetch the invoice HTML
            const response = await fetch(`/api/invoices/${invoiceId}/pdf?mode=html`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch invoice')
            }
            
            const html = await response.text()
            
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
            
            // Generate PDF
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            
            // Calculate with margins
            const maxWidth = pdfWidth - 20
            const maxHeight = pdfHeight - 20
            
            const imgWidth = maxWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            
            // If content fits on one page, scale it to fit nicely
            if (imgHeight <= maxHeight) {
                // Content fits! Center it on the page
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
                // Content is too long, use multi-page approach
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
            
            // Cleanup
            document.body.removeChild(iframe)
            
            // Return PDF as blob
            return pdf.output('blob')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleWhatsAppShare = async () => {
        try {
            setIsGenerating(true)
            
            // Generate PDF
            const pdfBlob = await generatePDFBlob()
            const file = new File([pdfBlob], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' })
            
            // Check if Web Share API with files is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice ${invoiceNumber}`,
                    text: `Hi ${customerName}! 👋\n\nHere's your invoice from BillBooky:\n\n📄 Invoice: ${invoiceNumber}\n💰 Amount: ₹${total.toFixed(2)}\n\nThank you for your business! 🙏`,
                    files: [file]
                })
            } else {
                // Fallback: Download PDF and show WhatsApp message
                const url = URL.createObjectURL(pdfBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `Invoice-${invoiceNumber}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                
                // Open WhatsApp with message
                const message = encodeURIComponent(
                    `Hi ${customerName}! 👋\n\n` +
                    `Here's your invoice from BillBooky:\n\n` +
                    `📄 Invoice: ${invoiceNumber}\n` +
                    `💰 Amount: ₹${total.toFixed(2)}\n\n` +
                    `(PDF downloaded - please attach manually)\n\n` +
                    `Thank you for your business! 🙏`
                )
                
                const whatsappUrl = customerPhone 
                    ? `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${message}`
                    : `https://wa.me/?text=${message}`
                
                window.open(whatsappUrl, '_blank')
            }
            
            setShowMenu(false)
        } catch (error) {
            // Don't show error if user just canceled the share dialog
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Share canceled by user')
            } else {
                console.error('Error sharing via WhatsApp:', error)
                alert('Failed to share PDF. Please try again.')
            }
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePrintInvoice = async () => {
        try {
            setIsGenerating(true)
            const pdfBlob = await generatePDFBlob()
            const url = URL.createObjectURL(pdfBlob)
            const printWindow = window.open(url, '_blank')
            
            if (!printWindow) {
                alert('Please allow popups to print the invoice')
            } else {
                // Clean up after window is closed
                setTimeout(() => URL.revokeObjectURL(url), 60000)
            }
            
            setShowMenu(false)
        } catch (error) {
            console.error('Error printing invoice:', error)
            alert('Failed to print invoice. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleEmailShare = async () => {
        try {
            setIsGenerating(true)
            
            // Generate PDF
            const pdfBlob = await generatePDFBlob()
            const file = new File([pdfBlob], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' })
            
            // Check if Web Share API with files is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice ${invoiceNumber}`,
                    text: `Hi ${customerName},\n\nPlease find your invoice details:\n\nInvoice: ${invoiceNumber}\nAmount: ₹${total.toFixed(2)}\n\nThank you for your business!`,
                    files: [file]
                })
            } else {
                // Fallback: Download PDF and open email client
                const url = URL.createObjectURL(pdfBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `Invoice-${invoiceNumber}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                
                // Open email client
                const subject = encodeURIComponent(`Invoice ${invoiceNumber}`)
                const body = encodeURIComponent(
                    `Hi ${customerName},\n\n` +
                    `Please find your invoice attached.\n\n` +
                    `Invoice: ${invoiceNumber}\n` +
                    `Amount: ₹${total.toFixed(2)}\n\n` +
                    `(PDF downloaded - please attach manually)\n\n` +
                    `Thank you for your business!`
                )
                window.location.href = `mailto:?subject=${subject}&body=${body}`
            }
            
            setShowMenu(false)
        } catch (error) {
            // Don't show error if user just canceled the share dialog
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Share canceled by user')
            } else {
                console.error('Error sharing via email:', error)
                alert('Failed to share PDF. Please try again.')
            }
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(invoiceUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy link:', error)
            alert('Failed to copy link to clipboard')
        }
    }

    return (
        <div className="relative">
            <Button
                onClick={() => setShowMenu(!showMenu)}
                variant="outline"
                className="gap-2"
            >
                <Share2 className="h-4 w-4" />
                Share
            </Button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Share Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Share Options
                            </div>
                            
                            {/* WhatsApp - Prominent placement at top */}
                            <button
                                onClick={handleWhatsAppShare}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    {isGenerating ? (
                                        <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                                    ) : (
                                        <MessageCircle className="h-4 w-4 text-green-600" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        {isGenerating ? 'Generating PDF...' : 'WhatsApp'}
                                    </div>
                                    <div className="text-xs text-green-600">
                                        {customerPhone ? 'Send PDF to customer' : 'Share PDF via WhatsApp'}
                                    </div>
                                </div>
                            </button>
                            
                            {/* Print PDF */}
                            <button
                                onClick={handlePrintInvoice}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    {isGenerating ? (
                                        <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
                                    ) : (
                                        <Printer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Print / Download</div>
                                    <div className="text-xs text-gray-600">Save as PDF or print</div>
                                </div>
                            </button>

                            {/* Email */}
                            <button
                                onClick={handleEmailShare}
                                disabled={isGenerating}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    {isGenerating ? (
                                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                    ) : (
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Email</div>
                                    <div className="text-xs text-gray-600">
                                        Send PDF via email
                                    </div>
                                </div>
                            </button>

                            {/* Copy Link */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Copy invoice URL
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
