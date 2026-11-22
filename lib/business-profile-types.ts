/**
 * Business Profile & Multi-Industry Types for BillBook
 */

export type BusinessType = 
    | 'retail'                      // Standard Retail & Supermarket
    | 'wholesale'                   // Wholesale & Distribution
    | 'services'                    // IT & Professional Consulting
    | 'software_it'                 // Software Development, IT Services & SaaS
    | 'digital_marketing'           // Digital Marketing, Media Buying & Social Agencies
    | 'freelancer'                  // Solo Freelancers, Contractors & Creators
    | 'art_crafts'                  // Art, Handcrafted Goods & Studio Commissions
    | 'salon_spa'                   // Salon, Beauty Parlor & Spa
    | 'dental_clinic'               // Dental Clinic
    | 'hospital_op'                 // Medical Clinic & Hospital Outpatient
    | 'auto_workshop'               // Car & Bike Servicing, Detailing, Garages
    | 'tours_and_travels'           // Travel Agency & Tour Operators
    | 'jewelry_retail'              // Jewellery Store & Goldsmiths
    | 'event_management'            // Corporate & Social Event Management
    | 'laundry_drycleaning'         // Laundry & Dry Cleaning
    | 'resorts_farmhouses'          // Resorts & Luxury Farmhouses (Multi-Property Estate PMS)
    | 'camping_outdoors'            // Campsites, Glamping & Outdoor Adventure Stays
    | 'resorts_farmhouses_camping'  // Unified Hybrid PMS (Backward compatible alias)
    | 'real_estate'                 // Real Estate Brokerage & Property Listings
    | 'standard'                    // Generic

export interface BusinessVerticalConfig {
    id: BusinessType
    name: string
    category: 'commerce' | 'healthcare' | 'hospitality' | 'services' | 'automotive'
    tagline: string
    description: string
    icon: string // emoji or Lucide identifier
    primaryColor: string
    features: {
        hasStaffSplits?: boolean
        hasOdontogram?: boolean
        hasJobCards?: boolean
        hasItineraryBuilder?: boolean
        hasBullionRates?: boolean
        hasPmsRoomGrid?: boolean
        hasLaundryTags?: boolean
        hasPropertyListings?: boolean
        hasEventMilestones?: boolean
        hasBarcodes?: boolean
        hasSprintMilestones?: boolean
        hasAdSpendDisbursements?: boolean
        hasFreelanceScopeContracts?: boolean
        hasChangeOrders?: boolean
        hasClientPortal?: boolean
        hasPOS?: boolean
        hasBOMCosting?: boolean
        hasCertificateOfAuthenticity?: boolean
        hasGearRentals?: boolean
        hasMultiPropertyGrid?: boolean
    }
    customFieldLabels: {
        customer: string     // e.g. "Customer", "Patient", "Guest", "Client"
        items: string        // e.g. "Items", "Services", "Procedures", "Garments", "Tents/Rooms"
        unit: string         // e.g. "pcs", "sittings", "nights", "sq.ft", "teeth"
        identifier?: string  // e.g. "Barcode", "UHID", "Vehicle Reg #", "Rack #", "HUID"
    }
}

