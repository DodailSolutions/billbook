import { redirect } from 'next/navigation'
import { checkSuperAdminAccess } from '@/lib/admin-auth'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const isSuperAdmin = await checkSuperAdminAccess()

    if (!isSuperAdmin) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {children}
        </div>
    )
}
