'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Loader2, Check, Calendar, Users } from 'lucide-react'
import { loadRazorpayScript } from '@/lib/razorpay'

interface PricingOption {
  id: string
  billing_period: 'monthly' | 'yearly'
  price_per_slot: number
  duration_days: number
  display_price: string
}

interface PurchaseAddonModalProps {
  isLifetimePlan: boolean
  currentSlots: number
  onSuccess: () => void
}

export function PurchaseAddonModal({ isLifetimePlan, currentSlots, onSuccess }: PurchaseAddonModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pricing, setPricing] = useState<PricingOption[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && isLifetimePlan) {
      fetchPricing()
    }
  }, [open, isLifetimePlan])

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/team/addons')
      const data = await response.json()

      if (response.ok) {
        setPricing(data.pricing)
      }
    } catch (err) {
      console.error('Error fetching pricing:', err)
    }
  }

  const selectedPricing = pricing.find(p => p.billing_period === selectedPeriod)
  const totalAmount = selectedPricing ? (selectedPricing.price_per_slot * quantity) / 100 : 0

  const handlePurchase = async () => {
    if (!selectedPricing) return

    setLoading(true)
    setError('')

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load')
      }

      // Create order
      const orderResponse = await fetch('/api/team/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          billing_period: selectedPeriod
        })
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BillBook',
        description: `${quantity} Additional Team Member${quantity > 1 ? 's' : ''} - ${selectedPeriod === 'yearly' ? 'Yearly' : 'Monthly'}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/team/addons/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              quantity,
              billing_period: selectedPeriod,
              duration_days: orderData.duration_days,
              price_per_slot: orderData.price_per_slot
            })
          })

          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok) {
            setOpen(false)
            onSuccess()
          } else {
            throw new Error(verifyData.error || 'Payment verification failed')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (!isLifetimePlan) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Buy More Slots
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Additional Team Members</DialogTitle>
          <DialogDescription>
            Add more team member slots to your Lifetime plan. Current: {currentSlots} purchased slot(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Quantity Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Number of Additional Slots</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={loading || quantity <= 1}
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold">{quantity}</span>
                <span className="text-sm text-gray-500 ml-2">slot{quantity !== 1 ? 's' : ''}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={loading || quantity >= 10}
              >
                +
              </Button>
            </div>
          </div>

          {/* Billing Period Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Billing Period</label>
            <div className="grid grid-cols-2 gap-4">
              {pricing.map((option) => {
                const isSelected = option.billing_period === selectedPeriod
                const pricePerSlot = option.price_per_slot / 100
                const totalPrice = (pricePerSlot * quantity).toFixed(0)
                const savings = option.billing_period === 'yearly' 
                  ? Math.round(((199 * 12) - 2000) / (199 * 12) * 100)
                  : 0

                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-2 border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPeriod(option.billing_period)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {option.billing_period}
                        </CardTitle>
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      {savings > 0 && (
                        <div className="inline-block">
                          <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            Save {savings}%
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold">₹{pricePerSlot}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          per slot/{option.billing_period === 'yearly' ? 'year' : 'month'}
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-sm font-medium">Total: ₹{totalPrice}</div>
                          <div className="text-xs text-gray-500">
                            for {quantity} slot{quantity !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          {selectedPricing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Users className="h-4 w-4" />
                    Additional team slots
                  </span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Calendar className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="font-medium">
                    {selectedPeriod === 'yearly' ? '1 Year' : '1 Month'} ({selectedPricing.duration_days} days)
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-200 dark:border-blue-700 flex items-center justify-between">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ₹{totalAmount.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={loading || !selectedPricing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase ₹{totalAmount.toFixed(0)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
