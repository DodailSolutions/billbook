import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PWARegister } from "@/components/PWARegister";

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
    default: 'BillBooky - Free GST Invoice Generator for Indian Businesses | Made in India',
    template: '%s | BillBooky - Invoice Generator India'
  },
  description: 'Free GST-compliant invoice generator for Indian businesses. Create professional invoices, manage customers, track payments. Made in India for Indian MSMEs, freelancers, and enterprises. Start free today!',
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
    'payment tracking India'
  ],
  authors: [{ name: 'BillBooky Team' }],
  creator: 'BillBooky',
  publisher: 'BillBooky',
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
  themeColor: '#0072BC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
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
              logo: 'https://billbooky.dodail.com/logo-icon.svg',
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
      </body>
    </html>
  );
}
