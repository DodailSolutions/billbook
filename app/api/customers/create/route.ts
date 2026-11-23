import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { 
            name, email, phone, address, gstin, 
            organization_id, organization_name, designation, department, is_primary_contact 
        } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        let targetOrgId = organization_id || null
        let targetOrgName = organization_name?.trim() || null

        // If organization_name is provided without organization_id, find or create the organization
        if (!targetOrgId && targetOrgName) {
            const { data: existingOrg } = await supabase
                .from('organizations')
                .select('id, name')
                .eq('user_id', user.id)
                .ilike('name', targetOrgName)
                .limit(1)

            if (existingOrg && existingOrg.length > 0) {
                targetOrgId = existingOrg[0].id
                targetOrgName = existingOrg[0].name
            } else {
                const { data: newOrg } = await supabase
                    .from('organizations')
                    .insert([{
                        user_id: user.id,
                        name: targetOrgName,
                        gstin: gstin || null,
                        billing_address: address || null,
                        email: email || null,
                        phone: phone || null
                    }])
                    .select('id, name')
                    .single()

                if (newOrg) {
                    targetOrgId = newOrg.id
                    targetOrgName = newOrg.name
                }
            }
        }

        const { data, error } = await supabase
            .from('customers')
            .insert([{
                user_id: user.id,
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
                gstin: gstin || null,
                organization_id: targetOrgId,
                organization_name: targetOrgName,
                designation: designation || null,
                department: department || null,
                is_primary_contact: !!is_primary_contact
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating customer:', error)
            return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
        }

        revalidatePath('/customers')
        revalidatePath('/organizations')
        revalidatePath('/invoices/new')
        return NextResponse.json({ 
            success: true, 
            customer: data,
            organization: targetOrgId ? { id: targetOrgId, name: targetOrgName } : null
        })
    } catch (error) {
        console.error('API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
