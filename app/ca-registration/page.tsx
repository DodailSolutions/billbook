'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createCAProfile } from '@/lib/ca-profile-actions'
import type { CASpecialization } from '@/lib/hire-ca-types'
import {
  ArrowLeft,
  Award,
  MapPin,
  IndianRupee,
  CheckCircle,
  Briefcase,
} from 'lucide-react'

const SPECIALIZATIONS: CASpecialization[] = [
  'GST',
  'Income Tax',
  'Audit',
  'Company Law',
  'Financial Planning',
  'Bookkeeping',
  'Payroll',
  'TDS',
  'International Taxation',
]

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh',
]

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
  'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu',
]

export default function CARegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    icai_membership_number: '',
    firm_name: '',
    years_of_experience: 0,
    specializations: [] as CASpecialization[],
    office_address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    education: [''],
    certifications: [''],
    languages_spoken: [] as string[],
    consultation_fee: undefined as number | undefined,
    monthly_retainer_fee: undefined as number | undefined,
  })

  const handleSpecializationToggle = (spec: CASpecialization) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }))
  }

  const handleLanguageToggle = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages_spoken: prev.languages_spoken.includes(lang)
        ? prev.languages_spoken.filter((l) => l !== lang)
        : [...prev.languages_spoken, lang],
    }))
  }

  const handleSubmit = async () => {
    if (formData.specializations.length === 0) {
      alert('Please select at least one specialization')
      return
    }

    setLoading(true)
    const result = await createCAProfile({
      ...formData,
      education: formData.education.filter(e => e.trim()),
      certifications: formData.certifications.filter(c => c.trim()),
    })
    setLoading(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      alert(result.error || 'Failed to create profile')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3">Registration Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Your CA profile has been submitted for verification. Our team will review your ICAI
            membership details and activate your profile within 24-48 hours. You&apos;ll receive an email
            once verified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
            <Button onClick={() => router.push('/ca-profile')}>
              View My Profile
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Already registered?</span>
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-4">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">CA Registration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Register as a Chartered Accountant</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our network and connect with businesses looking for your expertise
          </p>
        </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s <= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-24 h-1 ${
                  s < step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Basic Information & ICAI Verification
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ICAI Membership Number *</label>
              <input
                type="text"
                value={formData.icai_membership_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icai_membership_number: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Enter your ICAI membership number"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We will verify this with ICAI before activating your profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Firm Name (Optional)</label>
              <input
                type="text"
                value={formData.firm_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, firm_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Your firm name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience *</label>
              <input
                type="number"
                value={formData.years_of_experience || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    years_of_experience: Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="e.g., 5"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={
                !formData.full_name ||
                !formData.email ||
                !formData.phone ||
                !formData.icai_membership_number ||
                !formData.years_of_experience
              }
            >
              Next: Specializations
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Specializations & Services */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Specializations & Languages
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Select Your Specializations *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecializationToggle(spec)}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    formData.specializations.includes(spec)
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageToggle(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.languages_spoken.includes(lang)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={formData.specializations.length === 0}>
              Next: Location
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Location & Office Details */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Office Location
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Office Address *</label>
              <input
                type="text"
                value={formData.office_address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, office_address: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Building name, street, area"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  required
                >
                  <option value="">Select state</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="PIN code"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={
                !formData.office_address || !formData.city || !formData.state || !formData.pincode
              }
            >
              Next: Pricing & Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Pricing & Additional Details */}
      {step === 4 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <IndianRupee className="w-5 h-5 mr-2" />
            Pricing & Profile Details
          </h2>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={formData.consultation_fee || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      consultation_fee: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="e.g., 2000"
                />
                <p className="text-xs text-gray-500 mt-1">Fee for one-time consultation</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monthly Retainer Fee (₹)</label>
                <input
                  type="number"
                  value={formData.monthly_retainer_fee || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthly_retainer_fee: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="e.g., 10000"
                />
                <p className="text-xs text-gray-500 mt-1">Fee for monthly retainer services</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Professional Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Tell clients about your expertise, experience, and what makes you unique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Education</label>
              {formData.education.map((edu, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={edu}
                    onChange={(e) => {
                      const newEducation = [...formData.education]
                      newEducation[index] = e.target.value
                      setFormData((prev) => ({ ...prev, education: newEducation }))
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., B.Com, CA Final"
                  />
                  {index === formData.education.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, education: [...prev.education, ''] }))
                      }
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Certifications</label>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => {
                      const newCerts = [...formData.certifications]
                      newCerts[index] = e.target.value
                      setFormData((prev) => ({ ...prev, certifications: newCerts }))
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., Certified Public Accountant"
                  />
                  {index === formData.certifications.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          certifications: [...prev.certifications, ''],
                        }))
                      }
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </Card>
      )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 BillBooky. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Terms of Service
              </a>
              <a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
