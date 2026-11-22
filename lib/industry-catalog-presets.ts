import type { BusinessType } from './business-profile-types'

export interface PresetCatalogItem {
    name: string
    unit_price: number
    gst_rate: number
    hsn_sac_code?: string
    unit: string
    description?: string
    is_service?: boolean
}

export const INDUSTRY_CATALOG_PRESETS: Record<BusinessType, PresetCatalogItem[]> = {
    salon_spa: [
        { name: "Men's Classic Haircut", unit_price: 250, gst_rate: 18, hsn_sac_code: '999721', unit: 'sittings', is_service: true },
        { name: "Beard Styling & Shave", unit_price: 150, gst_rate: 18, hsn_sac_code: '999721', unit: 'sittings', is_service: true },
        { name: "Head Massage (Olive / Almond Oil)", unit_price: 350, gst_rate: 18, hsn_sac_code: '999721', unit: 'sittings', is_service: true },
        { name: "Gold Radiance Facial", unit_price: 1200, gst_rate: 18, hsn_sac_code: '999722', unit: 'sittings', is_service: true },
        { name: "Hair Spa & Deep Conditioning", unit_price: 900, gst_rate: 18, hsn_sac_code: '999721', unit: 'sittings', is_service: true },
        { name: "Moroccan Argan Hair Serum (Retail)", unit_price: 650, gst_rate: 18, hsn_sac_code: '330590', unit: 'pcs', is_service: false }
    ],
    dental_clinic: [
        { name: "Comprehensive Dental Consultation", unit_price: 500, gst_rate: 0, hsn_sac_code: '999312', unit: 'visits', is_service: true },
        { name: "Ultrasonic Scaling & Polishing", unit_price: 1200, gst_rate: 0, hsn_sac_code: '999312', unit: 'visits', is_service: true },
        { name: "Single Sitting Rotary RCT (Root Canal)", unit_price: 3500, gst_rate: 0, hsn_sac_code: '999312', unit: 'teeth', is_service: true },
        { name: "Zirconia Premium Crown (10-Yr Warranty)", unit_price: 5500, gst_rate: 0, hsn_sac_code: '999312', unit: 'teeth', is_service: true },
        { name: "Tooth Extraction (Surgical/Impaction)", unit_price: 2000, gst_rate: 0, hsn_sac_code: '999312', unit: 'teeth', is_service: true },
        { name: "Composite Tooth-Colored Filling", unit_price: 800, gst_rate: 0, hsn_sac_code: '999312', unit: 'teeth', is_service: true }
    ],
    hospital_op: [
        { name: "General OPD Consultation Token", unit_price: 300, gst_rate: 0, hsn_sac_code: '999312', unit: 'visits', is_service: true },
        { name: "Specialist / Consultant Doctor Fee", unit_price: 700, gst_rate: 0, hsn_sac_code: '999312', unit: 'visits', is_service: true },
        { name: "Complete Blood Count (CBC) Profile", unit_price: 450, gst_rate: 0, hsn_sac_code: '999313', unit: 'tests', is_service: true },
        { name: "Blood Glucose & Lipid Panel", unit_price: 600, gst_rate: 0, hsn_sac_code: '999313', unit: 'tests', is_service: true }
    ],
    auto_workshop: [
        { name: "Synthetic Engine Oil (5W-30 3.5L)", unit_price: 2400, gst_rate: 18, hsn_sac_code: '271019', unit: 'pcs', is_service: false },
        { name: "Oil Filter Replacement", unit_price: 350, gst_rate: 18, hsn_sac_code: '842123', unit: 'pcs', is_service: false },
        { name: "Front Brake Pads Set", unit_price: 1800, gst_rate: 28, hsn_sac_code: '870830', unit: 'sets', is_service: false },
        { name: "General Periodic Service Labor", unit_price: 1200, gst_rate: 18, hsn_sac_code: '998714', unit: 'hrs', is_service: true },
        { name: "Brake Overhaul & Bleeding Labor", unit_price: 600, gst_rate: 18, hsn_sac_code: '998714', unit: 'hrs', is_service: true },
        { name: "Foam Car Wash & Interior Vacuuming", unit_price: 650, gst_rate: 18, hsn_sac_code: '998714', unit: 'hrs', is_service: true }
    ],
    resorts_farmhouses_camping: [
        { name: "Luxury Camping Tent (2-Person Stay)", unit_price: 2500, gst_rate: 12, hsn_sac_code: '996311', unit: 'nights', is_service: true },
        { name: "Family Glamping Dome Tent (4-Person)", unit_price: 4500, gst_rate: 12, hsn_sac_code: '996311', unit: 'nights', is_service: true },
        { name: "Farmhouse Private Pool Villa (Full Day)", unit_price: 12000, gst_rate: 18, hsn_sac_code: '996311', unit: 'days', is_service: true },
        { name: "Barbecue Marinated Grill Kit (Veg/Non-Veg)", unit_price: 850, gst_rate: 5, hsn_sac_code: '996331', unit: 'packages', is_service: true },
        { name: "Campfire & Marshmallow Setup", unit_price: 500, gst_rate: 18, hsn_sac_code: '996311', unit: 'services', is_service: true },
        { name: "Buffet Breakfast & High-Tea (Per Pax)", unit_price: 400, gst_rate: 5, hsn_sac_code: '996331', unit: 'pax', is_service: true }
    ],
    laundry_drycleaning: [
        { name: "Men's Shirt (Steam Iron)", unit_price: 20, gst_rate: 18, hsn_sac_code: '999719', unit: 'pcs', is_service: true },
        { name: "Men's Shirt (Dry Clean & Press)", unit_price: 80, gst_rate: 18, hsn_sac_code: '999719', unit: 'pcs', is_service: true },
        { name: "Trousers / Jeans (Dry Clean)", unit_price: 90, gst_rate: 18, hsn_sac_code: '999719', unit: 'pcs', is_service: true },
        { name: "Silk Saree (Dry Clean & Roll Press)", unit_price: 220, gst_rate: 18, hsn_sac_code: '999719', unit: 'pcs', is_service: true },
        { name: "Two-Piece Formal Suit (Dry Clean)", unit_price: 280, gst_rate: 18, hsn_sac_code: '999719', unit: 'pcs', is_service: true },
        { name: "Daily Wash & Fold (Per Kg)", unit_price: 70, gst_rate: 18, hsn_sac_code: '999719', unit: 'kg', is_service: true }
    ],
    tours_and_travels: [
        { name: "Goa 3N/4D Beach Holiday Package (Per Pax)", unit_price: 14500, gst_rate: 5, hsn_sac_code: '998555', unit: 'pax', is_service: true },
        { name: "Dubai 5N/6D Desert Safari & City Package", unit_price: 48000, gst_rate: 5, hsn_sac_code: '998555', unit: 'pax', is_service: true },
        { name: "Airport Sedan Cab Transfer (Round-Trip)", unit_price: 2200, gst_rate: 5, hsn_sac_code: '996412', unit: 'trips', is_service: true },
        { name: "Schengen Visa Processing Assistance", unit_price: 3500, gst_rate: 18, hsn_sac_code: '998559', unit: 'pax', is_service: true }
    ],
    jewelry_retail: [
        { name: "22K (916) Gold Traditional Necklace", unit_price: 68500, gst_rate: 3, hsn_sac_code: '711319', unit: 'grams', is_service: false },
        { name: "22K Gold Handcrafted Bangles Pair", unit_price: 42000, gst_rate: 3, hsn_sac_code: '711319', unit: 'grams', is_service: false },
        { name: "925 Sterling Silver Anklets Pair", unit_price: 3500, gst_rate: 3, hsn_sac_code: '711311', unit: 'grams', is_service: false },
        { name: "Diamond Solitaire Ring (18K White Gold)", unit_price: 55000, gst_rate: 3, hsn_sac_code: '711319', unit: 'pcs', is_service: false }
    ],
    real_estate: [
        { name: "Buyer Brokerage Fee (2 BHK Apartment)", unit_price: 75000, gst_rate: 18, hsn_sac_code: '997222', unit: 'deals', is_service: true },
        { name: "Rental Agreement & Tenant Verification", unit_price: 2500, gst_rate: 18, hsn_sac_code: '997222', unit: 'agreements', is_service: true },
        { name: "Commercial Office Lease Retainer", unit_price: 50000, gst_rate: 18, hsn_sac_code: '997222', unit: 'deals', is_service: true }
    ],
    event_management: [
        { name: "Corporate Annual Gala Setup & Stage", unit_price: 150000, gst_rate: 18, hsn_sac_code: '998596', unit: 'events', is_service: true },
        { name: "Professional Audio-Visual & LED Wall", unit_price: 65000, gst_rate: 18, hsn_sac_code: '998596', unit: 'events', is_service: true },
        { name: "Premium Corporate Buffet Catering (Per Pax)", unit_price: 850, gst_rate: 5, hsn_sac_code: '996331', unit: 'pax', is_service: true },
        { name: "Master of Ceremonies (Emcee) Fee", unit_price: 25000, gst_rate: 18, hsn_sac_code: '999613', unit: 'sessions', is_service: true }
    ],
    retail: [
        { name: "Sample Retail Product A", unit_price: 199, gst_rate: 18, hsn_sac_code: '847130', unit: 'pcs', is_service: false },
        { name: "Sample Retail Product B", unit_price: 499, gst_rate: 12, hsn_sac_code: '847130', unit: 'pcs', is_service: false }
    ],
    wholesale: [
        { name: "FMCG Bulk Master Carton (24 Units)", unit_price: 3600, gst_rate: 18, hsn_sac_code: '210690', unit: 'boxes', is_service: false }
    ],
    services: [
        { name: "Full-Stack Development Hours", unit_price: 1500, gst_rate: 18, hsn_sac_code: '998314', unit: 'hours', is_service: true },
        { name: "Monthly IT Maintenance Retainer", unit_price: 25000, gst_rate: 18, hsn_sac_code: '998313', unit: 'months', is_service: true }
    ],
    standard: [
        { name: "Standard Product / Service", unit_price: 1000, gst_rate: 18, hsn_sac_code: '998311', unit: 'pcs', is_service: false }
    ]
}
