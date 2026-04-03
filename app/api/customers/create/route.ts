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
        const { name, email, phone, address, gstin } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
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
            }])
            .select()
            .single()

        if (error) {
            console.error('Error creating customer:', error)
            return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
        }

        revalidatePath('/customers')
        return NextResponse.json({ success: true, customer: data })
    } catch (error) {
        console.error('API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
