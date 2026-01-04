'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loader2, Mail } from 'lucide-react'
import { resetPassword } from '../actions'

interface ForgotPasswordFormProps {
    message?: string
}

export function ForgotPasswordForm({ message }: ForgotPasswordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [email, setEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        await resetPassword(formData)
        
        setIsSubmitting(false)
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
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message.includes('sent') || message.includes('Check') 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    }`}>
                        {message}
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
                            required 
                            disabled={isSubmitting}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending Reset Link...
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
