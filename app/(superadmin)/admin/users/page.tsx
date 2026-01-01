import { Search, UserPlus, Filter, Shield, User, Crown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { getAllUsers } from './actions'
import UserManagementTable from './UserManagementTable'

export default async function UsersManagementPage() {
    const users = await getAllUsers()

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
            case 'admin':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            case 'suspended':
                return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        admins: users.filter(u => u.role === 'super_admin' || u.role === 'admin').length
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="h-8 w-8 text-blue-600" />
                            User Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage all users, roles, and permissions
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add New User
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                                </div>
                                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                                    <User className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search users by name, email, or business..."
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button variant="secondary" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                            {users.length} users found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserManagementTable 
                            users={users}
                            getRoleBadgeColor={getRoleBadgeColor}
                            getStatusBadgeColor={getStatusBadgeColor}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
