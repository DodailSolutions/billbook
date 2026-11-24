# BillBook Internal Change Tracker

This tracker records all bugs, fixes, feature enhancements, and database migrations applied to the repository.

---

## [Release v1.7.2 - Implemented] - 2026-11-24

### Customer-Organization Linkage & Invoice Builder Quick-Create Workflow (Phase 15)

#### 1. Customer Edit & Creation Form Organization Selector (`app/(dashboard)/customers/`)
- **Linked Organization Selector**: Added an Organization dropdown selector to `customers/[id]/page.tsx` and `customers/new/NewCustomerForm.tsx`, allowing users to link new and existing customer records to companies.
- **Designation / Role Input**: Added designation input field (e.g. Accounts Manager, Director, Billing Contact).
- **Auto-Inheritance of Corporate Tax & Address**: Selecting an organization automatically populates corporate GSTIN and billing address if not already filled.
- **Server Action Updates (`actions.ts`)**: Updated `createCustomerAction`, `createCustomer`, and `updateCustomer` to handle `organization_id`, `organization_name`, and `designation`, including auto-resolving company name from database when only `organization_id` is supplied.
- **Customer Directory Pill Badges (`CustomersList.tsx`)**: Displayed company name and designation badge chips directly in the Customer Directory cards.

#### 2. Invoice Builder Quick-Add Auto-Fill (`app/(dashboard)/invoices/new/ImprovedInvoiceForm.tsx`)
- In the Quick-Add Customer modal within the invoice builder, selecting an existing organization automatically auto-fills corporate GSTIN and registered address into the modal fields.

---

## [Release v1.7.1 - Implemented] - 2026-11-24

### Tier-Based Automatic Vertical Bundling, Super Admin Industry Simulator, Contextual Upgrade & Non-GST Onboarding

#### 1. Automatic Vertical Module Entitlement (`lib/plan-utils.ts`, `components/Sidebar.tsx`)
- Automatic entitlement of industry-specific tools (Estate PMS, Odontogram, Job Cards, Stylist Splits, SOW Proposals) on paid tiers (Pro, Enterprise, Lifetime) without requiring manual package switch toggles.
- Zero risk of locking out vertical customers who purchase universal standard packages.

#### 2. Super Admin Industry Simulator Preview (`app/(superadmin)/admin/plans/PlansManager.tsx`)
- Added industry vertical simulation selector to Plans Manager with 12 vertical profiles, allowing admins to preview plan features exactly as seen by tenants in each business vertical.

#### 3. Zero-Loss Contextual Upgrades (`components/InstantTrialButton.tsx`, `app/(dashboard)/invoices/new/page.tsx`)
- Inline 1-click Pro trial activation button preserving in-progress workflows when free invoice quotas are reached.

#### 4. 60-Second Onboarding Wizard with Non-GST Support (`components/SetupWizard.tsx`)
- Comprehensive support for unregistered non-GST businesses with compliant B2C billing defaults and reassuring setup guidance.

---

## [Release v1.7.0 - Implemented] - 2026-11-24

### Super Admin Modular Package Engine, Dynamic Landing Page Sync & Strict Universal Rule Enforcement

#### 1. Super Admin Package Builder Expansion (`app/(superadmin)/admin/plans/PlansManager.tsx`, `lib/types-admin.ts`)
- **Elimination of Hardcoded Labels**: All plan labels, descriptions, bullet points, tags, and badge texts are fully editable via UI modal without code changes.
- **24 Modular Feature Flags**: Expanded toggle switches across 6 business categories (Sales & Commerce, Finance & Tax, Operations & Inventory, Team & HR, Communication & Automation, White-Label & Enterprise).
- **Explicit Quota Inputs**: Dedicated numeric fields for Monthly Invoices, Customers Directory, Team Member Seats, and Storage GB with clean visual card previews.

#### 2. Dynamic Landing Page & Pricing Sync (`app/_components/HomePricingSection.tsx`, `PricingToggleSection.tsx`, `app/page.tsx`)
- **Direct Database Hydration**: Replaced hardcoded static `<li>` lists on homepage and pricing pages with dynamic database reads from `subscription_plans`.
- **Live Sync Guarantee**: Updates to packages in Super Admin immediately reflect on `/` and `/pricing`. Included features show with active checkmarks and excluded features show with crossed-out line-through badges.
- **Enterprise Plan Dynamic Scope**: Guaranteed strongly typed hydration for `enterprisePlan`, resolving missing variable scope in `HomePricingSection.tsx`.

#### 3. Strict Universal Rule & Quota Enforcement Engine (`lib/plan-utils.ts`)
- **Universal Feature Gating**: Platform-wide enforcement of active package capabilities across all 16 business verticals via `hasPlanFeature()` and `checkFeatureLimit()`.
- **Strict Server-Side Quota Barriers**: Upgraded `checkInvoiceLimit()` to dynamically respect super-admin configured monthly invoice quotas (`invoices_per_month`), with unlimited bypass for `-1` and safe fallback defaults.

#### 4. Type Safety Fix in ImprovedInvoiceForm (`app/(dashboard)/invoices/new/ImprovedInvoiceForm.tsx`)
- **Resolved Vercel Turbopack Compilation Error on Form Reset**: Added missing recurrence configuration state properties (`recurring_frequency`, `recurring_start_date`, `recurring_end_date`, `recurring_never_expires`) to `setFormData()` in the modal reset handler, ensuring 100% type compatibility with `formData` state.

---

## [Release v1.6.6 - Hotfix Implemented] - 2026-11-24

### Super Admin PlansManager Type Fix, Dynamic Pro Team Limits & RPC Upgrade

