export type BusinessType = 
    | 'standard'
    | 'retail'
    | 'jewelry_retail'
    | 'wholesale'
    | 'supermarket'
    | 'services'
    | 'it_tech'

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'QR'

export type LabelPrinterFormat = 
    | 'jewelry_dumbbell'   // 38mm x 25mm with wing flap for rings/chains
    | 'retail_38x25'       // 38mm x 25mm standard retail sticker
    | 'retail_50x25'       // 50mm x 25mm barcode + price + name sticker
    | 'sheet_a4_24'        // A4 24 labels (3x8)
    | 'sheet_a4_48'        // A4 48 labels (4x12)

export interface JewelryAttributes {
    gross_weight_grams: number
    net_weight_grams: number
    stone_weight_carats?: number
    purity: '24K' | '22K_916' | '18K_750' | '14K_585' | 'Silver_925' | 'Platinum_950' | 'Custom'
    making_charge_type: 'per_gram' | 'percentage' | 'flat'
    making_charge_value: number
    wastage_percent?: number
    huid_number?: string // Unique BIS Hallmark / HUID code
    tag_id?: string      // Unique individual ornament tag identifier
}

export interface BarcodeSettings {
    enable_barcode_system: boolean
    business_type: BusinessType
    barcode_format: BarcodeFormat
    default_label_format: LabelPrinterFormat
    auto_generate_on_item_create: boolean
    scanner_sound_feedback: boolean
    printer_settings: {
        printer_type: 'browser' | 'thermal_usb' | 'network_ip'
        receipt_paper_size: '58mm' | '80mm' | 'A4'
        label_printer_type: 'thermal' | 'office_sheet'
        label_format: LabelPrinterFormat
        ip_address?: string
        port?: number
        auto_print_on_save: boolean
    }
}

export interface PrinterDevice {
    id: string
    user_id: string
    name: string
    printer_type: 'thermal_pos' | 'thermal_label' | 'desktop_sheet'
    connection_type: 'usb' | 'bluetooth' | 'network' | 'system'
    ip_address?: string
    port?: number
    paper_width: '58mm' | '80mm' | 'A4' | 'custom'
    label_format: LabelPrinterFormat
    is_default: boolean
}

export interface BarcodeLabelItem {
    id: string
    name: string
    sku?: string
    barcode: string
    price: number
    unit?: string
    jewelry_attributes?: JewelryAttributes | null
    copies?: number
}
