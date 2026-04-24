import { Sidebar } from "@/components/Sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"
import { PlanExpiryChecker } from "@/components/PlanExpiryChecker"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full relative flex">
            <PlanExpiryChecker />
            
            {/* Mobile Sidebar */}
            <MobileSidebar />
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-screen sticky top-0 z-80 bg-gray-900">
                <Sidebar />
            </div>
            
            {/* Main Content */}
            <main className="flex-1 min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
                {/* Add top padding on mobile for fixed header */}
                <div className="p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
