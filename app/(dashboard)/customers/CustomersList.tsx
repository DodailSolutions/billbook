'use client'

import { useState } from "react"
import Link from "next/link"
import { Trash2, Mail, Phone, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { deleteCustomer } from "./actions"
import type { Customer } from "@/lib/types"

interface CustomersListProps {
    customers: Customer[]
}

export function CustomersList({ customers }: CustomersListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer?')) {
            return
        }

        setDeletingId(id)
        try {
            await deleteCustomer(id)
        } catch (error) {
            console.error('Error deleting customer:', error)
            alert('Failed to delete customer')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-base md:text-lg font-semibold bg-linear-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent line-clamp-2">
                            {customer.name}
                        </CardTitle>
                        <div className="flex gap-1 shrink-0">
                            <Link href={`/customers/${customer.id}`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(customer.id)}
                                disabled={deletingId === customer.id}
                                className="h-8 w-8 text-destructive hover:bg-red-50 dark:hover:bg-red-950 hover:text-destructive transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {customer.email && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                <span className="truncate">{customer.email}</span>
                            </div>
                        )}
                        {customer.phone && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Phone className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                <span>{customer.phone}</span>
                            </div>
                        )}
                        {customer.gstin && (
                            <div className="text-xs md:text-sm">
                                <span className="font-medium">GSTIN:</span>{' '}
                                <span className="text-muted-foreground">{customer.gstin}</span>
                            </div>
                        )}
                        {customer.address && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                {customer.address}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
