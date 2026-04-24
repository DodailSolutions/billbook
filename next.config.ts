import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ====================================================================
     REACT COMPILER & PERFORMANCE OPTIMIZATIONS
     ==================================================================== */
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  
  /* ====================================================================
     IMAGE OPTIMIZATION
     ==================================================================== */
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  /* ====================================================================
     EXPERIMENTAL OPTIMIZATIONS
     ==================================================================== */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'date-fns',
    ],
  },
  
  /* ====================================================================
     SECURITY HEADERS
     ==================================================================== */
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|webp|avif|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; frame-src https://checkout.razorpay.com; connect-src 'self' https: wss:; font-src 'self' data:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';",
          },
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  
  /* ====================================================================
     REDIRECT RULES - Remove trailing slashes & Force HTTPS
     ==================================================================== */
  async redirects() {
    return [
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // Force HTTPS in production
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/:path*',
              has: [
                {
                  type: 'header' as const,
                  key: 'x-forwarded-proto',
                  value: 'http',
                },
              ],
              destination: 'https://:host/:path*',
              permanent: true,
            },
          ]
        : []),
    ];
  },

  /* ====================================================================
     BUILD OPTIMIZATION
     ==================================================================== */
  productionBrowserSourceMaps: false, // Disable source maps in production
  generateEtags: true,
};

export default nextConfig;
