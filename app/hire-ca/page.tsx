// Simple redirect page for /hire-ca → /dashboard/reports/hire-ca
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'

export default function HireCaRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/reports/hire-ca')
  }, [router])
  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-lg text-gray-600">Redirecting to Hire CA form...</p>
      </Card>
    </div>
  )
}
