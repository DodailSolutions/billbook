'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Save, Building2, Mail, Phone, MapPin, FileText, Palette } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { saveInvoiceSettings, type InvoiceSettings } from './actions'

interface InvoiceSettingsFormProps {
    initialSettings: InvoiceSettings | null
    onPreviewUpdate?: (settings: any) => void
}

export default function InvoiceSettingsForm({ initialSettings, onPreviewUpdate }: InvoiceSettingsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    
    const [companyName, setCompanyName] = useState(initialSettings?.company_name || '')
    const [companyEmail, setCompanyEmail] = useState(initialSettings?.company_email || '')
    const [companyPhone, setCompanyPhone] = useState(initialSettings?.company_phone || '')
    const [companyAddress, setCompanyAddress] = useState(initialSettings?.company_address || '')
    const [companyGstin, setCompanyGstin] = useState(initialSettings?.company_gstin || '')
    const [invoicePrefix, setInvoicePrefix] = useState(initialSettings?.invoice_prefix || 'INV')
    const [primaryColor, setPrimaryColor] = useState(initialSettings?.primary_color || '#3B82F6')
    const [secondaryColor, setSecondaryColor] = useState(initialSettings?.secondary_color || '#8B5CF6')
    const [termsAndConditions, setTermsAndConditions] = useState(initialSettings?.terms_and_conditions || '')
    const [paymentInstructions, setPaymentInstructions] = useState(initialSettings?.payment_instructions || '')
    const [footerText, setFooterText] = useState(initialSettings?.footer_text || '')
    const [showLogo, setShowLogo] = useState(initialSettings?.show_logo ?? true)
    const [showCompanyDetails, setShowCompanyDetails] = useState(initialSettings?.show_company_details ?? true)
    const [showGstin, setShowGstin] = useState(initialSettings?.show_gstin ?? true)
    const [logoUrl, setLogoUrl] = useState(initialSettings?.company_logo_url || '')
    const [logoPreview, setLogoPreview] = useState(initialSettings?.company_logo_url || '')
    const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>(initialSettings?.logo_size || 'medium')
    const [companyFontFamily, setCompanyFontFamily] = useState(initialSettings?.company_font_family || 'Arial')
    const [companyFontSize, setCompanyFontSize] = useState(initialSettings?.company_font_size || 24)
    const [companyNameColor, setCompanyNameColor] = useState(initialSettings?.company_name_color || initialSettings?.primary_color || '#3B82F6')
    const [companyFontWeight, setCompanyFontWeight] = useState<'normal' | 'bold' | 'bolder'>(initialSettings?.company_font_weight || 'bold')
    const [companyDetailsFontFamily, setCompanyDetailsFontFamily] = useState(initialSettings?.company_details_font_family || 'Arial')
    const [companyDetailsFontSize, setCompanyDetailsFontSize] = useState(initialSettings?.company_details_font_size || 12)
    const [companyDetailsColor, setCompanyDetailsColor] = useState(initialSettings?.company_details_color || '#6b7280')
    const [termsFontFamily, setTermsFontFamily] = useState(initialSettings?.terms_font_family || 'Arial')
    const [termsFontSize, setTermsFontSize] = useState(initialSettings?.terms_font_size || 12)
    const [invoiceFontFamily, setInvoiceFontFamily] = useState(initialSettings?.invoice_font_family || 'Arial')
    const [invoiceFontSize, setInvoiceFontSize] = useState(initialSettings?.invoice_font_size || 12)
    const [qrCodeUrl, setQrCodeUrl] = useState(initialSettings?.payment_qr_code_url || '')
    const [qrCodePreview, setQrCodePreview] = useState(initialSettings?.payment_qr_code_url || '')
    const [showQrCode, setShowQrCode] = useState(initialSettings?.show_qr_code ?? true)

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB')
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setLogoUrl(base64String)
            setLogoPreview(base64String)
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveLogo = () => {
        setLogoUrl('')
        setLogoPreview('')
    }

    const handleQrCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB')
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setQrCodeUrl(base64String)
            setQrCodePreview(base64String)
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveQrCode = () => {
        setQrCodeUrl('')
        setQrCodePreview('')
    }

    // Update preview when any field changes
    useEffect(() => {
        if (onPreviewUpdate) {
            onPreviewUpdate({
                company_name: companyName,
                company_email: companyEmail,
                company_phone: companyPhone,
                company_address: companyAddress,
                company_gstin: companyGstin,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                terms_and_conditions: termsAndConditions,
                payment_instructions: paymentInstructions,
                footer_text: footerText,
                show_company_details: showCompanyDetails,
                show_gstin: showGstin,
                company_logo_url: logoPreview,
                show_logo: showLogo,
                logo_size: logoSize,
                payment_qr_code_url: qrCodePreview,
                show_qr_code: showQrCode,
                company_font_family: companyFontFamily,
                company_font_size: companyFontSize,
                company_name_color: companyNameColor,
                company_font_weight: companyFontWeight,
                invoice_font_family: invoiceFontFamily,
                invoice_font_size: invoiceFontSize,
            })
        }
    }, [
        companyName, companyEmail, companyPhone, companyAddress, companyGstin,
        primaryColor, secondaryColor, termsAndConditions, paymentInstructions,
        footerText, showCompanyDetails, showGstin, logoPreview, showLogo, logoSize,
        companyFontFamily, companyFontSize, companyNameColor, companyFontWeight,
        companyDetailsFontFamily, companyDetailsFontSize, companyDetailsColor,
        termsFontFamily, termsFontSize,
        invoiceFontFamily, invoiceFontSize, onPreviewUpdate
    ])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await saveInvoiceSettings({
                company_name: companyName || undefined,
                company_email: companyEmail || undefined,
                company_phone: companyPhone || undefined,
                company_address: companyAddress || undefined,
                company_gstin: companyGstin || undefined,
                company_logo_url: logoUrl || undefined,
                logo_size: logoSize,
                company_font_family: companyFontFamily,
                company_font_size: companyFontSize,
                company_name_color: companyNameColor,
                company_font_weight: companyFontWeight,
                invoice_font_family: invoiceFontFamily,
                invoice_font_size: invoiceFontSize,
                invoice_prefix: invoicePrefix || 'INV',
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                terms_and_conditions: termsAndConditions || undefined,
                payment_instructions: paymentInstructions || undefined,
                footer_text: footerText || undefined,
                show_logo: showLogo,
                show_company_details: showCompanyDetails,
                show_gstin: showGstin,
                payment_qr_code_url: qrCodeUrl || undefined,
                show_qr_code: showQrCode
            })

            alert('Invoice settings saved successfully!')
            router.refresh()
        } catch (err) {
            console.error('Error saving settings:', err)
            alert('Failed to save settings. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <Card className="border-2 dark:border-gray-700">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold text-gray-900" style={{ color: 'var(--foreground)' }}>
                            Company Information
                        </h2>
                    </div>

                    {/* Logo Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Company Logo
                        </label>
                        <div className="flex items-center gap-4">
                            {logoPreview ? (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={logoPreview} 
                                        alt="Company Logo" 
                                        className="h-20 w-20 object-contain border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="h-20 w-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium">Upload Logo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    PNG, JPG or SVG (max 2MB)
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="showLogo"
                                    checked={showLogo}
                                    onChange={(e) => setShowLogo(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                                />
                                <label htmlFor="showLogo" className="text-sm text-gray-700 dark:text-gray-200">
                                    Show logo on invoices
                                </label>
                            </div>
                            {logoPreview && showLogo && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Logo Size
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setLogoSize('small')}
                                            className={`px-3 py-1 text-sm rounded-lg border-2 transition-colors ${
                                                logoSize === 'small'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            Small
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLogoSize('medium')}
                                            className={`px-3 py-1 text-sm rounded-lg border-2 transition-colors ${
                                                logoSize === 'medium'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            Medium
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLogoSize('large')}
                                            className={`px-3 py-1 text-sm rounded-lg border-2 transition-colors ${
                                                logoSize === 'large'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            Large
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Company Name
                            </label>
                            <Input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Your Company Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                <Mail className="h-4 w-4 inline mr-1" />
                                Email
                            </label>
                            <Input
                                type="email"
                                value={companyEmail}
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                placeholder="company@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                <Phone className="h-4 w-4 inline mr-1" />
                                Phone
                            </label>
                            <Input
                                type="tel"
                                value={companyPhone}
                                onChange={(e) => setCompanyPhone(e.target.value)}
                                placeholder="+91 1234567890"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                GSTIN
                            </label>
                            <Input
                                type="text"
                                value={companyGstin}
                                onChange={(e) => setCompanyGstin(e.target.value)}
                                placeholder="22AAAAA0000A1Z5"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            Address
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                            rows={3}
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            placeholder="Your company address"
                        />
                    </div>
                </div>
            </Card>

            {/* Branding & Typography */}
            <Card className="border-2 dark:border-gray-700">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-xl font-bold text-gray-900" style={{ color: 'var(--foreground)' }}>
                            Branding & Typography
                        </h2>
                    </div>

                    {/* Font Customization */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Company Name Styling
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Family
                                </label>
                                <select
                                    value={companyFontFamily}
                                    onChange={(e) => setCompanyFontFamily(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Tahoma">Tahoma</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                    <option value="Impact">Impact</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Weight
                                </label>
                                <select
                                    value={companyFontWeight}
                                    onChange={(e) => setCompanyFontWeight(e.target.value as 'normal' | 'bold' | 'bolder')}
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                    <option value="bolder">Bolder</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Company Name Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={companyNameColor}
                                        onChange={(e) => setCompanyNameColor(e.target.value)}
                                        className="h-10 w-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={companyNameColor}
                                        onChange={(e) => setCompanyNameColor(e.target.value)}
                                        placeholder="#3B82F6"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Size: {companyFontSize}px
                                </label>
                                <input
                                    type="range"
                                    min="16"
                                    max="48"
                                    value={companyFontSize}
                                    onChange={(e) => setCompanyFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>Small</span>
                                    <span>Medium</span>
                                    <span>Large</span>
                                </div>
                            </div>
                        </div>
                        <div 
                            className="mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center"
                            style={{ 
                                fontFamily: companyFontFamily,
                                fontSize: `${companyFontSize}px`,
                                fontWeight: companyFontWeight,
                                color: companyNameColor
                            }}
                        >
                            {companyName || 'Your Company'}
                        </div>
                    </div>

                    {/* Company Details Font */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Company Details (Address, Email, Phone)
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Family
                                </label>
                                <select
                                    value={companyDetailsFontFamily}
                                    onChange={(e) => setCompanyDetailsFontFamily(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Tahoma">Tahoma</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Text Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={companyDetailsColor}
                                        onChange={(e) => setCompanyDetailsColor(e.target.value)}
                                        className="h-10 w-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={companyDetailsColor}
                                        onChange={(e) => setCompanyDetailsColor(e.target.value)}
                                        placeholder="#6b7280"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Font Size: {companyDetailsFontSize}px
                            </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="16"
                                    value={companyDetailsFontSize}
                                    onChange={(e) => setCompanyDetailsFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>10px</span>
                                    <span>13px</span>
                                    <span>16px</span>
                                </div>
                            </div>
                        <div 
                            className="mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                            style={{ 
                                fontFamily: companyDetailsFontFamily,
                                fontSize: `${companyDetailsFontSize}px`,
                                color: companyDetailsColor
                            }}
                        >
                            <div className="space-y-1">
                                <div>123 Business Street, City, State 12345</div>
                                <div>Email: contact@company.com</div>
                                <div>Phone: +91 1234567890</div>
                                <div>GSTIN: 22AAAAA0000A1Z5</div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Body Text Font */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Invoice Body Text
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Family
                                </label>
                                <select
                                    value={invoiceFontFamily}
                                    onChange={(e) => setInvoiceFontFamily(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Tahoma">Tahoma</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Size: {invoiceFontSize}px
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="18"
                                    value={invoiceFontSize}
                                    onChange={(e) => setInvoiceFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>10px</span>
                                    <span>14px</span>
                                    <span>18px</span>
                                </div>
                            </div>
                        </div>
                        <div 
                            className="mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                            style={{ 
                                fontFamily: invoiceFontFamily,
                                fontSize: `${invoiceFontSize}px`,
                            }}
                        >
                            <div className="text-gray-600 dark:text-gray-400">
                                <div className="mb-1">Sample invoice text preview</div>
                                <div className="text-sm">Address: 123 Main Street</div>
                                <div className="text-sm">Email: contact@example.com</div>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Conditions Font */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Terms, Conditions & Notes
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Family
                                </label>
                                <select
                                    value={termsFontFamily}
                                    onChange={(e) => setTermsFontFamily(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Tahoma">Tahoma</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Font Size: {termsFontSize}px
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="16"
                                    value={termsFontSize}
                                    onChange={(e) => setTermsFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span>10px</span>
                                    <span>13px</span>
                                    <span>16px</span>
                                </div>
                            </div>
                        </div>
                        <div 
                            className="mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                            style={{ 
                                fontFamily: termsFontFamily,
                                fontSize: `${termsFontSize}px`,
                            }}
                        >
                            <div className="text-gray-600 dark:text-gray-400">
                                <div className="font-semibold mb-1">Terms and Conditions:</div>
                                <div>Payment is due within 30 days. Late payments may incur additional charges.</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Invoice Prefix
                            </label>
                            <Input
                                type="text"
                                value={invoicePrefix}
                                onChange={(e) => setInvoicePrefix(e.target.value)}
                                placeholder="INV"
                                maxLength={10}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Primary Color
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-10 w-20"
                                />
                                <Input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Secondary Color
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="h-10 w-20"
                                />
                                <Input
                                    type="text"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    placeholder="#8B5CF6"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Display Options</h3>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showCompanyDetails}
                                onChange={(e) => setShowCompanyDetails(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">Show company details on invoice</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showGstin}
                                onChange={(e) => setShowGstin(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">Show GSTIN on invoice</span>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Terms and Footer */}
            <Card className="border-2 dark:border-gray-700">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h2 className="text-xl font-bold text-gray-900" style={{ color: 'var(--foreground)' }}>
                            Terms & Footer
                        </h2>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Terms and Conditions
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                            rows={4}
                            value={termsAndConditions}
                            onChange={(e) => setTermsAndConditions(e.target.value)}
                            placeholder="Enter your terms and conditions..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Payment Instructions
                        </label>
                        <textarea
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                            rows={3}
                            value={paymentInstructions}
                            onChange={(e) => setPaymentInstructions(e.target.value)}
                            placeholder="Bank details, payment methods, etc."
                        />
                    </div>

                    {/* Payment QR Code Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Payment QR Code (GPay, PhonePe, Paytm, etc.)
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Upload your payment QR code to display on invoices for easy customer payments
                        </p>
                        <div className="flex items-start gap-4">
                            {qrCodePreview ? (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={qrCodePreview} 
                                        alt="Payment QR Code" 
                                        className="h-32 w-32 object-contain border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveQrCode}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="h-32 w-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleQrCodeUpload}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        dark:file:bg-blue-900/20 dark:file:text-blue-400
                                        hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30
                                        file:cursor-pointer cursor-pointer"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Recommended: Square image, PNG/JPG, max 2MB
                                </p>
                            </div>
                        </div>
                        {qrCodePreview && (
                            <div className="mt-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showQrCode}
                                        onChange={(e) => setShowQrCode(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                        Show QR code on invoices
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Footer Text
                        </label>
                        <Input
                            type="text"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="Thank you for your business!"
                        />
                    </div>
                </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
