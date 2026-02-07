'use client'

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet"
import { AdminSidebar } from "./AdminSidebar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function MobileAdminSidebar() {
    const [isMounted, setIsMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    if (!isMounted) {
        return null
    }

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <button className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Menu className="h-6 w-6" />
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-slate-700">
                    <AdminSidebar />
                </SheetContent>
            </Sheet>
            <div className="flex items-center justify-center absolute left-0 right-0 top-3 pointer-events-none">
                <h1 className="text-lg font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    Super Admin
                </h1>
            </div>
        </div>
    )
}
