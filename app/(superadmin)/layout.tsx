import { redirect } from 'next/navigation'
import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { AdminSidebar } from "@/components/AdminSidebar"
import { MobileAdminSidebar } from "@/components/MobileAdminSidebar"

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
        <div className="h-full relative">
            {/* Mobile Sidebar */}
            <MobileAdminSidebar />
            
            {/* Desktop Sidebar */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
                <AdminSidebar />
            </div>
            
            {/* Main Content */}
            <main className="md:pl-72 min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                {/* Add top padding on mobile for fixed header */}
                <div className="pt-20 md:pt-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
