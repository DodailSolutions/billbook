import Link from 'next/link'
import { Settings, Mail, Bell, Shield, Database, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
    const settingsSections = [
        {
            title: 'Email Configuration',
            description: 'Configure SMTP settings for sending emails',
            icon: Mail,
            href: '/dashboard/admin/smtp-settings',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Notifications',
            description: 'Manage system notifications and alerts',
            icon: Bell,
            href: '#',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            comingSoon: true
        },
        {
            title: 'Security',
            description: 'Configure security settings and access controls',
            icon: Shield,
            href: '#',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            comingSoon: true
        },
        {
            title: 'Database',
            description: 'Database maintenance and backups',
            icon: Database,
            href: '#',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: true
        },
        {
            title: 'Performance',
            description: 'Optimize system performance and caching',
            icon: Zap,
            href: '#',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            comingSoon: true
        }
    ]

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Settings className="h-8 w-8 text-gray-600" />
                            System Settings
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Configure and manage system-wide settings
                        </p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Settings Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {settingsSections.map((section) => {
                        const Icon = section.icon
                        return (
                            <Card 
                                key={section.title} 
                                className="hover:shadow-lg transition-shadow relative"
                            >
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                                        <Icon className={`h-6 w-6 ${section.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">
                                        {section.title}
                                        {section.comingSoon && (
                                            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-normal">
                                                Coming Soon
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {section.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {section.comingSoon ? (
                                        <Button variant="outline" disabled className="w-full">
                                            Coming Soon
                                        </Button>
                                    ) : (
                                        <Link href={section.href}>
                                            <Button className="w-full">
                                                Configure
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* System Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>Current system configuration and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Node Version</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {process.version}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Platform</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {process.platform}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Architecture</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {process.arch}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
