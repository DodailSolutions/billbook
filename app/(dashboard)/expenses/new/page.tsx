'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    ChevronLeft, Save, Loader2, Plus, Calendar, AlertCircle,
    Briefcase, Home, Zap, Megaphone, Plane, Utensils, Users, Laptop, HardDrive, MoreHorizontal,
    Wallet, CreditCard, Building, FileSignature, Car, Shield, UploadCloud, CheckCircle
} from 'lucide-react'
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { createExpenseAction, getExpenseCategoriesWithSeed, getVendorsList } from '../actions'
import { createVendor } from '@/lib/customer-management-actions'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

const categoryIcons: Record<string, any> = {
    'Office Supplies': Briefcase,
    'Rent & Rates': Home,
    'Utilities': Zap,
    'Marketing & Advertising': Megaphone,
    'Travel & Lodging': Plane,
    'Meals & Entertainment': Utensils,
    'Salaries & Wages': Users,
    'Software & SaaS': Laptop,
    'Hardware & Equipment': HardDrive,
    'Other Expenses': MoreHorizontal
}

function getCategoryIcon(name: string) {
    if (categoryIcons[name]) return categoryIcons[name]
    const n = name.toLowerCase()
    if (n.includes('office') || n.includes('supply')) return Briefcase
    if (n.includes('rent') || n.includes('rate')) return Home
    if (n.includes('utilit') || n.includes('electricity') || n.includes('water')) return Zap
    if (n.includes('marketing') || n.includes('advertis') || n.includes('promo')) return Megaphone
    if (n.includes('travel') || n.includes('lodg') || n.includes('hotel')) return Plane
    if (n.includes('meal') || n.includes('food') || n.includes('entertain')) return Utensils
    if (n.includes('salaries') || n.includes('wage') || n.includes('payroll') || n.includes('staff')) return Users
    if (n.includes('software') || n.includes('saas') || n.includes('subscription')) return Laptop
    if (n.includes('hardware') || n.includes('equip') || n.includes('comput')) return HardDrive
    return MoreHorizontal
}

const paymentTypes = [
    { value: 'cash', label: 'Cash', icon: Wallet, color: 'text-emerald-600 border-emerald-100 hover:bg-emerald-50 bg-emerald-50/50' },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-600 border-blue-100 hover:bg-blue-50 bg-blue-50/50' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building, color: 'text-purple-600 border-purple-100 hover:bg-purple-50 bg-purple-50/50' },
    { value: 'cheque', label: 'Cheque', icon: FileSignature, color: 'text-amber-600 border-amber-100 hover:bg-amber-50 bg-amber-50/50' },
    { value: 'mileage', label: 'Mileage', icon: Car, color: 'text-teal-600 border-teal-100 hover:bg-teal-50 bg-teal-50/50' },
    { value: 'asset_purchase', label: 'Asset', icon: Shield, color: 'text-rose-600 border-rose-100 hover:bg-rose-50 bg-rose-50/50' }
]

