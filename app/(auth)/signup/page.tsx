import { SignupPageContent } from "./SignupPageContent"

export default async function SignupPage(props: { 
    searchParams: Promise<{ message?: string; error?: string; error_description?: string; plan?: string; redirect?: string; payment?: string }> 
}) {
    const searchParams = await props.searchParams
    const errorMessage = searchParams.error_description || searchParams.error || searchParams.message
    return <SignupPageContent 
        searchParams={{
            ...searchParams,
            message: errorMessage
        }} 
    />
}
