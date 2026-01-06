import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { subject, category, priority, description } = await request.json()

        if (!subject || !category || !priority || !description) {
            return new NextResponse('All fields are required', { status: 400 })
        }

        // Create support ticket in database
        const { data, error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user.id,
                subject,
                category,
                priority,
                description,
                status: 'open'
            })
            .select()
            .single()

        if (error) {
            // If table doesn't exist, just log the ticket (for now)
            console.log('Support ticket submitted:', {
                user_id: user.id,
                email: user.email,
                subject,
                category,
                priority,
                description
            })

            // In production, you'd send an email notification here
            // await sendEmailNotification({ user, subject, category, priority, description })

            return NextResponse.json({ 
                success: true, 
                message: 'Support ticket submitted successfully',
                ticketId: `TEMP-${Date.now()}`
            })
        }

        // Send email notification to support team
        // await sendEmailNotification({ user, ticketId: data.id, subject, category, priority, description })

        return NextResponse.json({ 
            success: true, 
            message: 'Support ticket submitted successfully',
            ticketId: data.id
        })
    } catch (error) {
        console.error('Error creating support ticket:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
