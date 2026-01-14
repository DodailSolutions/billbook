'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Mail, Copy, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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

    const invoiceUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invoices/${invoiceId}`
    const pdfUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/invoices/${invoiceId}/pdf`
    
    const shareMessage = `Invoice ${invoiceNumber} for ${customerName}\nAmount: ₹${total.toFixed(2)}\n\nView invoice: ${invoiceUrl}`

    const handleWhatsAppShare = () => {
        try {
            console.log('WhatsApp share clicked')
            console.log('Customer phone:', customerPhone)
            
            // Format phone number - remove spaces, dashes, and add country code if needed
            let phoneNumber = customerPhone?.replace(/[\s-]/g, '') || ''
            
            // If phone number exists and doesn't start with country code, assume India (+91)
            if (phoneNumber && !phoneNumber.startsWith('+')) {
                // Remove leading 0 if present
                if (phoneNumber.startsWith('0')) {
                    phoneNumber = phoneNumber.substring(1)
                }
                // Add India country code
                phoneNumber = '91' + phoneNumber
            } else if (phoneNumber.startsWith('+')) {
                // Remove + if present
                phoneNumber = phoneNumber.substring(1)
            }
            
            console.log('Formatted phone number:', phoneNumber)
            
            // Share invoice link via WhatsApp with PDF link
            const message = `Hi ${customerName},\n\nYour Invoice ${invoiceNumber}\nAmount: ₹${total.toFixed(2)}\n\nView Invoice: ${invoiceUrl}\n\nDownload PDF: ${pdfUrl}\n\nThank you for your business!`
            
            // If phone number exists, send to specific number; otherwise open general WhatsApp share
            const whatsappUrl = phoneNumber 
                ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                : `https://wa.me/?text=${encodeURIComponent(message)}`
            
            console.log('Opening WhatsApp URL:', whatsappUrl)
            
            const whatsappWindow = window.open(whatsappUrl, '_blank')
            
            if (!whatsappWindow) {
                alert('Please allow popups to share via WhatsApp. Check your browser settings.')
            } else {
                console.log('WhatsApp opened successfully')
            }
            
            setShowMenu(false)
        } catch (error) {
            console.error('Error sharing via WhatsApp:', error)
            alert('Failed to open WhatsApp. Please try again or check your browser settings.')
        }
    }

    const handleEmailShare = () => {
        // Share via email with PDF link
        const subject = encodeURIComponent(`Invoice ${invoiceNumber}`)
        const body = encodeURIComponent(shareMessage + '\n\nPrint/Download PDF: ' + pdfUrl)
        window.location.href = `mailto:?subject=${subject}&body=${body}`
        setShowMenu(false)
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

    const handleDownloadPDF = () => {
        // Open PDF in new window and trigger print dialog
        const pdfWindow = window.open(pdfUrl, '_blank')
        if (pdfWindow) {
            pdfWindow.onload = () => {
                setTimeout(() => {
                    pdfWindow.focus()
                    pdfWindow.print()
                }, 500)
            }
        } else {
            alert('Please allow popups to download the PDF')
        }
        setShowMenu(false)
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
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Share Invoice
                            </div>
                            
                            {/* WhatsApp */}
                            <button
                                onClick={handleWhatsAppShare}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">WhatsApp</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Share invoice with PDF link</div>
                                </div>
                            </button>

                            {/* Email */}
                            <button
                                onClick={handleEmailShare}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Email</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Send with PDF attached
                                    </div>
                                </div>
                            </button>

                            {/* Copy Link */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Copy invoice URL
                                    </div>
                                </div>
                            </button>

                            {/* Download PDF */}
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Download className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Download PDF</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Save or print invoice</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
