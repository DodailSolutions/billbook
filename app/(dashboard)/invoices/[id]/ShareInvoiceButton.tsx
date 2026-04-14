'use client'

import { useState } from 'react'
import { Mail, Check, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ShareInvoiceButtonProps {
    invoiceId: string
    invoiceNumber: string
    customerName: string
    customerPhone?: string
    customerEmail?: string
    total: number
}

export function ShareInvoiceButton({ 
    invoiceId, 
    invoiceNumber, 
    customerName,
    customerPhone,
    customerEmail,
    total
}: ShareInvoiceButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

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

    const handleEmailShare = async () => {
        if (customerEmail) {
            // Server-side email via SMTP
            try {
                setIsGenerating(true)
                const res = await fetch(`/api/invoices/${invoiceId}/send-email`, { method: 'POST' })
                const data = await res.json()
                if (res.ok) {
                    setEmailSent(true)
                    setTimeout(() => setEmailSent(false), 3000)
                } else {
                    alert(data.error || 'Failed to send email')
                }
            } catch {
                alert('Failed to send email. Please try again.')
            } finally {
                setIsGenerating(false)
            }
        } else {
            // No email on file — fallback to mailto
            const subject = encodeURIComponent(`Invoice ${invoiceNumber}`)
            const body = encodeURIComponent(
                `Hi ${customerName},\n\nPlease find your invoice.\n\nInvoice: ${invoiceNumber}\nAmount: ₹${total.toFixed(2)}\n\nThank you for your business!`
            )
            window.location.href = `mailto:?subject=${subject}&body=${body}`
        }
    }

    return (
        <>
            {/* WhatsApp */}
            <Button
                onClick={handleWhatsAppShare}
                disabled={isGenerating}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 disabled:opacity-50"
            >
                {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <MessageCircle className="h-3.5 w-3.5" />
                )}
                WhatsApp
            </Button>

            {/* Send Email */}
            <Button
                onClick={handleEmailShare}
                disabled={isGenerating}
                variant="outline"
                size="sm"
                className={`gap-1.5 rounded-lg disabled:opacity-50 transition-colors ${
                    emailSent
                        ? 'text-green-700 border-green-300 bg-green-50'
                        : 'text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
            >
                {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : emailSent ? (
                    <Check className="h-3.5 w-3.5" />
                ) : (
                    <Mail className="h-3.5 w-3.5" />
                )}
                {emailSent ? 'Sent!' : 'Send Email'}
            </Button>
        </>
    )
}
