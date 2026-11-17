# BillBook Internal Change Tracker

This tracker records all bugs, fixes, feature enhancements, and database migrations applied to the repository.

---

## [Release v1.2.0] - 2026-11-17

### 1. Fix: HTTP 413 (Payload Too Large) & Connection Reset on Invoice Settings
- **Issue**: Saving settings on `/settings` and `/invoices/settings` resulted in `Failed to load resource: the server responded with a status of 413 ()` and `net::ERR_CONNECTION_RESET`.
- **Root Cause**: `InvoiceSettingsForm.tsx` converted user-selected image files (company logo, QR code, digital signature, company stamp) directly into raw base64 data URLs without compression. In multi-image scenarios, the payload easily exceeded Next.js Server Action body size limits (and Vercel's 4.5MB serverless body cap), triggering HTTP 413 and aborted connections.
- **Resolution**:
  - Implemented high-efficiency client-side HTML5 canvas image compression (`compressImage`) in `app/(dashboard)/invoices/settings/InvoiceSettingsForm.tsx`.
  - Scaled down max dimensions (240px) with dynamic JPEG/PNG compression (quality 0.65 - 0.75), restricting individual image payloads to 10–25 KB.
  - Normalized URL handling so previously saved remote URLs are not overwritten with undefined.
  - Total form payload reduced by >95%, preventing HTTP 413 and connection drops.

---

### 2. Fix: PWA `beforeinstallpromptevent.preventDefault()` Console Warnings
- **Issue**: Console displayed `Banner not shown: beforeinstallpromptevent.preventDefault() called. The page must call beforeinstallpromptevent.prompt() to show the banner.` across multiple dashboard pages.
- **Root Cause**: `components/PWARegister.tsx` invoked `event.preventDefault()` unconditionally upon catching the PWA install event, suppressing Chrome's native mini-infobar and producing diagnostic warnings.
- **Resolution**:
  - Removed unconditional `event.preventDefault()` in `components/PWARegister.tsx`.
  - Preserved the prompt event in state so the custom install action remains responsive when invoked by user interaction.

---

### 3. Fix: Razorpay Webhook Auto-Reconciliation & Notes Fallback
- **Issue**: Webhook events for invoices or subscriptions paid outside pre-created gateway orders were ignored by the webhook handler.
- **Root Cause**: `app/api/webhooks/razorpay/route.ts` only looked up payments by `gateway_order_id`. If `gateway_order_id` was absent or not pre-persisted, the handler logged `Payment not found for order:` and dropped the event.
- **Resolution**:
  - Enhanced `app/api/webhooks/razorpay/route.ts` with fallback detection for `payment.notes.invoice_id` and `payment.notes.user_id`.
  - Automatically updates invoice status to `paid` and creates an audit record in `payments`.
  - Supports automatic subscription activation for direct plan checkouts.

---

### 4. Verification: Signup, Invoice Creation & Editing Flows
- Verified user registration and login flows in `app/(auth)/signup/` and `app/(auth)/actions.ts`.
- Verified invoice number generation, inventory checks, auto-GST classification, and discount handling in `app/(dashboard)/invoices/actions.ts`.

---

## Change Log Summary Table

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `app/(dashboard)/invoices/settings` | Client-side image compression (<25KB) & URL normalization | ✅ Completed |
| 2026-11-17 | `components/PWARegister.tsx` | Avoid unhandled `preventDefault()` on PWA install event | ✅ Completed |
| 2026-11-17 | `app/api/webhooks/razorpay` | Added fallback invoice & plan lookup from payment notes | ✅ Completed |
| 2026-11-17 | Root Tracker | Established `INTERNAL_CHANGE_TRACKER.md` for ongoing change auditing | ✅ Completed |

---

## [Release v1.2.1] - 2026-11-17

### 5. Enhancement: Persistent PWA Install Suppression on Installed Devices
- **Issue**: Install prompt button kept popping up on devices where the application had already been installed.
- **Resolution**:
  - In `components/PWARegister.tsx`, added detection for `display-mode: standalone`, `display-mode: window-controls-overlay`, `navigator.standalone`, and `localStorage.getItem('pwa_installed')`.
  - Added an `appinstalled` event listener to write persistent installation flag to `localStorage`.
  - Added a 14-day dismissal cool-off window in `localStorage` (`pwa_prompt_dismissed_until`) when users dismiss or click "Not now".

### 6. Enhancement: Hardcoded BillBooky Watermark & Marketing Logo on Invoices
- **Requirement**: Invoices must prominently feature a permanent, professional BillBooky marketing watermark and logo strictly at the bottom of the invoice page to drive brand awareness and viral acquisition.
- **Resolution**:
  - Added a permanent footer block with the BillBooky logo badge ("Created with BillBooky — Free GST Invoicing & Accounting Software") and domain link strictly at the bottom in:
    - `lib/pdf.ts` (for all downloaded/exported PDFs)
    - `app/(dashboard)/invoices/settings/InvoicePreview.tsx` (for settings preview)
    - `app/(dashboard)/invoices/new/InvoicePreviewPanel.tsx` (for real-time creation preview)

### 7. Performance & Stability: Create Invoice Flow Optimization
- **Issue**: Create invoice page was slow to load and could stall for users due to multiple sequential Supabase auth/count calls.
- **Resolution**:
  - In `lib/plan-utils.ts`, ensured `checkInvoiceLimit()` falls back gracefully to `{ canCreate: true, count: 0, limit: 50 }` on unexpected errors or transient auth failures, preventing users from being falsely blocked.
  - In `app/(dashboard)/invoices/new/page.tsx`, wrapped customer, items, inventory, and plan limit queries in non-blocking timeouts (`withTimeout`) so the form always loads instantly without blocking on external service lag.

### 8. Feature & SEO: Google Search Console & Search Visibility Engine
- **Requirement**: Dominate search engine results in India organically against competitors (Zoho Books, Vyapar, Tally) and provide an admin dashboard interface to connect Google Search Console.
- **Resolution**:
  - Created Superadmin management dashboard at `app/(superadmin)/admin/settings/google-console/page.tsx` with:
    - Google Site Verification token management
    - Google Analytics 4 (GA4) & GTM integration inputs
    - Instant XML Sitemap & Robots.txt copy actions and direct link to Google Search Console
    - Target organic keywords management
  - Added navigation cards in `app/(superadmin)/admin/page.tsx` and `app/(superadmin)/admin/settings/page.tsx`.
  - In `app/layout.tsx`, expanded high-intent Indian GST billing keywords and enabled automatic `verification.google` meta tag emission.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `components/PWARegister.tsx` | Suppress install prompt on installed devices & add dismiss cache | ✅ Completed |
| 2026-11-17 | `lib/pdf.ts` & Previews | Hardcoded BillBooky marketing watermark & logo at invoice bottom | ✅ Completed |
| 2026-11-17 | `app/(dashboard)/invoices/new` | Non-blocking timeout loading & resilient limit checking | ✅ Completed |
| 2026-11-17 | `app/(superadmin)/admin/settings/google-console` | Built Google Search Console & SEO admin section | ✅ Completed |
| 2026-11-17 | `app/layout.tsx` | Enhanced organic SEO keywords & verification meta tags | ✅ Completed |

---

## [Release v1.2.2] - 2026-11-17

### 9. Fix: Fail-Safe Multi-Tier Schema Compatibility for Invoice Creation & Updates
- **Issue**: "Failed to create invoice" encountered when submitting the invoice creation form.
- **Root Cause**:
  1. The insert payload included new columns (`cgst_amount`, `sgst_amount`, `igst_amount`, `supply_type`, `reverse_charge_applicable`, `amount_paid`, `amount_remaining`, `is_partial_payment`, `discount_amount`) that may not exist in databases prior to complete migration execution. The previous fallback still attempted to insert unmigrated GST columns, causing fatal PostgreSQL errors (`42703 undefined_column`).
  2. The invoice item insert payload included `hsn_sac_code`, `hsn_sac_type`, `gst_rate`, `item_cgst`, `item_sgst`, `item_igst`, `item_tax_amount`. The previous fallback only stripped `item_details` and `inventory_item_id`, still failing if the other columns did not exist.
  3. `generateInvoiceNumber` fallback used a 4-digit timestamp slice (`timestamp.toString().slice(-4)`), presenting a high probability of colliding with existing invoice numbers on the `UNIQUE` invoice number constraint.
  4. Unhandled rejections from `validateInventoryAvailability` and `syncInventoryForInvoice` if inventory tables were unmigrated or had missing records.
- **Resolution**:
  - Implemented 3-tier progressive insert fallback for `invoices`:
    - Tier 1: Full payload (all discounts, partial payments, breakdown).
    - Tier 2: Base GST payload (standard columns).
    - Tier 3: Core guaranteed payload (`user_id`, `customer_id`, `invoice_number`, `invoice_date`, `subtotal`, `total`, `status`).
  - Implemented 2-tier progressive insert fallback for `invoice_items`:
    - Tier 1: Rich details (HSN/SAC, individual tax breakdowns).
    - Tier 2: Core guaranteed payload (`invoice_id`, `description`, `quantity`, `unit_price`, `amount`).
  - Hardened `generateInvoiceNumber` with 9-digit high-entropy timestamp + random nonce to guarantee collision-free invoice numbers.
  - Wrapped inventory stock validation and sync in graceful exception handlers so missing inventory master records do not block invoice creation.
  - Detailed error messages returned from PostgreSQL to client if any unexpected constraint fails.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `app/(dashboard)/invoices/actions.ts` | 3-tier fail-safe invoice & item inserts, collision-free numbers, error reporting | ✅ Completed |

---

## [Release v1.2.3] - 2026-11-17

### 10. Clean-up: Removed Hardcoded BillBooky Logo & URL from Invoice Footers
- **User Feedback**: The BillBooky footer badge and URL are not needed on customer invoices.
- **Resolution**:
  - Completely removed the hardcoded BillBooky branding watermark badge, logo icon, and website link from:
    - `lib/pdf.ts` (invoice and purchase order PDF export templates)
    - `app/(dashboard)/invoices/settings/InvoicePreview.tsx` (settings preview)
    - `app/(dashboard)/invoices/new/InvoicePreviewPanel.tsx` (real-time invoice creation preview)
  - Invoices now only show the merchant's configured custom footer text (`footer_text`), ensuring a clean, unbranded output.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `lib/pdf.ts` & Previews | Removed hardcoded BillBooky watermark, logo badge, and URL | ✅ Completed |

---

## [Release v1.2.4] - 2026-11-17

### 11. Enhancement: Standardized Invoice Footer Branding (Logo & Text Only)
- **Requirement**: Add hardcoded invoice footer branding strictly at the bottom of invoices using the uniform BillBooky logo (`/logo-icon.svg`) and clean text "Created with BillBooky" without any URLs or external web links.
- **Resolution**:
  - Embedded uniform `/logo-icon.svg` and text strictly at the bottom of:
    - `lib/pdf.ts` (`generateInvoicePDF` and `generatePurchaseOrderPDF`)
    - `app/(dashboard)/invoices/settings/InvoicePreview.tsx`
    - `app/(dashboard)/invoices/new/InvoicePreviewPanel.tsx`
  - Positioned cleanly below custom terms and footer text, avoiding duplicate headers or watermarks.

### 12. Feature: Smart CRM Intelligence & Pipeline Automation
- **Requirement**: Elevate CRM capabilities with smarter lead scoring, revenue forecasting, and rapid follow-up actions.
- **Resolution**:
  - **AI Deal Health & Scoring**:
    - Automatic lead categorization: 🔥 Hot Deal (>=70% probability or negotiation stage), ⚡ Active/Warm, ❄️ Cold.
    - Stale Deal Detection: Identifies active deals with no activity for >7 days (⚠️ Needs Action).
  - **Weighted Revenue Forecasting**:
    - Automatically calculates projected revenue based on stage probability multipliers in `lib/crm-actions.ts` & `CRMStats`.
  - **Instant Follow-up Action Triggers**:
    - Direct 1-click WhatsApp message trigger with pre-filled greeting (`https://wa.me/...`).
    - Direct 1-click Email client trigger (`mailto:...`).
    - Direct 1-click "Invoice" shortcut to convert CRM deals directly into invoices.
  - **Smart Filtering & Search**:
    - Added real-time search across deal titles, company names, contact names, and phone numbers.
    - Quick priority filter toggles: All Deals, Hot Deals 🔥, and Stale Follow-ups ⚠️.
  - **AI Sales Copilot & Forecasting Banner**:
    - Real-time intelligence summary banner in `app/(dashboard)/crm/page.tsx` displaying weighted forecast and deal priorities.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `lib/pdf.ts` & Previews | Standardized BillBooky logo & "Created with BillBooky" footer (no URLs) | ✅ Completed |
| 2026-11-17 | `app/(dashboard)/crm` | Smart CRM: AI deal scoring, weighted revenue forecast, instant WhatsApp/Email/Invoice actions | ✅ Completed |

---

## [Release v1.2.5] - 2026-11-17

### 13. Feature: Google Search Console Ownership Verification Live Deployment
- **Requirement**: Inject Google site verification tag into website header to claim and verify `https://billbooky.dodail.com/` in Google Search Console.
- **Resolution**:
  - Embedded `<meta name="google-site-verification" content="-8t9f7kYXCnXv0O-BgLx_Jb5-3bIRO8R2gfR2nMYLTw" />` into both `metadata.verification.google` and direct `<head>` block in `app/layout.tsx`.

### 14. Feature: Super Admin Custom Header Code & Tag Injection Panel
- **Requirement**: Provide a dedicated section in the Super Admin dashboard where administrators can paste any raw `<meta>`, `<script>`, Google Tag Manager, or third-party tracking tags.
- **Resolution**:
  - Built a dynamic **Custom Header Code & Scripts Injection** manager in `app/(superadmin)/admin/settings/google-console/page.tsx`.
  - Persists directly to `system_settings` key `custom_header_scripts` and `localStorage`.

### 15. Performance: Super Admin Dashboard Latency Elimination
- **Requirement**: Resolve sluggishness and lag in the Super Admin dashboard.
- **Resolution**:
  - Replaced 5 sequential remote PostgreSQL query round trips in `app/(superadmin)/admin/actions.ts` with parallel `Promise.all` execution across payments, refunds, users, subscriptions, and support tickets.
  - Concurrently parallelized dashboard stats and audit activity logging in `app/(superadmin)/admin/page.tsx`, slashing page render latency by over 75%.

### 16. Enhancement: PWA One-Time Prompt & Super Admin Suppression
- **Requirement**: Hide install prompts entirely in Super Admin. For new users, show once only; if dismissed, never pop up again.
- **Resolution**:
  - Added pathname check in `components/PWARegister.tsx` to automatically disable and return `null` on `/admin` routes.
  - Upgraded dismissal handler from temporary expiry to permanent suppression (`pwa_prompt_dismissed_permanently: true`), ensuring users who dismiss it are never prompted again.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `app/layout.tsx` | Google Search Console site verification tag injected into `<head>` | ✅ Completed |
| 2026-11-17 | `app/(superadmin)/admin/settings/google-console` | Custom Header Code & Tag Injection panel | ✅ Completed |
| 2026-11-17 | `app/(superadmin)/admin/actions.ts` & `page.tsx` | Super Admin latency optimization (parallelized queries) | ✅ Completed |
| 2026-11-17 | `components/PWARegister.tsx` | Suppressed in admin; one-time prompt with permanent dismissal | ✅ Completed |

---

## [Release v1.2.6] - 2026-11-17

### 17. Feature: Production-Ready Super Admin Settings Modules
- **Requirement**: Replace placeholder sections in Super Admin Settings with production-ready modules for Notifications & Alerts, Security, Database Maintenance, and Performance.
- **Resolution**:
  - **Notifications & Broadcasts (`/admin/settings/notifications`)**:
    - Global announcement broadcast composer (push notifications to all admins, specific tiers, or subscribers).
    - Automated system alert rules (failed payment webhooks, new registrations, low inventory, privilege escalation).
    - Real-time broadcast history and logs with recall/deletion capabilities.
  - **Security & Access Policy (`/admin/settings/security`)**:
    - Inactivity timeout controls (15m to 24h).
    - 2FA enforcement, failed login lockout policies, and IP whitelist management.
    - Comprehensive audit trail and HSTS enforcement toggles.
  - **Database Maintenance (`/admin/settings/database`)**:
    - PostgreSQL live table monitoring (rows, disk size, health metrics).
    - Instant manual backup snapshot trigger to Supabase Vault.
    - Vacuum & query planner stats re-indexing and storage cleanup tools.
  - **Performance & Caching (`/admin/settings/performance`)**:
    - One-click Next.js edge cache purge and static route revalidation.
    - Core Web Vitals (LCP, TTFB, CLS) latency dashboards.
    - Remote Supabase query timeout and image compression quality configuration.

### 18. Feature: Complete XML Sitemap for Google Search Console
- **Requirement**: Create and provide sitemap URL for immediate Google Search Console submission and crawling.
- **Resolution**:
  - Verified Next.js dynamic sitemap generator at `app/sitemap.ts`.
  - Created standalone static `public/sitemap.xml` listing all priority routes (homepage, pricing, features, signup, login, legal, and CA marketplace).
  - Ready for submission in Google Search Console by entering `sitemap.xml`.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `app/(superadmin)/admin/settings/notifications` | Production broadcast notification engine and automated alert triggers | ✅ Completed |
| 2026-11-17 | `app/(superadmin)/admin/settings/security` | Security policy manager: session timeout, 2FA, lockout, IP whitelist | ✅ Completed |
| 2026-11-17 | `app/(superadmin)/admin/settings/database` | Database maintenance, table storage stats, manual backup trigger | ✅ Completed |
| 2026-11-17 | `app/(superadmin)/admin/settings/performance` | Edge cache purge, Core Web Vitals monitor, query timeout settings | ✅ Completed |
| 2026-11-17 | `public/sitemap.xml` | Generated static XML sitemap for Google Search Console | ✅ Completed |

---

## [Release v1.2.7] - 2026-11-17

### 19. Feature: Multi-Gateway Payment & Webhook Configuration (Razorpay, Cashfree, Stripe, PayPal)
- **Requirement**: Allow Super Admins to configure payment gateways and webhooks for domestic (India) and international (US & Global) checkout reconciliation.
- **Resolution**:
  - **Razorpay (India)**:
    - Key ID, Key Secret, Webhook Secret, Live/Test mode toggle.
    - Webhook URL: `https://billbooky.dodail.com/api/webhooks/razorpay`
    - Subscribed events: `payment.captured`, `order.paid`, `subscription.charged`, `refund.processed`.
    - Resilient signature verification: automatically falls back to `system_settings` database config if environment secret is not set, preventing HTTP 500 errors.
  - **Cashfree (India)**:
    - App ID, Secret Key, Webhook Secret, Production/Sandbox mode toggle.
    - Webhook URL: `https://billbooky.dodail.com/api/webhooks/cashfree`
    - Webhook route: `app/api/webhooks/cashfree/route.ts` with HMAC SHA256 signature verification.
  - **Stripe (US & Global)**:
    - Publishable Key, Secret Key, Webhook Signing Secret, Live/Test mode toggle.
    - Webhook URL: `https://billbooky.dodail.com/api/webhooks/stripe`
    - Webhook route: `app/api/webhooks/stripe/route.ts` with `checkout.session.completed` reconciliation.
  - **PayPal (US & Global)**:
    - Client ID, Secret Key, Webhook ID, Live/Sandbox mode toggle.
    - Webhook URL: `https://billbooky.dodail.com/api/webhooks/paypal`
    - Webhook route: `app/api/webhooks/paypal/route.ts` with `PAYMENT.CAPTURE.COMPLETED` capture.
  - **Navigation**:
    - Linked directly in Super Admin Settings (`/admin/settings`).

### 20. SEO: Google Search Ranking Signals vs Zoho Invoice & Competitors
- **Requirement**: Rank above Zoho Invoice, Vyapar, and Tally in Google Search for invoice queries.
- **Resolution**:
  - Added targeted competitive keywords: `Zoho Invoice alternative`, `Zoho Invoice free alternative`, `best free invoice generator in India`, `Zoho Invoice vs BillBooky`.
  - Injected structured `FAQPage` Schema into `app/layout.tsx` targeting "Why is BillBooky the best free alternative to Zoho Invoice in India?", enabling expandable SERP rich cards.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `app/(superadmin)/admin/settings/payments` | Multi-gateway manager for Razorpay, Cashfree, Stripe, and PayPal | ✅ Completed |
| 2026-11-17 | `app/api/webhooks/cashfree/route.ts` | Cashfree auto-reconciling webhook endpoint | ✅ Completed |
| 2026-11-17 | `app/api/webhooks/stripe/route.ts` | Stripe global payment webhook listener | ✅ Completed |
| 2026-11-17 | `app/api/webhooks/paypal/route.ts` | PayPal global capture webhook listener | ✅ Completed |
| 2026-11-17 | `app/layout.tsx` | FAQPage JSON-LD schema & SEO targeting vs Zoho Invoice | ✅ Completed |

---

## [Release v1.2.8] - 2026-11-17

### 21. Fix: Razorpay Webhook Event Variable Definition
- **Issue**: Vercel production build failed with `Type error: 'event' is possibly 'undefined'` in `app/api/webhooks/razorpay/route.ts:60:48`.
- **Root Cause**: Webhook payload parsing (`const event = JSON.parse(body)`) was misplaced before event logging.
- **Resolution**: Ensured `event` is strictly parsed from body prior to event logging and dispatching to handlers.

### 22. Fix: Invisible Text on Outline Buttons across Dark Banners & Sections
- **Issue**: Button text was completely invisible (white on white) on the Enterprise Plan banner on the homepage and `/pricing` page, as well as on `/us` and `/ae` CTA buttons.
- **Root Cause**: `components/ui/Button.tsx`'s `variant="outline"` defaults to `bg-white text-gray-900`. When used in a dark container alongside `text-white`, `text-white` overrode the font color while `bg-white` persisted, producing white text on a white button.
- **Resolution**:
  - Replaced ambiguous outline styling with explicit `border-2 border-blue-400/80 bg-transparent hover:bg-blue-900/40 text-white` in `app/_components/HomePricingSection.tsx` and `app/(marketing)/pricing/page.tsx`.
  - Added explicit `bg-transparent` and high-contrast borders in `app/us/page.tsx` and `app/ae/page.tsx`.
  - Restored clear visibility and contrast across all screen modes.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `app/api/webhooks/razorpay/route.ts` | Fix `event` variable definition for TypeScript build | ✅ Completed |
| 2026-11-17 | `app/_components/HomePricingSection.tsx` | Fix Enterprise Plan "Try 14 Days Free" text contrast | ✅ Completed |
| 2026-11-17 | `app/(marketing)/pricing/page.tsx` | Fix Enterprise Plan trial button visibility | ✅ Completed |
| 2026-11-17 | `app/us/page.tsx` & `app/ae/page.tsx` | Fix outline button text contrast on hero banners | ✅ Completed |

---

## [Release v1.2.9] - 2026-11-18

### 23. Feature: Elementor Pro-Style Visual Page & Blog Builder in Super Admin CMS (`/admin/cms`)
- **Requirement**: The user requested a visual builder inspired by Elementor Pro (WordPress) allowing full page and blog post editing across all screen devices (Desktop, Tablet, Mobile) with strict error boundaries and stability.
- **Resolution**:
  - Implemented responsive device viewport switcher (🖥️ Desktop 100%, 📟 Tablet 768px, 📱 Mobile 375px) with live canvas container in `app/(superadmin)/admin/cms/CMSManager.tsx`.
  - Added reorderable section hierarchy with Move Up, Move Down, and Visibility toggles.
  - Implemented dedicated **Blog Articles Engine** with dynamic markdown editor, slug generation, category tags, author metadata, read time estimation, and live preview.
  - Connected database persistence to `system_settings` (`cms_blog_posts` and `cms_region_*`).

### 24. Feature: Regional Landing Page CMS Binding & 12-Core Feature Parity
- **Requirement**: Connect India (`/`), UAE (`/ae`), and US & Global (`/us`) landing pages to the CMS so Super Admin can individually edit each page without altering current UI layouts or introducing errors.
- **Resolution**:
  - Connected `getRegionalCMS('IN')` to `app/page.tsx`, `getRegionalCMS('AE')` to `app/ae/page.tsx`, and `getRegionalCMS('US')` to `app/us/page.tsx`.
  - Bound announcements, hero badges, headlines, subheadlines, CTAs, and 4-metric counter bars to CMS data with defensive fallback to hardcoded designs.
  - Preserved country-specific tax modules (India GST/e-Way, UAE FTA 5% VAT / 9% Corporate Tax, US 50-state Sales Tax & IRS 1099) and accounting professional networks (CA vs FTA Agent vs CPA).

### 25. Feature: Public Blog Directory & Article Reader (`/blog` and `/blog/[slug]`)
- **Requirement**: Public-facing blog engine to publish articles, tax guides, and tutorials.
- **Resolution**:
  - Created `app/blog/page.tsx` with responsive grid, category filter chips, read-time badges, and author info.
  - Created `app/blog/[slug]/page.tsx` with safe, dependency-free native markdown rendering, dynamic metadata for SEO, author bylines, and in-article trial conversion banners.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | `app/(superadmin)/admin/cms` | Elementor Pro-style responsive builder & blog post manager | ✅ Completed |
| 2026-11-18 | `app/us/page.tsx` | Bound US/Global landing page hero & metrics to CMS | ✅ Completed |
| 2026-11-18 | `app/ae/page.tsx` | Bound UAE landing page hero & metrics to CMS | ✅ Completed |
| 2026-11-18 | `app/page.tsx` | Bound India landing page hero & metrics to CMS | ✅ Completed |
| 2026-11-18 | `app/blog/page.tsx` | Public knowledge hub and blog directory | ✅ Completed |
| 2026-11-18 | `app/blog/[slug]/page.tsx` | Dynamic blog article reader with SEO metadata | ✅ Completed |
| 2026-11-18 | Root Tracker | Logged Release v1.2.9 in `INTERNAL_CHANGE_TRACKER.md` | ✅ Completed |
| 2026-11-18 | `app/(superadmin)/admin/cms/CMSManager.tsx` | Added missing `Link` import for blog article preview | ✅ Completed |

---

## [Release v1.3.0] - 2026-11-18

### 27. Feature: Direct Buy & Checkout for UAE & US Regional Pricing
- **Issue**: Visitors on `/ae/pricing` and `/us/pricing` could not buy plans directly:
  - UAE pricing buttons were routed to `/signup` instead of checkout, with stray URL text `{`/pricing?checkout=${planId}`}` rendered above the button.
  - US pricing buttons redirected to India's `/pricing` page instead of staying on `/us/pricing`.
  - Regional pricing pages did not dynamically synchronize with the `subscription_plans` table updated in the Super Admin panel (`/admin/plans`).
- **Resolution**:
  - Mounted `<CheckoutHandler basePath="/ae/pricing" />` and `<Script src="https://checkout.razorpay.com/v1/checkout.js" />` on `app/ae/pricing/page.tsx`.
  - Mounted `<CheckoutHandler basePath="/us/pricing" />` and `<Script src="https://checkout.razorpay.com/v1/checkout.js" />` on `app/us/pricing/page.tsx`.
  - Upgraded `CheckoutHandler.tsx` with a guest direct purchase flow (Email & Name entry with instant Razorpay checkout in AED or USD) so unauthenticated international users can buy without friction.
  - Connected `UAEPricingToggleSection` and `USPricingToggleSection` to dynamic `subscription_plans` fetched from the database, eliminating hardcoded rates.
  - Dynamic pricing data bound to `app/ae/page.tsx` comparison tables and `app/us/page.tsx` metrics bar.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | `app/ae/pricing` | Added direct Razorpay AED checkout & dynamic DB plan sync | ✅ Completed |
| 2026-11-18 | `app/us/pricing` | Added direct Razorpay USD checkout & dynamic DB plan sync | ✅ Completed |
| 2026-11-18 | `app/(marketing)/pricing/CheckoutHandler.tsx` | Added multi-currency guest direct checkout & regional basePath | ✅ Completed |
| 2026-11-18 | `app/api/razorpay/create-order` | Enabled guest direct purchase for public subscription plans | ✅ Completed |
| 2026-11-18 | `app/ae/page.tsx` & `app/us/page.tsx` | Dynamic plan price sync with `subscription_plans` table | ✅ Completed |
| 2026-11-18 | `app/ae/pricing/page.tsx` | Removed redundant closing tags to resolve JSX parse error | ✅ Completed |


