'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { signup } from '../actions'

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
    { value: 'other', label: 'Other' }
]

interface SignupFormProps {
    selectedPlan: string
    message?: string
}

export function SignupForm({ selectedPlan, message }: SignupFormProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
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
        selectedPlan: selectedPlan
    })

    const totalSteps = 3
    const progress = (currentStep / totalSteps) * 100

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.fullName && formData.email && formData.password.length >= 6)
            case 2:
                return !!(formData.businessType && formData.businessName && formData.businessPhone)
            case 3:
                return true // Review step, always valid
            default:
                return false
        }
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps))
        }
    }

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formElement = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            formElement.append(key, value)
        })

        try {
            await signup(formElement)
            // If we reach here without redirect, something went wrong
        } catch (error) {
            // Don't catch NEXT_REDIRECT - let it propagate for the redirect to work
            if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                throw error
            }
            console.error('Signup error:', error)
            alert('Failed to create account. Please try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>
                    {selectedPlan !== 'free' ? (
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
                {message && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
                        {message}
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
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium leading-none">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="password" 
                                        name="password" 
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        minLength={6} 
                                        required 
                                    />
                                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
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
                                <div className="space-y-2">
                                    <label htmlFor="businessType" className="text-sm font-medium leading-none">
                                        Business Type <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        id="businessType" 
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    >
                                        <option value="">Select your business type</option>
                                        {BUSINESS_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
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
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="ownerName" className="text-sm font-medium leading-none">
                                            Owner Name
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

                                <div className="space-y-2">
                                    <label htmlFor="businessAddress" className="text-sm font-medium leading-none">
                                        Business Address
                                    </label>
                                    <Input 
                                        id="businessAddress" 
                                        name="businessAddress" 
                                        type="text" 
                                        placeholder="123 Main Street, City, State"
                                        value={formData.businessAddress}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
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
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="businessEmail" className="text-sm font-medium leading-none">
                                            Business Email
                                        </label>
                                        <Input 
                                            id="businessEmail" 
                                            name="businessEmail" 
                                            type="email" 
                                            placeholder="contact@business.com"
                                            value={formData.businessEmail}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="gstin" className="text-sm font-medium leading-none">
                                        GSTIN (Optional)
                                    </label>
                                    <Input 
                                        id="gstin" 
                                        name="gstin" 
                                        type="text" 
                                        placeholder="22AAAAA0000A1Z5"
                                        value={formData.gstin}
                                        onChange={handleInputChange}
                                        maxLength={15} 
                                    />
                                    <p className="text-xs text-gray-500">Leave blank if not applicable</p>
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
                                disabled={!validateStep(currentStep) || isSubmitting}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        {selectedPlan !== 'free' ? 'Create Account & Proceed' : 'Create Free Account'}
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