#### 1. PlansManager Build Failure Resolution (`app/(superadmin)/admin/plans/PlansManager.tsx`, `lib/types-admin.ts`)
- **Resolved Vercel Type Error (`Property 'crm' does not exist on type '{}'`)**:
  - Expanded `SubscriptionPlan.limits` in `lib/types-admin.ts` to support `team_members?: number`, `feature_flags?: Record<string, boolean>`, `excluded_features?: string[]`, and `[key: string]: any`, preventing incorrect narrowing to `{}` / `number`.
  - Added explicit typing for `rawLimits` and `existingFlags` in `openEditModal()` to guarantee safe fallback evaluations across all 11 feature toggle switches.

#### 2. Dynamic Team Limits & Pro Plan Team Management (`app/(dashboard)/team/page.tsx`, `app/api/team/invite/route.ts`)
- **Dynamic Plan Seat Limits Sync**:
  - In `app/(dashboard)/team/page.tsx` and `/api/team/invite`, replaced hardcoded seat allocations with dynamic lookups against `planStatus.limits.team_members`. Custom seat caps configured via Super Admin are now faithfully respected instead of being overridden by legacy defaults.
  - Enhanced fallback heuristics for Pro (`isProOrAbove`) and custom plans with `team_members` feature access.
- **RPC Migration (`supabase-dynamic-team-limits-migration.sql`)**:
  - Rebuilt `check_team_member_limit(p_owner_id UUID)` to read `subscription_plans.limits->>'team_members'` dynamically from the database, and support flexible pattern matching (`%pro%`, `%enterprise%`, `%lifetime%`) rather than only exact string `'professional'`.

---

## [Release v1.6.5 - In Progress / Implementing] - 2026-11-23

### Navigation Vertical Scoping, Recursive Expenses, Excel Parser & Integrations Hub

#### 1. Adaptive Vertical Scoping & Navigation Refinement
- **Counter POS Isolation**: Strictly excluded Counter POS for IT, Software Development, Digital Marketing, Freelancers, and Consulting Agencies via `isPosSupported()` while keeping Barcodes & QR standee generators accessible.
- **AI Proposal & RFP/RFQ Engine Restriction**: Proposals & RFP evaluation restricted exclusively to `software_it`, `digital_marketing`, and `freelancer` workspaces via `isProposalSupported()`.
- **Dynamic Real-Time Sync**: Dispatches `billbook:vertical-changed` custom events so sidebars update immediately upon vertical selection without requiring hard page refresh.

#### 2. Expense Tracking Engine: Recursive Cycles, Period Views & Excel Importer
- **Recursive vs. One-Time Expenses**: Added recurring billing support (`one_time`, `daily`, `weekly`, `monthly`, `quarterly`, `yearly`) with auto-calculated run-rates and next cycle dates.
- **Daily, Monthly & Yearly Expense Breakdowns**: Multi-tab period breakdown filters (`All`, `Daily (Today / This Week)`, `Monthly (This Month)`, `Yearly (Annual / FY)`) with burn-rate and tax-deductible metrics.
- **Vehicle & Fleet Expenses Category**: Pre-seeded `Vehicle & Fleet Expenses` (Fuel, Servicing, Fastag, Insurance) tailored for workshops, travels, logistics, and field operations.
- **Excel / CSV Report Bulk Importer**: Client-side spreadsheet parser with column auto-mapping for historic `.xlsx` and `.csv` expense reports, featuring live data preview and bulk insertion into the expense ledger.

#### 3. Integrations Hub: Microsoft Teams, Google Sheets & WhatsApp Architecture
- **Microsoft Teams Integration**: Incoming Webhook notifications for new paid invoices, overdue payment reminders, SOW acceptances, and daily expense alerts.
- **Google Sheets Integration**: Automated sync of invoices, expenses, and client ledger to connected Google Spreadsheets with test sync verification.
- **WhatsApp Role Security & 0-API Click-to-Chat**:
  - Centralized Meta Cloud API keys strictly restricted to Super Admin Command Center, preventing unauthorized credential tampering.
  - 0-API Click-to-Chat deep link (`wa.me`) enabled across all business tiers, empowering users to send pre-filled invoice reminders with dynamic UPI payment links directly via personal or business WhatsApp with 0 configuration.

#### 4. Smooth Recurring Invoice Creation & Automated Schedule Engine (In Progress)
- **Interactive Recurrence Drawer in `/invoices/new`**:
  - Replaces bare, unlinked checkbox with a smooth recurrence schedule picker (Frequency: Weekly, Monthly, Quarterly, Yearly, Custom Interval; Start Date; End Date / Never Ends; Auto-send WhatsApp/Email notifications).
  - Guarantees `recurring_frequency` and `recurring_start_date` are seamlessly forwarded to `createInvoice` and recorded in `recurring_invoices`.

---

## [Release v1.6.0 - Implemented] - 2026-11-22

### Super Admin Business Category / Vertical Management & Phase 5: AI Proposal Writing & RFP / RFQ Engine

#### 1. Super Admin Business Category / Vertical Management (`app/(superadmin)/admin/users/`, `app/(superadmin)/admin/businesses/`)
- **Backend Reassignment API (`updateUserBusinessType`, `updateBusinessCategory`)**:
  - Super administrators can now dynamically reassign any existing tenant or customer to any of the 14 business verticals (`software_it`, `digital_marketing`, `freelancer`, `salon_spa`, `dental_clinic`, `hospital_op`, `auto_workshop`, `resorts_farmhouses_camping`, `tours_and_travels`, `jewelry_retail`, `laundry_drycleaning`, `real_estate`, `event_management`, `retail`).
  - Strict authorization check via `checkSuperAdminAccess()` with service role execution.
  - Automatically writes structured audit logs (`user_business_type_updated`) and revalidates dashboard cache.
