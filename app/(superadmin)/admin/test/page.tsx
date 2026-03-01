import { checkSuperAdminAccess } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function AdminTestPage() {
    const status = {
        isSuperAdmin: false,
        canConnectToSupabase: false,
        userProfilesCount: 0,
        hasServiceRoleKey: false,
        error: null as string | null
    }

    try {
        // Test 1: Check super admin access
        status.isSuperAdmin = await checkSuperAdminAccess()

        // Test 2: Check Supabase connection
        const supabase = await createClient()
        
        // Test 3: Try to count user profiles
        const { count, error: countError } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
        
        if (countError) {
            status.error = countError.message
        } else {
            status.canConnectToSupabase = true
            status.userProfilesCount = count || 0
        }

        // Test 4: Check if service role key is available
        status.hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    } catch (error) {
        status.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Admin System Diagnostics</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Super Admin Access</div>
                                <div className={`text-lg font-bold ${status.isSuperAdmin ? 'text-green-600' : 'text-red-600'}`}>
                                    {status.isSuperAdmin ? '✓ Granted' : '✗ Denied'}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600">Supabase Connection</div>
                                <div className={`text-lg font-bold ${status.canConnectToSupabase ? 'text-green-600' : 'text-red-600'}`}>
                                    {status.canConnectToSupabase ? '✓ Connected' : '✗ Failed'}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600">User Profiles Count</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {status.userProfilesCount}
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600">Service Role Key</div>
                                <div className={`text-lg font-bold ${status.hasServiceRoleKey ? 'text-green-600' : 'text-orange-600'}`}>
                                    {status.hasServiceRoleKey ? '✓ Configured' : '⚠ Not Set'}
                                </div>
                            </div>
                        </div>

                        {status.error && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="text-sm font-medium text-red-800 dark:text-red-200">Error:</div>
                                <div className="text-sm text-red-600 dark:text-red-400 mt-1">{status.error}</div>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Note:</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                If Service Role Key is not set, auth.admin functions will fail. 
                                This is needed for accessing user emails from auth.users table.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
