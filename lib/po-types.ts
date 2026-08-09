export type POStatus = 'draft' | 'issued' | 'partially_received' | 'received' | 'cancelled'

export interface PurchaseOrderItem {
    id?: string
    po_id?: string
    inventory_item_id?: string | null
    item_name: string
    description?: string | null
    quantity: number
    received_quantity: number
    unit_price: number
    gst_rate: number
    tax_amount: number
    total_amount: number
    created_at?: string
}

export interface PurchaseOrder {
    id: string
    user_id: string
    po_number: string
    vendor_id?: string | null
    vendor_name: string
    vendor_email?: string | null
    po_date: string
    expected_delivery_date?: string | null
    status: POStatus
    subtotal: number
    tax_total: number
    total_amount: number
    notes?: string | null
    terms?: string | null
    created_at: string
    updated_at: string
    items?: PurchaseOrderItem[]
    vendor?: {
        address?: string | null
        gstin?: string | null
        phone?: string | null
        contact_person?: string | null
        state_code?: string | null
    } | null
}

export interface CreatePOInput {
    vendor_id?: string
    vendor_name: string
    vendor_email?: string
    po_date: string
    expected_delivery_date?: string
    notes?: string
    terms?: string
    items: {
        inventory_item_id?: string
        item_name: string
        description?: string
        quantity: number
        unit_price: number
        gst_rate: number
    }[]
}
