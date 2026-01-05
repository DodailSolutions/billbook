import { SignupPageContent } from "./SignupPageContent"

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default function SignupPage({ searchParams }: { searchParams: { message?: string; plan?: string; redirect?: string; payment?: string } }) {
    return <SignupPageContent searchParams={searchParams} />
}
