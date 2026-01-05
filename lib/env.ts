/**
 * Environment Variable Validation and Configuration
 * Ensures all required environment variables are set correctly
 */

interface EnvConfig {
  required: boolean;
  description: string;
  pattern?: RegExp;
  default?: string;
  minLength?: number;
}

const requiredEnvVars: Record<string, EnvConfig> = {
  // Supabase Configuration (Required)
  'NEXT_PUBLIC_SUPABASE_URL': {
    required: true,
    description: 'Supabase project URL',
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    required: true,
    description: 'Supabase anonymous key',
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    required: true,
    description: 'Supabase service role key (server-side only)',
    pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  },

  // Razorpay Configuration (Required for payments)
  'NEXT_PUBLIC_RAZORPAY_KEY_ID': {
    required: true,
    description: 'Razorpay public key',
    pattern: /^[a-z0-9]{14}$/,
  },
  'RAZORPAY_KEY_SECRET': {
    required: true,
    description: 'Razorpay secret key (server-side only)',
    pattern: /^[a-z0-9]{32}$/,
  },

  // Email Configuration (Required)
  'RESEND_API_KEY': {
    required: true,
    description: 'Resend email service API key',
    pattern: /^re_[a-z0-9]{32}$/,
  },
  'NEXT_PUBLIC_SUPPORT_EMAIL': {
    required: true,
    description: 'Support email address',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // App Configuration
  'NEXT_PUBLIC_APP_URL': {
    required: true,
    description: 'Application URL',
    pattern: /^https?:\/\/.+/,
  },
  'NEXT_PUBLIC_APP_NAME': {
    required: false,
    description: 'Application name',
    default: 'BillBook',
  },

  // Security (Optional, with defaults)
  'JWT_SECRET': {
    required: false,
    description: 'JWT signing secret',
    default: 'your-jwt-secret-change-in-production',
    minLength: 32,
  },
  'API_SECRET': {
    required: false,
    description: 'API secret for internal requests',
    minLength: 32,
  },

  // Analytics (Optional)
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID': {
    required: false,
    description: 'Google Analytics ID',
    pattern: /^G-[A-Z0-9]+$/,
  },

  // Feature Flags (Optional)
  'NEXT_PUBLIC_ENABLE_GST': {
    required: false,
    description: 'Enable GST features',
    default: 'true',
  },
  'NEXT_PUBLIC_ENABLE_RECURRING': {
    required: false,
    description: 'Enable recurring invoices',
    default: 'true',
  },
};

/**
 * Validate environment variables
 */
export function validateEnv(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    // Check if required
    if (config.required && !value) {
      errors.push(
        `Missing required environment variable: ${key} (${config.description})`
      );
      continue;
    }

    // Skip validation if not provided and not required
    if (!value) {
      continue;
    }

    // Check pattern if provided
    if ('pattern' in config && config.pattern && !config.pattern.test(value)) {
      errors.push(
        `Invalid format for ${key}: "${value}" (expected pattern: ${config.pattern})`
      );
    }

    // Check minimum length if provided
    if ('minLength' in config && config.minLength && value.length < config.minLength) {
      errors.push(
        `${key} must be at least ${config.minLength} characters long`
      );
    }

    // Check if it's a development-unsafe value in production
    if (
      process.env.NODE_ENV === 'production' &&
      'default' in config &&
      config.default &&
      value === config.default
    ) {
      errors.push(
        `${key} is using the default insecure value in production. Please set a secure value.`
      );
    }
  }

  // Additional security checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
      errors.push(
        'NEXT_PUBLIC_APP_URL must use HTTPS in production'
      );
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push(
        'JWT_SECRET must be at least 32 characters in production'
      );
    }
  }

  // Warnings for optional but recommended variables
  if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    warnings.push(
      'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID not set. Analytics will be disabled.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get environment variable with fallback
 */
export function getEnv(
  key: string,
  defaultValue?: string
): string {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Get public environment variables for client side
 */
export function getPublicEnv() {
  return {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'BillBook',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    ENABLE_GST: process.env.NEXT_PUBLIC_ENABLE_GST === 'true',
    ENABLE_RECURRING: process.env.NEXT_PUBLIC_ENABLE_RECURRING === 'true',
  };
}

/**
 * Validate environment on startup
 */
if (typeof window === 'undefined') {
  // Server-side only
  const validation = validateEnv();

  if (validation.errors.length > 0) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment validation warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }
}
