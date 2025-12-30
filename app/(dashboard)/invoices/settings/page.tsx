import { Settings } from 'lucide-react'
import { getInvoiceSettings } from './actions'
import SettingsWithPreview from './SettingsWithPreview'

export default async function InvoiceSettingsPage() {
    const settings = await getInvoiceSettings()

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Invoice Template Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Customize your invoice appearance and company details
                    </p>
                </div>
            </div>

            <SettingsWithPreview initialSettings={settings} />
        </div>
    )
}
