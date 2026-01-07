import { Settings } from 'lucide-react'
import { getUserProfile } from './actions'
import SettingsContent from './SettingsContent'

export default async function SettingsPage() {
    const profile = await getUserProfile()

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Account Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your account preferences and security settings
                    </p>
                </div>
            </div>

            <SettingsContent initialProfile={profile} />
        </div>
    )
}
