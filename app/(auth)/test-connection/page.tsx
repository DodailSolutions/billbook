import { createClient } from '@/lib/supabase/server'

export default async function TestConnectionPage() {
    let connectionStatus = 'Unknown'
    let errorDetails = ''
    let envVarsStatus = {
        url: false,
        key: false
    }

    try {
        // Check environment variables
        envVarsStatus.url = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        envVarsStatus.key = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!envVarsStatus.url || !envVarsStatus.key) {
            connectionStatus = 'Missing environment variables'
            errorDetails = `URL: ${envVarsStatus.url ? 'Set' : 'MISSING'}, Key: ${envVarsStatus.key ? 'Set' : 'MISSING'}`
        } else {
            const supabase = await createClient()
            const { data, error } = await supabase.auth.getSession()
            
            if (error) {
                connectionStatus = 'Connection Error'
                errorDetails = error.message
            } else {
                connectionStatus = 'Connected'
                errorDetails = data.session ? 'Session active' : 'No active session'
            }
        }
    } catch (error) {
        connectionStatus = 'Exception'
        errorDetails = error instanceof Error ? error.message : String(error)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
                
                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
                        <div className="space-y-2 text-sm">
                            <p className={envVarsStatus.url ? 'text-green-600' : 'text-red-600'}>
                                NEXT_PUBLIC_SUPABASE_URL: {envVarsStatus.url ? '✓ Set' : '✗ Missing'}
                            </p>
                            <p className={envVarsStatus.key ? 'text-green-600' : 'text-red-600'}>
                                NEXT_PUBLIC_SUPABASE_ANON_KEY: {envVarsStatus.key ? '✓ Set' : '✗ Missing'}
                            </p>
                        </div>
                    </div>

                    <div className="border-b pb-4">
                        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
                        <p className={connectionStatus === 'Connected' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {connectionStatus}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Details</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded">
                            {errorDetails}
                        </p>
                    </div>

                    {connectionStatus === 'Connected' && (
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                            <p className="text-green-800 dark:text-green-200">
                                ✓ Supabase is connected correctly. You can now try to login or signup.
                            </p>
                        </div>
                    )}

                    {(connectionStatus === 'Missing environment variables' || connectionStatus === 'Connection Error') && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                            <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                                Action Required:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                                <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                                <li>Add NEXT_PUBLIC_SUPABASE_URL with your Supabase project URL</li>
                                <li>Add NEXT_PUBLIC_SUPABASE_ANON_KEY with your anon/public key</li>
                                <li>Redeploy the application</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
