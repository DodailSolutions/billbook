'use client'

import { useState } from 'react'
import { Share2, Mail, Copy, Check, Printer, MessageCircle } from 'lucide-react'
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
    const pdfUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/invoices/${invoiceId}/pdf?mode=preview`

    const handleWhatsAppShare = () => {
        const message = encodeURIComponent(
            `Hi ${customerName}! 👋\n\n` +
            `Here's your invoice from BillBooky:\n\n` +
            `📄 Invoice: ${invoiceNumber}\n` +
            `💰 Amount: ₹${total.toFixed(2)}\n\n` +
            `🔗 View Invoice: ${invoiceUrl}\n` +
            `📥 Download PDF: ${pdfUrl}\n\n` +
            `Thank you for your business! 🙏`
        )
        
        // If customer phone is provided, open directly to that chat
        const whatsappUrl = customerPhone 
            ? `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${message}`
            : `https://wa.me/?text=${message}`
        
        window.open(whatsappUrl, '_blank')
        setShowMenu(false)
    }

    const handlePrintInvoice = () => {
        const printWindow = window.open(pdfUrl, '_blank')
        if (!printWindow) {
            alert('Please allow popups to print the invoice')
        }
        setShowMenu(false)
    }

    const handleEmailShare = () => {
        const subject = encodeURIComponent(`Invoice ${invoiceNumber}`)
        const body = encodeURIComponent(
            `Hi ${customerName},\n\n` +
            `Please find your invoice details:\n\n` +
            `Invoice: ${invoiceNumber}\n` +
            `Amount: ₹${total.toFixed(2)}\n\n` +
            `View Invoice: ${invoiceUrl}\n` +
            `Download PDF: ${pdfUrl}\n\n` +
            `Thank you for your business!`
        )
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
                                Share Options
                            </div>
                            
                            {/* WhatsApp - Prominent placement at top */}
                            <button
                                onClick={handleWhatsAppShare}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-800"
                            >
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-green-900 dark:text-green-100">WhatsApp</div>
                                    <div className="text-xs text-green-700 dark:text-green-400">
                                        {customerPhone ? 'Send to customer' : 'Share via WhatsApp'}
                                    </div>
                                </div>
                            </button>
                            
                            {/* Print PDF */}
                            <button
                                onClick={handlePrintInvoice}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Printer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Print / Download</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Save as PDF or print</div>
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
                                        Send via email
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
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
