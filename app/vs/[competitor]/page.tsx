import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CompetitorData {
    slug: string
    name: string
    tagline: string
    metaTitle: string
    metaDescription: string
    heroSummary: string
    rows: { feature: string; billbooky: string | boolean; competitor: string | boolean }[]
    faqs: { question: string; answer: string }[]
}

const COMPETITORS: Record<string, CompetitorData> = {
    'zoho-books': {
        slug: 'zoho-books',
        name: 'Zoho Books',
        tagline: 'Modern GST Billing, Vertical CRM & Client Portals Without Per-Module Upsells',
        metaTitle: 'BillBooky vs Zoho Books (2026) — Pricing, GST, CRM & Vertical Features',
        metaDescription:
            'Compare BillBooky vs Zoho Books for Indian SMBs and agencies. See how BillBooky delivers GST invoicing, passwordless client portals, POS, and HR payroll at a fraction of the cost.',
        heroSummary:
            'Zoho Books is built as a generic accounting tool that requires separate paid subscriptions for CRM, Projects, People/Payroll, and Desk. BillBooky unifies GST Invoicing, CRM, Proposals, Payroll, and 16+ industry workflows in one workspace.',
        rows: [
            { feature: 'GST Tax Invoices, HSN Summary & Amount in Words', billbooky: true, competitor: true },
            { feature: 'Passwordless Client Portal (1-Click Magic Link)', billbooky: true, competitor: 'Requires Client Portal Setup' },
            { feature: 'Built-in CRM, Pipeline & Relationship Manager Hierarchy', billbooky: true, competitor: 'Separate Zoho CRM Paid Plan' },
            { feature: 'AI SOW / Proposal Writer & Word Export', billbooky: true, competitor: false },
            { feature: 'Built-in Payroll, Attendance & Employee Portal', billbooky: true, competitor: 'Separate Zoho Payroll' },
            { feature: '58mm / 80mm Thermal POS Counter', billbooky: true, competitor: false },
            { feature: 'Industry-Specific Verticals (Events, Dental, Resorts, Art)', billbooky: '16+ Verticals Built-in', competitor: 'Generic Only' },
            { feature: '0-API WhatsApp Payment Reminders + Dynamic UPI QR', billbooky: true, competitor: 'Paid Add-on / Integration' },
        ],
        faqs: [
            {
                question: 'Is BillBooky easier to set up than Zoho Books?',
                answer: 'Yes. BillBooky offers a 60-second onboarding wizard with both GST-registered and non-GST business support, pre-seeded industry catalogs, and zero complex chart-of-accounts setup required to send your first invoice.',
            },
            {
                question: 'Can I migrate my customers and items from Zoho Books to BillBooky?',
                answer: 'Yes, you can import your customers, products, and opening balances via CSV/Excel directly in BillBooky without losing historical GSTIN or HSN data.',
            },
            {
                question: 'Does BillBooky replace Zoho Books + Zoho CRM + Zoho Payroll?',
                answer: 'For Indian agencies, service firms, and SMBs, BillBooky combines invoicing, GST reports, CRM deal tracking, proposals, and employee payroll in a single subscription.',
            },
        ],
    },
    vyapar: {
        slug: 'vyapar',
        name: 'Vyapar',
        tagline: 'Cloud-Native GST Billing, Team RBAC & Client Portals Beyond Desktop-First Software',
        metaTitle: 'BillBooky vs Vyapar (2026) — Cloud GST Billing, Multi-User RBAC & POS',
        metaDescription:
            'Compare BillBooky vs Vyapar. Discover why growing businesses switch to BillBooky for real-time cloud collaboration, Client Portals, CRM, and multi-device access.',
        heroSummary:
            'Vyapar is popular for single-device desktop billing, but growing teams quickly hit limits around real-time cloud sync, role-based access, B2B proposals, and client portals. BillBooky is 100% cloud-native from day one.',
        rows: [
            { feature: 'True Cloud Multi-Device Access (Web, Mac, Mobile)', billbooky: true, competitor: 'Desktop-First Sync' },
            { feature: 'Role-Based Access Control (RM, HR, CA, Staff)', billbooky: true, competitor: 'Limited User Roles' },
            { feature: 'Passwordless Client Portal & Live Statement Ledger', billbooky: true, competitor: false },
            { feature: '58mm / 80mm Thermal POS & Barcode Billing', billbooky: true, competitor: true },
            { feature: 'GSTR-1, GSTR-3B & Direct CA Workspace Access', billbooky: true, competitor: 'Export Only' },
            { feature: 'CRM Leads, Follow-ups & Sales Commissions', billbooky: true, competitor: false },
            { feature: 'Automated WhatsApp & Email Payment Reminders', billbooky: true, competitor: 'Basic WhatsApp Share' },
            { feature: 'Enterprise White-Labeling & Custom Domain', billbooky: true, competitor: false },
        ],
        faqs: [
            {
                question: 'Why switch from Vyapar to BillBooky?',
                answer: 'Teams outgrow Vyapar when they need multiple staff members, Relationship Managers, or an external CA logging in simultaneously from anywhere with strict role permissions and real-time cloud backups.',
            },
            {
                question: 'Does BillBooky support thermal receipt printing like Vyapar?',
                answer: 'Yes. BillBooky supports both A4 GST Tax Invoices (Original/Duplicate/Triplicate) and 58mm/80mm thermal POS receipts right from the browser.',
            },
        ],
    },
    tally: {
        slug: 'tally',
        name: 'TallyPrime',
        tagline: 'Modern Cloud Invoicing, WhatsApp Collections & Tally XML Export Without Legacy Complexity',
        metaTitle: 'BillBooky vs TallyPrime (2026) — Modern Cloud GST Billing with Tally Export',
        metaDescription:
            'Compare BillBooky vs TallyPrime. Get instant cloud invoicing, UPI QR payments, CRM, and 1-click Tally XML export for your Chartered Accountant.',
        heroSummary:
            'TallyPrime is powerful for desktop accountants, but sales teams and founders struggle with its legacy UI and lack of mobile/cloud collaboration. BillBooky gives your team a fast, modern interface while exporting clean Tally XML for your CA.',
        rows: [
            { feature: 'Modern Cloud UI Accessible Anywhere', billbooky: true, competitor: 'Windows / Remote Desktop' },
            { feature: '1-Click Tally XML & GSTR Export for CAs', billbooky: true, competitor: true },
            { feature: 'Dedicated CA Marketplace & Read-Only CA Portal', billbooky: true, competitor: false },
            { feature: '1-Click UPI QR & Online Razorpay Settlement', billbooky: true, competitor: 'Limited' },
            { feature: 'Built-in CRM, Proposals & Client Portal', billbooky: true, competitor: false },
            { feature: 'Automated WhatsApp Overdue Reminders', billbooky: true, competitor: 'Third-Party Add-on' },
            { feature: 'Zero Local Server / Dongle / Backup Hassle', billbooky: true, competitor: false },
            { feature: 'HR Payroll, Attendance & Leave Portal', billbooky: true, competitor: 'Basic Voucher Entry' },
        ],
        faqs: [
            {
                question: 'Can my Chartered Accountant still use Tally if I switch to BillBooky?',
                answer: 'Yes! BillBooky includes 1-click Tally XML export and a dedicated CA Portal so your accountant gets clean vouchers and GSTR-1/3B summaries without you having to use Tally for daily billing.',
            },
            {
                question: 'Do I need a Windows PC or license dongle to run BillBooky?',
                answer: 'No. BillBooky runs in any browser on Mac, Windows, iPad, or mobile with automatic cloud backups.',
            },
        ],
    },
}

