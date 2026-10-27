'use server'

import { createClient } from '@/lib/supabase/server'
import { checkSuperAdminAccess, createAuditLog } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import { 
    type RegionalCMSData, 
    type SubdomainConfig, 
    DEFAULT_REGIONAL_CONTENT, 
    DEFAULT_SUBDOMAINS 
} from './types'

export async function getRegionalCMS(region: 'IN' | 'AE' | 'US'): Promise<RegionalCMSData> {
    try {
        const supabase = await createClient()
        const key = `cms_region_${region.toLowerCase()}`

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error || !data?.value) {
            return DEFAULT_REGIONAL_CONTENT[region] || DEFAULT_REGIONAL_CONTENT.IN
        }

        return {
            ...DEFAULT_REGIONAL_CONTENT[region],
            ...(data.value as Partial<RegionalCMSData>)
        }
    } catch (err) {
        console.warn(`[getRegionalCMS] Using default template for ${region}:`, err)
        return DEFAULT_REGIONAL_CONTENT[region] || DEFAULT_REGIONAL_CONTENT.IN
    }
}

export async function getAllRegionalCMS(): Promise<Record<string, RegionalCMSData>> {
    const [inData, aeData, usData] = await Promise.all([
        getRegionalCMS('IN'),
        getRegionalCMS('AE'),
        getRegionalCMS('US')
    ])

    return {
        IN: inData,
        AE: aeData,
        US: usData
    }
}

export async function saveRegionalCMS(region: 'IN' | 'AE' | 'US', content: RegionalCMSData) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()
        const key = `cms_region_${region.toLowerCase()}`

        const { data: existing } = await supabase
            .from('system_settings')
            .select('id')
            .eq('key', key)
            .single()

        if (existing?.id) {
            const { error } = await supabase
                .from('system_settings')
                .update({
                    value: content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

            if (error) throw error
        } else {
            const { error } = await supabase
                .from('system_settings')
                .insert({
                    key,
                    value: content,
                    description: `Regional CMS and landing content for ${region}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        }

        await createAuditLog('cms_content_updated', 'cms', undefined, { region })

        revalidatePath('/admin/cms')
        revalidatePath('/')
        revalidatePath('/ae')
        revalidatePath('/us')
        revalidatePath('/pricing')
        revalidatePath('/ae/pricing')
        revalidatePath('/us/pricing')

        return { success: true }
    } catch (error) {
        console.error('Error saving regional CMS:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to save content' }
    }
}

export async function getSubdomainConfig(): Promise<SubdomainConfig> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'cms_subdomain_routing')
            .single()

        if (error || !data?.value) {
            return DEFAULT_SUBDOMAINS
        }

        return data.value as SubdomainConfig
    } catch (err) {
        console.warn('[getSubdomainConfig] Using default subdomains:', err)
        return DEFAULT_SUBDOMAINS
    }
}

export async function saveSubdomainConfig(config: SubdomainConfig) {
    try {
        const hasAccess = await checkSuperAdminAccess()
        if (!hasAccess) throw new Error('Unauthorized')

        const supabase = await createClient()
        const key = 'cms_subdomain_routing'

        const { data: existing } = await supabase
            .from('system_settings')
            .select('id')
            .eq('key', key)
            .single()

        if (existing?.id) {
            const { error } = await supabase
                .from('system_settings')
                .update({
                    value: config,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

            if (error) throw error
        } else {
            const { error } = await supabase
                .from('system_settings')
                .insert({
                    key,
                    value: config,
                    description: 'Subdomain and regional gateway routing configuration',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        }

        await createAuditLog('subdomain_routing_updated', 'system_settings')

        revalidatePath('/admin/cms')
        return { success: true }
    } catch (error) {
        console.error('Error saving subdomain routing config:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to save routing config' }
    }
}
