'use client'
import { signout } from "@/app/(auth)/actions"
import { LogOut } from "lucide-react"

export function SignOutButton() {
    return (
        <button onClick={() => signout()} className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
            <div className="flex items-center flex-1">
                <LogOut className="h-5 w-5 mr-3 text-red-500 transition-transform duration-200 group-hover:scale-110" />
                Sign Out
            </div>
        </button>
    )
}
