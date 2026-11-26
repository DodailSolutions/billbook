export type SupportedCurrency = 'INR' | 'USD' | 'AED' | 'EUR' | 'GBP'

export const SUPPORTED_CURRENCIES: Record<
    SupportedCurrency,
    { code: SupportedCurrency; symbol: string; name: string; locale: string }
> = {
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', locale: 'en-AE' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
}

export function formatCurrencyAmount(amount: number, currency: string = 'INR'): string {
    const code = (currency?.toUpperCase() as SupportedCurrency) || 'INR'
    const meta = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.INR
    const safeAmount = Number.isFinite(amount) ? amount : 0
    return new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency: meta.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeAmount)
}

export function convertToInr(amount: number, exchangeRate: number = 1): number {
    const safeAmount = Number.isFinite(amount) ? amount : 0
    const safeRate = Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : 1
    return Number((safeAmount * safeRate).toFixed(2))
}
