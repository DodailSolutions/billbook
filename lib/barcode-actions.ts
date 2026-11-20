'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { 
    BarcodeSettings, 
    JewelryAttributes, 
    PrinterDevice, 
    BarcodeLabelItem 
} from './barcode-types'
import { generateUniqueBarcode } from './barcode-utils'

const DEFAULT_SETTINGS: BarcodeSettings = {
    enable_barcode_system: false,
    business_type: 'standard',
    barcode_format: 'CODE128',
    default_label_format: 'retail_50x25',
    auto_generate_on_item_create: true,
    scanner_sound_feedback: true,
    printer_settings: {
        printer_type: 'browser',
        receipt_paper_size: '80mm',
        label_printer_type: 'thermal',
        label_format: 'retail_50x25',
        auto_print_on_save: false,
    }
}

/**
 * Fetch organization barcode & printer preferences with safe fallbacks
 */
export async function getBarcodeSettings(): Promise<BarcodeSettings> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return DEFAULT_SETTINGS

        const { data, error } = await supabase
            .from('invoice_settings')
            .select('enable_barcode_system, business_type, printer_settings')
            .eq('user_id', user.id)
            .maybeSingle()

        if (error || !data) {
            return DEFAULT_SETTINGS
        }

        return {
            enable_barcode_system: Boolean(data.enable_barcode_system ?? false),
            business_type: data.business_type || 'standard',
            barcode_format: 'CODE128',
            default_label_format: data.printer_settings?.label_format || (data.business_type === 'jewelry_retail' ? 'jewelry_dumbbell' : 'retail_50x25'),
            auto_generate_on_item_create: true,
            scanner_sound_feedback: true,
            printer_settings: {
                printer_type: data.printer_settings?.printer_type || 'browser',
                receipt_paper_size: data.printer_settings?.receipt_paper_size || '80mm',
                label_printer_type: data.printer_settings?.label_printer_type || 'thermal',
                label_format: data.printer_settings?.label_format || (data.business_type === 'jewelry_retail' ? 'jewelry_dumbbell' : 'retail_50x25'),
                ip_address: data.printer_settings?.ip_address,
                port: data.printer_settings?.port,
                auto_print_on_save: Boolean(data.printer_settings?.auto_print_on_save ?? false),
            }
        }
    } catch (err) {
        console.error('Error fetching barcode settings:', err)
        return DEFAULT_SETTINGS
    }
}

/**
 * Update organization barcode, business profile, and printer settings
 */
