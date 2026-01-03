import Link from "next/link"
import { signup } from "../actions"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

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

export default function SignupPage({ searchParams }: { searchParams: { message?: string; plan?: string } }) {
    const selectedPlan = searchParams.plan || 'free'
    
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>
                    {selectedPlan !== 'free' ? (
                        <span className="text-emerald-600 font-semibold">
                            Step 1 of 2: Create account to proceed with {selectedPlan} plan
                        </span>
                    ) : (
                        'Get started with your free account'
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {searchParams.message && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
                        {searchParams.message}
                    </div>
                )}
                <form action={signup} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Personal Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium leading-none">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <Input id="password" name="password" type="password" minLength={6} required />
                            <p className="text-xs text-gray-500">Minimum 6 characters</p>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Business Information</h3>
                        
                        <div className="space-y-2">
                            <label htmlFor="businessType" className="text-sm font-medium leading-none">
                                Business Type <span className="text-red-500">*</span>
                            </label>
                            <select 
                                id="businessType" 
                                name="businessType" 
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
                                <Input id="businessName" name="businessName" type="text" placeholder="ABC Dental Clinic" required />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="ownerName" className="text-sm font-medium leading-none">
                                    Owner Name
                                </label>
                                <Input id="ownerName" name="ownerName" type="text" placeholder="Dr. John Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="businessAddress" className="text-sm font-medium leading-none">
                                Business Address
                            </label>
                            <Input id="businessAddress" name="businessAddress" type="text" placeholder="123 Main Street, City, State" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="businessPhone" className="text-sm font-medium leading-none">
                                    Business Phone <span className="text-red-500">*</span>
                                </label>
                                <Input id="businessPhone" name="businessPhone" type="tel" placeholder="+91 9876543210" required />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="businessEmail" className="text-sm font-medium leading-none">
                                    Business Email
                                </label>
                                <Input id="businessEmail" name="businessEmail" type="email" placeholder="contact@business.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="gstin" className="text-sm font-medium leading-none">
                                GSTIN (Optional)
                            </label>
                            <Input id="gstin" name="gstin" type="text" placeholder="22AAAAA0000A1Z5" maxLength={15} />
                            <p className="text-xs text-gray-500">Leave blank if not applicable</p>
                        </div>
                    </div>

                    {/* Hidden field for plan */}
                    <input type="hidden" name="selectedPlan" value={selectedPlan} />

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        {selectedPlan !== 'free' ? 'Create Account & Proceed to Payment' : 'Create Free Account'}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
