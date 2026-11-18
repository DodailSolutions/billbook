import { getChartOfAccounts, getJournalEntries } from "@/lib/bookkeeping-actions"
import { BookkeepingClientView } from "./BookkeepingClientView"

export const metadata = {
    title: 'Bookkeeping & General Ledger | BillBook',
    description: 'Double-entry accounting, Chart of Accounts, and General Ledger.'
}

export default async function BookkeepingPage() {
    const [accounts, journalEntries] = await Promise.all([
        getChartOfAccounts(),
        getJournalEntries()
    ])

    return (
        <BookkeepingClientView 
            initialAccounts={accounts}
            initialJournalEntries={journalEntries}
        />
    )
}
