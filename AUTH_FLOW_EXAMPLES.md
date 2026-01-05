# Sign up and Login Flow - Implementation Examples

## 📚 Code Examples

### 1. Using Validation Functions

#### Email Validation
```typescript
import { validateEmail } from '@/lib/validation/auth'

// In a component
const handleEmailChange = (email: string) => {
    const result = validateEmail(email)
    
    if (result.isValid) {
        console.log('Email is valid!')
        // Enable submit button, proceed, etc.
    } else {
        console.log(result.error)
        // Show error: "Please enter a valid email address"
    }
}

// Example Results
validateEmail('user@example.com')  
// → { isValid: true }

validateEmail('invalid-email')
// → { isValid: false, error: 'Please enter a valid email address' }

validateEmail('user@domain.co')
// → { isValid: false, error: 'Did you mean .com or .co.in?' }
```

#### Password Validation & Strength
```typescript
import { validatePassword, checkPasswordStrength } from '@/lib/validation/auth'

// Validate minimum requirements
const passwordValidation = validatePassword(password)
if (!passwordValidation.isValid) {
    console.log(passwordValidation.error)
}

// Check strength
const strength = checkPasswordStrength(password)
console.log(strength.score)        // 0, 1, 2, 3, or 4
console.log(strength.isStrong)     // true if score >= 3
console.log(strength.feedback)     // ['Add numbers', 'Add special...']

// Example: Password Strength Progress
const passwords = [
    '',                    // score: 0 (None)
    '123456',             // score: 1 (Very Weak)
    'ABC123',             // score: 2 (Weak)
    'ABC123def',          // score: 3 (Fair)
    'ABC123def!@#',       // score: 4 (Strong)
]
```

#### Name Validation
```typescript
import { validateFullName, validateBusinessName } from '@/lib/validation/auth'

const fullNameValidation = validateFullName('John Doe')
// → { isValid: true }

const businessNameValidation = validateBusinessName('ABC Dental Clinic')
// → { isValid: true }

// Invalid examples
validateFullName('J')
// → { isValid: false, error: 'Name must be at least 2 characters' }

validateFullName('123')
// → { isValid: false, error: 'Name contains invalid characters' }
```

#### Phone Number Validation
```typescript
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/validation/auth'

// Validation
const phoneResult = validatePhoneNumber('+91 9876543210')
// → { isValid: true }

// Formatting for display
const formatted = formatPhoneNumber('9876543210')
// → "+91 98765 43210"

// Supports multiple formats
validatePhoneNumber('9876543210')      // 10 digits
// → { isValid: true }

validatePhoneNumber('919876543210')    // With country code
// → { isValid: true }

validatePhoneNumber('+919876543210')   // With +91
// → { isValid: true }
```

#### GSTIN Validation
```typescript
import { validateGSTIN } from '@/lib/validation/auth'

const gstinResult = validateGSTIN('22AAAAA0000A1Z5')
// → { isValid: true }

const invalidGSTIN = validateGSTIN('INVALID')
// → { isValid: false, error: 'Please enter a valid GSTIN format' }

// Optional field - empty is valid
const emptyGSTIN = validateGSTIN('')
// → { isValid: true }
```

---

### 2. Login Form Implementation

#### Full Example
```tsx
'use client'

import { useState } from 'react'
import { validateEmail, validatePassword } from '@/lib/validation/auth'
import { login } from '@/app/(auth)/actions'

export function MyLoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const validateField = (field: string, value: string) => {
        let error: string | undefined

        if (field === 'email') {
            const result = validateEmail(value)
            error = result.error
        } else if (field === 'password') {
            const result = validatePassword(value)
            error = result.error
        }

        setErrors(prev => ({ ...prev, [field]: error }))
        return !error
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field, field === 'email' ? email : password)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields
        if (!validateField('email', email) || !validateField('password', password)) {
            return
        }

        // Submit
        const formData = new FormData()
        formData.append('email', email.trim())
        formData.append('password', password)

        await login(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                />
                {touched.email && errors.email && (
                    <p style={{ color: 'red' }}>{errors.email}</p>
                )}
            </div>

            <div>
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                />
                {touched.password && errors.password && (
                    <p style={{ color: 'red' }}>{errors.password}</p>
                )}
            </div>

            <button type="submit">Login</button>
        </form>
    )
}
```

---

### 3. Signup Form - Real-Time Validation

