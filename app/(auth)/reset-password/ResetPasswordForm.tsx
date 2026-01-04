'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Lock } from 'lucide-react'
import { updatePassword } from '../actions'
import { useFormStatus } from 'react-dom'

interface ResetPasswordFormProps {
    message?: string
}

function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Lock className="h-4 w-4 mr-2 animate-pulse" />
                    Updating Password...
                </>
            ) : (
                'Update Password'
            )}
        </Button>
    )
}

export function ResetPasswordForm({ message }: ResetPasswordFormProps) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [clientError, setClientError] = useState('')

    const handleFormAction = async (formData: FormData) => {
        setClientError('')

        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password.length < 6) {
            setClientError('Password must be at least 6 characters long')
            return
        }

        if (password !== confirmPassword) {
            setClientError('Passwords do not match')
            return
        }

        await updatePassword(formData)
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <Lock className="h-6 w-6 text-emerald-600" />
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                </div>
                <CardDescription>
                    Enter your new password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {(message || clientError) && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                        message?.includes('success') || message?.includes('updated')
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    }`}>
                        {message || clientError}
                    </div>
                )}

                <form action={handleFormAction} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">
                            New Password
                        </label>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            placeholder="Enter new password (min 6 characters)" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                            Confirm Password
                        </label>
                        <Input 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            placeholder="Confirm new password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            minLength={6}
                        />
                    </div>

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}
