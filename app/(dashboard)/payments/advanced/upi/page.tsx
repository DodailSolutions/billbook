import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Smartphone, QrCode, Star, Plus } from 'lucide-react'
import Link from 'next/link'
import { getUPIDetails } from '@/lib/advanced-payment-actions'

export default async function UPIPaymentsPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const upiDetails = await getUPIDetails()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            UPI Payment Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your UPI IDs and generate payment QR codes
          </p>
        </div>
        <Link href="/payments/advanced/upi/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add UPI ID
          </Button>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Native UPI Integration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add your business UPI IDs to receive payments directly. Generate QR codes for offline payments and UPI intent links for online transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UPI IDs List */}
      <div className="grid gap-4">
        {upiDetails.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No UPI IDs Added Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first UPI ID to start accepting payments
              </p>
              <Link href="/payments/advanced/upi/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First UPI ID
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          upiDetails.map((upi) => (
            <Card key={upi.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{upi.upi_id}</CardTitle>
                      {upi.is_primary && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      <Badge variant={upi.is_active ? 'default' : 'secondary'}>
                        {upi.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {upi.business_name && (
                      <CardDescription className="text-base">
                        {upi.business_name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/payments/advanced/upi/${upi.id}/qr`}>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR
                      </Button>
                    </Link>
                    <Link href={`/payments/advanced/upi/${upi.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Payment Method
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      UPI Direct
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      QR Code
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {upi.qr_code_url ? 'Generated' : 'Not Generated'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Added On
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(upi.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>UPI Payment Features</CardTitle>
          <CardDescription>
            What you can do with UPI integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg h-fit">
                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  QR Code Generation
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Generate invoice-specific QR codes that customers can scan and pay instantly
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg h-fit">
                <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  UPI Intent Links
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Create payment links that open directly in UPI apps for one-tap payment
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg h-fit">
                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Multiple UPI IDs
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add multiple UPI IDs for different businesses or payment segregation
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg h-fit">
                <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Primary UPI Selection
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Set a default UPI ID that will be used for all new invoices
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
