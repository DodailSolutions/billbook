import { Sidebar } from "@/components/Sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"
import { PlanExpiryChecker } from "@/components/PlanExpiryChecker"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full relative">
            <PlanExpiryChecker />
            
            {/* Mobile Sidebar */}
            <MobileSidebar />
            
            {/* Desktop Sidebar */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
                <Sidebar />
            </div>
            
            {/* Main Content */}
            <main className="md:pl-72 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:bg-slate-900">
                {/* Add top padding on mobile for fixed header */}
                <div className="p-4 md:p-8 pt-20 md:pt-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
