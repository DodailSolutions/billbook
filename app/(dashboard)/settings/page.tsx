import { User, Shield, Bell } from 'lucide-react'
import { getUserProfile } from './actions'
import SettingsContent from './SettingsContent'

export default async function SettingsPage() {
    const profile = await getUserProfile()

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Account Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your account preferences and security
                    </p>
                </div>
            </div>

            <SettingsContent initialProfile={profile} />
        </div>
    )
}
