import Link from "next/link"
import { SignupForm } from "./SignupForm"
import { CardFooter } from "@/components/ui/Card"
import { ArrowLeft } from "lucide-react"

export default function SignupPage({ searchParams }: { searchParams: { message?: string; plan?: string; redirect?: string } }) {
    const selectedPlan = searchParams.plan || 'free'
    const redirectAfter = searchParams.redirect
    
    return (
        <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
            <SignupForm selectedPlan={selectedPlan} message={searchParams.message} redirectAfter={redirectAfter} />
            <div className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}