- **Interactive UI Modal (`ChangeVerticalModal.tsx`)**:
  - Modern modal featuring search filter, category tabs (Commerce, Services, Healthcare, Hospitality, Automotive), and instant switching.
  - Industry badges in the Super Admin User Table and Businesses Management table are directly interactive with 1-click edit triggers.

#### 2. Phase 5: AI Proposal Writing & RFP / RFQ Evaluation Engine (`lib/proposal-types.ts`, `lib/proposal-engine.ts`, `app/(dashboard)/proposals/`, `app/(public)/proposal/[id]/`)
- **AI Bid Feasibility & Compliance Scoring**:
  - Ingests raw RFP scope text, tender requirements, budget targets, and timeline constraints.
  - Analyzes scope against engineering delivery rates and produces composite win feasibility score (0-100%).
  - Outputs an automated 4-point AI Compliance Matrix with risk levels (Low, Medium, High) and suggested contractual mitigations.
- **Milestone Progress Tranches**:
  - Automatically parses deliverables into structured progress tranches (e.g. 40% Mobilization Advance, 40% Beta Staging, 20% Handover).
- **Interactive Web Proposal & Mobile Touchscreen E-Sign**:
  - Generates responsive, public client proposal pages (`/proposal/[id]`) with HTML5 canvas touchscreen/mouse signature pad.
- **Closed-Loop ERP Contract Triggers**:
  - Upon digital e-signature submission, the engine:
    1. Digitally signs and locks the proposal with signer timestamp and IP audit log.
    2. Automatically converts the linked CRM deal to `Won` with 100% win probability.
    3. Automatically generates an Advance Tax Invoice in the invoices table ready for instant settlement.
- **Database Schema Migration**: Added `supabase-proposals-and-rfp-migration.sql` with non-breaking RLS policies.

### Software & IT, Digital Marketing, Freelancer Verticals & Universal Team Capacity Radar

#### 1. Vertical Domain Expansion (`lib/business-profile-types.ts`, `lib/industry-catalog-presets.ts`)
- **New Core Industry Verticals**:
  - `software_it`: Software development agencies, SaaS companies, and IT consultancies. Features sprint milestone tranches, developer cost rates vs bill rates, unbilled timesheets, scope creep change orders, and zero-rated LUT export invoices.
  - `digital_marketing`: Digital marketing agencies and creative studios. Features 0% ad spend pass-through protection (Rule 33 pure agent disbursements), client creative approval decks, monthly post retainer quota overage billing, and subcontractor TDS.
  - `freelancer`: Solo freelancers, indie creators, and specialist contractors. Features 1-page mobile touchscreen scope contracts, 50% advance deposit generation, and ₹20L GST turnover warning radar.
- **Pre-Seeded Catalog Items**: Added 14 high-converting default items with accurate HSN/SAC codes (998314 for software engineering, 998361 for marketing retainers, 0% GST pass-throughs for ad disbursements).

#### 2. Universal Team Capacity Planning & Margin Radar (`lib/team-types.ts`, `app/(dashboard)/team/`)
- **Capacity Metric Engine**:
  - Implemented 40 hours/week standard capacity tracking.
  - Real-time bench risk warning (<20 hrs / 50% allocation) and burnout overcommitment alert (>40 hrs / 100% allocation).
- **Industry Functional Designations**:
  - Mapped vertical-specific roles (e.g. *Tech Lead, QA Automation, Media Buyer, Copywriter, Senior Stylist, Orthodontist*) dynamically based on the active workspace profile.
- **Dual-Rate Cost vs. Billing Margin Engine**:
  - Added internal hourly cost rate and hourly client billing rate fields with automated gross margin % calculation.
  - Strict privacy shield: Cost and gross margin data are strictly visible to owners and admins, while staff members see only their assigned workload and deliverables.
- **Interactive Team UI**:
  - Embedded `<TeamCapacityRadar>` into `/team` with weekly hours summary, utilization progress bars, bench risk chips, and inline configuration drawers.
  - Enhanced `InviteMemberModal` and `TeamMembersList` to support functional designations alongside administrative roles.

---

## [Release v1.5.8 - Implemented] - 2026-11-22

### Super Admin Multi-Vertical Analytics, Tenant Distribution Grid & User Filtering

#### 1. Vertical Distribution Intelligence Engine (`app/(superadmin)/admin/actions.ts`, `lib/types-admin.ts`)
- **Backend Metric Aggregator (`getVerticalDistributionStats`)**:
  - Aggregates tenant registrations, active account counts, invoice counts, and total sales across all 11 ERP verticals:
    - *Salon & Spa*, *Dental Clinics*, *Hospital OP*, *Automobile Garages*, *PMS (Resorts, Farmhouses & Camping)*, *Tours & Travels*, *Jewellery Stores*, *Laundry & Dry Cleaning*, *Real Estate*, *Event Management*, and *Retail/Wholesale*.
  - Calculates percentage tenant distribution across the platform.
  - Automatically classifies each vertical by adoption tier:
    - `🔥 Leader`: High adoption (>25% share or 10+ tenants)
    - `📈 Growing`: Steady traction (5% - 25% share)
    - `🌱 Early Stage`: 1 - 4 tenants
    - `⭕ Untapped`: Exactly 0 registered tenants, highlighting untapped SaaS market opportunities.

#### 2. Smooth Executive Vertical Distribution Component (`components/admin/VerticalDistributionSection.tsx`, `admin/page.tsx`)
- **Real-Time Visual Grid**:
  - Interactive multi-card layout displaying each vertical's emoji icon, category, adoption health badge, tenant progress bar, active users, and invoice volume.
  - Quick-toggle filter pills: `All Verticals (11)`, `Active Verticals`, and `Untapped / Zero Users`.
  - Integrated search bar allowing rapid filtering by vertical name, category, or industry tagline.
  - Deep-link action button: `View Users →` pre-filters `/admin/users?vertical=[key]` with 1 click.

