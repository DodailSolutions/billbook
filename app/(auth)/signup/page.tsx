import Link from "next/link"
import { SignupForm } from "./SignupForm"
import { CardFooter } from "@/components/ui/Card"

export default function SignupPage({ searchParams }: { searchParams: { message?: string; plan?: string } }) {
    const selectedPlan = searchParams.plan || 'free'
    
    return (
        <div className="space-y-4">
            <SignupForm selectedPlan={selectedPlan} message={searchParams.message} />
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
