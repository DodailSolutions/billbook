'use client'

import { useState } from 'react'
import { Share2, MessageCircle, Mail, Copy, Download, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ShareInvoiceButtonProps {
    invoiceId: string
    invoiceNumber: string
    customerName: string
    total: number
}

export function ShareInvoiceButton({ 
    invoiceId, 
    invoiceNumber, 
    customerName,
    total 
}: ShareInvoiceButtonProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isLoadingPDF, setIsLoadingPDF] = useState(false)

    const invoiceUrl = `${window.location.origin}/invoices/${invoiceId}`
    const pdfUrl = `${window.location.origin}/api/invoices/${invoiceId}/pdf`
    
    const shareMessage = `Invoice ${invoiceNumber} for ${customerName}\nAmount: ₹${total.toFixed(2)}\n\nView invoice: ${invoiceUrl}`

    const fetchPDFBlob = async () => {
        const response = await fetch(pdfUrl)
        if (!response.ok) throw new Error('Failed to fetch PDF')
        return await response.blob()
    }

    const handleWhatsAppShare = async () => {
        setIsLoadingPDF(true)
        try {
            // Try to fetch PDF and share via native share if supported
            if (navigator.share && navigator.canShare) {
                const blob = await fetchPDFBlob()
                const file = new File([blob], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' })
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Invoice ${invoiceNumber}`,
                        text: shareMessage,
                        files: [file]
                    })
                    setShowMenu(false)
                    setIsLoadingPDF(false)
                    return
                }
            }
            
            // Fallback to WhatsApp link with message
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage + '\n\nDownload PDF: ' + pdfUrl)}`
            window.open(whatsappUrl, '_blank')
            setShowMenu(false)
        } catch (error) {
            console.error('Error sharing via WhatsApp:', error)
            // Fallback to link share
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage + '\n\nDownload PDF: ' + pdfUrl)}`
            window.open(whatsappUrl, '_blank')
            setShowMenu(false)
        } finally {
            setIsLoadingPDF(false)
        }
    }

    const handleEmailShare = async () => {
        setIsLoadingPDF(true)
        try {
            // Try native share with PDF file
            if (navigator.share && navigator.canShare) {
                const blob = await fetchPDFBlob()
                const file = new File([blob], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' })
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Invoice ${invoiceNumber}`,
                        text: shareMessage,
                        files: [file]
                    })
                    setShowMenu(false)
                    setIsLoadingPDF(false)
                    return
                }
            }
            
            // Fallback to mailto (without attachment - browser limitation)
            const subject = encodeURIComponent(`Invoice ${invoiceNumber}`)
            const body = encodeURIComponent(shareMessage + '\n\nDownload PDF: ' + pdfUrl)
            window.location.href = `mailto:?subject=${subject}&body=${body}`
            setShowMenu(false)
        } catch (error) {
            console.error('Error sharing via email:', error)
            const subject = encodeURIComponent(`Invoice ${invoiceNumber}`)
            const body = encodeURIComponent(shareMessage + '\n\nDownload PDF: ' + pdfUrl)
            window.location.href = `mailto:?subject=${subject}&body=${body}`
            setShowMenu(false)
        } finally {
            setIsLoadingPDF(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(invoiceUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy link:', error)
        }
    }

    const handleDownloadPDF = () => {
        window.open(pdfUrl, '_blank')
        setShowMenu(false)
    }

    const handleNativeShare = async () => {
        setIsLoadingPDF(true)
        try {
            const blob = await fetchPDFBlob()
            const file = new File([blob], `Invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' })
            
            if (navigator.share) {
                // Check if we can share files
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `Invoice ${invoiceNumber}`,
                        text: shareMessage,
                        files: [file]
                    })
                } else {
                    // Share without file if not supported
                    await navigator.share({
                        title: `Invoice ${invoiceNumber}`,
                        text: shareMessage + '\n\nDownload PDF: ' + pdfUrl,
                        url: invoiceUrl,
                    })
                }
                setShowMenu(false)
            }
        } catch (error) {
            console.error('Error sharing:', error)
        } finally {
            setIsLoadingPDF(false)
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
                                Share Invoice
                            </div>
                            
                            {/* WhatsApp */}
                            <button
                                onClick={handleWhatsAppShare}
                                disabled={isLoadingPDF}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    {isLoadingPDF ? (
                                        <Loader2 className="h-4 w-4 text-green-600 dark:text-green-400 animate-spin" />
                                    ) : (
                                        <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">WhatsApp</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isLoadingPDF ? 'Preparing PDF...' : 'Share with PDF attached'}
                                    </div>
                                </div>
                            </button>

                            {/* Email */}
                            <button
                                onClick={handleEmailShare}
                                disabled={isLoadingPDF}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    {isLoadingPDF ? (
                                        <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                                    ) : (
                                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">Email</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {isLoadingPDF ? 'Preparing PDF...' : 'Send with PDF attached'}
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

                            {/* Native Share (Mobile) */}
                            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                <>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                                    <button
                                        onClick={handleNativeShare}
                                        disabled={isLoadingPDF}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            {isLoadingPDF ? (
                                                <Loader2 className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-spin" />
                                            ) : (
                                                <Share2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">More Options</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {isLoadingPDF ? 'Preparing PDF...' : 'Share with PDF to other apps'}
                                            </div>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