export default function NewExpensePage() {
    const router = useRouter()
    const [categories, setCategories] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form fields state
    const [expenseNumber, setExpenseNumber] = useState('')
    const [expenseDate, setExpenseDate] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [expenseType, setExpenseType] = useState('cash')
    const [vendorId, setVendorId] = useState('')
    const [payeeName, setPayeeName] = useState('')
    const [amount, setAmount] = useState('0')
    const [taxAmount, setTaxAmount] = useState('0')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [paymentReference, setPaymentReference] = useState('')

    // Scan State
    const [isScanning, setIsScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)
    const [scanSuccess, setScanSuccess] = useState(false)

    // Vendor Quick Add Modal State
    const [vendorModalOpen, setVendorModalOpen] = useState(false)
    const [newVendorName, setNewVendorName] = useState('')
    const [newVendorPhone, setNewVendorPhone] = useState('')
    const [newVendorGstin, setNewVendorGstin] = useState('')
    const [addingVendor, setAddingVendor] = useState(false)

    const handleQuickAddVendor = async () => {
        if (!newVendorName.trim()) {
            alert('Vendor name is required')
            return
        }

        setAddingVendor(true)
        try {
            const res = await createVendor({
                vendor_name: newVendorName.trim(),
                phone: newVendorPhone.trim() || undefined,
                gstin: newVendorGstin.trim() || undefined
            })

            if (res.success && res.data) {
                const newlyCreated = res.data
                setVendors(prev => [...prev, newlyCreated].sort((a, b) => a.vendor_name.localeCompare(b.vendor_name)))
                setVendorId(newlyCreated.id)
                setPayeeName('') // Clear custom payee
                setVendorModalOpen(false)
                
                // Reset inputs
                setNewVendorName('')
                setNewVendorPhone('')
                setNewVendorGstin('')
            } else {
                alert(res.error || 'Failed to create vendor')
            }
        } catch (err) {
            console.error('Quick add vendor error:', err)
            alert('An unexpected error occurred')
        } finally {
            setAddingVendor(false)
        }
    }

    // Load options
    useEffect(() => {
        async function loadOptions() {
            try {
                const cats = await getExpenseCategoriesWithSeed()
                const vends = await getVendorsList()
                setCategories(cats)
                setVendors(vends)
                if (cats.length > 0) {
                    setCategoryId(cats[0].id)
                }
            } catch (err) {
                console.error('Failed to load options:', err)
                setError('Failed to load form options')
            } finally {
                setFetching(false)
            }
        }

        loadOptions()

        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        setExpenseDate(`${yyyy}-${mm}-${dd}`)
        
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        setExpenseNumber(`EXP-${yyyy}${mm}${dd}-${randomNum}`)
    }, [])

    const totalAmount = (parseFloat(amount) || 0) + (parseFloat(taxAmount) || 0)

    // Quick GST Handler
    const handleQuickGst = (rate: number) => {
        const baseAmount = parseFloat(amount) || 0
        if (baseAmount > 0) {
            const calculatedTax = Math.round(baseAmount * (rate / 100) * 100) / 100
            setTaxAmount(calculatedTax.toString())
        }
    }

    // Mock OCR Scanner Handler
    const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setIsScanning(true)
        setScanProgress(0)
        setScanSuccess(false)
        setError(null)

        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(() => {
                        // AI mock auto-population
                        setVendorId('') // Reset vendor ID selection
                        setPayeeName('Reliable Office Solutions Ltd.')
                        setAmount('4350')
                        setTaxAmount('783') // 18% GST of 4350
                        setPaymentMethod('Visa Card (Debit)')
                        setPaymentReference('TXN9843210')
                        setExpenseType('card')
                        
                        // Set Category to "Office Supplies" if found
                        const officeCat = categories.find(c => c.category_name.toLowerCase().includes('office'))
                        if (officeCat) {
                            setCategoryId(officeCat.id)
                        }

                        // Set Date
                        const yesterday = new Date()
                        yesterday.setDate(yesterday.getDate() - 1)
                        setExpenseDate(yesterday.toISOString().split('T')[0])

                        setIsScanning(false)
                        setScanSuccess(true)
                    }, 500)
                    return 100
                }
                return prev + 10
            })
        }, 150)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryId) {
            setError('Please select an expense category')
            return
        }
        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than zero')
            return
        }

        // Determine final payee name and validate vendor/payee requirements
        let finalPayeeName = payeeName.trim()
        if (vendorId) {
            const selectedVendor = vendors.find(v => v.id === vendorId)
            if (selectedVendor) {
                finalPayeeName = selectedVendor.vendor_name
            }
        }

        if (!vendorId && !finalPayeeName) {
            setError('Please select a vendor or enter a payee name')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('expense_number', expenseNumber)
            formData.append('expense_date', expenseDate)
            formData.append('expense_category_id', categoryId)
            formData.append('expense_type', expenseType)
            formData.append('vendor_id', vendorId)
            formData.append('payee_name', finalPayeeName)
            formData.append('amount', amount)
            formData.append('tax_amount', taxAmount)
            formData.append('payment_method', paymentMethod)
            formData.append('payment_reference', paymentReference)

            const res = await createExpenseAction(formData)
            if (res.success) {
                router.push('/expenses')
                router.refresh()
            } else {
                setError(res.error || 'Failed to create expense')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/expenses">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg hover:bg-gray-50">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">Record Expense</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Quickly track a business spend with AI auto-fill or manual entry.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Smart Receipt Scanner Card */}
            <Card className="border border-blue-100 bg-linear-to-r from-blue-50/30 to-indigo-50/20 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 justify-center md:justify-start">
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                Smart AI Scan (OCR)
                            </h3>
                            <p className="text-xs text-gray-500">Upload a receipt or invoice image. Our AI will instantly scan and pre-populate all amounts, taxes, dates, and payee details.</p>
                        </div>

                        <div className="relative w-full md:w-auto shrink-0">
                            {isScanning ? (
                                <div className="w-full md:w-64 border border-blue-200 bg-white p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden shadow-sm">
                                    {/* Scan bar animation */}
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-bounce" />
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-blue-600">Extracting Receipt details...</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{scanProgress}% completed</p>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full transition-all duration-200" style={{ width: `${scanProgress}%` }} />
                                    </div>
                                </div>
                            ) : scanSuccess ? (
                                <div className="w-full md:w-64 border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl flex items-center justify-center text-center gap-3 shadow-xs">
                                    <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-emerald-800">Scanned Successfully!</p>
                                        <p className="text-[10px] text-emerald-600 font-medium">Extracted amount: ₹5,133.00</p>
                                    </div>
                                </div>
                            ) : (
                                <label className="w-full md:w-64 border-2 border-dashed border-blue-200 bg-white hover:bg-blue-50/30 transition-colors p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-xs">
                                    <UploadCloud className="h-6 w-6 text-blue-500" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-700">Upload Receipt</p>
                                        <p className="text-[10px] text-gray-400">PDF, PNG, or JPG (AI auto-fill)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*,application/pdf" 
                                        onChange={handleReceiptScan} 
                                        className="hidden" 
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Form Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <Card className="border border-gray-100 bg-white shadow-sm rounded-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-bold text-gray-900">1. Expense Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Interactive Category Selector Grid */}
                        <div className="space-y-2">
                            <Label className="font-bold text-gray-700">Category</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                {categories.map(cat => {
                                    const Icon = getCategoryIcon(cat.category_name)
                                    const isSelected = categoryId === cat.id
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoryId(cat.id)}
                                            className={`p-3 rounded-xl border text-left flex flex-col items-start gap-2.5 transition-all duration-200 cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/10' 
                                                    : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                                <Icon className="h-4.5 w-4.5" />
                                            </div>
                                            <span className="text-xs font-semibold truncate w-full">{cat.category_name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Interactive Payment Type Selector Segmented Row */}
                        <div className="space-y-2">
                            <Label className="font-bold text-gray-700">Expense Type (Outflow Mode)</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                {paymentTypes.map(type => {
                                    const Icon = type.icon
                                    const isSelected = expenseType === type.value
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                setExpenseType(type.value)
                                                setPaymentMethod(type.value)
                                            }}
                                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all duration-200 cursor-pointer text-sm font-semibold justify-center ${
                                                isSelected 
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                                                    : `bg-white border-gray-100 text-gray-600 ${type.color}`
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span>{type.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Expense Number */}
                            <div>
                                <Label htmlFor="expense_number" className="font-bold text-gray-700">Expense Reference ID</Label>
                                <Input 
                                    id="expense_number"
                                    value={expenseNumber}
                                    onChange={e => setExpenseNumber(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            {/* Expense Date */}
                            <div>
                                <Label htmlFor="expense_date" className="font-bold text-gray-700">Expense Date</Label>
                                <Input 
                                    id="expense_date"
                                    type="date"
                                    value={expenseDate}
                                    onChange={e => setExpenseDate(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Payee & Financial Details */}
                <Card className="border border-gray-100 bg-white shadow-sm rounded-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-bold text-gray-900">2. Payee & Financial Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vendor selection */}
                            <div className="space-y-1">
                                <Label htmlFor="vendor_id" className="font-bold text-gray-700">Link Vendor (Optional)</Label>
                                <div className="flex gap-2">
                                    <select
                                        id="vendor_id"
                                        value={vendorId}
                                        onChange={e => {
                                            setVendorId(e.target.value)
                                            if (e.target.value) setPayeeName('')
                                        }}
                                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">No vendor selected</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.vendor_name}</option>
                                        ))}
                                    </select>
                                    <Dialog open={vendorModalOpen} onOpenChange={setVendorModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" className="px-3 hover:bg-gray-50 shrink-0" title="Quick Add Vendor">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
                                            <DialogHeader>
                                                <DialogTitle className="text-lg font-bold text-gray-900">Add New Vendor</DialogTitle>
                                                <DialogDescription className="text-xs text-gray-400">Create a vendor master record to link with bills and expenses.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-1">
                                                    <Label htmlFor="new_vendor_name" className="font-semibold text-gray-700 text-xs">Vendor Name *</Label>
                                                    <Input 
                                                        id="new_vendor_name" 
                                                        value={newVendorName} 
                                                        onChange={e => setNewVendorName(e.target.value)}
                                                        placeholder="e.g. Acme Corp" 
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="new_vendor_phone" className="font-semibold text-gray-700 text-xs">Phone (Optional)</Label>
                                                    <Input 
                                                        id="new_vendor_phone" 
                                                        value={newVendorPhone} 
                                                        onChange={e => setNewVendorPhone(e.target.value)}
                                                        placeholder="e.g. +91 99999 99999" 
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="new_vendor_gstin" className="font-semibold text-gray-700 text-xs">GSTIN (Optional)</Label>
                                                    <Input 
                                                        id="new_vendor_gstin" 
                                                        value={newVendorGstin} 
                                                        onChange={e => setNewVendorGstin(e.target.value)}
                                                        placeholder="e.g. 29AAAAA0000A1Z5" 
                                                        className="w-full font-mono text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                                <Button type="button" variant="outline" onClick={() => setVendorModalOpen(false)}>Cancel</Button>
                                                <Button type="button" onClick={handleQuickAddVendor} disabled={addingVendor}>
                                                    {addingVendor ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Add Vendor'
                                                    )}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Custom Payee */}
                            <div>
                                <Label htmlFor="payee_name" className="font-bold text-gray-700">Payee Name (Optional)</Label>
                                <Input 
                                    id="payee_name"
                                    placeholder="e.g. Acme Supplies, Office Rent, Electricity Board"
                                    value={payeeName}
                                    onChange={e => {
                                        setPayeeName(e.target.value)
                                        if (e.target.value) setVendorId('')
                                    }}
                                    disabled={!!vendorId}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Base Amount */}
                            <div>
                                <Label htmlFor="amount" className="font-bold text-gray-700">Base Amount (₹)</Label>
                                <Input 
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                    className="mt-1 text-base font-semibold"
                                />
                            </div>

                            {/* Tax Amount + GST helper chips */}
                            <div className="space-y-2">
                                <Label htmlFor="tax_amount" className="font-bold text-gray-700">Tax Amount (GST / VAT) (₹)</Label>
                                <Input 
                                    id="tax_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={taxAmount}
                                    onChange={e => setTaxAmount(e.target.value)}
                                    className="mt-1 font-semibold"
                                />
                                {/* Quick GST selector chips */}
                                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                    <span className="text-[10px] text-gray-400 font-medium mr-1">Quick GST (IN):</span>
                                    {[0, 5, 12, 18, 28].map(rate => (
                                        <button
                                            key={rate}
                                            type="button"
                                            onClick={() => handleQuickGst(rate)}
                                            className="text-[10px] font-bold px-2 py-0.5 border border-slate-100 hover:border-blue-200 text-slate-500 hover:text-blue-600 rounded-md transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50"
                                        >
                                            {rate}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Payment Method Details */}
                            <div>
                                <Label htmlFor="payment_method" className="font-bold text-gray-700">Payment Reference Method</Label>
                                <Input 
                                    id="payment_method"
                                    placeholder="e.g. Visa Card, Cash, GPay UPI"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            {/* Payment Reference */}
                            <div>
                                <Label htmlFor="payment_reference" className="font-bold text-gray-700">Payment Reference No. (Optional)</Label>
                                <Input 
                                    id="payment_reference"
                                    placeholder="e.g. Cheque No., UPI Transaction ID, Reference"
                                    value={paymentReference}
                                    onChange={e => setPaymentReference(e.target.value)}
                                    className="mt-1 font-mono text-xs"
                                />
                            </div>
                        </div>

                        {/* Total Display */}
                        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between shadow-xs">
                            <span className="font-bold text-gray-500 text-sm">Calculated Total Outflow</span>
                            <span className="text-xl font-bold text-slate-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link href="/expenses">
                        <Button type="button" variant="outline" className="hover:bg-gray-50">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="gap-2 px-6">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving Expense...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Expense
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
