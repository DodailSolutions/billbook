'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { login } from '../actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    )
}

export default function LoginForm({ message }: { message?: string }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [clientError, setClientError] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setClientError('')

        // Client-side validation
        if (!email.trim()) {
            setClientError('Please enter your email address')
            return
        }

        if (!password) {
            setClientError('Please enter your password')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setClientError('Please enter a valid email address')
            return
        }

        // Create FormData and submit
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        try {
            await login(formData)
        } catch (err: any) {
            // Handle redirect errors (which are expected)
            if (err?.digest?.includes('NEXT_REDIRECT')) {
                return
            }
            setClientError('An unexpected error occurred. Please try again.')
            console.error('Login error:', err)
        }
    }

    return (
        <>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Server message error */}
                    {message && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800 dark:text-red-200">{message}</div>
                        </div>
                    )}

                    {/* Client error */}
                    {clientError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800 dark:text-red-200">{clientError}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setClientError('')
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setClientError('')
                                }}
                                required
                            />
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </>
    )
}
