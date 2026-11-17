export interface RegionalCMSData {
    region: 'IN' | 'AE' | 'US'
    announcement: {
        enabled: boolean
        message: string
        linkText?: string
        linkUrl?: string
        theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
    }
    hero: {
        badge: string
        headline: string
        subheadline: string
        primaryButtonText: string
        primaryButtonUrl: string
        secondaryButtonText: string
        secondaryButtonUrl: string
    }
    features?: Array<{
        id: string
        title: string
        desc: string
        badge?: string
        color?: string
    }>
    metrics?: Array<{
        value: string
        label: string
    }>
    contact: {
        supportEmail: string
        supportPhone: string
        whatsappNumber?: string
        officeAddress: string
        operatingHours: string
    }
    faqs: Array<{
        id: string
        question: string
        answer: string
        category?: string
        is_active: boolean
    }>
}

export interface BlogPost {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    author: string
    category: string
    coverImage?: string
    publishedAt: string
    isPublished: boolean
    readTime: string
}

export interface SubdomainConfig {
    subdomains: Array<{
        subdomain: string
        targetRegion: 'IN' | 'AE' | 'US'
        label: string
        targetPath: string
        isActive: boolean
        dnsStatus: 'active' | 'pending' | 'configured'
    }>
    autoDetectGeo: boolean
    enforceSubdomains: boolean
}

