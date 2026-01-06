'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function SupportForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/support/ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error('Failed to submit ticket')
            }

            setSubmitted(true)
            setFormData({
                subject: '',
                category: 'general',
                priority: 'medium',
                description: ''
            })

            // Reset after 5 seconds
            setTimeout(() => setSubmitted(false), 5000)
        } catch (error) {
            console.error('Error submitting support ticket:', error)
            alert('Failed to submit support ticket. Please try again or email us directly at support@billbooky.com')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ticket Submitted Successfully!</h3>
                <p className="text-muted-foreground mb-4">
                    Thank you for contacting us. Our team will review your ticket and respond within 24 hours.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                    Submit Another Ticket
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                    Subject <span className="text-destructive">*</span>
                </label>
                <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                        Category <span className="text-destructive">*</span>
                    </label>
                    <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                    >
                        <option value="general">General Inquiry</option>
                        <option value="billing">Billing & Payment</option>
                        <option value="technical">Technical Issue</option>
                        <option value="invoice">Invoice Related</option>
                        <option value="gst">GST & Tax</option>
                        <option value="reports">Reports</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                        Priority <span className="text-destructive">*</span>
                    </label>
                    <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                    >
                        <option value="low">Low - General question</option>
                        <option value="medium">Medium - Need help soon</option>
                        <option value="high">High - Urgent issue</option>
                        <option value="critical">Critical - System down</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide as much detail as possible about your issue..."
                    rows={6}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Include steps to reproduce the issue, error messages, or any relevant screenshots if applicable.
                </p>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Ticket
                    </>
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                You can also reach us directly at{' '}
                <a href="mailto:support@billbooky.com" className="text-primary hover:underline">
                    support@billbooky.com
                </a>
            </p>
        </form>
    )
}
