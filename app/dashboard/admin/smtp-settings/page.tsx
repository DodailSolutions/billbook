'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Mail, Check, AlertCircle, Loader } from 'lucide-react'

interface SMTPSettings {
  id: string
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  smtp_from_email: string
  smtp_from_name: string
  is_active: boolean
  last_tested_at: string | null
  last_test_status: string | null
  last_test_error: string | null
}

export default function SMTPSettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<SMTPSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    smtp_host: 'smtp-mail.outlook.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: 'BillBooky Support',
  })

  useEffect(() => {
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('smtp_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setSettings(data)
        setFormData({
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          smtp_user: data.smtp_user,
          smtp_password: data.smtp_password,
          smtp_from_email: data.smtp_from_email,
          smtp_from_name: data.smtp_from_name,
        })
      }
    } catch {
      console.log('No existing SMTP settings found, creating new form')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (settings?.id) {
        // Update existing
        const { error } = await supabase
          .from('smtp_settings')
          .update(formData)
          .eq('id', settings.id)

        if (error) throw error
        setMessage({ type: 'success', text: 'SMTP settings updated successfully!' })
      } else {
        // Create new
        const { error } = await supabase
          .from('smtp_settings')
          .insert([formData])

        if (error) throw error
        setMessage({ type: 'success', text: 'SMTP settings created successfully!' })
      }

      setTimeout(() => {
        fetchSettings()
        setMessage(null)
      }, 2000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'SMTP connection successful!' })

        // Update test status in database
        if (settings?.id) {
          await supabase
            .from('smtp_settings')
            .update({
              last_tested_at: new Date().toISOString(),
              last_test_status: 'success',
              last_test_error: null,
            })
            .eq('id', settings.id)

          fetchSettings()
        }
      } else {
        throw new Error(result.error || 'Connection test failed')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Test failed'
      setMessage({ type: 'error', text: `Connection failed: ${errorMsg}` })

      // Update test status in database
      if (settings?.id) {
        await supabase
          .from('smtp_settings')
          .update({
            last_tested_at: new Date().toISOString(),
            last_test_status: 'failed',
            last_test_error: errorMsg,
          })
          .eq('id', settings.id)

        fetchSettings()
      }
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-8 w-8 text-emerald-600" />
            Email Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Configure SMTP settings for sending contact form emails
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>SMTP Settings</CardTitle>
            <CardDescription>
              Enter your email provider credentials to enable contact form emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <p
                  className={
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Test Status */}
            {settings && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Last Test Result</h3>
                <p className="text-sm text-blue-800">
                  <strong>Status:</strong>{' '}
                  {settings.last_test_status === 'success' ? (
                    <span className="text-green-600">✓ Connected</span>
                  ) : settings.last_test_status === 'failed' ? (
                    <span className="text-red-600">✗ Failed</span>
                  ) : (
                    <span className="text-gray-600">Never tested</span>
                  )}
                </p>
                {settings.last_tested_at && (
                  <p className="text-sm text-blue-700 mt-1">
                    Tested at: {new Date(settings.last_tested_at).toLocaleString()}
                  </p>
                )}
                {settings.last_test_error && (
                  <p className="text-sm text-red-700 mt-1 font-mono">
                    Error: {settings.last_test_error}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SMTP Host */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtp_host}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_host: e.target.value })
                  }
                  placeholder="smtp-mail.outlook.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  For Outlook: smtp-mail.outlook.com | For Gmail: smtp.gmail.com
                </p>
              </div>

              {/* SMTP Port */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_port: parseInt(e.target.value) })
                  }
                  placeholder="587"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">Common ports: 587 (TLS), 465 (SSL)</p>
              </div>

              {/* SMTP User */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address (SMTP User)
                </label>
                <input
                  type="email"
                  value={formData.smtp_user}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_user: e.target.value })
                  }
                  placeholder="your-email@outlook.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {/* SMTP Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password / App Password
                </label>
                <input
                  type="password"
                  value={formData.smtp_password}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_password: e.target.value })
                  }
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  For Office 365: Use App Password from security settings
                </p>
              </div>

              {/* From Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={formData.smtp_from_email}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_from_email: e.target.value })
                  }
                  placeholder="support@dodail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Email address that will appear as the sender
                </p>
              </div>

              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  From Name (Display Name)
                </label>
                <input
                  type="text"
                  value={formData.smtp_from_name}
                  onChange={(e) =>
                    setFormData({ ...formData, smtp_from_name: e.target.value })
                  }
                  placeholder="BillBooky Support"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  How your email sender name will appear to recipients
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || saving}
                  className="flex-1"
                >
                  {testing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={saving || testing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Outlook/Office 365:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Go to https://account.microsoft.com/security-settings</li>
                <li>Enable Two-Factor Authentication (if not enabled)</li>
                <li>Go to App passwords → Select Mail and Windows</li>
                <li>Copy the 16-character password</li>
                <li>Paste it above in the Password field</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Gmail:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Enable 2-Step Verification on your Google Account</li>
                <li>Create an App Password for Mail</li>
                <li>Use SMTP Host: smtp.gmail.com, Port: 587</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
