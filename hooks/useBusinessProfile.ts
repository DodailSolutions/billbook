'use client'

import { useState, useEffect } from 'react'
import type { BusinessType, BusinessVerticalConfig } from '@/lib/business-profile-types'
import { BUSINESS_VERTICALS } from '@/lib/business-profile-types'
import { getBusinessProfile, updateBusinessProfile } from '@/lib/business-profile-actions'

export function useBusinessProfile() {
    const [businessType, setBusinessType] = useState<BusinessType>('standard')
    const [metadata, setMetadata] = useState<Record<string, any>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        getBusinessProfile()
            .then(res => {
                if (isMounted) {
                    setBusinessType(res.businessType)
                    setMetadata(res.metadata)
                    setIsLoading(false)
                }
            })
            .catch(() => {
                if (isMounted) setIsLoading(false)
            })
        return () => { isMounted = false }
    }, [])

    const config: BusinessVerticalConfig = BUSINESS_VERTICALS[businessType] || BUSINESS_VERTICALS.standard

    const switchProfile = async (newType: BusinessType, newMetadata?: Record<string, any>) => {
        setIsLoading(true)
        const res = await updateBusinessProfile(newType, newMetadata)
        if (res.success) {
            setBusinessType(newType)
            if (newMetadata) setMetadata(newMetadata)
        }
        setIsLoading(false)
        return res
    }

    return {
        businessType,
        metadata,
        config,
        isLoading,
        switchProfile,
        // Handy boolean flags
        isSalon: businessType === 'salon_spa',
        isDental: businessType === 'dental_clinic',
        isHospital: businessType === 'hospital_op',
        isAutoWorkshop: businessType === 'auto_workshop',
        isTravel: businessType === 'tours_and_travels',
        isJewellery: businessType === 'jewelry_retail',
        isPMS: businessType === 'resorts_farmhouses_camping',
        isLaundry: businessType === 'laundry_drycleaning',
        isRealEstate: businessType === 'real_estate',
        isEvents: businessType === 'event_management',
        isRetail: businessType === 'retail',
        isWholesale: businessType === 'wholesale',
        isServices: businessType === 'services',
        // Dynamic labels
        labels: config.customFieldLabels
    }
}
