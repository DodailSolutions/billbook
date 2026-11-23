import { Suspense } from 'react'
import { getOrganizations } from './actions'
import { OrganizationsList } from './OrganizationsList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Organizations & Companies | BillBooky',
    description: 'Manage B2B organizations, multi-stakeholder contacts, GST and tax profiles.'
}

export default async function OrganizationsPage() {
    const organizations = await getOrganizations()

    return (
        <div className="space-y-6">
            <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading organizations...</div>}>
                <OrganizationsList initialOrganizations={organizations} />
            </Suspense>
        </div>
    )
}
