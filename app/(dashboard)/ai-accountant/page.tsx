import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlanStatus } from '@/lib/plan-utils'
import { AIAccountantChat } from './AIAccountantChat'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function AIAccountantPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has access to AI Accountant
  const planStatus = await getUserPlanStatus()
  const hasAIAccess = planStatus && ['professional', 'lifetime', 'enterprise'].includes(planStatus.planSlug)

  // Get user's business info for context
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('business_name, owner_name')
    .eq('id', user.id)
    .single()

  if (!hasAIAccess) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Accountant is a Premium Feature
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Upgrade to Professional, Lifetime, or Enterprise plan to get access to your personal AI Accountant assistant that helps with bookkeeping, cash flow analysis, and financial insights.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-3">With AI Accountant you can:</h3>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span>Get instant bookkeeping assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span>Analyze cash flow and financial trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span>Get answers to accounting questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500">✓</span>
                  <span>Receive financial reports and insights</span>
                </li>
              </ul>
            </div>
            <Link href="/pricing">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                Upgrade Now →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Accountant Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal AI accountant for {profile?.business_name || 'your business'}. Ask about bookkeeping, cash flow, or financial insights.
          </p>
        </div>
        <AIAccountantChat userId={user.id} businessName={profile?.business_name || profile?.owner_name || 'your business'} />
      </div>
    </div>
  )
}
