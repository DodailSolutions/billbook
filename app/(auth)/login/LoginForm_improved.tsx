'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { login } from '../actions'
import { useFormStatus } from 'react-dom'
import { validateEmail, validatePassword } from '@/lib/validation/auth'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
            disabled={pending}
        >
            {pending ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                </span>
            ) : (
                'Login'
            )}
        </Button>
    )
}

interface FormErrors {
    email?: string
    password?: string
    general?: string
}

export default function LoginForm({ message }: { message?: string }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const validateField = (field: string, value: string): string | undefined => {
        switch (field) {
            case 'email': {
                const result = validateEmail(value)
                return result.isValid ? undefined : result.error
            }
            case 'password': {
                const result = validatePassword(value)
                return result.isValid ? undefined : result.error
            }
            default:
                return undefined
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEmail(value)

        if (touched.email) {
            const error = validateField('email', value)
            setErrors(prev => ({ ...prev, email: error, general: undefined }))
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPassword(value)

        if (touched.password) {
            const error = validateField('password', value)
            setErrors(prev => ({ ...prev, password: error, general: undefined }))
        }
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, field === 'email' ? email : password)
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})

        // Validate all fields
        const emailError = validateField('email', email)
        const passwordError = validateField('password', password)

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError
            })
            return
        }

        // Mark fields as touched
        setTouched({ email: true, password: true })

        // Create FormData and submit
        const formData = new FormData()
        formData.append('email', email.trim())
        formData.append('password', password)

        try {
            await login(formData)
        } catch (err: Error | unknown) {
            // Handle redirect errors (which are expected)
            if (err instanceof Error && err.message?.includes('NEXT_REDIRECT')) {
                return
            }
            setErrors({ general: 'An unexpected error occurred. Please try again.' })
            console.error('Login error:', err)
        }
    }

    return (
        <>
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Server message error */}
                    {message && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 animate-in fade-in-50">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800 dark:text-red-200">{message}</div>
                        </div>
                    )}

                    {/* General error */}
                    {errors.general && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 animate-in fade-in-50">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800 dark:text-red-200">{errors.general}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={() => handleBlur('email')}
                                className={`transition-colors ${
                                    errors.email 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : email && !errors.email
                                        ? 'border-emerald-500 focus:ring-emerald-500'
                                        : 'border-gray-300'
                                }`}
                                required
                                autoComplete="email"
                            />
                            {touched.email && errors.email && (
                                <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                    <span className="inline-block w-3 h-3 rounded-full border border-red-600 dark:border-red-400"></span>
                                    {errors.email}
                                </p>
                            )}
                            {touched.email && !errors.email && email && (
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Email looks good
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <Link 
                                    href="/forgot-password" 
                                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={() => handleBlur('password')}
                                className={`transition-colors ${
                                    errors.password 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : password && !errors.password
                                        ? 'border-emerald-500 focus:ring-emerald-500'
                                        : 'border-gray-300'
                                }`}
                                required
                                autoComplete="current-password"
                            />
                            {touched.password && errors.password && (
                                <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                    <span className="inline-block w-3 h-3 rounded-full border border-red-600 dark:border-red-400"></span>
                                    {errors.password}
                                </p>
                            )}
                            {touched.password && !errors.password && password && (
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Password entered
                                </p>
                            )}
                        </div>

                        <SubmitButton />
                    </form>

                    {/* Security tip */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                        🔒 Your login is secure and encrypted
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400 pt-4">
                        Don&apos;t have an account?{" "}
                        <Link 
                            href="/signup" 
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </>
    )
}
