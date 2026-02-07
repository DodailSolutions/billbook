import { getDashboardStats } from "./actions"
import { DashboardTabs } from "./DashboardTabs"

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <DashboardTabs stats={stats} />
    )
}
