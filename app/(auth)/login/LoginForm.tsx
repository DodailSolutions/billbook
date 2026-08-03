'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { login } from '../actions'
import { useFormStatus } from 'react-dom'
import { validateEmail, validatePassword } from '@/lib/validation/auth'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button 
            type="submit" 
            className="w-full bg-black hover:bg-slate-900 text-white font-bold py-3.5 rounded-full shadow-md hover:scale-[1.01] transition-all min-h-[48px]" 
            disabled={pending}
        >
            {pending ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                </span>
            ) : (
                'Sign In to Dashboard'
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
    const [showPassword, setShowPassword] = useState(false)
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

        const emailError = validateField('email', email)
        const passwordError = validateField('password', password)

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError
            })
            return
        }

        setTouched({ email: true, password: true })

        const formData = new FormData()
        formData.append('email', email.trim())
        formData.append('password', password)

        try {
            await login(formData)
        } catch (err: Error | unknown) {
            if (err instanceof Error && err.message?.includes('NEXT_REDIRECT')) {
                return
            }
            setErrors({ general: 'Invalid email or password. Please check your credentials.' })
            console.error('Login error:', err)
        }
    }

    return (
        <div className="w-full space-y-6">
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-black transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>

            <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure Business Login
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 -tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Enter your credentials to access your GST invoices, books & payroll.
                    </p>
                </div>

                {/* Server error message */}
                {message && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 animate-in fade-in-50 text-xs text-rose-800 font-semibold">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>{message}</div>
                    </div>
                )}

                {/* General error */}
                {errors.general && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 animate-in fade-in-50 text-xs text-rose-800 font-semibold">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>{errors.general}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-500" /> Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@business.com"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={() => handleBlur('email')}
                            className={`rounded-xl border transition-colors ${
                                errors.email 
                                    ? 'border-rose-500 focus:ring-rose-500' 
                                    : email && !errors.email
                                    ? 'border-emerald-500 focus:ring-emerald-500'
                                    : 'border-slate-300'
                            }`}
                            required
                            autoComplete="email"
                        />
                        {touched.email && errors.email && (
                            <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5 text-slate-500" /> Password
                            </label>
                            <Link 
                                href="/forgot-password" 
                                className="text-[11px] text-emerald-600 font-bold hover:underline transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={() => handleBlur('password')}
                                className={`rounded-xl border pr-10 transition-colors ${
                                    errors.password 
                                        ? 'border-rose-500 focus:ring-rose-500' 
                                        : password && !errors.password
                                        ? 'border-emerald-500 focus:ring-emerald-500'
                                        : 'border-slate-300'
                                }`}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center space-y-3">
                    <p className="text-xs text-slate-600 font-medium">
                        Don&apos;t have a BillBooky account?{' '}
                        <Link 
                            href="/signup" 
                            className="text-emerald-700 font-bold hover:underline"
                        >
                            Create Free Account
                        </Link>
                    </p>

                    <div className="pt-1">
                        <Link 
                            href="/ca-registration" 
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium transition-colors"
                        >
                            Are you a Chartered Accountant? <span className="font-bold text-emerald-600 hover:underline">Register as CA →</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