#### Multi-Step Form with Validation
```tsx
'use client'

import { useState } from 'react'
import { 
    validateFullName, 
    validateEmail, 
    validatePassword,
    validateBusinessName,
    validatePhoneNumber,
    checkPasswordStrength
} from '@/lib/validation/auth'

export function MySignupForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        businessName: '',
        businessPhone: '',
    })

    const validateField = (field: string, value: string): boolean => {
        let isValid = true
        let error: string | undefined

        switch (field) {
            case 'fullName':
                const fnResult = validateFullName(value)
                isValid = fnResult.isValid
                error = fnResult.error
                break
            case 'email':
                const emResult = validateEmail(value)
                isValid = emResult.isValid
                error = emResult.error
                break
            case 'password':
                const pwResult = validatePassword(value)
                isValid = pwResult.isValid
                error = pwResult.error
                break
            case 'businessName':
                const bnResult = validateBusinessName(value)
                isValid = bnResult.isValid
                error = bnResult.error
                break
            case 'businessPhone':
                const phResult = validatePhoneNumber(value)
                isValid = phResult.isValid
                error = phResult.error
                break
        }

        setFieldErrors(prev => ({
            ...prev,
            [field]: error
        }))

        return isValid
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Validate on change if field touched
        if (touched[field]) {
            validateField(field, value)
        }
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field, formData[field as keyof typeof formData] as string)
    }

    const handleNext = () => {
        // Validate all fields in current step
        const fieldsToValidate = 
            currentStep === 1 
                ? ['fullName', 'email', 'password']
                : ['businessName', 'businessPhone']

        const allValid = fieldsToValidate.every(field => 
            validateField(field, formData[field as keyof typeof formData] as string)
        )

        if (allValid) {
            setCurrentStep(2)
        }
    }

    const password = formData.password
    const strength = checkPasswordStrength(password)

    return (
        <form>
            {currentStep === 1 && (
                <div>
                    <h2>Personal Information</h2>
                    
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        onBlur={() => handleBlur('fullName')}
                    />
                    {fieldErrors.fullName && <p style={{color:'red'}}>{fieldErrors.fullName}</p>}

                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                    />
                    {fieldErrors.email && <p style={{color:'red'}}>{fieldErrors.email}</p>}

                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                    />
                    {fieldErrors.password && <p style={{color:'red'}}>{fieldErrors.password}</p>}
                    
                    {/* Password strength */}
                    {password && (
                        <div>
                            <div style={{
                                height: '8px',
                                backgroundColor: '#eee',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${((strength.score + 1) / 5) * 100}%`,
                                    backgroundColor: strength.score <= 1 ? '#ef4444' : 
                                                     strength.score === 2 ? '#f97316' :
                                                     strength.score === 3 ? '#eab308' : '#10b981'
                                }}></div>
                            </div>
                            <p>Strength: {strength.isStrong ? 'Strong' : 'Weak'}</p>
                        </div>
                    )}

                    <button type="button" onClick={handleNext}>Next</button>
                </div>
            )}

            {currentStep === 2 && (
                <div>
                    <h2>Business Information</h2>
                    
                    <input
                        type="text"
                        placeholder="Business Name"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        onBlur={() => handleBlur('businessName')}
                    />
                    {fieldErrors.businessName && <p style={{color:'red'}}>{fieldErrors.businessName}</p>}

                    <input
                        type="tel"
                        placeholder="Business Phone"
                        value={formData.businessPhone}
                        onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                        onBlur={() => handleBlur('businessPhone')}
                    />
                    {fieldErrors.businessPhone && <p style={{color:'red'}}>{fieldErrors.businessPhone}</p>}

                    <button type="submit">Create Account</button>
                </div>
            )}
        </form>
    )
}
```

---

### 4. Password Strength Indicator Component

#### Usage Example
```tsx
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { useState } from 'react'

export function PasswordForm() {
    const [password, setPassword] = useState('')

    return (
        <div>
            <label>Create Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
            />
            
            {/* Show strength indicator */}
            <PasswordStrengthIndicator 
                password={password}
                showFeedback={true}
            />
        </div>
    )
}
```

#### Custom Strength Display
```tsx
import { checkPasswordStrength } from '@/lib/validation/auth'

