import LoginForm from './LoginForm'

export default function LoginPage({ searchParams }: { searchParams: { message?: string } }) {
    return <LoginForm message={searchParams.message} />
}
