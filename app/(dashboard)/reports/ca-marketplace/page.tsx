'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'

/**
 * Redirect page for old CA Marketplace route
 * This page redirects to the new standalone CA Marketplace at /ca-marketplace
 */
export default function CAMarketplaceRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new standalone CA marketplace
    router.replace('/ca-marketplace')
  }, [router])

  return (
    <div className="container max-w-6xl mx-auto py-16 px-4">
      <Card className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-lg text-gray-600">Redirecting to CA Marketplace...</p>
      </Card>
    </div>
  )
}