export function CustomPasswordIndicator({ password }: { password: string }) {
    const strength = checkPasswordStrength(password)

    const getColor = (score: number) => {
        switch (score) {
            case 0: return '#d1d5db'  // gray
            case 1: return '#ef4444'  // red
            case 2: return '#f97316'  // orange
            case 3: return '#eab308'  // yellow
            case 4: return '#10b981'  // emerald
            default: return '#d1d5db'
        }
    }

    const getLabel = (score: number) => {
        const labels = ['None', 'Very Weak', 'Weak', 'Fair', 'Strong']
        return labels[score] || 'None'
    }

    if (!password) return null

    return (
        <div>
            <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
            }}>
                <div style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${((strength.score + 1) / 5) * 100}%`,
                        backgroundColor: getColor(strength.score),
                        transition: 'all 0.3s ease'
                    }}></div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: getColor(strength.score) }}>
                    {getLabel(strength.score)}
                </span>
            </div>

            {strength.feedback.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    {strength.feedback.map((suggestion, idx) => (
                        <p key={idx}>• {suggestion}</p>
                    ))}
                </div>
            )}

            {strength.isStrong && (
                <p style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ✓ Password strength is good
                </p>
            )}
        </div>
    )
}
```

---

### 5. Advanced Validation Patterns

#### Async Email Availability Check
```tsx
import { validateEmail } from '@/lib/validation/auth'
import { useState } from 'react'

export function EmailFieldWithAvailabilityCheck() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string>('')
    const [isChecking, setIsChecking] = useState(false)

    const handleEmailBlur = async (value: string) => {
        // First validate format
        const formatResult = validateEmail(value)
        if (!formatResult.isValid) {
            setError(formatResult.error || '')
            return
        }

        // Then check availability
        setIsChecking(true)
        try {
            const response = await fetch('/api/check-email', {
                method: 'POST',
                body: JSON.stringify({ email: value })
            })
            const data = await response.json()
            
            if (!data.available) {
                setError('Email already registered')
            } else {
                setError('')
            }
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleEmailBlur(e.target.value)}
            />
            {isChecking && <p>Checking availability...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    )
}
```

#### Conditional Business Fields
```tsx
import { validatePhoneNumber, validateGSTIN } from '@/lib/validation/auth'
import { useState } from 'react'

export function ConditionalBusinessForm() {
    const [businessPhone, setBusinessPhone] = useState('')
    const [gstin, setGSTIN] = useState('')
    const [gstinRequired, setGSTINRequired] = useState(false)

    const handlePhoneChange = (value: string) => {
        setBusinessPhone(value)

        // If phone starts with Indian area code, require GSTIN
        if (value.startsWith('91') || value.startsWith('+91')) {
            setGSTINRequired(true)
        } else {
            setGSTINRequired(false)
        }
    }

    return (
        <div>
            <input
                type="tel"
                value={businessPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Business Phone"
            />

            {gstinRequired && (
                <div>
                    <label>GSTIN (Required for Indian businesses)</label>
                    <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGSTIN(e.target.value)}
                        placeholder="22AAAAA0000A1Z5"
                    />
                    {gstin && !validateGSTIN(gstin).isValid && (
                        <p style={{color: 'red'}}>Invalid GSTIN format</p>
                    )}
                </div>
            )}
        </div>
    )
}
```

---

## 🎯 Common Patterns

### Pattern 1: Field-Level Validation
```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

const validateField = (field: string, value: string) => {
    const result = validateEmail(value) // Use appropriate validator
    setErrors(prev => ({
        ...prev,
        [field]: result.error || ''
    }))
}
```

### Pattern 2: Form-Level Validation
```tsx
const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    const emailResult = validateEmail(formData.email)
    if (!emailResult.isValid) errors.email = emailResult.error || ''
    
    const passwordResult = validatePassword(formData.password)
    if (!passwordResult.isValid) errors.password = passwordResult.error || ''
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
}
```

### Pattern 3: Step-by-Step Validation
```tsx
const validateStep = (step: number): boolean => {
    const fieldsInStep = step === 1 
        ? ['fullName', 'email', 'password']
        : ['businessName', 'businessPhone']
    
    return fieldsInStep.every(field =>
        validateField(field, formData[field])
    )
}
```

---

## 📖 See Also

- Full Documentation: `AUTH_FLOW_IMPROVEMENTS.md`
- Quick Reference: `AUTH_FLOW_QUICK_REFERENCE.md`
- Validation Module: `lib/validation/auth.ts`
- Components: `app/(auth)/login/LoginForm.tsx`, `app/(auth)/signup/SignupForm.tsx`
