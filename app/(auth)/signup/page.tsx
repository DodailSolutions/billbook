import { SignupPageContent } from "./SignupPageContent"

export default async function SignupPage(props: { 
    searchParams: Promise<{ message?: string; error?: string; error_description?: string; plan?: string; redirect?: string; payment?: string }> 
}) {
    const searchParams = await props.searchParams
    const rawError = searchParams.error_description || searchParams.error || searchParams.message
    const errorMessage = rawError && rawError !== '{}' && rawError !== 'null' && rawError !== 'undefined' && rawError.trim() !== ''
        ? rawError
        : undefined

    return <SignupPageContent 
        searchParams={{
            ...searchParams,
            message: errorMessage
        }} 
    />
}