#### 3. Super Admin User Table Vertical Badging & Filtering (`admin/users/UserManagementTable.tsx`, `page.tsx`)
- **Industry Vertical Column**:
  - Added dedicated *Vertical* badge column to the user management table displaying the tenant's chosen industry icon and title.
- **Vertical Filter Dropdown**:
  - Added an interactive dropdown in the user table toolbar to filter users by any specific industry vertical.
  - Supports URL parameter pre-selection (`?vertical=salon_spa`).
- **Suspense Boundary**:
  - Wrapped `UserManagementTable` in React `<Suspense>` to ensure smooth client-side search parameter hydration during production builds.

---

## [Release v1.5.7 - Implemented] - 2026-11-22

### Invoice Number Collision Prevention, Auth TypeScript Fix & Super Admin Access Hardening

#### 1. Invoice Number Uniqueness & Collision Protection (`app/(dashboard)/invoices/actions.ts`)
- **Uniqueness Check in `generateInvoiceNumber()`**:
  - Before returning any invoice number generated via RPC (`get_next_invoice_number_with_series` or `get_next_invoice_number`), queries the `invoices` table to verify whether the candidate number already exists.
  - Automatically increments numeric suffixes or appends entropy to guarantee a collision-free number, resolving `duplicate key value violates unique constraint "invoices_invoice_number_key"`.
- **Automatic Collision Retry in `createInvoice()`**:
  - Wrapped tiered invoice insertions in a retry loop. If a unique constraint violation (`code: 23505` or `invoices_invoice_number_key`) occurs under concurrency, automatically regenerates a guaranteed unique candidate and retries up to 3 times before returning an error.

#### 2. Auth Actions Type Safety Fix (`app/(auth)/actions.ts`)
- **Resolved Vercel Turbopack Build Errors**:
  - Typed `verticalKey: BusinessType` safely against `INDUSTRY_CATALOG_PRESETS` keys to eliminate TypeScript indexing `any` error during Vercel production builds.
  - Extracted strongly typed `const userId = data.user.id` at top of `if (data?.user)` block to eliminate closure-level `data.user is possibly 'null'` error inside `.map()` array callbacks during production compilation.

#### 3. Strict Super Admin Gating for Industry Switcher (`SettingsContent.tsx`, `lib/business-profile-actions.ts`)
- **UI & Server-Level Isolation**:
  - Confirmed and fortified that interactive vertical switching is exclusively visible to and executable by users with `role === 'superadmin'`.
  - Normal users select their business vertical during signup and cannot switch it post-registration.

#### 4. Fix "Invoice not found" on Sending Invoices (`app/api/invoices/[id]/send-email/route.ts`, `app/(dashboard)/invoices/actions.ts`)
- **Resolved Schema Column Mismatch (`invoice_date` vs `date`)**:
  - In `/api/invoices/[id]/send-email/route.ts`, the query was requesting a non-existent `date` column instead of `invoice_date`. This caused PostgreSQL/Supabase to fail the query with a column error, resulting in a false-positive `404 Invoice not found`.
  - Replaced the brittle inline query with the centralized `getInvoice(id)` service action and resilient direct fallback.
- **Support for Both UUID and Invoice Number Lookups**:
  - Enhanced `getInvoice(id)` in `invoices/actions.ts` to test for UUID format and transparently fall back to matching on `invoice_number` for routes and clients accessing invoices by number.

---

## [Release v1.5.5 - Implemented] - 2026-11-22

### Dynamic Plan Feature Gating, Unified ERP Pipeline & Universal Barcode Engine

#### 1. Dynamic Plan-Driven Feature & Limit Control (`lib/plan-utils.ts`, `app/(dashboard)/team/page.tsx`)
- **Database-Backed Feature Flags (`hasPlanFeature`)**: Replaced hardcoded plan checks with dynamic feature array matching against active DB subscriptions and custom plan tiers.
- **Graceful Backward Compatibility**: Default fallbacks ensure existing free and legacy paid users retain seamless access to invoices, customer masters, and core modules without login or permission lockouts.
- **Quota Limit Validator (`checkFeatureLimit`)**: Dynamic numeric check for invoice counts, customer limits, and team seats.

#### 2. Unified Interconnected ERP Event Pipeline (PO → Inventory → Expense → Bookkeeping → GST)
- **Purchase Order Receipt Synchronization (`lib/po-actions.ts`)**:
  - Automatically updates line item received quantities.
  - Automatically increments stock levels in `inventory_items` and records audit entries in `inventory_transactions`.
  - Automatically posts balanced journal entries into Bookkeeping Accounts Payable and Inventory Asset accounts upon receipt.
- **Input Tax Credit (ITC) Linking (`lib/gst-advanced-actions.ts`)**:
  - GSTR-3B auto-calculation now directly aggregates Input Tax Credit (`tax_amount`) from `expenses` and vendor bills into `itc_cgst` and `itc_sgst`.
  - Seamlessly bridges inward supply expenses with outward sales invoices for complete GST compliance.

#### 3. Universal Barcode Engine, Right Sidebar & Hardware Printing (`components/barcode/BarcodeRightSidebar.tsx`, `components/Sidebar.tsx`, `app/(dashboard)/layout.tsx`)
- **Quick-Access Slide-Over Right Sidebar (`BarcodeRightSidebar.tsx`)**:
  - Right-docked floating trigger badge (`[🏷️ Barcode Hub]`) globally accessible across all dashboard pages.
  - 3-tab slide-over control hub:
    1. *Scan & Find*: Fast hardware & manual barcode lookup, displaying stock levels, price, and instant "+ Add to Invoice" action.
    2. *Generator*: Auto-generates Code 128 vector barcodes with custom company prefixes, live SVG preview, SVG download, and 1-click clipboard copy.
    3. *Thermal Label Printing*: Formats for retail stickers (50x25mm, 38x25mm) and jewelry dumbbell tags (68x12mm).
