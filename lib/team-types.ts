/**
 * Universal Team Management, Capacity Planning & CRM Integration Types
 */

export interface EnhancedTeamMember {
    id: string
    owner_id: string
    email: string
    user_id?: string | null
    role_id: string
    role?: {
        id: string
        name: string
        slug: string
        description: string
    }
    status: 'pending' | 'active' | 'suspended' | 'removed'
    designation?: string | null
    allocated_hours?: number
    hourly_cost_rate?: number
    hourly_billing_rate?: number
    vertical_specialty?: string | null
    invited_at: string
    joined_at?: string | null
    last_active_at?: string | null
    active_deals_count?: number
    won_deals_value?: number
}

export type CapacityStatus = 'bench_risk' | 'optimal' | 'burnout_risk'

export interface CapacityMetric {
    status: CapacityStatus
    percentage: number
    label: string
    badgeClass: string
    barClass: string
}

export function getCapacityMetric(allocatedHours: number = 40, maxHours: number = 40): CapacityMetric {
    const pct = Math.round((allocatedHours / (maxHours || 40)) * 100)
    
    if (pct < 50) {
        return {
            status: 'bench_risk',
            percentage: pct,
            label: 'Bench Risk',
            badgeClass: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
            barClass: 'bg-amber-500'
        }
    }
    
    if (pct <= 100) {
        return {
            status: 'optimal',
            percentage: pct,
            label: 'Optimal (80-100%)',
            badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
            barClass: 'bg-emerald-500'
        }
    }

    return {
        status: 'burnout_risk',
        percentage: pct,
        label: 'Overcommitted (>100%)',
        badgeClass: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        barClass: 'bg-rose-500'
    }
}

export function calculateGrossMargin(costRate: number = 0, billingRate: number = 0): number {
    if (!billingRate || billingRate <= 0) return 0
    return Math.round(((billingRate - costRate) / billingRate) * 100)
}

export const VERTICAL_TEAM_DESIGNATIONS: Record<string, string[]> = {
    software_it: [
        'Tech Lead / Architect',
        'Senior Full-Stack Engineer',
        'Frontend Developer (React/Next.js)',
        'Backend Developer (Node/Python)',
        'QA Automation Engineer',
        'UI/UX Designer',
        'DevOps & Cloud Engineer',
        'Scrum Master / PM'
    ],
    digital_marketing: [
        'Account Director',
        'Media Buyer (Meta / Google Ads)',
        'Senior Copywriter',
        'SEO & Technical Strategist',
        'Visual & Motion Graphic Designer',
        'Short-Form Video / Reel Producer',
        'Social Media Campaign Manager'
    ],
    freelancer: [
        'Lead Independent Consultant',
        'Subcontractor Specialist',
        'Creative Associate',
        'Design Partner'
    ],
    salon_spa: [
        'Creative Director',
        'Senior Hair Stylist',
        'Color & Chemical Specialist',
        'Skin & Spa Therapist',
        'Beautician'
    ],
    dental_clinic: [
        'Chief Orthodontist',
        'Consultant Implantologist',
        'General Dentist',
        'Dental Hygienist',
        'Chairside Assistant'
    ],
    hospital_op: [
        'Senior Consultant Doctor',
        'Duty Medical Officer',
        'Senior Staff Nurse',
        'Clinical Lab Technician'
    ],
    auto_workshop: [
        'Master Diagnostic Tech',
        'Auto Electrician',
        'Service Advisor',
        'Dent & Paint Specialist',
        'General Service Mechanic'
    ],
    laundry_drycleaning: [
        'Plant Operations Lead',
        'Stain & Spotting Specialist',
        'Steam Press Master',
        'Logistics & Route Driver'
    ],
    real_estate: [
        'Principal Broker',
        'Senior Property Consultant',
        'Commercial Asset Lead',
        'Site Visit & CRM Executive'
    ],
    event_management: [
        'Production Director',
        'Creative Event Designer',
        'Stage & Audio-Visual Tech',
        'Artist & Hospitality Coordinator'
    ],
    art_crafts: [
        'Lead Artist / Studio Owner',
        'Ceramic & Pottery Artisan',
        'Resin & Woodcraft Specialist',
        'Exhibition & Gallery Coordinator',
        'Packaging & Provenance Assistant'
    ],
    resorts_farmhouses: [
        'Estate General Manager',
        'Villa & Guest Supervisor',
        'Front Desk & Concierge Lead',
        'Event Lawn & Banquet Coordinator',
        'Head Chef & F&B Lead'
    ],
    camping_outdoors: [
        'Campground Operations Director',
        'Lead Trek & Kayak Guide',
        'Campfire & Hospitality Host',
        'Outdoor Gear & Safety Inspector',
        'Camp Medic / Safety Coordinator'
    ],
    default: [
        'Team Manager',
        'Executive',
        'Specialist',
        'Staff Member'
    ]
}