export function generateStaticParams() {
    return Object.keys(COMPETITORS).map((competitor) => ({ competitor }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ competitor: string }>
}): Promise<Metadata> {
    const { competitor } = await params
    const data = COMPETITORS[competitor]
    if (!data) return {}
    return {
        title: data.metaTitle,
        description: data.metaDescription,
        alternates: {
            canonical: `https://billbooky.dodail.com/vs/${data.slug}`,
        },
    }
}

export default async function CompetitorComparisonPage({
    params,
}: {
    params: Promise<{ competitor: string }>
}) {
    const { competitor } = await params
    const data = COMPETITORS[competitor]
    if (!data) notFound()

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }

    const renderCell = (val: string | boolean, isBillBooky: boolean) => {
        if (val === true) {
            return (
                <span className={`inline-flex items-center gap-1.5 font-semibold ${isBillBooky ? 'text-emerald-600' : 'text-slate-700'}`}>
                    <Check className="h-4 w-4 shrink-0" /> Included
                </span>
            )
        }
        if (val === false) {
            return (
                <span className="inline-flex items-center gap-1.5 text-rose-500 font-medium">
                    <X className="h-4 w-4 shrink-0" /> Not Included
                </span>
            )
        }
        return <span className={`text-xs font-semibold ${isBillBooky ? 'text-blue-700' : 'text-slate-600'}`}>{val}</span>
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="font-black text-xl tracking-tight text-blue-600">
                        BillBooky
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                            Pricing
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="gap-1.5">
                                Start Free <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
                <section className="text-center space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        <Sparkles className="h-3.5 w-3.5" /> 2026 Comparison Guide
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                        BillBooky vs {data.name}
                    </h1>
                    <p className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400">
                        {data.tagline}
                    </p>
                    <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {data.heroSummary}
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <Link href="/signup">
                            <Button size="lg" className="gap-2">
                                Try BillBooky Free <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline">
                                View Transparent Pricing
                            </Button>
                        </Link>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Capability</th>
                                    <th className="p-4 text-sm font-black text-blue-600">BillBooky</th>
                                    <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">{data.name}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {data.rows.map((row) => (
                                    <tr key={row.feature} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                        <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{row.feature}</td>
                                        <td className="p-4">{renderCell(row.billbooky, true)}</td>
                                        <td className="p-4">{renderCell(row.competitor, false)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                        Frequently Asked Questions
                    </h2>
                    <div className="grid gap-4">
                        {data.faqs.map((faq) => (
                            <div
                                key={faq.question}
                                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                            >
                                <h3 className="font-bold text-base">{faq.question}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    <span>Other comparisons:</span>
                    {Object.values(COMPETITORS)
                        .filter((c) => c.slug !== data.slug)
                        .map((c) => (
                            <Link key={c.slug} href={`/vs/${c.slug}`} className="font-semibold text-blue-600 hover:underline">
                                BillBooky vs {c.name}
                            </Link>
                        ))}
                </section>
            </main>
        </div>
    )
}
