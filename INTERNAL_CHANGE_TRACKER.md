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
