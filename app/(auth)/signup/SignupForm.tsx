'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { ChevronLeft, ChevronRight, Check, AlertCircle, CheckCircle } from 'lucide-react'
import { signup } from '../actions'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { 
    validateEmail, 
    validatePassword, 
    validateFullName, 
    validateBusinessName, 
    validatePhoneNumber, 
    validateGSTIN,
    validateAddress
} from '@/lib/validation/auth'

const BUSINESS_TYPES = [
    { value: 'dental', label: 'Dental Clinic' },
    { value: 'it_company', label: 'IT Company' },
    { value: 'salon', label: 'Salon/Beauty Parlor' },
    { value: 'car_detailing', label: 'Car Detailing Shop' },
    { value: 'car_wash', label: 'Car & Bike Wash' },
    { value: 'spare_parts', label: 'Spare Parts Shop' },
    { value: 'clinic', label: 'Medical Clinic' },
    { value: 'restaurant', label: 'Restaurant/Cafe' },
    { value: 'retail', label: 'Retail Store' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'other', label: 'Other' }
]

interface SignupFormProps {
    selectedPlan: string
    message?: string
    redirectAfter?: string
    paymentData?: string | null
}

interface FieldErrors {
    [key: string]: string | undefined
}

export function SignupForm({ selectedPlan, message, redirectAfter, paymentData }: SignupFormProps) {
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationError, setValidationError] = useState<string>('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        businessType: '',
        businessName: '',
        ownerName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        gstin: '',
        selectedPlan: selectedPlan,
        redirectAfter: redirectAfter || ''
    })

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Reset submitting state if there's an error message (means we've been redirected back)
    useEffect(() => {
        if (message) {
            setIsSubmitting(false)
        }
    }, [message])

    const totalSteps = 3
    const progress = (currentStep / totalSteps) * 100

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        // Clear general validation error when user starts typing
        if (validationError) {
            setValidationError('')
        }
        
        // Real-time validation on change if field has been touched
        if (touched[name]) {
            validateField(name, value)
        }
    }

    const validateField = (field: string, value: string): boolean => {
        let isValid = true
        let errorMsg: string | undefined

        switch (field) {
            case 'fullName':
                const fullNameResult = validateFullName(value)
                isValid = fullNameResult.isValid
                errorMsg = fullNameResult.error
                break
            case 'email':
                const emailResult = validateEmail(value)
                isValid = emailResult.isValid
                errorMsg = emailResult.error
                break
            case 'password':
                const passwordResult = validatePassword(value)
                isValid = passwordResult.isValid
                errorMsg = passwordResult.error
                break
            case 'businessName':
                const bizNameResult = validateBusinessName(value)
                isValid = bizNameResult.isValid
                errorMsg = bizNameResult.error
                break
            case 'businessPhone':
                const phoneResult = validatePhoneNumber(value)
                isValid = phoneResult.isValid
                errorMsg = phoneResult.error
                break
            case 'gstin':
                const gstinResult = validateGSTIN(value)
                isValid = gstinResult.isValid
                errorMsg = gstinResult.error
                break
            case 'businessAddress':
                const addrResult = validateAddress(value)
                isValid = addrResult.isValid
                errorMsg = addrResult.error
                break
            case 'businessEmail':
                // Optional field - only validate if not empty
                if (value.trim()) {
                    const bizEmailResult = validateEmail(value)
                    isValid = bizEmailResult.isValid
                    errorMsg = bizEmailResult.error
                }
                break
        }

        setFieldErrors(prev => ({
            ...prev,
            [field]: errorMsg
        }))

        return isValid
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field, formData[field as keyof typeof formData] as string)
    }

    const validateStep = (step: number): boolean => {
        setValidationError('')
        let isStepValid = true

        switch (step) {
            case 1:
                const fullNameValid = validateField('fullName', formData.fullName)
                const emailValid = validateField('email', formData.email)
                const passwordValid = validateField('password', formData.password)
                
                isStepValid = fullNameValid && emailValid && passwordValid
                
                if (!isStepValid) {
                    setValidationError('Please fix the errors above before proceeding')
                }
                break
            case 2:
                if (!formData.businessType) {
                    setValidationError('Please select a business type')
                    return false
                }
                const bizNameValid = validateField('businessName', formData.businessName)
                const phoneValid = validateField('businessPhone', formData.businessPhone)
                
                // Validate optional email if provided
                let bizEmailValid = true
                if (formData.businessEmail) {
                    bizEmailValid = validateField('businessEmail', formData.businessEmail)
                }
                
                isStepValid = bizNameValid && phoneValid && bizEmailValid
                
                if (!isStepValid) {
                    setValidationError('Please fix the errors above before proceeding')
                }
                break
            case 3:
                return true // Review step, always valid
            default:
                return false
        }

        return isStepValid
    }

    const handleNext = () => {
        // Mark all fields in this step as touched
        const fieldsInStep = currentStep === 1 
            ? ['fullName', 'email', 'password']
            : currentStep === 2
            ? ['businessType', 'businessName', 'businessPhone']
            : []
        
        fieldsInStep.forEach(field => {
            setTouched(prev => ({ ...prev, [field]: true }))
        })

        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps))
        }
    }

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const getFieldState = (field: string): 'error' | 'valid' | 'default' => {
        if (!touched[field]) return 'default'
        if (fieldErrors[field]) return 'error'
        if (formData[field as keyof typeof formData]) return 'valid'
        return 'default'
    }

    const getFieldBorderClass = (field: string): string => {
        const state = getFieldState(field)
        switch (state) {
            case 'error':
                return 'border-red-500 focus:ring-red-500'
            case 'valid':
                return 'border-emerald-500 focus:ring-emerald-500'
            default:
                return 'border-gray-300'
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')
        
        // Validate all required fields before submission
        if (!formData.fullName || !formData.email || !formData.password) {
            setValidationError('Please fill in all required fields')
            return
        }

        if (formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters long')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setValidationError('Please enter a valid email address')
            return
        }

        if (!formData.businessType || !formData.businessName || !formData.businessPhone) {
            setValidationError('Please fill in all required business information')
            return
        }

        setIsSubmitting(true)

        try {
            // If we have payment data, this is a guest purchase - verify payment and create account
            if (paymentData) {
                try {
                    const payment = JSON.parse(atob(paymentData))
                    
                    const response = await fetch('/api/razorpay/verify-guest-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: payment.order_id,
                            razorpay_payment_id: payment.payment_id,
                            razorpay_signature: payment.signature,
                            plan: payment.plan,
                            email: formData.email,
                            password: formData.password,
                            fullName: formData.fullName,
                            businessType: formData.businessType,
                            businessName: formData.businessName,
                            ownerName: formData.ownerName,
                            businessAddress: formData.businessAddress,
                            businessPhone: formData.businessPhone,
                            businessEmail: formData.businessEmail,
                            gstin: formData.gstin
                        })
                    })

                    if (response.ok) {
                        // Account created successfully with payment - redirect to dashboard
                        router.push('/dashboard?payment=success&welcome=true')
                    } else {
                        const data = await response.json()
                        setValidationError(data.error || 'Failed to verify payment and create account')
                        setIsSubmitting(false)
                    }
                    return
                } catch (err) {
                    console.error('Payment verification error:', err)
                    setValidationError('Failed to verify payment. Please contact support.')
                    setIsSubmitting(false)
                    return
                }
            }

            // Normal signup flow (without payment)
            const formElement = new FormData()
            Object.entries(formData).forEach(([key, value]) => {
                formElement.append(key, value)
            })

            // Call the server action - it will handle redirects
            try {
                await signup(formElement)
                // If we reach here without redirect, something unexpected happened
                console.log('Signup completed without redirect')
            } catch (signupErr) {
                // Redirects throw NEXT_REDIRECT error which is expected
                // Only handle actual errors here
                if (signupErr && typeof signupErr === 'object' && 'digest' in signupErr) {
                    // This is a Next.js redirect, let it propagate
                    throw signupErr
                }
                // Handle other errors
                console.error('Signup error:', signupErr)
                const errorMsg = signupErr instanceof Error ? signupErr.message : 'An error occurred during signup. Please try again.'
                setValidationError(errorMsg)
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error('Form submit error:', error)
            if (error && typeof error === 'object' && 'digest' in error) {
                // This is a Next.js redirect - let it propagate
                throw error
            }
            setValidationError('An unexpected error occurred. Please try again.')
            setIsSubmitting(false)
        }
    }

    if (!isMounted) {
        return null
    }

    return (
        <Card className="max-w-2xl mx-auto relative" suppressHydrationWarning>
            {isSubmitting && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                                <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">Creating your account...</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait, this may take a moment</p>
                            </div>
                        </div>
                    )}
                    <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>
                    {paymentData ? (
                        <span className="text-emerald-600 font-semibold">
                            ✓ Payment successful! Complete signup to access your lifetime plan
                        </span>
                    ) : selectedPlan !== 'free' ? (
                        <span className="text-emerald-600 font-semibold">
                            Creating account for {selectedPlan} plan
                        </span>
                    ) : (
                        'Get started with your free account'
                    )}
                </CardDescription>
                
                {/* Progress Bar */}
                <div className="pt-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Step {currentStep} of {totalSteps}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <Progress value={progress} />
                    
                    {/* Step indicators */}
                    <div className="flex justify-between mt-4">
                        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                currentStep > 1 ? 'bg-emerald-600 border-emerald-600' : 
                                currentStep === 1 ? 'border-emerald-600' : 'border-gray-300'
                            }`}>
                                {currentStep > 1 ? <Check className="w-4 h-4 text-white" /> : <span className="text-sm font-semibold">1</span>}
                            </div>
                            <span className="text-xs font-medium hidden sm:inline">Personal</span>
                        </div>
                        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                currentStep > 2 ? 'bg-emerald-600 border-emerald-600' : 
                                currentStep === 2 ? 'border-emerald-600' : 'border-gray-300'
                            }`}>
                                {currentStep > 2 ? <Check className="w-4 h-4 text-white" /> : <span className="text-sm font-semibold">2</span>}
                            </div>
                            <span className="text-xs font-medium hidden sm:inline">Business</span>
                        </div>
                        <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                currentStep === 3 ? 'border-emerald-600' : 'border-gray-300'
                            }`}>
                                <span className="text-sm font-semibold">3</span>
                            </div>
                            <span className="text-xs font-medium hidden sm:inline">Review</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {validationError && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                            {validationError}
                        </p>
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                            {message}
                        </p>
                        {message.toLowerCase().includes('already') && (
                            <p className="text-xs text-red-700 dark:text-red-300">
                                Already have an account? <a href="/login" className="underline font-semibold hover:text-red-900 dark:hover:text-red-100">Login here</a>
                            </p>
                        )}
                        {message.toLowerCase().includes('confirm') && (
                            <p className="text-xs text-red-700 dark:text-red-300">
                                Need to resend confirmation email? <a href="/resend-confirmation" className="underline font-semibold hover:text-red-900 dark:hover:text-red-100">Click here</a>
                            </p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Personal Information
                            </h3>
                            <div className="space-y-4">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-sm font-medium leading-none">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="fullName" 
                                        name="fullName" 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('fullName')}
                                        className={`transition-colors ${getFieldBorderClass('fullName')}`}
                                        required 
                                        autoComplete="name"
                                    />
                                    {touched.fullName && fieldErrors.fullName && (
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.fullName}
                                        </p>
                                    )}
                                    {touched.fullName && getFieldState('fullName') === 'valid' && (
                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Name looks good
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('email')}
                                        className={`transition-colors ${getFieldBorderClass('email')}`}
                                        required
                                        autoComplete="email"
                                    />
                                    {touched.email && fieldErrors.email && (
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.email}
                                        </p>
                                    )}
                                    {touched.email && getFieldState('email') === 'valid' && (
                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Email verified
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium leading-none">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('password')}
                                        className={`transition-colors ${getFieldBorderClass('password')}`}
                                        minLength={6} 
                                        required
                                        autoComplete="new-password"
                                    />
                                    {touched.password && fieldErrors.password && (
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.password}
                                        </p>
                                    )}
                                    {formData.password && (
                                        <PasswordStrengthIndicator password={formData.password} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business Information */}
                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Business Information
                            </h3>
                            <div className="space-y-4">
                                {/* Business Type */}
                                <div className="space-y-2">
                                    <label htmlFor="businessType" className="text-sm font-medium leading-none">
                                        Business Type <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        id="businessType" 
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('businessType')}
                                        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                                            !formData.businessType && touched.businessType ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">Select your business type</option>
                                        {BUSINESS_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    {!formData.businessType && touched.businessType && (
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Please select a business type
                                        </p>
                                    )}
                                    {formData.businessType && (
                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}
                                        </p>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Business Name */}
                                    <div className="space-y-2">
                                        <label htmlFor="businessName" className="text-sm font-medium leading-none">
                                            Business Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input 
                                            id="businessName" 
                                            name="businessName" 
                                            type="text" 
                                            placeholder="ABC Dental Clinic"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('businessName')}
                                            className={`transition-colors ${getFieldBorderClass('businessName')}`}
                                            required 
                                        />
                                        {touched.businessName && fieldErrors.businessName && (
                                            <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {fieldErrors.businessName}
                                            </p>
                                        )}
                                        {touched.businessName && getFieldState('businessName') === 'valid' && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Business name valid
                                            </p>
                                        )}
                                    </div>

                                    {/* Owner Name */}
                                    <div className="space-y-2">
                                        <label htmlFor="ownerName" className="text-sm font-medium leading-none">
                                            Owner Name <span className="text-gray-500">(Optional)</span>
                                        </label>
                                        <Input 
                                            id="ownerName" 
                                            name="ownerName" 
                                            type="text" 
                                            placeholder="Dr. John Doe"
                                            value={formData.ownerName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Business Address */}
                                <div className="space-y-2">
                                    <label htmlFor="businessAddress" className="text-sm font-medium leading-none">
                                        Business Address <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <Input 
                                        id="businessAddress" 
                                        name="businessAddress" 
                                        type="text" 
                                        placeholder="123 Main Street, City, State"
                                        value={formData.businessAddress}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('businessAddress')}
                                        className={`transition-colors ${getFieldBorderClass('businessAddress')}`}
                                    />
                                    {touched.businessAddress && fieldErrors.businessAddress && (
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.businessAddress}
                                        </p>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Business Phone */}
                                    <div className="space-y-2">
                                        <label htmlFor="businessPhone" className="text-sm font-medium leading-none">
                                            Business Phone <span className="text-red-500">*</span>
                                        </label>
                                        <Input 
                                            id="businessPhone" 
                                            name="businessPhone" 
                                            type="tel" 
                                            placeholder="+91 9876543210"
                                            value={formData.businessPhone}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('businessPhone')}
                                            className={`transition-colors ${getFieldBorderClass('businessPhone')}`}
                                            required 
                                            autoComplete="tel"
                                        />
                                        {touched.businessPhone && fieldErrors.businessPhone && (
                                            <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {fieldErrors.businessPhone}
                                            </p>
                                        )}
                                        {touched.businessPhone && getFieldState('businessPhone') === 'valid' && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Phone number valid
                                            </p>
                                        )}
                                    </div>

                                    {/* Business Email */}
                                    <div className="space-y-2">
                                        <label htmlFor="businessEmail" className="text-sm font-medium leading-none">
                                            Business Email <span className="text-gray-500">(Optional)</span>
                                        </label>
                                        <Input 
                                            id="businessEmail" 
                                            name="businessEmail" 
                                            type="email" 
                                            placeholder="contact@business.com"
                                            value={formData.businessEmail}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('businessEmail')}
                                            className={`transition-colors ${getFieldBorderClass('businessEmail')}`}
                                        />
                                        {touched.businessEmail && fieldErrors.businessEmail && (
                                            <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {fieldErrors.businessEmail}
                                            </p>
                                        )}
                                        {touched.businessEmail && formData.businessEmail && getFieldState('businessEmail') === 'valid' && (
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Email verified
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* GSTIN */}
                                <div className="space-y-2">
                                    <label htmlFor="gstin" className="text-sm font-medium leading-none">
                                        GSTIN <span className="text-gray-500">(Optional)</span>
                                    </label>
                                    <Input 
                                        id="gstin" 
                                        name="gstin" 
                                        type="text" 
                                        placeholder="22AAAAA0000A1Z5"
                                        value={formData.gstin}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('gstin')}
                                        className={`transition-colors ${getFieldBorderClass('gstin')}`}
                                        maxLength={15}
                                    />
                                    {touched.gstin && fieldErrors.gstin && (
                                        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldErrors.gstin}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">15-character GSTIN format. Leave blank if not applicable</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in-50 duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                                Review Your Information
                            </h3>
                            
                            <div className="space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Personal Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formData.fullName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formData.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Business Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Business Type:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Business Name:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formData.businessName}</span>
                                        </div>
                                        {formData.ownerName && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Owner Name:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{formData.ownerName}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formData.businessPhone}</span>
                                        </div>
                                        {formData.businessEmail && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Business Email:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{formData.businessEmail}</span>
                                            </div>
                                        )}
                                        {formData.businessAddress && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                                <span className="font-medium text-right text-gray-900 dark:text-white">{formData.businessAddress}</span>
                                            </div>
                                        )}
                                        {formData.gstin && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">GSTIN:</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{formData.gstin}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedPlan !== 'free' && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Selected Plan</h4>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                                            <span className="font-medium text-emerald-600 capitalize">{selectedPlan}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-center text-gray-500">
                                By signing up, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between gap-4 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handlePrevious}
                            disabled={currentStep === 1 || isSubmitting}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        {currentStep < totalSteps ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-50 justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Free Account
                                        <Check className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
