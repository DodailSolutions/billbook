export function getDefaultFYDates(): { fromDate: string; toDate: string } {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed (April is 3)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1
    const fyEndYear = fyStartYear + 1
    const fromDate = `${fyStartYear}-04-01`
    const toDate = `${fyEndYear}-03-31`
    return { fromDate, toDate }
}
