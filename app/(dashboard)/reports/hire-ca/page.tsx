'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createHireRequest } from '@/lib/hire-ca-actions'
import type { HireRequestType, CAServiceType } from '@/lib/hire-ca-types'
import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'

const REQUEST_TYPES: { value: HireRequestType; label: string; description: string }[] = [
  { value: 'consultation', label: 'One-time Consultation', description: 'Get expert advice on a specific issue' },
  { value: 'monthly_retainer', label: 'Monthly Retainer', description: 'Ongoing monthly support for your business' },
  { value: 'project_based', label: 'Project-Based', description: 'Hire for a specific project or task' },
  { value: 'gst_filing', label: 'GST Filing', description: 'Monthly or quarterly GST return filing' },
  { value: 'tax_filing', label: 'Tax Filing', description: 'Income tax return filing assistance' },
  { value: 'audit', label: 'Audit Services', description: 'Financial audit and compliance' },
]

const SERVICES: { value: CAServiceType; label: string }[] = [
  { value: 'GST Filing', label: 'GST Filing' },
  { value: 'Tax Returns', label: 'Tax Returns' },
  { value: 'Bookkeeping', label: 'Bookkeeping' },
  { value: 'Audit', label: 'Audit' },
  { value: 'Financial Planning', label: 'Financial Planning' },
  { value: 'Company Registration', label: 'Company Registration' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Payroll Management', label: 'Payroll Management' },
  { value: 'TDS Filing', label: 'TDS Filing' },
]

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'Individual',
]

export default function HireCAPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    request_type: 'consultation' as HireRequestType,
    service_needed: [] as CAServiceType[],
    business_name: '',
    business_type: '',
    annual_turnover: undefined as number | undefined,
    number_of_invoices: undefined as number | undefined,
    description: '',
    preferred_start_date: '',
    duration_months: undefined as number | undefined,
    budget_min: undefined as number | undefined,
    budget_max: undefined as number | undefined,
    preferred_city: '',
    preferred_state: '',
    remote_ok: true,
  })

  const handleServiceToggle = (service: CAServiceType) => {
    setFormData((prev) => ({
      ...prev,
      service_needed: prev.service_needed.includes(service)
        ? prev.service_needed.filter((s) => s !== service)
        : [...prev.service_needed, service],
    }))
  }

  const handleSubmit = async () => {
    if (formData.service_needed.length === 0) {
      alert('Please select at least one service')
      return
    }

    setLoading(true)
    const result = await createHireRequest(formData)
    setLoading(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      alert(result.error || 'Failed to submit request')
    }
  }

  if (submitted) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your hire request has been sent to our network of verified Chartered Accountants.
            You&apos;ll receive proposals within 24-48 hours.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/reports')}>
              Back to Reports
            </Button>
            <Button onClick={() => router.push('/reports/my-ca-requests')}>
              View My Requests
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hire a Chartered Accountant</h1>
        <p className="text-gray-600">
          Tell us about your requirements and we&apos;ll connect you with verified CAs
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s <= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-24 h-1 ${
                  s < step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Request Type & Services */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            What type of service do you need?
          </h2>

          <div className="space-y-3 mb-8">
            {REQUEST_TYPES.map((type) => (
              <div
                key={type.value}
                onClick={() => setFormData((prev) => ({ ...prev, request_type: type.value }))}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.request_type === type.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200  hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4">Select Services Needed</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {SERVICES.map((service) => (
              <div
                key={service.value}
                onClick={() => handleServiceToggle(service.value)}
                className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                  formData.service_needed.includes(service.value)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200  hover:border-blue-300'
                }`}
              >
                {service.label}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={formData.service_needed.length === 0}>
              Next: Business Details
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Business Details */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Tell us about your business
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Business Name (Optional)</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, business_name: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                placeholder="Your Business Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Type (Optional)</label>
              <select
                value={formData.business_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, business_type: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Annual Turnover (₹) (Optional)
                </label>
                <input
                  type="number"
                  value={formData.annual_turnover || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      annual_turnover: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="e.g., 5000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Invoices (Optional)
                </label>
                <input
                  type="number"
                  value={formData.number_of_invoices || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      number_of_invoices: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Describe Your Requirements *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                placeholder="Provide details about what you need help with..."
                required
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!formData.description.trim()}>
              Next: Budget & Timeline
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Budget & Location */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Budget and Timeline
          </h2>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Budget (₹) (Optional)
                </label>
                <input
                  type="number"
                  value={formData.budget_min || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      budget_min: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Budget (₹) (Optional)
                </label>
                <input
                  type="number"
                  value={formData.budget_max || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      budget_max: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="e.g., 15000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Preferred Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.preferred_start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, preferred_start_date: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (Months) (Optional)
                </label>
                <input
                  type="number"
                  value={formData.duration_months || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration_months: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="e.g., 6"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred City (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, preferred_city: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="e.g., Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred State (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_state}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, preferred_state: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote_ok"
                  checked={formData.remote_ok}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, remote_ok: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="remote_ok" className="ml-2 text-sm">
                  Open to remote CA services
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
