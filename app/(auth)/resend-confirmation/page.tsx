import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Mail, ArrowLeft } from 'lucide-react'
import { resendConfirmationEmail } from '../actions'

export default function ResendConfirmationPage({ searchParams }: { searchParams: { message?: string } }) {
    return (
        <>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
            <Card className="max-w-md mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Mail className="h-6 w-6 text-emerald-600" />
                        <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
                    </div>
                    <CardDescription>
                        Didn&apos;t receive the confirmation email? We&apos;ll send it again.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {searchParams.message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${
                            searchParams.message.includes('sent') || searchParams.message.includes('Check')
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                        }`}>
                            {searchParams.message}
                        </div>
                    )}

                    <form action={resendConfirmationEmail} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Resend Confirmation Email
                        </Button>
                    </form>

                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Already verified?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
