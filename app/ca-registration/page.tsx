'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/app/_components/Footer'
import { createCAProfile } from '@/lib/ca-profile-actions'
import { createClient } from '@/lib/supabase/client'
import type { CASpecialization } from '@/lib/hire-ca-types'
import {
  ArrowLeft,
  Award,
  MapPin,
  IndianRupee,
  CheckCircle,
  Briefcase,
  Clock3,
  Shield,
  Sparkles,
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

const STORAGE_KEY = 'caRegistrationData'

const STEP_DETAILS = [
  {
    title: 'Basic info',
    description: 'Verify your identity and ICAI details',
  },
  {
    title: 'Expertise',
    description: 'Select the services and languages you offer',
  },
  {
    title: 'Location',
    description: 'Add your office and service coverage',
  },
  {
    title: 'Pricing',
    description: 'Set fees and write a client-facing profile',
  },
]

const createInitialFormData = () => ({
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

type CARegistrationFormData = ReturnType<typeof createInitialFormData>

export default function CARegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [validationError, setValidationError] = useState('')
  const [draftRestored, setDraftRestored] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY))
  })
  const [formData, setFormData] = useState<CARegistrationFormData>(() => {
    const fallback = createInitialFormData()

    if (typeof window === 'undefined') {
      return fallback
    }

    const savedData = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (!savedData) {
      return fallback
    }

    try {
      return {
        ...fallback,
        ...JSON.parse(savedData),
      }
    } catch (error) {
      console.error('Failed to restore form data:', error)
      return fallback
    }
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasStarted = Object.values(formData).some((value) => {
      if (Array.isArray(value)) return value.some((item) => Boolean(String(item).trim()))
      if (typeof value === 'number') return value > 0
      return Boolean(value)
    })

    if (hasStarted) {
      const serialized = JSON.stringify(formData)
      localStorage.setItem(STORAGE_KEY, serialized)
      sessionStorage.setItem(STORAGE_KEY, serialized)
    }
  }, [formData])

  const completedItems = [
    Boolean(formData.full_name.trim()),
    /\S+@\S+\.\S+/.test(formData.email),
    formData.phone.replace(/\D/g, '').length >= 10,
    /^[A-Za-z0-9/-]{5,15}$/.test(formData.icai_membership_number.trim()),
    formData.specializations.length > 0,
    Boolean(
      formData.office_address.trim() &&
      formData.city.trim() &&
      formData.state &&
      formData.pincode.trim().length >= 6
    ),
    Boolean(formData.bio.trim() || formData.consultation_fee || formData.monthly_retainer_fee),
  ]

  const profileCompletion = Math.round(
    (completedItems.filter(Boolean).length / completedItems.length) * 100
  )

  const validateStep = (stepToValidate: number) => {
    setValidationError('')

    const emailIsValid = /\S+@\S+\.\S+/.test(formData.email)
    const phoneDigits = formData.phone.replace(/\D/g, '')
    const membershipLooksValid = /^[A-Za-z0-9/-]{5,15}$/.test(
      formData.icai_membership_number.trim()
    )

    if (stepToValidate === 1) {
      if (!formData.full_name.trim() || !emailIsValid || phoneDigits.length < 10 || !membershipLooksValid) {
        setValidationError('Please enter valid contact details and a valid ICAI membership number to continue.')
        return false
      }
    }

    if (stepToValidate === 2 && formData.specializations.length === 0) {
      setValidationError('Please select at least one specialization so clients can discover your services.')
      return false
    }

    if (stepToValidate === 3) {
      const pincodeLooksValid = /^\d{6}$/.test(formData.pincode.trim())
      if (!formData.office_address.trim() || !formData.city.trim() || !formData.state || !pincodeLooksValid) {
        setValidationError('Please complete your office address with a valid 6-digit pincode.')
        return false
      }
    }

    return true
  }

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
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return
    }

    if ((formData.consultation_fee ?? 0) < 0 || (formData.monthly_retainer_fee ?? 0) < 0) {
      setValidationError('Pricing values cannot be negative.')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      const serialized = JSON.stringify(formData)
      localStorage.setItem(STORAGE_KEY, serialized)
      sessionStorage.setItem(STORAGE_KEY, serialized)
      router.push('/signup?returnTo=/ca-registration&message=Please sign up or log in to complete your CA registration')
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
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      setDraftRestored(false)
      setSubmitted(true)
    } else {
      setValidationError(result.error || 'Failed to create profile. Please review your details and try again.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full p-8 text-center bg-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3">Registration Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 mb-8">
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
    <div className="min-h-screen bg-gray-50">
      {/* BillBooky Brand Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/logo-icon.svg" 
                  alt="BillBooky Logo" 
                  width={32} 
                  height={32}
                  priority
                  className="transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                BillBooky<span className="text-emerald-600">.</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <Link href="/ca-marketplace" className="hover:text-black transition-colors">CA Marketplace</Link>
              <Link href="/features" className="hover:text-black transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
              <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium hidden sm:inline">Already a partner?</span>
              <Button 
                onClick={() => router.push('/login')}
                className="bg-black hover:bg-slate-900 text-white rounded-full font-bold px-5 py-2 text-xs shadow-sm hover:scale-[1.02] transition-all"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">CA Registration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Register as a Chartered Accountant</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our network and connect with businesses looking for your expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white border-blue-100">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold">Verified onboarding</p>
                <p className="text-sm text-gray-600">ICAI details are reviewed before your profile goes live.</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white border-emerald-100">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold">Fast setup</p>
                <p className="text-sm text-gray-600">Finish in about 3 minutes and continue anytime.</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white border-amber-100">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold">Better discovery</p>
                <p className="text-sm text-gray-600">Complete profiles appear more trustworthy to businesses.</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5 bg-white mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Step {step} of 4</p>
              <h2 className="text-xl font-bold">{STEP_DETAILS[step - 1].title}</h2>
              <p className="text-sm text-gray-600">{STEP_DETAILS[step - 1].description}</p>
            </div>
            <div className="min-w-45">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Profile completion</span>
                <span className="font-semibold">{profileCompletion}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {STEP_DETAILS.map((item, index) => {
              const stepNumber = index + 1
              const isCurrent = stepNumber === step
              const isComplete = stepNumber < step

              return (
                <div
                  key={item.title}
                  className={`rounded-xl border p-3 text-left ${
                    isCurrent
                      ? 'border-blue-300 bg-blue-50'
                      : isComplete
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isComplete
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {stepNumber}
                    </div>
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {draftRestored && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your saved CA application draft has been restored.
          </div>
        )}

        {validationError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {validationError}
          </div>
        )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card className="p-6 bg-white">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                placeholder="e.g., 5"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (validateStep(1)) setStep(2)
              }}
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
        <Card className="p-6 bg-white">
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
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
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
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <Button
              onClick={() => {
                if (validateStep(2)) setStep(3)
              }}
              disabled={formData.specializations.length === 0}
            >
              Next: Location
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Location & Office Details */}
      {step === 3 && (
        <Card className="p-6 bg-white">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
              onClick={() => {
                if (validateStep(3)) setStep(4)
              }}
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
        <Card className="p-6 bg-white">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
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
      <Footer />
    </div>
  )
}
