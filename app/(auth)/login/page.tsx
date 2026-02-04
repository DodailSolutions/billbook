import LoginForm from './LoginForm'

export default async function LoginPage(props: { 
    searchParams: Promise<{ message?: string, error?: string, error_description?: string }> 
}) {
    const searchParams = await props.searchParams
    const errorMessage = searchParams.error_description || searchParams.error || searchParams.message
    return <LoginForm message={errorMessage} />
}
