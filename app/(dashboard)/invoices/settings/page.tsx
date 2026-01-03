import { Settings } from 'lucide-react'
import { getInvoiceSettings } from './actions'
import SettingsWithPreview from './SettingsWithPreview'

export default async function InvoiceSettingsPage() {
    const settings = await getInvoiceSettings()

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Invoice Template Settings
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                            Customize your invoice appearance and company details
                        </p>
                    </div>
                </div>
            </div>

            <SettingsWithPreview initialSettings={settings} />
        </div>
    )
}
