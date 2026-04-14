import { getUserProfile } from './actions'
import { getUserPlanStatus } from '@/lib/plan-utils'
import SettingsContent from './SettingsContent'

export default async function SettingsPage() {
    const [profile, planStatus] = await Promise.all([
        getUserProfile(),
        getUserPlanStatus(),
    ])

    return (
        <div className="max-w-5xl mx-auto">
            <SettingsContent initialProfile={profile} planStatus={planStatus} />
        </div>
    )
}
