// Microsoft Teams Incoming Webhook Dispatcher
// Sends formatted Office 365 MessageCards / Adaptive Cards to connected channels.
// Completely resilient: failures never throw or interrupt the primary business flow.

export interface TeamsInvoicePayload {
    webhookUrl: string
    invoiceNumber: string
    customerName: string
    amount: number
    currency?: string
    dueDate?: string
    isPaid?: boolean
    paymentMethod?: string
    publicUrl?: string
}

export async function sendTeamsInvoiceCard(payload: TeamsInvoicePayload): Promise<boolean> {
    if (!payload.webhookUrl || !payload.webhookUrl.startsWith('http')) {
        return false
    }

    const currencySymbol = payload.currency === 'AED' ? 'AED ' : payload.currency === 'USD' ? '$' : '₹'
    const statusText = payload.isPaid ? 'PAID & SETTLED' : 'ISSUED / UNPAID'
    const themeColor = payload.isPaid ? '107C41' : '0078D4' // Emerald or Microsoft Blue

    const messageCard = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: `Invoice ${payload.invoiceNumber} - ${statusText}`,
        themeColor,
        title: payload.isPaid 
            ? `💰 Payment Received: ${payload.invoiceNumber}` 
            : `📄 New Invoice Generated: ${payload.invoiceNumber}`,
        sections: [
            {
                activityTitle: `BillBook Invoicing Event`,
                activitySubtitle: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                facts: [
                    { name: 'Customer / Client:', value: payload.customerName || 'Standard Client' },
                    { name: 'Total Amount:', value: `${currencySymbol}${payload.amount.toLocaleString('en-IN')}` },
                    { name: 'Status:', value: statusText },
                    ...(payload.dueDate ? [{ name: 'Due Date:', value: payload.dueDate }] : []),
                    ...(payload.paymentMethod ? [{ name: 'Payment Mode:', value: payload.paymentMethod.toUpperCase() }] : [])
                ],
                markdown: true
            }
        ],
        potentialAction: payload.publicUrl ? [
            {
                '@type': 'OpenURI',
                name: 'View Invoice Online',
                targets: [{ os: 'default', uri: payload.publicUrl }]
            }
        ] : []
    }

    try {
        const res = await fetch(payload.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageCard)
        })
        return res.ok
    } catch (err) {
        console.warn('Teams webhook dispatch notification warning (non-fatal):', err)
        return false
    }
}