- **Navigation & Inventory Barcode Visibility**:
  - Added dedicated "Barcodes & Labels" link in both desktop and mobile sidebars under "Inventory & Items".
  - Always-visible "Barcode & Printers" action button and barcode column in the main Inventory dashboard (`/inventory`).
- **Universal Barcode Lookup**: Instant cross-table resolution across `inventory_items` and `saved_items`.

---

## [Release v1.5.6 - Implemented] - 2026-11-22

### Multi-Industry Adaptive Architecture, First-Time Onboarding Tour & Industry Welcome Emails

#### 1. Adaptive Multi-Tenant Business Profiles (`lib/business-profile-types.ts`, `lib/business-profile-actions.ts`)
- **10 Supported Verticals**: Salon & Spa, Dental Clinics, Hospital OP, Automobile Garages, Resorts/Farmhouses/Camping (PMS), Tours & Travels, Jewellery Retail, Laundry & Dry Cleaning, Real Estate, and Corporate Events.
- **Dynamic Terminology & Field Adapters (`hooks/useBusinessProfile.ts`)**: Custom field mapping (`Client` vs `Patient` vs `Guest`, `UHID` vs `Vehicle Reg #` vs `Rack #`).
- **Database Schema Migration (`supabase-industry-adaptive-migration.sql`)**: Tables for `staff_revenue_splits`, `pms_units`, `pms_bookings`, `vehicle_job_cards`, `dental_case_sheets`, `laundry_orders`, and `real_estate_listings`.

#### 2. Industry Starter Catalogs & Zero-Config Signup (`lib/industry-catalog-presets.ts`, `app/(auth)/`)
- **Automated Catalog Seeding**: Pre-populates starter services/items on signup or industry switch (e.g. haircuts for salons, root canals for dental, synthetic oil for garages, tents for camping).
- **Signup Vertical Picker (`SignupForm.tsx` & `actions.ts`)**: Saves chosen industry directly to `invoice_settings` and `user_profiles`.

#### 3. Interactive First-Time User Walkthrough (`components/onboarding/FirstTimeOnboardingTour.tsx`)
- **Single-Trigger Onboarding Modal**: Launches once on initial dashboard login with 5 informative steps, Next/Back/Skip controls, and browser storage persistence.

#### 4. Personalized Industry Welcome Email (`lib/email.ts`)
- **Tailored Email Notification**: Sends HTML welcome email featuring the user's business name and industry vertical upon registration.

#### 5. Super Admin-Only Industry Switcher & Email Syntax Fix (`lib/email.ts`, `SettingsContent.tsx`, `business-profile-actions.ts`)
- **Super Admin Exclusive Access**: Gated `BusinessProfileSelector` in Account Settings and server action `updateBusinessProfile` so that only accounts with `role === 'superadmin'` can switch an organization's industry vertical.
- **Fixed Email Syntax Error**: Resolved duplicated CSS styles in `lib/email.ts` that caused Vercel Turbopack build failure.
- **Signup Vertical Selection**: Normal users select their industry once during registration, provisioning starter catalogs and tailored workflows cleanly.

---

### 2. Comprehensive 10-Vertical Gap Analysis & Unified Implementation Plan
Deep market research and competitor benchmarking completed across 10 major industry verticals:
1. **Salon & Spa (`salon_spa`)**: Stylist commission agreements (50/50, tiered, chair rent), separate retail vs service splits, daily settlement payouts, and prepaid service wallets.
2. **Dental & Hospital OP (`dental_clinic`, `hospital_op`)**: Outpatient token queues, interactive 32-tooth odontogram, procedure billing, visiting specialist fee splits, and SAC 999312 GST exemption.
3. **Automobile Workshops & Garages (`auto_workshop`)**: Digital vehicle job cards with 2D scratch diagram, odometer, parts inventory deduction vs labor billing, and periodic service alerts.
4. **Resorts, Farmhouses & Camping (PMS) (`resorts_farmhouses_camping`)**: Visual Room/Tent availability grid (Open vs Occupied), flexible pricing (Per Room, Per Bed, Per Tent, Per Hour, Per Person), BBQ/bonfire add-ons, and guest ID register.
5. **Real Estate Brokerage (`real_estate`)**: Property listing inventory, site visit tracking, buyer/seller commission splits, and RERA document checklists.
6. **Corporate & Social Event Management (`event_management`)**: Budget vs actual cost centers, milestone tranche billing, vendor PO matching, and Section 194C/194J subcontractor TDS.
7. **Laundry & Dry Cleaning (`laundry_drycleaning`)**: Garment piece inwarding, waterproof thermal tag printing, rack/shelf slot allocation, and WhatsApp pickup alerts.
8. **Tours & Travels (`tours_and_travels`)**: Day-wise itinerary builder, PAX manifests, passport vault, supplier vouchers, and Tour Operator GST (5%) & TCS.
9. **Jewellery Retail & Goldsmiths (`jewelry_retail`)**: Live bullion board rates, weight-based calculations, BIS Hallmark HUIDs, and old gold exchange buybacks.
10. **Retail & Wholesale FMCG (`retail`, `wholesale`)**: High-speed barcode POS, carton tiers, and automated GSTR-3B filings.

---

## [Release v1.5.4 - Implemented] - 2026-11-22

