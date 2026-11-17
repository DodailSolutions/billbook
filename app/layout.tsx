import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PWARegister } from "@/components/PWARegister";
import { PublicMobileNav } from "@/components/PublicMobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  applicationName: 'BillBooky',
  metadataBase: new URL('https://billbooky.dodail.com'),
  title: {
    default: 'BillBooky - #1 Free GST Invoice Generator & Billing Software | Top Zoho Invoice Alternative India',
    template: '%s | BillBooky - Invoice Generator India'
  },
  description: 'Free GST-compliant invoice generator for Indian businesses. #1 Zoho Invoice & Vyapar alternative with instant WhatsApp sharing, GST e-invoicing, payments, and smart CRM. 100% free for Indian MSMEs.',
  keywords: [
    'free invoice generator',
    'invoice generator India',
    'GST invoice maker',
    'billing software India',
    'invoice creator free',
    'invoice maker online',
    'GST billing software',
    'invoice app India',
    'free billing software',
    'invoice generator for small business',
    'Made in India invoice software',
    'Indian invoice generator',
    'MSME invoice software',
    'freelancer invoice tool',
    'business invoice generator',
    'online invoice maker India',
    'GST compliant software',
    'invoice management system',
    'customer billing software',
    'payment tracking India',
    'Zoho Invoice alternative',
    'Zoho Invoice free alternative',
    'Zoho Books alternative',
    'Vyapar alternative',
    'Tally alternative',
    'Tally Prime online alternative',
    'free GST billing software India',
    'e-invoicing software for MSME',
    'online invoice maker with GST',
    'BillBooky billing app',
    'best free invoice generator in India',
    'Zoho Invoice vs BillBooky'
  ],
  authors: [{ name: 'BillBooky Team' }],
  creator: 'BillBooky',
  publisher: 'BillBooky',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '-8t9f7kYXCnXv0O-BgLx_Jb5-3bIRO8R2gfR2nMYLTw',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://billbooky.dodail.com',
    title: 'BillBooky - Free Invoice Generator for Indian Businesses | Made in India',
    description: 'Free GST-compliant invoice generator made in India. Perfect for MSMEs, freelancers, and enterprises. Create professional invoices in seconds!',
    siteName: 'BillBooky',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BillBooky - Free Invoice Generator for Indian Businesses',
    description: 'Free GST-compliant invoice software made in India. Start creating professional invoices today!',
    creator: '@billbooky',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BillBooky',
  },
  alternates: {
    canonical: 'https://billbooky.dodail.com',
  },
  category: 'Business Software',
};

export const viewport: Viewport = {
  themeColor: '#005DEE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="-8t9f7kYXCnXv0O-BgLx_Jb5-3bIRO8R2gfR2nMYLTw" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <PublicMobileNav />
        <SpeedInsights />
        <PWARegister />
        
        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'BillBooky',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
              },
              description: 'Free GST-compliant invoice generator for Indian businesses. Made in India for MSMEs, freelancers, and enterprises.',
              featureList: [
                'Free invoice generator',
                'GST-compliant billing',
                'Customer management',
                'Payment tracking',
                'Recurring invoices',
                'Multiple templates',
                'Cloud storage',
              ],
              countryOfOrigin: {
                '@type': 'Country',
                name: 'India',
              },
            }),
          }}
        />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'BillBooky',
              legalName: 'Dodail Solutions Private Limited',
              url: 'https://billbooky.dodail.com',
              logo: 'https://billbooky.dodail.com/logo-full.png',
              foundingDate: '2024',
              description: 'Free GST-compliant invoice generator for Indian businesses',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
              },
              sameAs: [
                'https://twitter.com/billbooky',
                'https://linkedin.com/company/billbooky',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Support',
                email: 'support@billbooky.com',
              },
            }),
          }}
        />
        
        {/* Structured Data - WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'BillBooky',
              url: 'https://billbooky.dodail.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://billbooky.dodail.com/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Structured Data - FAQPage Schema for Rich Search Results vs Zoho Invoice */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Why is BillBooky the best free alternative to Zoho Invoice and Vyapar in India?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'BillBooky is 100% free with unlimited GST invoice creation, built-in WhatsApp sharing, automated payment reminders, and multi-gateway support (Razorpay, Cashfree, Stripe, PayPal) without restrictive invoice caps or forced subscription upgrades.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Is BillBooky fully GST compliant with HSN/SAC codes and e-invoicing?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! BillBooky generates 100% GST-compliant tax invoices with automatic CGST, SGST, IGST calculations, HSN/SAC lookups, and reverse charge mechanisms compliant with Indian tax laws.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'Can I accept online payments with BillBooky invoices?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, BillBooky connects directly to Razorpay, Cashfree, Stripe, and PayPal so customers can pay via UPI, Credit/Debit cards, Netbanking, or international cards with instant webhook reconciliation.'
                  }
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
