'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { resetPassword } from '../actions'

interface ForgotPasswordFormProps {
    message?: string
}

export function ForgotPasswordForm({ message }: ForgotPasswordFormProps) {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')
    const emailParam = searchParams.get('email')

    useEffect(() => {
        if (errorParam) {
            setError(decodeURIComponent(errorParam))
            setIsSubmitting(false)
        }
        if (successParam === 'true') {
            setSuccess(true)
            setIsSubmitting(false)
            if (emailParam) {
                setEmail(decodeURIComponent(emailParam))
            }
        }
    }, [errorParam, successParam, emailParam])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        // Client-side validation
        if (!email.trim()) {
            setError('Please enter your email address')
            setIsSubmitting(false)
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            setIsSubmitting(false)
            return
        }

        // Submit form
        const formData = new FormData(e.currentTarget)
        try {
            await resetPassword(formData)
        } catch (err) {
            console.error('Form submission error:', err)
            setError('Something went wrong. Please try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <Mail className="h-6 w-6 text-emerald-600" />
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                </div>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Legacy message support */}
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message.includes('sent') || message.includes('Check') 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                                    Check your email
                                </h4>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                    We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                                    Click the link in the email to reset your password.
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                                    Don&apos;t see it? Check your spam folder.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                    Error
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">
                            Email Address
                        </label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="your.email@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting || success}
                            required 
                            autoComplete="email"
                            className={error ? 'border-red-300' : ''}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={isSubmitting || success}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending Reset Link...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Email Sent
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Remember your password?{" "}
                        <a href="/login" className="text-emerald-600 hover:underline font-semibold">
                            Login here
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