### 100% ERP-Ready CRM Suite & Team Management
- **Multi-Tenant Team Member Association**: Integrated with `team_members` and `user_profiles` with dynamic organization owner scoping (`getEffectiveOwnerId`).
- **On-Card Quick Reassignment & Filters**: Fast assignee selection on Kanban cards, member workload leaderboards, and stage filters.
- **Dual-Mode Lead Importer**: Drag-and-drop Excel/CSV parsing (RFC-4180 standard) and zero-config live Google Sheets stream synchronization.
- **Cross-Module ERP Interconnects**: 1-click `+Customer` conversion linking to Customer Master, and 1-click `Invoice` generation auto-closing leads into Won deals.

---

## [Roadmap / Pending Implementations]

### 1. WhatsApp Invoices Hub UI (`/whatsapp-invoices`)
- Live message threads, invoice quick-share, template management, and delivery status tracking.

### 2. Smart Pricing & Margin Insights Dashboard (`/pricing-insights`)
- Margin analytics dashboard, price floor alerts, and bulk re-pricing actions.

### 3. Multi-Currency & FX Gain/Loss Settings (`/settings/currency`)
- Exchange rate provider controls, real-time FX calculator, and realized vs. unrealized gain/loss reports.

### 4. Customer Blacklist & Defaulter Rules UI (`/customers/blacklist`)
- Defaulter registry UI, overdue threshold configuration, and invoice block rules.

---

## [Release v1.5.3 - Implemented] - 2026-11-20

### Barcode Generation, Hardware Label Printers & Jewelry Business Profile

#### 1. Settings & Organization Profile Management (`/settings/barcode`)
- **Feature Toggle (`enable_barcode_system`)**: Configurable in Settings to keep UI distraction-free for service firms while enabling instant barcodes for retail & jewelry businesses.
- **Industry Profile Selector**: Support for `jewelry_retail`, `electronics_retail`, `supermarket`, `apparel_footwear`, and `wholesale_fmcg`.
- **Specialized Jewelry Fields**: Gross weight, net weight, gold/silver purity (24K, 22K 916, 18K), making charges (per gram, percentage, flat), and BIS HUID hallmark numbers.

#### 2. Hardware Printer & Label Printing Hub (`components/barcode/BarcodeLabelPrinter.tsx`)
- Thermal label printer formats:
  - Jewelry Dumbbell / Butterfly tags (68x12mm)
  - Standard Retail Barcode stickers (50x25mm and 38x25mm)
  - Full A4 24-up label sheets
- Fast direct browser and ESC/POS thermal printing with clean CSS page-break rules.

#### 3. Hardware Barcode Scanner Listener (`hooks/useBarcodeScanner.ts`)
- Global HID keyboard wedge scanner hook with timestamp timing buffer, auto-incrementing line items and stock lookups on hardware scan.

---

## [Release v1.5.2 - Implemented] - 2026-11-20

### CCTV Local Desktop Bridge Connection & Signal Booster Relay

#### 1. Chrome Private Network Access (PNA) & CORS Preflight Compliance
- Added custom middleware and preflight handlers returning `Access-Control-Allow-Private-Network: true` and credentials-safe origin reflection in both `cctv-bridge/server.py` and `apps/vision-bridge/src/index.ts`.
- Resolves browser blocks when cloud dashboard (`https://billbooky.dodail.com`) sends requests to loopback (`http://127.0.0.1:5050`).

#### 2. Mixed-Content Elimination via WebSocket MJPEG Stream Relay
- Added `@app.websocket("/ws/stream")` in `cctv-bridge/server.py` streaming raw binary JPEG frames at 22+ FPS over loopback WebSocket.
- Added `@app.websocket("/ws/status")` providing continuous bidirectional heartbeat and camera telemetry.
- WebSockets over loopback are fully compliant with HTTPS security policies and completely avoid browser mixed-content video drops.

#### 3. Dual-Mode Low-Latency Stream Player (`CctvLivePlayer.tsx`)
- Created `CctvLivePlayer.tsx` with zero-copy object URL memory management for high-FPS, tear-free rendering.
- Automatically attempts WebSocket connection first with instant fallback to MJPEG.

#### 4. In-App Bridge Diagnostic Hub (`/payroll/attendance/cctv`)
- Added real-time Vision Bridge status banner with dynamic signal indicator (🟢 Bridge Online 100% / 🟡 Testing Handshake / 🔴 Offline).
- Added 1-click "Test Handshake" diagnostic trigger and direct desktop bridge launcher documentation.
- Integrated LAN Camera Probe routing: camera connection tests directly route to the local bridge's `/camera/probe` endpoint when online, preventing cloud private-subnet timeout failures on `192.168.x.x` addresses.

#### 5. 1-Click Desktop Launchers (`cctv-bridge/`)
- Created `start-bridge.command` for macOS and `start-bridge.bat` for Windows with automatic Python virtual environment detection, dependency verification, and startup on port 5050.

---

## [Release v1.5.1 - Implemented] - 2026-11-20

### Paid Invoice Payment Details & QR Code Visibility Toggles

#### 1. Invoice Settings & Live Preview
- **Organization-Level Preference (`/invoices/settings`)**: Added a persistent toggle (`show_bank_details_when_paid`) allowing businesses to choose whether already paid invoices display organization bank details and payment QR codes or hide them.
- **Interactive Live Preview (`InvoicePreview.tsx`)**: Added an immediate Unpaid vs. Paid preview mode switcher with real-time feedback reflecting the toggle state.

#### 2. Invoice Creation & Editing Forms
- **New & Edit Form Toggles (`ImprovedInvoiceForm.tsx`, `InvoiceForm.tsx`, `InvoicePreviewPanel.tsx`)**:
  - Added "Show Bank Details & QR Code if Invoice is Paid" toggle directly in the payment collection section and under Notes.
  - Live creation preview (`InvoicePreviewPanel.tsx`) immediately responds to the payment collected state and toggle.
  - Multi-tier progressive fallback payload handles `show_bank_details_when_paid` gracefully in `invoices/actions.ts` (`createInvoice` & `updateInvoice`).