export const BUSINESS_VERTICALS: Record<BusinessType, BusinessVerticalConfig> = {
    salon_spa: {
        id: 'salon_spa',
        name: 'Salon, Spa & Beauty Parlor',
        category: 'services',
        tagline: 'Chair splits, stylist commissions & service wallets',
        description: 'Auto-calculates owner vs. barber 50/50 revenue splits, tip reconciliation, retail commissions, and prepaid client packages.',
        icon: '💈',
        primaryColor: 'text-pink-600',
        features: { hasStaffSplits: true, hasBarcodes: false, hasPOS: true },
        customFieldLabels: { customer: 'Client', items: 'Services & Treatments', unit: 'sittings', identifier: 'Stylist / Chair' }
    },
    dental_clinic: {
        id: 'dental_clinic',
        name: 'Dental Clinic',
        category: 'healthcare',
        tagline: '32-tooth odontogram, OP tokens & consultant shares',
        description: 'Interactive visual tooth charting, multi-sitting treatment plans, doctor fee splits, and GST-exempt healthcare billing (SAC 999312).',
        icon: '🦷',
        primaryColor: 'text-cyan-600',
        features: { hasOdontogram: true, hasStaffSplits: true },
        customFieldLabels: { customer: 'Patient', items: 'Procedures & Treatments', unit: 'teeth', identifier: 'Patient UHID' }
    },
    hospital_op: {
        id: 'hospital_op',
        name: 'Medical Clinic & Polyclinic OP',
        category: 'healthcare',
        tagline: 'Outpatient tokens, e-prescriptions & doctor fees',
        description: 'Streamlined patient OP queue, doctor fee splits, consultation billing, and digital case sheets.',
        icon: '🏥',
        primaryColor: 'text-teal-600',
        features: { hasStaffSplits: true },
        customFieldLabels: { customer: 'Patient', items: 'Consultation & Lab Tests', unit: 'visits', identifier: 'OP Token #' }
    },
    auto_workshop: {
        id: 'auto_workshop',
        name: 'Car & Bike Servicing / Garages',
        category: 'automotive',
        tagline: 'Vehicle Job Cards, spare parts vs labor & scratch diagrams',
        description: 'Intake job cards with 2D car dent diagrams, odometer tracking, spare parts inventory deduction, and automated service reminders.',
        icon: '🚗',
        primaryColor: 'text-amber-600',
        features: { hasJobCards: true, hasStaffSplits: true, hasBarcodes: true },
        customFieldLabels: { customer: 'Vehicle Owner', items: 'Parts & Labor Services', unit: 'hrs/pcs', identifier: 'Vehicle Reg #' }
    },
    resorts_farmhouses: {
        id: 'resorts_farmhouses',
        name: 'Resorts & Luxury Farmhouses',
        category: 'hospitality',
        tagline: 'Multi-property villa buyouts, rooms & event lawns',
        description: 'Multi-property estate PMS with visual room & villa availability, per-night suite tariffs, 24-hr entire farmhouse buyouts, and caution deposits.',
        icon: '🏡',
        primaryColor: 'text-emerald-700',
        features: { hasPmsRoomGrid: true, hasMultiPropertyGrid: true, hasPOS: true },
        customFieldLabels: { customer: 'Guest / Host', items: 'Villas, Rooms & Lawns', unit: 'nights/days', identifier: 'Property / Villa #' }
    },
    camping_outdoors: {
        id: 'camping_outdoors',
        name: 'Campsites, Glamping & Outdoor Stays',
        category: 'hospitality',
        tagline: 'Tent pitches, per-person passes & adventure gear rentals',
        description: 'Experiential outdoor hospitality system with visual dome/tent campground allocation, all-inclusive per-head night passes, campfire BBQ add-ons, and equipment rentals.',
        icon: '⛺',
        primaryColor: 'text-amber-700',
        features: { hasPmsRoomGrid: true, hasGearRentals: true, hasPOS: true },
        customFieldLabels: { customer: 'Camper / Group', items: 'Tents, Domes & Gear', unit: 'passes/tents', identifier: 'Pitch / Dome #' }
    },
    resorts_farmhouses_camping: {
        id: 'resorts_farmhouses_camping',
        name: 'Unified Hospitality & Stays (PMS)',
        category: 'hospitality',
        tagline: 'Visual room/tent grid, hourly/daily/bed rates & BBQ add-ons',
        description: 'Property management system with visual room/tent availability (Open/Booked), per-bed/tent/hour rates, and barbecue service packages.',
        icon: '🏨',
        primaryColor: 'text-emerald-600',
        features: { hasPmsRoomGrid: true, hasMultiPropertyGrid: true, hasPOS: true },
        customFieldLabels: { customer: 'Guest', items: 'Rooms, Tents & Stays', unit: 'nights/hrs', identifier: 'Room / Tent #' }
    },
    art_crafts: {
        id: 'art_crafts',
        name: 'Art, Crafts & Handmade Studio',
        category: 'commerce',
        tagline: 'Artwork gallery, raw material BOM & Certificates of Authenticity',
        description: 'Tailored for painters, sculptors, resin/clay artisans, and crafters. Features raw material recipe costing, custom commission 50% deposits, and printable Certificates of Authenticity with QR codes.',
        icon: '🎨',
        primaryColor: 'text-pink-600',
        features: { hasBarcodes: true, hasBOMCosting: true, hasCertificateOfAuthenticity: true, hasPOS: true },
        customFieldLabels: { customer: 'Collector / Client', items: 'Artworks & Handcrafted Goods', unit: 'pieces', identifier: 'Certificate / SKU #' }
    },
    tours_and_travels: {
        id: 'tours_and_travels',
        name: 'Tours & Travels',
        category: 'hospitality',
        tagline: 'Day-wise itinerary proposals, PAX manifests & Tour GST/TCS',
        description: 'Interactive day-by-day travel itineraries, PAX passport/visa records, supplier vouchers, and Tour Operator GST & TCS.',
        icon: '✈️',
        primaryColor: 'text-blue-600',
        features: { hasItineraryBuilder: true },
        customFieldLabels: { customer: 'Traveler / Group', items: 'Tour Packages & Flights', unit: 'pax', identifier: 'Booking / PNR' }
    },
    jewelry_retail: {
        id: 'jewelry_retail',
        name: 'Jewellery Store & Goldsmiths',
        category: 'commerce',
        tagline: 'Live bullion rate lock, Net Wt, Hallmark HUID & dumbbell tags',
        description: 'Dynamic gold/silver rate updates, weight-based calculations (Net wt, wastage, making charges), BIS HUID tracking, and old gold buybacks.',
        icon: '💍',
        primaryColor: 'text-yellow-600',
        features: { hasBullionRates: true, hasBarcodes: true, hasPOS: true },
        customFieldLabels: { customer: 'Buyer', items: 'Ornaments & Bullion', unit: 'grams', identifier: 'BIS Hallmark HUID' }
    },
    laundry_drycleaning: {
        id: 'laundry_drycleaning',
        name: 'Laundry & Dry Cleaning',
        category: 'services',
        tagline: 'Garment piece tracking, waterproof tags & rack slots',
        description: 'Multi-piece garment inwarding (Wash/Iron/DryClean), rack/shelf slot allocation, waterproof tag printing, and WhatsApp ready alerts.',
        icon: '🧺',
        primaryColor: 'text-indigo-600',
        features: { hasLaundryTags: true, hasBarcodes: true, hasPOS: true },
        customFieldLabels: { customer: 'Customer', items: 'Garments & Articles', unit: 'pieces', identifier: 'Rack / Slot #' }
    },
    real_estate: {
        id: 'real_estate',
        name: 'Real Estate Agency & Brokerage',
        category: 'services',
        tagline: 'Property listings, buyer/seller commission splits & site visits',
        description: 'Listing inventory (apartments, villas, plots), deal stage pipelines (Site Visit to Registration), and brokerage splits.',
        icon: '🏢',
        primaryColor: 'text-violet-600',
        features: { hasPropertyListings: true, hasStaffSplits: true },
        customFieldLabels: { customer: 'Client / Investor', items: 'Properties & Units', unit: 'sq.ft', identifier: 'Property / RERA #' }
    },
    event_management: {
        id: 'event_management',
        name: 'Corporate & Social Event Management',
        category: 'services',
        tagline: 'Cost center budgets, milestone billing, vendor POs & artist TDS',
        description: 'Live event budget vs actual margins, milestone invoicing schedules (25/35/30/10), subcontractor TDS, and attendee QR badges.',
        icon: '🎪',
        primaryColor: 'text-rose-600',
        features: { hasEventMilestones: true, hasBarcodes: true },
        customFieldLabels: { customer: 'Corporate Client', items: 'Event Scope & Deliverables', unit: 'events', identifier: 'Event Project Code' }
    },
    retail: {
        id: 'retail',
        name: 'Retail Store / Supermarket',
        category: 'commerce',
        tagline: 'High-speed POS counter checkout & thermal barcodes',
        description: 'Barcode scanning, instant shelf label generation, cash drawer balancing, and real-time inventory reorders.',
        icon: '🛒',
        primaryColor: 'text-emerald-600',
        features: { hasBarcodes: true, hasPOS: true },
        customFieldLabels: { customer: 'Customer', items: 'Products', unit: 'pcs', identifier: 'Barcode / SKU' }
    },
    wholesale: {
        id: 'wholesale',
        name: 'Wholesale & FMCG Distribution',
        category: 'commerce',
        tagline: 'Carton/box tiers, credit limits & e-way bills',
        description: 'Multi-quantity bulk pricing, credit limit management, payment aging, and dispatch e-way bill generation.',
        icon: '📦',
        primaryColor: 'text-amber-700',
        features: { hasBarcodes: true },
        customFieldLabels: { customer: 'Wholesale Buyer', items: 'Cases & Cartons', unit: 'boxes', identifier: 'Batch / SKU' }
    },
    software_it: {
        id: 'software_it',
        name: 'Software & IT Services',
        category: 'services',
        tagline: 'Sprint milestone tranches, dev cost rates & change orders',
        description: 'Milestone progress billing, developer cost rates vs bill rates for gross margins, timesheet invoicing, scope creep change orders, and zero-rated LUT export invoices.',
        icon: '💻',
        primaryColor: 'text-blue-600',
        features: { hasSprintMilestones: true, hasStaffSplits: true, hasChangeOrders: true, hasClientPortal: true, hasBarcodes: false },
        customFieldLabels: { customer: 'Enterprise Client', items: 'Sprints & Deliverables', unit: 'sprints/hrs', identifier: 'Sprint / Milestone #' }
    },
    digital_marketing: {
        id: 'digital_marketing',
        name: 'Digital Marketing & Creative Agency',
        category: 'services',
        tagline: 'Ad spend pass-through (0% GST), client portals & retainer caps',
        description: 'Separates 0% tax pass-through media disbursements from 18% agency fees, client creative approval deck, monthly post retainer quota overage billing, and subcontractor TDS.',
        icon: '📢',
        primaryColor: 'text-purple-600',
        features: { hasAdSpendDisbursements: true, hasStaffSplits: true, hasClientPortal: true, hasBarcodes: false },
        customFieldLabels: { customer: 'Agency Client', items: 'Campaigns & Creatives', unit: 'campaigns/hrs', identifier: 'Campaign / Retainer' }
    },
    freelancer: {
        id: 'freelancer',
        name: 'Freelancer & Indie Contractor',
        category: 'services',
        tagline: '1-page touchscreen scope contracts & 50% advance deposits',
        description: 'Mobile e-sign scope agreements, automated 50% upfront deposit unlock workflows, ₹20L GST threshold warning radar, and client deliverable vaults.',
        icon: '🚀',
        primaryColor: 'text-emerald-600',
        features: { hasFreelanceScopeContracts: true, hasClientPortal: true, hasBarcodes: false },
        customFieldLabels: { customer: 'Direct Client', items: 'Milestones & Tasks', unit: 'deliverables', identifier: 'Scope Order #' }
    },
    services: {
        id: 'services',
        name: 'IT Services & Consulting Agency',
        category: 'services',
        tagline: 'Milestone invoicing, retainers & TDS deductions',
        description: 'Professional service invoices, milestone-based progress billing, hourly logs, and TDS Section 194J compliance.',
        icon: '💼',
        primaryColor: 'text-slate-800',
        features: { hasBarcodes: false },
        customFieldLabels: { customer: 'Client', items: 'Services & Deliverables', unit: 'hours', identifier: 'Project Milestone' }
    },
    standard: {
        id: 'standard',
        name: 'Standard Business',
        category: 'commerce',
        tagline: 'Universal invoicing, inventory & bookkeeping',
        description: 'Standard GST-compliant invoicing, quotes, customer accounts, and financial reports.',
        icon: '⚡',
        primaryColor: 'text-indigo-600',
        features: { hasBarcodes: true },
        customFieldLabels: { customer: 'Customer', items: 'Items', unit: 'pcs', identifier: 'SKU / Code' }
    }
}