// Default Content Templates per Region
export const DEFAULT_REGIONAL_CONTENT: Record<string, RegionalCMSData> = {
    IN: {
        region: 'IN',
        announcement: {
            enabled: true,
            message: '🎉 GST 2.0 Ready! Unlimited invoicing with automated GSTR reports & e-Way bill.',
            linkText: 'Explore Features',
            linkUrl: '#features',
            theme: 'blue'
        },
        hero: {
            badge: '🇮🇳 100% GST Compliant Invoice Generator & Operating System',
            headline: 'Accounting, Invoicing, CRM & Payroll. Simple. Fast. Compliant.',
            subheadline: 'Create GST invoices, track CRM sales pipelines, manage double-entry books, issue vendor POs, and run monthly staff payroll — all in one elegant workspace.',
            primaryButtonText: 'Start Free Account',
            primaryButtonUrl: '/signup',
            secondaryButtonText: 'Explore Features',
            secondaryButtonUrl: '#features'
        },
        metrics: [
            { value: '500+', label: 'Active Businesses' },
            { value: '₹10Cr+', label: 'Invoices Processed' },
            { value: '99.9%', label: 'Platform Uptime' },
            { value: '4.9/5', label: 'Customer Rating' }
        ],
        contact: {
            supportEmail: 'support@dodail.com',
            supportPhone: '+91 98765 43210',
            whatsappNumber: '+91 98765 43210',
            officeAddress: 'Cyber Gateway, Hitech City, Hyderabad, Telangana, India',
            operatingHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST'
        },
        faqs: [
            {
                id: 'faq-in-1',
                question: 'Is BillBooky 100% compliant with Indian GST laws?',
                answer: 'Yes! BillBooky generates CGST, SGST, IGST, and HSN/SAC compliant invoices. You can export GSTR-1, GSTR-3B summaries and e-Way bills in one click.',
                category: 'GST & Compliance',
                is_active: true
            },
            {
                id: 'faq-in-2',
                question: 'Can I share invoices directly to my client on WhatsApp?',
                answer: 'Yes, you can send automated WhatsApp notifications with secure PDF download links and Razorpay/UPI payment collection.',
                category: 'Features',
                is_active: true
            },
            {
                id: 'faq-in-3',
                question: 'What happens after the 50 free invoices?',
                answer: 'You can upgrade anytime to Starter at ₹2,999/month, or claim our Lifetime Founder Deal for ₹9,999 with zero recurring fees forever.',
                category: 'Pricing',
                is_active: true
            }
        ]
    },
    AE: {
        region: 'AE',
        announcement: {
            enabled: true,
            message: '🇦🇪 FTA Approved: Bilingual Arabic & English Invoicing with 5% VAT & Corporate Tax ready.',
            linkText: 'Explore UAE Features',
            linkUrl: '/ae#features',
            theme: 'emerald'
        },
        hero: {
            badge: '🇦🇪 Bilingual E-Invoicing Compliant with UAE Federal Tax Authority',
            headline: 'Fast, Bilingual VAT Invoicing for UAE & Middle East Businesses',
            subheadline: 'Generate bilingual Arabic and English tax invoices with TRN validation, 5% UAE VAT calculations, multi-currency support (AED, USD, EUR), and corporate tax records.',
            primaryButtonText: 'Start Free UAE Invoicing',
            primaryButtonUrl: '/signup?region=ae',
            secondaryButtonText: 'Explore UAE Plans (AED)',
            secondaryButtonUrl: '/ae/pricing'
        },
        metrics: [
            { value: '300+', label: 'UAE Companies' },
            { value: 'AED 25M+', label: 'VAT Invoiced' },
            { value: '100%', label: 'FTA Compliant' },
            { value: '4.9/5', label: 'Client Rating' }
        ],
        contact: {
            supportEmail: 'support@dodail.com',
            supportPhone: '+971 4 123 4567',
            whatsappNumber: '+971 50 123 4567',
            officeAddress: 'Downtown Dubai, Sheikh Zayed Road, Dubai, United Arab Emirates',
            operatingHours: 'Sun - Thu: 9:00 AM - 6:00 PM GST'
        },
        faqs: [
            {
                id: 'faq-ae-1',
                question: 'Are invoices bilingual in Arabic and English?',
                answer: 'Yes, all tax invoices comply with UAE FTA guidelines and include side-by-side Arabic and English translations, QR codes, and TRN numbers.',
                category: 'FTA Compliance',
                is_active: true
            },
            {
                id: 'faq-ae-2',
                question: 'Does BillBooky support 5% UAE VAT and 0% exports?',
                answer: 'Yes, standard 5% VAT, zero-rated exports, and exempt supplies are fully supported with automated tax summary reports.',
                category: 'Tax & VAT',
                is_active: true
            },
            {
                id: 'faq-ae-3',
                question: 'Can I invoice in AED, USD, and EUR?',
                answer: 'Yes, BillBooky features multi-currency invoicing with real-time conversion rates into AED for UAE tax declaration.',
                category: 'Currency',
                is_active: true
            }
        ]
    },
    US: {
        region: 'US',
        announcement: {
            enabled: true,
            message: '🌐 International Invoicing in USD: Multi-state sales tax, estimates, and automated reminders.',
            linkText: 'View Global Plans',
            linkUrl: '/us/pricing',
            theme: 'purple'
        },
        hero: {
            badge: '🇺🇸 / 🌐 Global Invoicing Built for Freelancers, Agencies & Startups',
            headline: 'Simple, Beautiful Invoicing in USD with Automated Sales Tax',
            subheadline: 'Send client estimates, recurring retainers, and professional invoices worldwide. Accept online payments via credit card, Stripe, and wire transfer with real-time aging tracking.',
            primaryButtonText: 'Try BillBooky Free',
            primaryButtonUrl: '/signup?region=us',
            secondaryButtonText: 'View USD Pricing ($)',
            secondaryButtonUrl: '/us/pricing'
        },
        metrics: [
            { value: '800+', label: 'Global Clients' },
            { value: '$15M+', label: 'Processed in USD' },
            { value: '50', label: 'US States Covered' },
            { value: '4.9/5', label: 'User Rating' }
        ],
        contact: {
            supportEmail: 'support@dodail.com',
            supportPhone: '+1 (555) 019-2834',
            whatsappNumber: '+1 (555) 019-2834',
            officeAddress: 'Market Street, Suite 400, San Francisco, CA 94103, USA',
            operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM PST'
        },
        faqs: [
            {
                id: 'faq-us-1',
                question: 'Can I calculate US state sales taxes dynamically?',
                answer: 'Yes, you can configure state and local sales tax rules or apply standard tax overrides per line item.',
                category: 'Sales Tax',
                is_active: true
            },
            {
                id: 'faq-us-2',
                question: 'Can international clients pay in USD via Credit Card?',
                answer: 'Yes, clients can pay online through your integrated payment links with instant receipt generation.',
                category: 'Payments',
                is_active: true
            },
            {
                id: 'faq-us-3',
                question: 'Is there a Lifetime Deal available in USD?',
                answer: 'Yes, our Starter Lifetime plan is available for a one-time payment of $149 with zero monthly charges.',
                category: 'Deals',
                is_active: true
            }
        ]
    }
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
    {
        id: 'post-1',
        title: 'GST Invoicing in India: Complete Guide for MSMEs and Freelancers',
        slug: 'gst-invoicing-guide-india',
        excerpt: 'Everything Indian business owners need to know about CGST, SGST, IGST calculations, HSN codes, and e-invoicing compliance.',
        content: `### GST Invoicing Essentials for Indian Businesses\n\nUnder the Goods and Services Tax (GST) regime, generating accurate and compliant tax invoices is critical for claiming Input Tax Credit (ITC) and avoiding penalties.\n\n#### Key Components of a GST Invoice:\n- **Supplier and Buyer Details**: Legal business name, address, and valid 15-digit GSTIN.\n- **Invoice Serial Number**: Unique consecutive numbering for each financial year.\n- **HSN/SAC Codes**: Harmonized System of Nomenclature codes corresponding to goods and services.\n- **Tax Breakup**: Distinct columns for CGST, SGST (intra-state) or IGST (inter-state).\n- **Payment QR Code**: Dynamic or static UPI QR code for immediate reconciliation.\n\nWith **BillBooky**, GST calculation is 100% automated based on your customer's location.`,
        author: 'BillBooky Compliance Team',
        category: 'Tax & Compliance',
        publishedAt: '2026-11-15',
        isPublished: true,
        readTime: '4 min read'
    },
    {
        id: 'post-2',
        title: 'UAE FTA VAT & Corporate Tax: Bilingual E-Invoicing Best Practices',
        slug: 'uae-fta-vat-corporate-tax-guide',
        excerpt: 'How UAE businesses can issue Federal Tax Authority compliant bilingual tax invoices in Arabic and English with TRN verification.',
        content: `### UAE VAT & Corporate Tax Rules for Businesses\n\nThe Federal Tax Authority (FTA) mandates specific standards for tax invoices issued by VAT-registered businesses in the United Arab Emirates.\n\n#### Requirements for FTA Compliance:\n1. **Bilingual Text**: Must display labels in Arabic and English side-by-side.\n2. **TRN (Tax Registration Number)**: Clearly displayed for both vendor and buyer.\n3. **5% Standard VAT Calculation**: Explicitly shown in Dirhams (AED).\n4. **9% Corporate Tax Record Keeping**: Financial ledgers and general journals maintained for at least 5 years.\n\nBillBooky's UAE edition produces instant bilingual PDF invoices formatted to FTA guidelines.`,
        author: 'Middle East Tax Advisory',
        category: 'International Tax',
        publishedAt: '2026-11-16',
        isPublished: true,
        readTime: '5 min read'
    },
    {
        id: 'post-3',
        title: 'Double-Entry Bookkeeping vs Single-Entry: Why Growing Businesses Upgrade',
        slug: 'double-entry-bookkeeping-benefits',
        excerpt: 'Learn why automated double-entry general ledgers prevent fraud, simplify audits, and generate instant P&L and Balance Sheet reports.',
        content: `### Why Double-Entry Accounting is the Gold Standard\n\nWhile single-entry bookkeeping tracks cash inflows and outflows, double-entry bookkeeping ensures every financial transaction has equal and opposite debits and credits.\n\n#### The Big Advantages:\n- **Audit Readiness**: Certified Accountants and auditors can verify every account balance effortlessly.\n- **Real-Time Financial Health**: Generate Trial Balances, P&L statements, and Balance Sheets on demand.\n- **Error Detection**: Mathematical imbalances immediately flag omitted or duplicate entries.\n\nBillBooky automates your Chart of Accounts and General Ledger silently in the background whenever you create an invoice, expense, or payroll entry.`,
        author: 'Finance & Accounts Team',
        category: 'Accounting',
        publishedAt: '2026-11-17',
        isPublished: true,
        readTime: '3 min read'
    }
]

export const DEFAULT_SUBDOMAINS: SubdomainConfig = {
    subdomains: [
        {
            subdomain: 'billbooky.dodail.com',
            targetRegion: 'IN',
            label: 'Main / India Gateway',
            targetPath: '/',
            isActive: true,
            dnsStatus: 'active'
        },
        {
            subdomain: 'ae.billbooky.dodail.com',
            targetRegion: 'AE',
            label: 'UAE & Middle East Subdomain',
            targetPath: '/ae',
            isActive: true,
            dnsStatus: 'configured'
        },
        {
            subdomain: 'us.billbooky.dodail.com',
            targetRegion: 'US',
            label: 'US & Global Subdomain',
            targetPath: '/us',
            isActive: true,
            dnsStatus: 'configured'
        },
        {
            subdomain: 'app.billbooky.dodail.com',
            targetRegion: 'IN',
            label: 'Client Dashboard Portal',
            targetPath: '/dashboard',
            isActive: true,
            dnsStatus: 'configured'
        }
    ],
    autoDetectGeo: true,
    enforceSubdomains: true
}