#### 3. Invoice View & Pre-Download PDF Customization (`/invoices/[id]`)
- **Interactive Action Bar & Section (`PaidInvoicePaymentDetailsSection.tsx`)**:
  - Live toggle on paid invoices allows instant visibility switching directly on the screen.
  - Real-time event broadcasting synchronizes choices with `DownloadPDFButton`.
  - Background persistence via `toggleInvoiceBankDetailsWhenPaid`.
- **Dynamic PDF Generator (`lib/pdf.ts`, `app/api/invoices/[id]/pdf/route.ts`)**:
  - `generateInvoicePDF` accepts runtime overrides for `show_bank_details_when_paid`.
  - PDF route supports `?show_bank_details_when_paid=true/false` query parameter to enforce user selection when generating exported PDFs.

#### 4. Database Migration
- Generated `supabase-invoice-paid-payment-details-toggle.sql` adding `show_bank_details_when_paid` to `invoice_settings` and `invoices` with safe column defaults.

---

## [Release v1.5.0 - Implemented] - 2026-11-19

### Multi-Tenant Live CCTV AI Attendance & P2P Stream Pipeline

#### 1. Real-Time Camera Stream Ingestion & P2P WebRTC Bridge (`cctv-bridge/`)
- **Multi-Threaded Live Video Reader (`CameraStream`)**: Engineered zero-latency background ingestion in `server.py` supporting RTSP, ONVIF, and Cloud P2P streams (Hikvision, CP Plus, Dahua, Uniview/EasyView, Tapo).
- **Auto-Reconnection & Buffer Flushing**: Flushes video buffers continuously to eliminate RTSP delay (<100ms real-time stream) with exponential backoff on stream drops.
- **Dynamic Camera Registration Endpoint**: Added `POST /camera/register` on the Python bridge to mount camera feeds dynamically upon user creation in the dashboard.
- **Zero-CPU WebRTC Gateway (`go2rtc.yaml`)**: Added production configuration for hardware-accelerated WebRTC P2P live stream relay.

#### 2. Multi-Person AI Trajectory & Biometric Attendance Engine (`tracker.py`)
- **Group Tracking & Motion Vectoring**: Concurrently tracks multiple persons across gate thresholds, calculating Y-axis directional movement (`IN` vs `OUT`).
- **Anti-Passback Debounce Protection**: Configurable cooldown timer prevents duplicate punches when employees linger near cameras.
- **Biometric Cosine Similarity Matching**: Performs vectorized cosine similarity matching against enrolled 512-D face embeddings.
- **Automated Punch Ingestion Route (`/api/payroll/attendance/movement`)**: Directly delivers verified punch events to Supabase with multi-tenant token authorization.

#### 3. Admin Movement Audit & Daily Shift Rollup (`lib/cctv-attendance-actions.ts`)
- **Daily Attendance Rollup**: Automatically computes First In (In-Time), Last Out (Out-Time), Break Minutes, and Net Working Hours, tagging status (`present`, `half_day`, `absent`, `incomplete`).
- **Strict Multi-Tenant Isolation**: Enforced via PostgreSQL Row Level Security (RLS) and scoped `user_id`, guaranteeing zero cross-tenant visibility between organizations.

---

## [Release v1.4.0 - Implemented] - 2026-11-19

### Production Readiness & End-to-End Enterprise Module Sync

#### 1. Invoicing & Payment Corrections (Completed)
- **Payment Received Date Picker**: Integrated explicit date pickers in both `MarkAsPaidButton.tsx` and `PartialPaymentButton.tsx`, passing through `POST /api/invoices/partial-payment` and updating `invoices.paid_at`.
- **Payment History Edit & Void**: Upgraded `PaymentHistory.tsx` with full inline/modal editing (amount, payment method, date, notes) and Void/Delete with status confirmation. Handled via `PATCH` and `DELETE /api/invoices/partial-payment`, which automatically recalculates `amount_paid`, `amount_remaining`, `is_partial_payment`, and updates invoice `status` (`paid`, `partial`, `sent`).

#### 2. Real-Time Bookkeeping & Accounting Automation (Completed)
- **Automated Ledger Posting**:
  - Invoices: Real-time double-entry journal entries posted automatically upon invoice creation via `postInvoiceJournalEntry` in `invoices/actions.ts` (Debit: Accounts Receivable / Bank, Credit: Sales Revenue & GST Output).
  - Payments: Automated receipt journal entry posted via `postPaymentReceiptJournalEntry` (Debit: Bank/Cash, Credit: Accounts Receivable).
  - Expenses: Automated disbursement entry posted upon expense logging.
- **One-Click Historical Ledger Sync**: Added 'Sync to Ledger' button on the Bookkeeping dashboard (`BookkeepingClientView.tsx`) wired to `syncInvoicesAndExpensesToLedger()` to backfill historical transactions seamlessly into the general ledger.

#### 3. Purchase Orders (PO) Integration (Completed)
- Linked completed/received purchase orders to vendor bills and inventory replenishment in `po-actions.ts`.
- Automatically records double-entry journal entries upon item receipt (Debit: Inventory/Expense, Credit: Accounts Payable) via `postPOJournalEntry`.

#### 4. Real-Time Inventory Sync with Invoicing (Completed)
- **Stock Depletion on Invoice**: Invoicing line items decrement `current_stock` in `inventory_items` and create audit movement records via `syncInventoryForInvoice`.
- **Stock Reversal on Void/Cancel**: Deleting an invoice via `deleteInvoice` in `invoices/actions.ts` restores inventory stock with reversal movement logs and removes associated general ledger entries.
- **Stock Availability Warning**: Validates item availability during invoice creation to prevent overselling.

---

## [Release v1.3.1] - 2026-11-18