export async function updateBarcodeSettings(
    settings: Partial<BarcodeSettings>
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { success: false, error: 'User is not authenticated' }

        const payload: Record<string, any> = {
            updated_at: new Date().toISOString()
        }

        if (settings.enable_barcode_system !== undefined) {
            payload.enable_barcode_system = settings.enable_barcode_system
        }
        if (settings.business_type !== undefined) {
            payload.business_type = settings.business_type
        }
        if (settings.printer_settings) {
            payload.printer_settings = settings.printer_settings
        }

        const { error } = await supabase
            .from('invoice_settings')
            .update(payload)
            .eq('user_id', user.id)

        if (error) {
            console.error('Failed to update barcode settings:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/settings')
        revalidatePath('/inventory')
        revalidatePath('/items')
        return { success: true }
    } catch (err) {
        console.error('Unexpected error updating barcode settings:', err)
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}

/**
 * Generate or assign a unique barcode to an inventory or saved item
 */
export async function assignItemBarcode(
    itemId: string,
    table: 'inventory_items' | 'saved_items',
    customBarcode?: string
): Promise<{ success: boolean; barcode?: string; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { success: false, error: 'Authentication required' }

        const barcode = (customBarcode && customBarcode.trim()) || generateUniqueBarcode()

        const { error } = await supabase
            .from(table)
            .update({ 
                barcode, 
                barcode_format: 'CODE128',
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .eq('user_id', user.id)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/inventory')
        revalidatePath('/items')
        return { success: true, barcode }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Error generating barcode' }
    }
}

/**
 * Instant barcode scan lookup across Inventory & Invoicing items
 */
export async function lookupItemByBarcode(
    barcodeText: string
): Promise<{
    success: boolean
    item?: {
        id: string
        name: string
        sku: string
        barcode: string
        selling_price: number
        current_stock?: number
        unit: string
        hsn_sac_code?: string
        gst_rate?: number
        jewelry_attributes?: JewelryAttributes | null
        source_table: 'inventory_items' | 'saved_items'
    }
    error?: string
}> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { success: false, error: 'Authentication required' }

        const cleanBarcode = barcodeText.trim()
        if (!cleanBarcode) return { success: false, error: 'Barcode is empty' }

        // 1. Check inventory_items by barcode or SKU
        const { data: invItem } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', user.id)
            .or(`barcode.eq.${cleanBarcode},sku.eq.${cleanBarcode}`)
            .maybeSingle()

        if (invItem) {
            return {
                success: true,
                item: {
                    id: invItem.id,
                    name: invItem.name || invItem.item_name || 'Unnamed Item',
                    sku: invItem.sku || '',
                    barcode: invItem.barcode || cleanBarcode,
                    selling_price: Number(invItem.selling_price || 0),
                    current_stock: Number(invItem.current_stock ?? invItem.quantity_on_hand ?? 0),
                    unit: invItem.unit || 'pcs',
                    jewelry_attributes: invItem.jewelry_attributes || null,
                    source_table: 'inventory_items'
                }
            }
        }

        // 2. Check saved_items (invoicing items) by barcode or name
        const { data: savedItem } = await supabase
            .from('saved_items')
            .select('*')
            .eq('user_id', user.id)
            .or(`barcode.eq.${cleanBarcode},name.ilike.${cleanBarcode}`)
            .maybeSingle()

        if (savedItem) {
            return {
                success: true,
                item: {
                    id: savedItem.id,
                    name: savedItem.name,
                    sku: savedItem.barcode || '',
                    barcode: savedItem.barcode || cleanBarcode,
                    selling_price: Number(savedItem.unit_price || 0),
                    unit: 'pcs',
                    hsn_sac_code: savedItem.hsn_sac_code,
                    gst_rate: savedItem.gst_rate,
                    jewelry_attributes: savedItem.jewelry_attributes || null,
                    source_table: 'saved_items'
                }
            }
        }

        return { success: false, error: `No item found matching barcode "${cleanBarcode}"` }
    } catch (err) {
        console.error('Error during barcode lookup:', err)
        return { success: false, error: 'Lookup failed' }
    }
}

/**
 * Save specialized jewelry specifications for an item
 */
export async function updateItemJewelryDetails(
    itemId: string,
    table: 'inventory_items' | 'saved_items',
    details: JewelryAttributes
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { success: false, error: 'Authentication required' }

        const { error } = await supabase
            .from(table)
            .update({
                jewelry_attributes: details,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .eq('user_id', user.id)

        if (error) return { success: false, error: error.message }

        revalidatePath('/inventory')
        revalidatePath('/items')
        return { success: true }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Error updating jewelry details' }
    }
}

/**
 * Retrieve connected organization printers
 */
export async function getOrganizationPrinters(): Promise<PrinterDevice[]> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return []

        const { data, error } = await supabase
            .from('organization_printers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })

        if (error) {
            console.warn('Printers table not yet migrated or empty:', error.message)
            return []
        }

        return data || []
    } catch {
        return []
    }
}

/**
 * Save or register a new hardware printer
 */
export async function saveOrganizationPrinter(
    printer: Omit<PrinterDevice, 'id' | 'user_id'> & { id?: string }
): Promise<{ success: boolean; printer_id?: string; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { success: false, error: 'Authentication required' }

        if (printer.id) {
            const { error } = await supabase
                .from('organization_printers')
                .update({
                    name: printer.name,
                    printer_type: printer.printer_type,
                    connection_type: printer.connection_type,
                    ip_address: printer.ip_address,
                    port: printer.port,
                    paper_width: printer.paper_width,
                    label_format: printer.label_format,
                    is_default: printer.is_default,
                    updated_at: new Date().toISOString()
                })
                .eq('id', printer.id)
                .eq('user_id', user.id)

            if (error) return { success: false, error: error.message }
            return { success: true, printer_id: printer.id }
        } else {
            const { data, error } = await supabase
                .from('organization_printers')
                .insert([{
                    user_id: user.id,
                    name: printer.name,
                    printer_type: printer.printer_type,
                    connection_type: printer.connection_type,
                    ip_address: printer.ip_address,
                    port: printer.port,
                    paper_width: printer.paper_width,
                    label_format: printer.label_format,
                    is_default: printer.is_default
                }])
                .select('id')
                .single()

            if (error) return { success: false, error: error.message }
            return { success: true, printer_id: data.id }
        }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to save printer' }
    }
}
