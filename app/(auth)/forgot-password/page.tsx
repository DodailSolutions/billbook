import Link from "next/link"
import { ForgotPasswordForm } from "./ForgotPasswordForm"
import { ArrowLeft } from "lucide-react"

export default async function ForgotPasswordPage(props: { 
    searchParams: Promise<{ message?: string, error?: string, success?: string, email?: string }> 
}) {
    const searchParams = await props.searchParams
    
    return (
        <div className="space-y-4">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
            </Link>
            <ForgotPasswordForm message={searchParams.message} />
        </div>
    )
}