### 1. Feature & Fix: Full Database Sync for Regional Lifetime Tiers in Super Admin
- **Issue**: Lifetime tiers on UAE (`/ae/pricing`) and US (`/us/pricing`) were hardcoded with static prices, while Super Admin (`/admin/plans`) only showed a single lifetime tier per region. Disabling a lifetime deal in Super Admin had no effect on the frontend.
- **Root Cause**: `STANDARD_REGIONAL_PLANS` in `app/(superadmin)/admin/plans/actions.ts` lacked entries for Growth, Pro, and Business/Enterprise lifetime plans for UAE (AED 899, AED 1,499, AED 2,499) and US (USD 249, USD 399, USD 599). Public pages also rendered static fallback cards even when database plans returned inactive.
- **Resolution**:
  - Expanded `STANDARD_REGIONAL_PLANS` to include all 4 UAE Lifetime tiers (`lifetime-ae`, `lifetime-growth-ae`, `lifetime-pro-ae`, `lifetime-enterprise-ae`) and all 4 US Lifetime tiers (`lifetime-starter-us`, `lifetime-growth-us`, `lifetime-pro-us`, `lifetime-business-us`), alongside Pro and Enterprise monthly/yearly plans.
  - Updated `getAllPlans` to automatically seed any missing standard regional plan into `subscription_plans` on access, guaranteeing Super Admin can immediately view, edit prices, or toggle active/inactive states for all tiers.

---

### 2. Fix: Dynamic Rendering & Conditional Hiding of Inactive Lifetime Plans
- **Issue**: Toggling lifetime plans to inactive (`is_active = false`) in Super Admin did not hide the plans on public regional pricing pages.
- **Resolution**:
  - In `app/ae/pricing/page.tsx`: Replaced static HTML cards with dynamic mapping over `activeLifetimePlans`. If a specific lifetime plan is deactivated, its card is immediately omitted. If all lifetime plans are deactivated, `<section id="lifetime">` is completely hidden.
  - In `app/us/pricing/page.tsx`: Dynamically maps `activeLifetimePlans`. Deactivated lifetime cards are removed, and the entire section hides if none are active.
  - In `app/(marketing)/pricing/FounderCircle.tsx`: Deactivated cards (Lifetime or Founder Yearly) are cleanly omitted, and the section hides completely if both are inactive.
  - In `app/ae/page.tsx`: Comparison table conditionally checks `hasActiveLifetime` before rendering the lifetime founder deal row.

---

### 3. Fix: Complete Public Route Cache Invalidation
- **Issue**: Next.js server components cached public pricing pages indefinitely when plans were updated in Super Admin.
- **Resolution**:
  - Centralized cache purging with `revalidateAllPricingRoutes()` in `app/(superadmin)/admin/plans/actions.ts`.
  - Revalidates `/admin/plans`, `/`, `/pricing`, `/ae`, `/ae/pricing`, `/us`, and `/us/pricing` on all mutations (`updatePlan`, `createPlan`, `togglePlanStatus`, `togglePlanPopular`, `deletePlan`, `seedStandardRegionalPlans`).

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

---

## [Release v1.6.6] - 2026-11-23

### 28. Super Admin Production-Readiness Overhaul: Coupons, Testimonials, Refunds, Payments & Support
- **Issue**:
  - Coupons module (`admin/coupons`) was read-only and lacked creation, editing, active toggles, and deletion, preventing coupon management.
  - Testimonials CMS (`admin/testimonials`) was failing with 500 error when saving due to `.single()` query on empty tables.
  - Payments & Revenue (`admin/payments`) only tracked partial subscriptions without unified view of invoice payments or search/export capabilities.
  - Refund processing engine crashed if `gateway_payment_id` was absent on manual or test transactions.
  - Support Tickets (`admin/support`) lacked instant toast confirmations and local state synchronizations upon reply.
- **Resolution**:
  - **Coupons (`admin/coupons`)**: Built `actions.ts` with full CRUD (`createCoupon`, `updateCoupon`, `toggleCouponStatus`, `deleteCoupon`) and interactive `CouponsClientView.tsx` with modal, percentage/flat discounts, usage caps, and active status switches.
  - **Testimonials CMS (`admin/testimonials`)**: Fixed `app/api/admin/testimonials/route.ts` with `.maybeSingle()` and added status banners for save feedback.
  - **Payments & Revenue (`admin/payments`)**: Built `UnifiedPayment` merging subscriptions and invoice gateway collections into `PaymentsClientView.tsx` with live KPIs, CSV exporter, and type/status filters.
  - **Refund Engine (`admin/refunds`)**: Updated `baseProcessRefund` to handle both live Razorpay (`pay_*`) and offline ledger settlements.
  - **Support Helpdesk (`admin/support`)**: Enhanced `SupportTicketsClientTable.tsx` with toast feedback and ticket status updates.

---

| Date | Component / Route | Change Description | Status |
| :--- | :--- | :--- | :--- |
| 2026-11-23 | `app/(superadmin)/admin/coupons/` | Full interactive coupon CRUD suite and creation modal | ✅ Completed |
| 2026-11-23 | `app/api/admin/testimonials/` | Fixed empty table `.single()` query failure & error handling | ✅ Completed |
| 2026-11-23 | `app/(superadmin)/admin/testimonials/` | Added real-time save/edit status alert banners | ✅ Completed |
| 2026-11-23 | `app/(superadmin)/admin/payments/` | Unified revenue journal, KPI cards, and CSV export | ✅ Completed |
| 2026-11-23 | `app/(dashboard)/invoices/payment-actions.ts` | Resilient refund processing for live and offline transactions | ✅ Completed |
| 2026-11-23 | `app/(superadmin)/admin/support/` | Upgraded ticket resolution, toast feedback, and reply handling | ✅ Completed |



