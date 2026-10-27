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
        <div className="h-full relative flex">
            {/* Mobile Sidebar */}
            <MobileAdminSidebar />
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-screen sticky top-0 z-80">
                <AdminSidebar />
            </div>
            
            {/* Main Content */}
            <main className="flex-1 min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Mobile top padding for fixed header */}
                <div className="p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
