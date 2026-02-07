'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle, Zap } from 'lucide-react'

interface SetupWizardProps {
  onComplete?: () => void
  initialStep?: number
}

export function SetupWizard({ onComplete, initialStep = 1 }: SetupWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    paymentMethod: 'upi',
    upiId: '',
    upiIdConfirm: '',
    enabledModules: {
      quotes: true,
      deliveryChallans: true,
      timesheet: true,
      recurringInvoice: true,
      creditNote: false,
      paymentLinks: false,
    },
  })

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save setup data to local storage or database
    localStorage.setItem('setupCompleted', 'true')
    localStorage.setItem('setupData', JSON.stringify(formData))
    if (onComplete) {
      onComplete()
    } else {
      router.push('/dashboard')
    }
  }

  const isStepComplete = (step: number) => {
    if (step === 1) return formData.companyName.length > 0
    if (step === 2) return formData.paymentMethod !== ''
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to BillBook
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your journey to top-tier invoicing starts here. Configure BillBook the way you want with our intuitive setup guide.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      1. How do you want your invoices to look?
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => router.push('/invoices/settings')}
                  >
                    Edit
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <Input
                      placeholder="Enter your company name"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GSTIN (Optional)
                    </label>
                    <Input
                      placeholder="Enter your GSTIN"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={handleNext}
                    disabled={!isStepComplete(1)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save & Proceed
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card className="p-8">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    STEP 2/3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    2. How do you want to receive payments?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    You can collect payments either online or offline, based on your preference.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Cash</div>
                      <div className="text-sm text-gray-500">Offline payment method</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">UPI</div>
                      <div className="text-sm text-gray-500">
                        Display your UPI details on invoices. You will have to record received payments manually.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gateway"
                      checked={formData.paymentMethod === 'gateway'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Online Payment Gateways</div>
                      <div className="text-sm text-gray-500">Accept online payments via Razorpay</div>
                    </div>
                  </label>
                </div>

                {formData.paymentMethod === 'upi' && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter UPI ID
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="username@bank"
                          value={formData.upiId}
                          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                          className="w-full pr-12"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm UPI ID
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="Confirm your UPI ID"
                          value={formData.upiIdConfirm}
                          onChange={(e) => setFormData({ ...formData, upiIdConfirm: e.target.value })}
                          className="w-full pr-12"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save & Proceed
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Enable Modules */}
            {currentStep === 3 && (
              <Card className="p-8">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    STEP 3/3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    3. Make the most of BillBook
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enable additional modules that you may use. These settings can be changed any time.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Select Modules
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'quotes', label: 'Quotes' },
                      { key: 'deliveryChallans', label: 'Delivery Challans' },
                      { key: 'timesheet', label: 'Timesheet' },
                      { key: 'recurringInvoice', label: 'Recurring Invoice' },
                      { key: 'creditNote', label: 'Credit Note' },
                      { key: 'paymentLinks', label: 'Payment Links' },
                    ].map((module) => (
                      <label
                        key={module.key}
                        className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.enabledModules[module.key as keyof typeof formData.enabledModules]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              enabledModules: {
                                ...formData.enabledModules,
                                [module.key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {module.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Start Invoicing
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Preview
              </h3>
              
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Company Name</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formData.companyName || 'Your Company Name'}
                    </div>
                  </div>
                  {formData.gstin && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">GSTIN</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formData.gstin}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                      INVOICE
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      ₹20000.00
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment for INV-000001
                      </div>
                    </div>
                    {formData.paymentMethod === 'upi' && formData.upiId && (
                      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Scan QR for Payment</div>
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                          <span className="text-xs text-gray-500">QR Code</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Enabled Modules:
                  </div>
                  {Object.entries(formData.enabledModules)
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
