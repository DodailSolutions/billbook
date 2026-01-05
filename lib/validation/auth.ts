/**
 * Authentication validation utilities
 * Provides consistent validation rules for signup and login forms
 */

export interface ValidationResult {
    isValid: boolean
    error?: string
}

export interface PasswordStrength {
    score: number // 0-4
    feedback: string[]
    isStrong: boolean
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
        return { isValid: false, error: 'Email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: 'Please enter a valid email address' }
    }

    // Additional check for common typos
    if (trimmedEmail.endsWith('.co')) {
        return { isValid: false, error: 'Did you mean .com or .co.in?' }
    }

    return { isValid: true }
}

// Password validation
export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
        return { isValid: false, error: 'Password is required' }
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' }
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password is too long (max 128 characters)' }
    }

    return { isValid: true }
}

// Check password strength
export const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (!password) {
        return { score: 0, feedback: ['Enter a password'], isStrong: false }
    }

    if (password.length >= 6) score++
    else feedback.push('At least 6 characters')

    if (password.length >= 8) score++
    if (password.length >= 12) score++

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    else feedback.push('Mix uppercase and lowercase letters')

    if (/[0-9]/.test(password)) score++
    else feedback.push('Add numbers')

    if (/[!@#$%^&*]/.test(password)) score++
    else feedback.push('Add special characters (!@#$%^&*)')
    
    return {
        score: Math.min(score, 4),
        feedback: feedback.slice(0, 2), // Show top 2 suggestions
        isStrong: score >= 3
    }
}

// Full name validation
export const validateFullName = (name: string): ValidationResult => {
    const trimmedName = name.trim()

    if (!trimmedName) {
        return { isValid: false, error: 'Full name is required' }
    }

    if (trimmedName.length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters' }
    }

    if (trimmedName.length > 100) {
        return { isValid: false, error: 'Name is too long (max 100 characters)' }
    }

    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, error: 'Name contains invalid characters' }
    }

    return { isValid: true }
}

// Business name validation
export const validateBusinessName = (name: string): ValidationResult => {
    const trimmedName = name.trim()

    if (!trimmedName) {
        return { isValid: false, error: 'Business name is required' }
    }

    if (trimmedName.length < 2) {
        return { isValid: false, error: 'Business name must be at least 2 characters' }
    }

    if (trimmedName.length > 200) {
        return { isValid: false, error: 'Business name is too long (max 200 characters)' }
    }

    return { isValid: true }
}

// Phone number validation (for Indian phone numbers)
export const validatePhoneNumber = (phone: string): ValidationResult => {
    const trimmedPhone = phone.trim()

    if (!trimmedPhone) {
        return { isValid: false, error: 'Phone number is required' }
    }

    // Remove common formatting characters
    const cleanPhone = trimmedPhone.replace(/[\s\-().+]/g, '')

    // Check if it's a valid phone number (10-15 digits)
    if (!/^\d{10,15}$/.test(cleanPhone)) {
        return { isValid: false, error: 'Please enter a valid phone number' }
    }

    // Check for Indian phone numbers specifically
    if (cleanPhone.length === 10) {
        return { isValid: true }
    }

    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        return { isValid: true }
    }

    if (cleanPhone.startsWith('+91') && cleanPhone.length === 13) {
        return { isValid: true }
    }

    return { isValid: true } // Accept other formats
}

// GSTIN validation
export const validateGSTIN = (gstin: string): ValidationResult => {
    if (!gstin) {
        return { isValid: true } // GSTIN is optional
    }

    const trimmedGSTIN = gstin.trim()

    // GSTIN format: 2 digits state code, 10 digits PAN, 1 digit entity, 1 digit checksum
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9]{1}[Z]{1}[0-9]{1}$/
    if (!gstinRegex.test(trimmedGSTIN)) {
        return { isValid: false, error: 'Please enter a valid GSTIN format' }
    }

    return { isValid: true }
}

// Business type validation
export const validateBusinessType = (type: string): ValidationResult => {
    const validTypes = ['dental', 'it_company', 'salon', 'car_detailing', 'car_wash', 'spare_parts', 'clinic', 'restaurant', 'retail', 'consulting', 'freelancer', 'other']

    if (!type) {
        return { isValid: false, error: 'Please select a business type' }
    }

    if (!validTypes.includes(type)) {
        return { isValid: false, error: 'Invalid business type selected' }
    }

    return { isValid: true }
}

// Address validation
export const validateAddress = (address: string): ValidationResult => {
    const trimmedAddress = address.trim()

    if (!trimmedAddress) {
        return { isValid: true } // Address is optional
    }

    if (trimmedAddress.length < 5) {
        return { isValid: false, error: 'Address must be at least 5 characters' }
    }

    if (trimmedAddress.length > 500) {
        return { isValid: false, error: 'Address is too long (max 500 characters)' }
    }

    return { isValid: true }
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
    }

    return phone
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '')
}
