'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { resetPassword } from '../actions'
import { useFormStatus } from 'react-dom'

interface ForgotPasswordFormProps {
    message?: string
}

function SubmitButton() {
    const { pending } = useFormStatus()
    const searchParams = useSearchParams()
    const success = searchParams.get('success') === 'true'
    
    return (
        <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={pending || success}
        >
            {pending ? (
                <>
                    <Mail className="h-4 w-4 mr-2 animate-pulse" />
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
    )
}

export function ForgotPasswordForm({ message }: ForgotPasswordFormProps) {
    const searchParams = useSearchParams()
    
    // Derive all state from URL params directly
    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')
    const emailParam = searchParams.get('email')
    
    const error = errorParam ? decodeURIComponent(errorParam) : null
    const success = successParam === 'true'
    const email = emailParam ? decodeURIComponent(emailParam) : ''

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

                <form action={resetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">
                            Email Address
                        </label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="your.email@example.com" 
                            defaultValue={email}
                            disabled={success}
                            required 
                            autoComplete="email"
                            className={error ? 'border-red-300' : ''}
                        />
                    </div>

                    <SubmitButton />
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
