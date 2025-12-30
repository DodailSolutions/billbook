import { getCustomers } from '../../../customers/actions'
import { getInvoice } from '../../actions'
import RecurringInvoiceForm from './RecurringInvoiceForm'

export default async function NewRecurringInvoicePage({
    searchParams,
}: {
    searchParams: Promise<{ fromInvoice?: string }>
}) {
    const customers = await getCustomers()
    const params = await searchParams
    const fromInvoiceId = params.fromInvoice
    
    let sourceInvoice = null
    if (fromInvoiceId) {
        sourceInvoice = await getInvoice(fromInvoiceId)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Create Recurring Invoice
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {sourceInvoice 
                        ? `Creating recurring invoice from ${sourceInvoice.invoice_number}` 
                        : 'Set up automated invoice generation for regular billing cycles'
                    }
                </p>
            </div>

            <RecurringInvoiceForm customers={customers} sourceInvoice={sourceInvoice} />
        </div>
    )
}
