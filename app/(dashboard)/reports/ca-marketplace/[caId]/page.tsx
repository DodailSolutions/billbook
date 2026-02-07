'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'

/**
 * Redirect page for old CA Profile route
 * This page redirects to the new standalone CA Profile at /ca-marketplace/[caId]
 */
export default function CAProfileRedirect({ params }: { params: { caId: string } }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new standalone CA profile
    router.replace(`/ca-marketplace/${params.caId}`)
  }, [router, params.caId])

  return (
    <div className="container max-w-6xl mx-auto py-16 px-4">
      <Card className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Redirecting to CA Profile...</p>
      </Card>
    </div>
  )
}
