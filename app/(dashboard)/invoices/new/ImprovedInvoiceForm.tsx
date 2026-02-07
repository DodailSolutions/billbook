'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  ArrowLeft, Plus, Trash2, Send, 
  User, Receipt, FileText, 
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  Sparkles, Shield, Clock
} from 'lucide-react'
import { createInvoice } from '../actions'
import type { Customer } from '@/lib/types'

interface InvoiceItem {
  id: string
  description: string
  hsn_sac_code: string
  quantity: number
  unit_price: number
  gst_rate: number
  amount: number
  cgst: number
  sgst: number
  igst: number
}

interface ImprovedInvoiceFormProps {
  customers: Customer[]
}

export function ImprovedInvoiceForm({ customers }: ImprovedInvoiceFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    supply_type: 'intra-state' as 'intra-state' | 'inter-state',
    reverse_charge_applicable: false,
    is_recurring: false,
    notes: ''
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      hsn_sac_code: '',
      quantity: 1,
      unit_price: 0,
      gst_rate: 18,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0
    }
  ])

  // Auto-calculate amounts
  useEffect(() => {
    setItems(prevItems => prevItems.map(item => {
      const amount = item.quantity * item.unit_price
      const gstAmount = (amount * item.gst_rate) / 100
      
      return {
        ...item,
        amount,
        cgst: formData.supply_type === 'intra-state' ? gstAmount / 2 : 0,
        sgst: formData.supply_type === 'intra-state' ? gstAmount / 2 : 0,
        igst: formData.supply_type === 'inter-state' ? gstAmount : 0
      }
    }))
  }, [items, formData.supply_type])

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const totalCGST = items.reduce((sum, item) => sum + item.cgst, 0)
  const totalSGST = items.reduce((sum, item) => sum + item.sgst, 0)
  const totalIGST = items.reduce((sum, item) => sum + item.igst, 0)
  const gstPercentage = items.length > 0 ? items[0].gst_rate : 18
  const total = subtotal + totalCGST + totalSGST + totalIGST

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.customer_id) newErrors.customer_id = 'Please select a customer'
      if (!formData.invoice_date) newErrors.invoice_date = 'Invoice date is required'
    }

    if (step === 2) {
      items.forEach((item, index) => {
        if (!item.description) newErrors[`item-${index}-desc`] = 'Description required'
        if (item.quantity <= 0) newErrors[`item-${index}-qty`] = 'Quantity must be positive'
        if (item.unit_price <= 0) newErrors[`item-${index}-price`] = 'Price must be positive'
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Add item
  const addItem = () => {
    setItems([...items, {
      id: crypto.randomUUID(),
      description: '',
      hsn_sac_code: '',
      quantity: 1,
      unit_price: 0,
      gst_rate: 18,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0
    }])
  }

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Submit invoice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(1) || !validateStep(2)) {
      alert('Please fix all errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      const invoiceData = {
        customer_id: formData.customer_id,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || undefined,
        gst_percentage: gstPercentage,
        supply_type: formData.supply_type,
        reverse_charge_applicable: formData.reverse_charge_applicable,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          hsn_sac_code: item.hsn_sac_code || undefined,
          gst_rate: item.gst_rate
        })),
        is_recurring: formData.is_recurring
      }

      const result = await createInvoice(invoiceData)

      if (result.success) {
        alert('Invoice created successfully!')
        router.push('/invoices')
        router.refresh()
      } else {
        alert('Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
            <Shield className="w-3 h-3" />
            Secure
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            <Clock className="w-3 h-3" />
            Auto-save
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[
            { num: 1, label: 'Customer Details', icon: User },
            { num: 2, label: 'Add Items', icon: Receipt },
            { num: 3, label: 'Review & Send', icon: Send }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${currentStep === step.num 
                    ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                    : currentStep > step.num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.num ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep === step.num ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < 2 && (
                <div className={`w-24 h-0.5 ${
                  currentStep > step.num ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Customer Details */}
            {currentStep === 1 && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="border-b bg-linear-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer & Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={formData.customer_id} 
                      onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                      className={`w-full px-3 py-2.5 border rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.customer_id ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="" className="text-gray-400">Select a customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    {errors.customer_id && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.customer_id}
                      </p>
                    )}
                    {!errors.customer_id && formData.customer_id && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Customer selected
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">
                        Invoice Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.invoice_date}
                        onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                        className={errors.invoice_date ? 'border-red-500' : ''}
                      />
                      {errors.invoice_date && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.invoice_date}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">Due Date</label>
                      <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        min={formData.invoice_date}
                      />
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        Payment deadline for this invoice
                      </p>
                    </div>
                  </div>

                  {/* Supply Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Supply Type</label>
                    <p className="text-xs text-gray-500 mb-2">Select based on customer location</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={formData.supply_type === 'intra-state' ? 'default' : 'outline'}
                        onClick={() => setFormData({...formData, supply_type: 'intra-state'})}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-semibold">Intra-State</div>
                          <div className="text-xs opacity-75">CGST + SGST</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={formData.supply_type === 'inter-state' ? 'default' : 'outline'}
                        onClick={() => setFormData({...formData, supply_type: 'inter-state'})}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-semibold">Inter-State</div>
                          <div className="text-xs opacity-75">IGST</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Advanced Options
                      </span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {showAdvanced && (
                      <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.reverse_charge_applicable}
                            onChange={(e) => setFormData({...formData, reverse_charge_applicable: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-900 font-medium">Reverse Charge Applicable</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_recurring}
                            onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-900 font-medium">Make this a Recurring Invoice</span>
                        </label>
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Step 2: Items */}
            {currentStep === 2 && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="border-b bg-linear-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-blue-600" />
                      Invoice Items
                    </CardTitle>
                    <Button type="button" onClick={addItem} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  
                  {items.map((item, index) => (
                    <Card key={item.id} className="border-2 hover:border-blue-200 transition-colors">
                      <CardContent className="p-4 space-y-4">
                        
                        <div className="flex items-start justify-between">
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            Item {index + 1}
                          </div>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Description *</label>
                            <Input
                              placeholder="e.g., Web Development Services"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className={errors[`item-${index}-desc`] ? 'border-red-500' : ''}
                            />
                            {errors[`item-${index}-desc`] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors[`item-${index}-desc`]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">HSN/SAC Code</label>
                            <Input
                              placeholder="998314"
                              value={item.hsn_sac_code}
                              onChange={(e) => updateItem(item.id, 'hsn_sac_code', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Quantity *</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className={errors[`item-${index}-qty`] ? 'border-red-500' : ''}
                            />
                            {errors[`item-${index}-qty`] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors[`item-${index}-qty`]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Rate *</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="₹0.00"
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className={errors[`item-${index}-price`] ? 'border-red-500' : ''}
                            />
                            {errors[`item-${index}-price`] && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors[`item-${index}-price`]}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">GST Rate (%)</label>
                            <select
                              value={item.gst_rate}
                              onChange={(e) => updateItem(item.id, 'gst_rate', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <Input
                              value={`₹${item.amount.toFixed(2)}`}
                              disabled
                              className="bg-gray-50 font-semibold"
                            />
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  ))}

                </CardContent>
              </Card>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="border-b bg-linear-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Review Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-blue-600 font-medium">Subtotal</div>
                        <div className="text-2xl font-bold text-blue-900">₹{subtotal.toFixed(2)}</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-green-600 font-medium">
                          {formData.supply_type === 'intra-state' ? 'CGST + SGST' : 'IGST'}
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          ₹{(totalCGST + totalSGST + totalIGST).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-purple-600 font-medium">Total</div>
                        <div className="text-2xl font-bold text-purple-900">₹{total.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Additional Notes</label>
                    <textarea
                      placeholder="Add any additional information or payment instructions..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div className="border-t pt-6" />

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Creating...' : 'Create Invoice'}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              {currentStep < 3 && (
                <Button type="button" onClick={nextStep} className="ml-auto gap-2">
                  Next
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              )}
            </div>

          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-xl border-0 bg-white">
              <CardHeader className="border-b bg-linear-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-lg">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Company Header */}
                <div className="text-center pb-4 border-b">
                  <h2 className="text-2xl font-bold text-blue-600">BillBooky</h2>
                  <p className="text-sm text-gray-600">Invoice Management System</p>
                </div>

                {/* Invoice Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice #:</span>
                    <span className="font-semibold">INV-2026-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{formData.invoice_date}</span>
                  </div>
                  {formData.due_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-semibold">{formData.due_date}</span>
                    </div>
                  )}
                </div>

                <div className="border-t" />

                {/* Items */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Items</h3>
                  {items.map((item, index) => (
                    <div key={item.id} className="text-xs space-y-1 p-2 bg-gray-50 rounded">
                      <div className="font-medium">{item.description || `Item ${index + 1}`}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>{item.quantity} × ₹{item.unit_price.toFixed(2)}</span>
                        <span className="font-semibold">₹{item.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {formData.supply_type === 'intra-state' ? (
                    <>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>CGST:</span>
                        <span>₹{totalCGST.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>SGST:</span>
                        <span>₹{totalSGST.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>IGST:</span>
                      <span>₹{totalIGST.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
