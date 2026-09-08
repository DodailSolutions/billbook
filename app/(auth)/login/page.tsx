import LoginForm from './LoginForm'

export default async function LoginPage(props: { 
    searchParams: Promise<{ message?: string, error?: string, error_description?: string, redirect?: string }> 
}) {
    const searchParams = await props.searchParams
    const rawError = searchParams.error_description || searchParams.error || searchParams.message
    const errorMessage = rawError && rawError !== '{}' && rawError !== 'null' && rawError !== 'undefined' && rawError.trim() !== ''
        ? rawError
        : undefined
    return <LoginForm message={errorMessage} redirect={searchParams.redirect} />
}
