'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
    Barcode, 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    CreditCard, 
    DollarSign, 
    QrCode, 
    Printer, 
    CheckCircle2, 
    ShoppingBag, 
    User, 
    Phone, 
    RotateCcw,
    Zap,
    Sparkles,
    Scissors,
    Shirt,
    Building2,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { INDUSTRY_CATALOG_PRESETS, type PresetCatalogItem } from '@/lib/industry-catalog-presets'
import { BUSINESS_VERTICALS, type BusinessType } from '@/lib/business-profile-types'

interface CartItem extends PresetCatalogItem {
    id: string
    quantity: number
    discount: number
}

export default function CounterPOSPage() {
    const supabase = createClient()
    const [businessType, setBusinessType] = useState<BusinessType>('retail')
    const [businessName, setBusinessName] = useState('BillBook Store')
    const [catalog, setCatalog] = useState<PresetCatalogItem[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    
    // Customer
    const [customerName, setCustomerName] = useState('Walk-in Customer')
    const [customerPhone, setCustomerPhone] = useState('')
    
    // Search & Barcode
    const [searchQuery, setSearchQuery] = useState('')
    const [barcodeInput, setBarcodeInput] = useState('')
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    // Payment Modal
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card'>('upi')
    const [cashReceived, setCashReceived] = useState<string>('')
    const [isPaid, setIsPaid] = useState(false)
    const [receiptNumber, setReceiptNumber] = useState('')

    // Fetch tenant profile to tailor POS
    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('business_type, business_name')
                        .eq('id', user.id)
                        .maybeSingle()

                    if (profile) {
                        const bType = (profile.business_type as BusinessType) || 'retail'
                        setBusinessType(bType)
                        if (profile.business_name) setBusinessName(profile.business_name)
                    }
                }
            } catch (err) {
                console.warn('Could not load profile for POS:', err)
            }
        }
        loadProfile()
    }, [])

    // Load catalog items for active vertical
    useEffect(() => {
        const items = INDUSTRY_CATALOG_PRESETS[businessType] || INDUSTRY_CATALOG_PRESETS['retail']
        setCatalog(items)
    }, [businessType])

    // Focus barcode input on mount
    useEffect(() => {
        barcodeInputRef.current?.focus()
    }, [])

    const handleAddToCart = (item: PresetCatalogItem) => {
        setCart(prev => {
            const existingIndex = prev.findIndex(i => i.name === item.name)
            if (existingIndex > -1) {
                const updated = [...prev]
                updated[existingIndex].quantity += 1
                return updated
            }
            return [...prev, { ...item, id: `item-${Date.now()}-${Math.random()}`, quantity: 1, discount: 0 }]
        })
    }

    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!barcodeInput.trim()) return

        // Match barcode or product SKU
        const matched = catalog.find(i => 
            (i.hsn_sac_code && i.hsn_sac_code.includes(barcodeInput.trim())) ||
            i.name.toLowerCase().includes(barcodeInput.toLowerCase().trim())
        )

        if (matched) {
            handleAddToCart(matched)
            setBarcodeInput('')
        } else {
            // Add as custom scanned item
            handleAddToCart({
                name: `Scanned Item #${barcodeInput}`,
                unit_price: 150,
                gst_rate: 18,
                hsn_sac_code: barcodeInput,
                unit: 'pcs',
                is_service: false
            })
            setBarcodeInput('')
        }
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta
                return newQty > 0 ? { ...item, quantity: newQty } : null
            }
            return item
        }).filter(Boolean) as CartItem[])
    }

    const removeItem = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id))
    }

    const clearCart = () => {
        setCart([])
        setIsPaid(false)
        setIsPayModalOpen(false)
        setCashReceived('')
    }

    // Totals
    const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
    const taxTotal = cart.reduce((acc, item) => {
        const itemSubtotal = item.unit_price * item.quantity
        return acc + Math.round(itemSubtotal * (item.gst_rate / 100))
    }, 0)
    const grandTotal = subtotal + taxTotal
    const cashNumeric = Number(cashReceived) || 0
    const changeDue = Math.max(0, cashNumeric - grandTotal)

    const handleCompletePayment = () => {
        const invNo = `POS-${Date.now().toString().slice(-6)}`
        setReceiptNumber(invNo)
        setIsPaid(true)
    }

    const handlePrintThermal = () => {
        window.print()
    }

    const filteredCatalog = catalog.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (item.hsn_sac_code && item.hsn_sac_code.includes(searchQuery.trim()))
    )

    const verticalConfig = BUSINESS_VERTICALS[businessType] || BUSINESS_VERTICALS['retail']

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-3 sm:p-5 flex flex-col gap-4">
            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>High-Speed Counter POS</span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                58mm/80mm Thermal
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{verticalConfig.icon} {verticalConfig.name}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{businessName}</span>
                        </p>
                    </div>
                </div>

                {/* Barcode Scanner Fast Input */}
                <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Barcode className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            ref={barcodeInputRef}
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            placeholder="Scan Barcode or Enter SKU..."
                            className="pl-9 h-9 text-xs font-mono"
                        />
                    </div>
                    <Button type="submit" size="sm" className="h-9 text-xs bg-slate-800 hover:bg-slate-900 text-white font-semibold">
                        Scan Item
                    </Button>
                </form>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                {/* Left 7 Cols: Catalog Quick Grid */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                    {/* Search & Categories */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${verticalConfig.customFieldLabels.items} by name, HSN, or SKU...`}
                            className="h-8 text-xs border-0 focus-visible:ring-0 shadow-none"
                        />
                    </div>

                    {/* Catalog Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
                        {filteredCatalog.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                            >
                                <div>
                                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {item.name}
                                    </span>
                                    {item.hsn_sac_code && (
                                        <span className="text-[10px] text-slate-400 font-mono block mt-1">
                                            Code: {item.hsn_sac_code}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                    <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">
                                        ₹{item.unit_price.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                                        +{item.gst_rate}% GST
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right 5 Cols: Counter Checkout Register */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col justify-between">
                        {/* Customer Top Tag */}
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                            <User className="h-4 w-4 text-blue-600" />
                            <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer Name"
                                className="h-7 text-xs font-semibold"
                            />
                            <Input
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="Phone (for WhatsApp Bill)"
                                className="h-7 text-xs"
                            />
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto space-y-2 py-3 min-h-[200px] max-h-[340px] pr-1">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10 space-y-2">
                                    <ShoppingBag className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                                    <span>Register empty. Tap items or scan barcodes to begin.</span>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                                        <div className="min-w-0 flex-1">
                                            <span className="font-bold text-slate-900 dark:text-white truncate block">
                                                {item.name}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                                ₹{item.unit_price} × {item.quantity} = ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="font-bold font-mono px-1 min-w-[20px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Bill Summary & Payment Trigger */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                            <div className="space-y-1 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST Tax:</span>
                                    <span>₹{taxTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                                    <span>Total Payable:</span>
                                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCart}
                                    disabled={cart.length === 0}
                                    className="text-xs h-10 rounded-xl"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setIsPayModalOpen(true)}
                                    disabled={cart.length === 0}
                                    className="text-xs h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                    Pay ₹{grandTotal.toLocaleString('en-IN')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal & Thermal Slip Preview */}
            {isPayModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        {!isPaid ? (
                            <>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                        Complete Counter Payment
                                    </h3>
                                    <span className="font-extrabold text-base text-emerald-600 font-mono">
                                        ₹{grandTotal.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Tender Mode Pills */}
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setPayMethod('upi')}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-bold ${
                                            payMethod === 'upi' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40' : 'border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <QrCode className="h-4 w-4" />
                                        <span>UPI QR</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPayMethod('cash')}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-bold ${
                                            payMethod === 'cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <DollarSign className="h-4 w-4" />
                                        <span>Cash</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPayMethod('card')}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-bold ${
                                            payMethod === 'card' ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40' : 'border-slate-200 text-slate-600'
                                        }`}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span>Card / POS</span>
                                    </button>
                                </div>

                                {/* Mode Specific Details */}
                                {payMethod === 'upi' && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                                        <div className="h-32 w-32 mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                                            <QrCode className="h-28 w-28 text-slate-900" />
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-medium block">
                                            Scan via GPay / PhonePe / Paytm to Pay ₹{grandTotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}

                                {payMethod === 'cash' && (
                                    <div className="space-y-2 text-xs">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                                            Cash Received from Customer (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                            placeholder={`e.g. ${grandTotal}`}
                                            className="h-10 text-base font-mono font-bold"
                                        />
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between font-mono font-bold text-emerald-800 dark:text-emerald-200 text-xs">
                                            <span>Change to Return:</span>
                                            <span>₹{changeDue.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsPayModalOpen(false)}
                                        className="w-1/2 text-xs h-10 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleCompletePayment}
                                        className="w-1/2 text-xs h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                        Confirm & Print
                                    </Button>
                                </div>
                            </>
                        ) : (
                            /* Thermal Receipt Ready Screen */
                            <div className="space-y-4 text-center">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                    <Check className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                        Payment Settled Successfully!
                                    </h3>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        Receipt #{receiptNumber}
                                    </span>
                                </div>

                                {/* Thermal Slip Preview Box */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 font-mono text-[10px] text-left space-y-1">
                                    <div className="text-center font-bold text-xs">{businessName}</div>
                                    <div className="text-center text-slate-500">TAX INVOICE / RECEIPT</div>
                                    <div className="border-t border-slate-300 dark:border-slate-700 my-1" />
                                    <div>Date: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString()}</div>
                                    <div>Customer: {customerName}</div>
                                    <div className="border-t border-slate-300 dark:border-slate-700 my-1" />
                                    {cart.map(i => (
                                        <div key={i.id} className="flex justify-between">
                                            <span>{i.name.slice(0, 18)} ×{i.quantity}</span>
                                            <span>₹{i.unit_price * i.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-slate-300 dark:border-slate-700 my-1" />
                                    <div className="flex justify-between font-bold text-xs">
                                        <span>TOTAL PAID:</span>
                                        <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="text-center text-slate-400 pt-1">Thank you for visiting!</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handlePrintThermal}
                                        className="w-1/2 text-xs h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print Thermal
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={clearCart}
                                        className="w-1/2 text-xs h-10 rounded-xl font-bold"
                                    >
                                        New Sale
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
