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
