'use server'

import { sendContactEmail } from '@/lib/email'

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        success: false,
        message: 'All fields are required',
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Please provide a valid email address',
      }
    }

    // Send email
    await sendContactEmail({
      name,
      email,
      subject,
      message,
    })

    return {
      success: true,
      message: 'Thank you for contacting us! We will get back to you within 24 hours.',
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    
    // Check if it's a configuration error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('RESEND_API_KEY')) {
      return {
        success: false,
        message: 'Email service is not configured yet. Please email us directly at support@billbooky.com',
      }
    }
    
    return {
      success: false,
      message: 'Failed to send message. Please try again or email us directly at support@billbooky.com',
    }
  }
}
