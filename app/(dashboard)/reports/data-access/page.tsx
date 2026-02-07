'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import ClientDataAccessRequests from '@/components/ClientDataAccessRequests'
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react'

export default function DataAccessPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'info'>('requests')

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Link href="/reports">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Data Access Management</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage data access requests from your hired CAs for GST filing, tax returns,
          and other services.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Access Requests
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Security Info
        </button>
      </div>

      {/* Content */}
      {activeTab === 'requests' && <ClientDataAccessRequests />}

      {activeTab === 'info' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">How Data Access Works</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  When you hire a CA for GST filing, tax returns, or other services, they need
                  access to specific financial data to complete their work professionally and
                  accurately.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">CA Requests Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After payment confirmation, your CA can request access to specific data types
                    (invoices, bank statements, GST portal, etc.) needed for their services.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">You Review & Decide</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You receive a notification and can review the request details. Approve only
                    the data types necessary for the specific service you hired them for.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Time-Limited Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Once approved, access is granted for the specified duration (typically 90
                    days). Access automatically expires after this period.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Revoke Anytime</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You maintain full control and can revoke access at any time if you
                    terminate the engagement or have security concerns.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Security & Privacy</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We take data security seriously. Here&apos;s how your data is protected:
                </p>
              </div>
            </div>

            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Verified CAs Only:</strong> All CAs are ICAI-verified professionals
                  bound by confidentiality and professional ethics
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Granular Permissions:</strong> Control exactly what data each CA can
                  access (view, download, or edit permissions)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Audit Trail:</strong> All data access is logged and tracked for
                  security and compliance
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Encrypted Transfer:</strong> All data is encrypted during transfer using
                  industry-standard SSL/TLS protocols
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Automatic Expiry:</strong> Access automatically expires after the
                  specified duration - no manual intervention needed
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Review each request carefully before approving</li>
              <li>• Grant access only for services you&apos;ve actually hired the CA for</li>
              <li>
                • Choose appropriate access duration (90 days for monthly services, shorter for
                one-time work)
              </li>
              <li>• Revoke access immediately if you terminate the engagement</li>
              <li>• Never share portal passwords directly - use authorized access only</li>
              <li>• Report any suspicious activity to BillBooky support</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
