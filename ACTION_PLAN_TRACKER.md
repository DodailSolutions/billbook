# BillBook Action Plan Tracker & Implementation Roadmap

This document serves as the master execution tracker for multi-vertical architecture, Point of Sale (POS) engines, and specialized industry modules. Every phase, action item, status, and commit is recorded here.

---

## Master Phase Breakdown

| Phase | Module / Capability | Target Verticals | Status |
|---|---|---|---|
| **Phase 1** | Dynamic Vertical Schemas & Super Admin Multi-Vertical Analytics | All 14 Core Verticals | **COMPLETED & DEPLOYED** (v1.5.8) |
| **Phase 2** | Universal Team Capacity Radar & Dual-Rate Margins | All Verticals | **COMPLETED & DEPLOYED** (v1.5.9) |
| **Phase 3** | Project Engine, Change Orders & Client Portal | Software, Marketing, Freelancers | **COMPLETED & DEPLOYED** (v1.5.9) |
| **Phase 4** | Unified Branding & Platform Reversion | Core Platform (14 Verticals) | **COMPLETED & DEPLOYED** (Reverted selective pages) |
| **Phase 5** | AI Proposal Writing & RFP / RFQ Evaluation Engine | Universal SOWs / B2B Verticals | **COMPLETED & DEPLOYED** (v1.6.0) |
| **Phase 6** | Art & Crafts Vertical + Camping vs. Resort Separation | `art_crafts`, `camping_outdoors`, `resorts_farmhouses` | **COMPLETED & IMPLEMENTED** |
| **Phase 7** | High-Speed Counter Point of Sale (POS) Engine | `retail`, `salon_spa`, `laundry_drycleaning`, `art_crafts` | **COMPLETED & IMPLEMENTED** |
| **Phase 8** | Multi-Property Estate PMS & Campsite Campground Grid | `resorts_farmhouses`, `camping_outdoors` | **COMPLETED & IMPLEMENTED** |
| **Phase 9** | Studio BOM Recipe Costing & Certificate of Authenticity (COA) | `art_crafts` | **COMPLETED & IMPLEMENTED** |
| **Phase 10** | Automated WhatsApp Reminders & 1-Click Dynamic UPI Pay | All 16 Verticals | **COMPLETED & IMPLEMENTED** |
| **Phase 11** | SOW Commission Splits, HR Handbook & Mobile RFP Engine | Universal B2B / Services | **COMPLETED & IMPLEMENTED** |
| **Hotfix (v1.6.6)** | PlansManager Build Error & Dynamic Pro Team Limits | Core Platform & Super Admin | **COMPLETED & IMPLEMENTED** |
| **Phase 12** | Recursive Expenses, Period Breakdowns, Smooth Recurring Invoices & Integrations Hub | All Verticals | **COMPLETED & IMPLEMENTED** |
| **Phase 13** | Super Admin Modular Package Engine, Dynamic Landing Page Sync & Universal Rule Enforcement | Platform-Wide (Super Admin & All Tenants) | **COMPLETED & IMPLEMENTED** |
| **Phase 14** | Tier-Based Automatic Vertical Bundling, Super Admin Industry Simulator, Contextual Upgrade & Non-GST Onboarding | Platform-Wide (All 16 Verticals & Super Admin) | **COMPLETED & IMPLEMENTED** |
| **Phase 15** | Customer-Organization Linkage & Invoice Builder Quick-Create Workflow | Core CRM & Invoicing Flow | **COMPLETED & IMPLEMENTED** |
| **Phase 16** | B2B Relationship Manager & Agent Hierarchy with Scoped RBAC Security | Team Management & B2B Verticals | **COMPLETED & IMPLEMENTED** |
| **Phase 17** | Passwordless Client Portal & Enterprise White-Labeling Engine | Client Portal & Enterprise Tier | **COMPLETED & IMPLEMENTED** |
| **Phase 18** | Unified Workforce Architecture, Dynamic Department Creator & Save Reliability | Core HR, Payroll & Settings | **COMPLETED & IMPLEMENTED** |

---

## Detailed Execution Plan

### [Phase 6] - Specialized Vertical Expansion & Separation
- [x] **Task 6.1: Account Creator Role Correction**
  - Ensure all primary account creators who register workspaces are displayed and recognized as **Workspace Owner** across Super Admin tables and user directories, preventing confusion with invited staff members.
- [x] **Task 6.2: Art, Crafts & Handmade Studio Vertical (`art_crafts`)**
  - Add `art_crafts` to `BusinessType` and `BUSINESS_VERTICALS` (`lib/business-profile-types.ts`).
  - Pre-seed catalog items: Original Paintings (Canvas), Resin & Clay Crafts, Archival Fine Art Prints, Handcrafted Ceramics, and Bespoke Commission SOWs (`lib/industry-catalog-presets.ts`).
  - Map functional designations: Lead Artist, Ceramic Artisan, Resin Specialist, Studio Assistant, Exhibition Coordinator (`lib/team-types.ts`).
- [x] **Task 6.3: Separation of Camping from Resorts & Farmhouses**
  - Separate `camping_outdoors` from `resorts_farmhouses` in profile configurations.
  - `resorts_farmhouses`: Fixed architecture (Villas, Suites, Event Lawns, Swimming Pools) with Per-Day Estate Buyout or Per-Night Room tariffs and caution deposits.
  - `camping_outdoors`: Experiential per-head campground model (Dome Tents, Safari Tents, Treks, Campfire BBQ Packages, and Adventure Gear Rentals).
- [x] **Task 6.4: Super Admin Intelligence & Vertical Switching Alignment**
  - Register new verticals in `ChangeVerticalModal.tsx`, `BusinessesClientTable.tsx`, and `VerticalDistributionSection.tsx`.
- [x] **Task 6.5: Interactive Onboarding Sandbox Walkthrough**
  - Upgraded `FirstTimeOnboardingTour.tsx` with zero-impact practice invoice simulator, mock customer selection, dynamic GST calculation, and single-execution guarantee.

---

### [Phase 7] - High-Speed Counter Point of Sale (POS) Engine
*Focused strictly on businesses that conduct in-person counter checkout and ticket issuance.*
- [x] **Task 7.1: POS Architecture & Capability Flags**
  - Add `hasPOS: true` to `retail`, `salon_spa`, `laundry_drycleaning`, `art_crafts`, and `resorts_farmhouses`.
- [x] **Task 7.2: Counter POS Terminal (`/pos`)**
  - Built high-speed barcode scanning & instant item search.
  - Dual print modes: 58mm & 80mm thermal receipt printing.
  - Cash drawer change calculator and quick split tender (Cash / UPI / Card).

---

### [Phase 10] - Automated WhatsApp Reminders & 1-Click Dynamic UPI Pay
- [x] **Task 10.1: Reminder Schedule Engine (`lib/whatsapp-reminders.ts`)**
  - Generates polite 3-day pre-due, due date, and overdue WhatsApp payment links.
- [x] **Task 10.2: NPCI Interoperable UPI Deep-Link URI**
  - Standard `upi://pay` generation for 1-click settlement.
- [x] **Task 10.3: WhatsApp Reminder API Route (`/api/reminders/whatsapp`)**
  - Server route to dispatch customized reminder payloads per invoice.

---

### [Phase 8] - Multi-Property Estate PMS & Campsite Campground Grid
- [x] **Task 8.1: Multi-Property Tagging & Estate Hierarchy (`app/(dashboard)/estate-pms/page.tsx`)**
  - Multi-property estate picker (e.g. *Whispering Palms Estate*, *Pine Woods Campground*, *Heritage Farmhouse*).
  - Villa buyout management, presidential suites, event lawns, live occupancy rate, caution deposits held, and housekeeping turnover workflow.
- [x] **Task 8.2: Camping & Outdoor Stays Grid**
  - Experiential per-head passes, geodesic stargazer dome & alpine safari tent allocations.
  - Adventure equipment rental station (Kayaks, BBQ kits, sleeping bags, telescopes) with deposit tracking and digital liability waiver verification.

---

### [Phase 9] - Art Studio BOM Recipe Costing & Certificate of Authenticity (COA)
- [x] **Task 9.1: Bill of Materials (BOM) & Recipe Cost Calculator (`app/(dashboard)/art-studio/page.tsx`)**
  - Tracks raw material inputs (linen canvas, pigments, resins, gold leaf, custom framing) plus crafting hours and studio overhead to compute true COGS, suggested MRP, and gallery splits.
- [x] **Task 9.2: Printable Certificate of Authenticity (COA)**
  - Museum-grade archival certificate layout with gold ornamental borders, unique provenance ID, QR verification code, and official artist signature block ready for A4 framing.
- [x] **Task 9.3: Bespoke Commission 50% Advance Settlement**
  - Milestone contract tracking with 50% advance booking deposit, pre-dispatch WIP preview, and 1-click WhatsApp progress updates.

---

### [Phase 11] - AI Proposal Writer, Word/PDF Exports, Sales Partner Commission & HR Policy Engine
- [x] **Task 11.1: AI Proposal Drafting & Word/PDF Exports (`app/(dashboard)/proposals/`)**
  - AI SOW writer generating tailored deliverables, tranches, and feasibility scores from rough briefs.
  - 1-Click download as Word (`.doc`) in **Draft** or **Final SOW** format with full Microsoft Word formatting, section margins, and callout blocks.
  - Formatted print & PDF view with custom brand accent colors, header text, footer notice, and diagonal watermarks (DRAFT / CONFIDENTIAL).
- [x] **Task 11.2: Proposal Stage Tracking & Follow-up Assignment**
  - Track proposal lifecycle: `Draft`, `Sent`, `Under Review`, `Accepted`, `Rejected`, `On Hold`.
  - Assign proposals to sales employees or client partners with next touchpoint date and follow-up notes.
- [x] **Task 11.3: Sales & Partner Compensation Engine (`app/(employee)/employee/commissions/page.tsx`)**
  - Dedicated commission calculator for IT, Software & Digital Marketing agencies.
  - Supports Salary Only, Pure Commission %, and Hybrid (Salary + %) with Monthly or Weekly payout cycles and One-time vs Monthly Retainer earning models.
  - Employee portal calculator, live projected compensation, and verified closed deals ledger.
- [x] **Task 11.4: HR Organization Rules, Guidelines & Policy Center (`app/(dashboard)/hr-dashboard/page.tsx`)**
  - Configurable policy center with industry presets (IT & Software flexible/remote vs Retail/Hospitality strict shifts & overtime).
  - Customizable working models (Hybrid, In-Office, Remote-First), WFH limits, leave notice windows, overtime multipliers, and exit notice periods.
  - Live publishing sync to the employee dashboard handbook.
- [x] **Task 11.5: Enhanced Employee Self-Service Dashboard (`app/(employee)/employee/dashboard/page.tsx`)**
  - Touchless virtual timeclock punch in/out widget.
  - Instant navigation to Leaves, Payslips, and Commissions & Payouts.
  - Active organizational guidelines handbook viewer.

---

### [Phase 12] - Recursive Expenses, Period Breakdowns, Smooth Recurring Invoices & Integrations Hub
- [x] **Task 12.1: Expense Tracking Engine: Recursive Cycles, Period Views & Excel Importer**
  - Added recurring expense cycles (`one_time`, `daily`, `weekly`, `monthly`, `quarterly`, `yearly`) with run-rates.
  - Multi-tab breakdown filters (Daily, Monthly, Yearly) and client-side `.xlsx` / `.csv` bulk importer.
- [x] **Task 12.2: Integrations Hub UI & 0-API WhatsApp Simulator**
  - Microsoft Teams incoming webhook configuration, Google Sheets sync tester, and instant `wa.me` reminder generator.
- [x] **Task 12.3: Smooth Recurring Invoice Creation Interaction (`app/(dashboard)/invoices/new/`)**
  - **Implemented**: Replaced the standalone checkbox with an interactive, smooth Recurrence Configuration drawer in `ImprovedInvoiceForm.tsx` (Billing Cadence: Monthly / Yearly, Start Date picker, Optional End Date with 'Never ends' toggle, and live Next Invoice Date preview).
  - Forwarded `recurring_frequency`, `recurring_start_date`, and `recurring_end_date` into `createInvoice`, with resilient server-side fallbacks ensuring bulletproof creation of the linked recurring template in `recurring_invoices`.
- [x] **Task 12.4: Integrations Dispatch Engine (`lib/integrations/teams.ts`)**
  - Added dedicated Microsoft Teams MessageCard / Adaptive Card dispatcher utility with resilient error isolation ensuring zero disruption to core billing flows.

---

### [Phase 13 - Implemented] - Super Admin Modular Package Engine, Dynamic Landing Page Sync & Universal Rule Enforcement
*Comprehensive overhaul to make all subscription text editable, expand package capabilities, dynamically reflect package updates on the landing page, and strictly enforce rules platform-wide.*

- [x] **Task 13.1: Super Admin Package Builder Expansion & Hardcoded Text Elimination (`PlansManager.tsx`)**
  - **Eliminate All Hardcoded UI Text**: Removed static labels on plan cards and edit modals (e.g. fixed plan subtitles, hardcoded tags, static currency hints, uneditable bullet points). Every string displayed to the public or tenant is now editable via the Super Admin modal.
  - **Expand Modular Feature Flags to 24 Switches** across 6 business categories:
    1. *Sales & Commerce*: CRM Deal Pipelines, B2B Organizations & Multi-Stakeholders, Interactive Client Proposals / SOWs, Counter POS & Thermal Checkout, Barcode & Label Batch Printing, Purchase Orders & Vendor Bills.
    2. *Finance & Tax*: Double-Entry Bookkeeping & General Ledger, GSTR-1 & GSTR-3B Tax Reports & JSON/Excel Exports, Multi-Currency & ZATCA e-Invoicing, E-Way Bill Generation.
    3. *Operations & Inventory*: Multi-Location / Multi-Warehouse Stock Tracking, Studio BOM Recipe Costing, Estate PMS & Campsite Allocation Grid.
    4. *Team & HR*: Universal Team Capacity Planning & Margin Radar, HR Guidelines Handbook & Leave Management, Sales Partner Commission Splits & Ledgers, CCTV Vision AI Attendance.
    5. *Communication & Automation*: Automated WhatsApp Reminders (0-API & Meta Cloud), Recurring Invoices & Retainer Subscriptions, Integrations Hub (Teams & Sheets Webhooks).
    6. *White-Label & Enterprise*: Custom Domain & Branding ("Powered by BillBook" removal), Advanced RBAC Custom Permission Roles, Priority 24/7 Phone & CA Advisory Support.
  - **Custom Quota Inputs**: Added explicit number fields for Monthly Invoices quota, Customer directory quota, Team seat limits, and Cloud storage GB.

- [x] **Task 13.2: Dynamic Landing Page & Pricing Page Synchronization (`HomePricingSection.tsx`, `PricingToggleSection.tsx`, `app/page.tsx`)**
  - **Refactor `app/_components/HomePricingSection.tsx`**: Replaced all hardcoded static `<li>` bullet points for Free, Pro Starter, and Enterprise with dynamic rendering from `plans` loaded from Supabase `subscription_plans`.
  - **Live Reflection of Super Admin Edits**: Plan titles, descriptions, pricing, included features (`plan.features`), and crossed-out excluded features (`plan.excluded_features`) instantly update on the homepage (`/`) and pricing page (`/pricing`) upon Super Admin save.

- [x] **Task 13.3: Strict Universal Rule & Quota Enforcement Engine (`lib/plan-utils.ts`, Middleware & Actions)**
  - **Strict Central Feature Gating**: Dynamically enforced `hasPlanFeature()` and `checkFeatureLimit()` across all 16 verticals.
  - **Dynamic Invoice Quota Enforcement**: Enhanced `checkInvoiceLimit()` to respect super-admin configured monthly invoice quotas (`invoices_per_month`), with transparent unlimited bypass for `-1` and safe fallback defaults.

---

### [Phase 14 - Implemented] - Tier-Based Automatic Vertical Bundling, Super Admin Industry Simulator, Zero-Loss Contextual Upgrades & Non-GST Onboarding
*Ensures seamless industry-specific software experience without manual package toggle micromanagement, zero-loss contextual upgrades, and flexible non-GST onboarding.*

- [x] **Task 14.1: Automatic Vertical Module Bundling in Rules Engine (`lib/plan-utils.ts`, `components/Sidebar.tsx`)**
  - **Auto-Entitle Vertical Modules**: Tied specialized industry tools directly to subscription tiers (Starter, Pro, Enterprise) based on tenant vertical.
    - Paid tiers (Professional, Enterprise, Lifetime) automatically entitle all specialized modules for the tenant's chosen business type (e.g. `resorts_farmhouses_camping` gets Estate & Campsite PMS, `dental_clinic` gets Odontogram, `auto_workshop` gets Job Cards, `salon_spa` gets Stylist Splits) without requiring manual package switches.
    - Zero friction for new vertical customers purchasing standard packages.
    - 100% backward compatibility for existing accounts.
- [x] **Task 14.2: Super Admin Industry Simulator Preview (`PlansManager.tsx`)**
  - Added an "Industry Simulator" selector to the Plans Manager UI.
  - When an admin selects an industry vertical, the card previews dynamically showcase the exact feature set and sidebar tools that a customer in that specific vertical will receive under Free, Starter, Pro, and Enterprise tiers.
- [x] **Task 14.3: Zero-Loss Contextual Upgrade Experience (`components/InstantTrialButton.tsx`, `app/(dashboard)/invoices/new/page.tsx`)**
  - 1-click inline trial activation button so tenants hitting invoice quota barriers (50 invoices on Free) can instantly unlock Pro without leaving the page or losing in-progress work.
- [x] **Task 14.4: 60-Second Onboarding Wizard with Non-GST Business Support (`components/SetupWizard.tsx`)**
  - Support unregistered / non-GST businesses with dedicated toggle: manual legal name, state, and address with compliant B2C tax handling.
  - Informative guidance reassuring non-GST businesses of compliant invoicing.

---

### [Phase 15] - Customer-Organization Linkage & Invoice Builder Quick-Create Workflow
*Enables seamless linking of new and existing customers to organizations, with auto-inheritance of corporate GSTIN and billing addresses.*

- [x] **Task 15.1: Customer Edit & Creation Form Organization Selector (`NewCustomerForm.tsx`, `customers/[id]`)**
  - Added an **Organization** dropdown selector in the Customer Edit view and New Customer form.
  - Enabled linking existing customers to any organization, or reassigning them in 1 click.
  - Displayed the linked organization name as a blue pill badge with designation in the Customer Directory table (`/customers`).
- [x] **Task 15.2: Invoice Builder Quick-Add Customer Organization Picker (`ImprovedInvoiceForm.tsx`)**
  - In the "+ Add Customer" modal inside the invoice generator, added an **Organization** picker with Select, + New, and None modes.
  - Automatically links the newly created contact to the selected or created organization without leaving the invoice creation flow.
- [x] **Task 15.3: Auto-Inheritance of Company Tax & Address Details**
  - Selecting an organization in the customer creation form or invoice quick-add modal automatically auto-populates the organization's GSTIN and corporate billing address onto the client record.

---

### [Phase 16] - B2B Relationship Manager & Agent Hierarchy with Scoped RBAC Security
*Two-tier client ownership hierarchy for IT, agencies, and B2B services, ensuring strict data isolation.*

- [x] **Task 16.1: Dedicated B2B Roles in Team Management (`/team`)**
  - Added **Client Relationship Manager (Senior RM)** and **Relationship Agent (Junior RM)** roles for B2B verticals (Software/IT, Digital Marketing, Freelancers, Consulting).
  - Relationship Managers supervise and assign accounts to their subordinate agents, configure proposals, and monitor deal health.
- [x] **Task 16.2: Client Account Assignment & Manager Ownership (`customers`, `organizations`)**
  - Added `assigned_rm_id` and `assigned_rm_name` to customer and organization records so managers own their client portfolio.
  - Added Assigned RM selector to customer edit forms with team directory auto-lookup.
  - Displayed assigned RM badge directly on Customer Directory cards.
- [x] **Task 16.3: Strict Security & Role Boundary Enforcement**
  - Enforced route-level isolation between `/admin/*` and `/dashboard/*`.
  - Non-superadmins (employees, RMs, HR) are blocked from accessing Super Admin console or master financials.
  - Added 1-click Switcher buttons between Super Admin Console and Business ERP strictly for Super Admin profiles.

---

### [Phase 17] - Passwordless Client Portal & Enterprise White-Labeling Engine
*Dedicated external client portal with branded magic links and complete Enterprise white-labeling.*

- [x] **Task 17.1: Dedicated Client Portal Dashboard (`/portal/[customerId]`)**
  - Built passwordless magic link portal for external clients to view statement ledgers, download tax invoices, and track settlement balances.
- [x] **Task 17.2: Dedicated Relationship Manager Card in Client Portal**
  - Displayed assigned Relationship Manager badge with verified live contact chip and direct 1-click WhatsApp messaging.
- [x] **Task 17.3: Enterprise White-Labeling**
  - Replaced vendor branding with tenant corporate identity and custom Enterprise VIP footer badge when owner is on Enterprise tier.
  - Added 1-click Portal preview buttons from customer edit forms and directory cards.

---

### [Phase 18] - Unified Workforce Architecture, Dynamic Department Creator & Save Reliability
*Unifies Employees, Team Members, and Client Relationship Managers with dynamic department creation and saves.*

- [x] **Task 18.1: Business Profile Save Fix (`lib/business-profile-actions.ts`)**
  - Updated role check to recognize `super_admin`, resolving the `"Business vertical is permanently locked"` permission error.
- [x] **Task 18.2: Attendance Page Crash Defense (`app/(dashboard)/payroll/attendance/page.tsx`)**
  - Added safe array guards for `empData` and `attData` with `.catch(() => [])` fallbacks, eliminating `TypeError: Cannot read properties of undefined (reading 'filter')`.
- [x] **Task 18.3: Dynamic Department Creation (`app/(dashboard)/payroll/employees/page.tsx`)**
  - Added interactive Department selector with suggestions datalist (*Engineering, Sales & Client Relations, Accounts, HR, Operations*) and instant custom department typing.
- [x] **Task 18.4: Unified Workforce Architecture Documentation**
  - Formulated full architectural map unifying Employee payroll records with Team Member login roles (Admin, HR, Manager, Client RM, Staff).
- [x] **Task 18.5: Bi-Directional Employee-Team Member Sync & Role Assignment**
  - Integrated Employment Type selector (*Full-Time, Part-Time, Contract, Intern*) into Employee Onboarding.
  - Added Operational Team Role selector (*General Employee, Operations Manager, HR Executive, Client Relationship Manager, Relationship Agent, Administrator*) when enabling login access.
  - Automated bi-directional synchronization in `createEmployee` (`lib/payroll-actions.ts`) to automatically register auth credentials, assign `user_profiles.role`, and establish membership in `team_members` with designated role ID and designation.
- [x] **Task 18.6: Super Admin Unrestricted ERP Privileges & Team Members RLS Fix**
  - Updated `getUserPlanStatus()` (`lib/plan-utils.ts`) to recognize `super_admin` with underscores, permanently unlocking VIP Enterprise status (unlimited invoices, team members, customers, and all modules).
  - Fixed Row-Level Security policy violation on `team_members` by enforcing authenticated user client session fallback during member invitations and employee synchronization.
  - Removed team seat limit checks for Super Admin in `/team` and `/api/team/invite` (allowing unlimited team members and employees).
  - Locked the primary Super Admin workspace vertical to Software Development & IT (`software_it`).
  - Authored SQL migration script `supabase-superadmin-unrestricted-rls.sql` for database-level RLS policy alignment.

---

### [Phase 19] - Partial Payment Engine Fix, Layman-Friendly Quick Actions & Quotation Workflow
*Fixes the 0-default remaining balance bug, provides 1-click partial payment presets, and aligns the Quotation / Proforma to Tax Invoice pipeline.*

- [x] **Task 19.1: Fix Remaining Balance 0-Default Bug (`InvoicesList.tsx`, `actions.ts`, `partial-payment/route.ts`)**
  - Resolved `Max ₹0.00` error caused by legacy database column defaults where `amount_remaining` was stored as `0` for unpaid invoices.
  - Formulated resilient fallback: `amountRemaining = invoice.status === 'paid' ? 0 : ((storedRemaining > 0 && storedRemaining <= total) ? storedRemaining : Math.max(0, total - amountPaid))`.
- [x] **Task 19.2: Layman-Friendly Quick Payment Presets (`InvoicesList.tsx`, `PartialPaymentButton.tsx`)**
  - Added 1-click partial payment percentage chips (*25%*, *50%*, *Full Balance*) directly below the amount input so users don't have to calculate sums manually.
- [x] **Task 19.3: Quotation / Proforma Invoice Workflow Architecture**
  - Clarified separation: Quotations / Proforma estimates serve as pre-sale preliminary quotes without demanding upfront GST liability.
  - Leveraged `convertProformaToInvoice()` (`lib/advanced-invoice-actions.ts`) to enable 1-click conversion from accepted quotes into final legal Tax Invoices without disturbing current billing flows.
- [x] **Task 19.4: Resilient Employee Onboarding & Login Provisioning (`lib/payroll-actions.ts`)**
  - Implemented multi-tier fallback for employee login creation: tries admin auth client if service key exists, falls back to `supabase.auth.signUp()`, and auto-resolves existing registered users.
  - Replaced strict failure with non-blocking auth setup and automatic retry on duplicate `employee_code` collisions, ensuring employee creation never crashes or blocks the user.
- [x] **Task 19.5: Adaptive Schema Compatibility for Employees (`lib/payroll-actions.ts`, `supabase-superadmin-unrestricted-rls.sql`)**
  - Resolved `Could not find the 'address' column of 'employees' in the schema cache` error by introducing dual-phase adaptive inserts and updates.
  - Inserts and updates automatically retry with guaranteed base columns if extended columns (`address`, `bank_name`, `bank_branch`, `employee_user_id`) are missing from the active database schema cache.
  - Added safe `select('*')` query guard in `updateEmployee` to avoid querying nonexistent columns.
  - Added idempotent schema migration commands in `supabase-superadmin-unrestricted-rls.sql` for adding `address`, `bank_name`, `bank_branch`, `employee_user_id`, and `employment_type`.

---

### [Phase 20] - Event Management & MICE Industry Vertical Suite
*Specialized workflow, event metadata, milestone-based billing, and CRM team member sync strictly active for event management organizations.*

- [ ] **Task 20.1: Vertical Detection & Industry-Gated Feature Flags**
  - Configure `business_type === 'event_management'` detection across settings and session contexts so event-specific fields only render when enabled.
- [x] **Task 20.2: CRM Employee & Team Member Assignee Sync (`lib/crm-actions.ts`)**
  - Enhanced `getCRMTeamMembers()` to query both invited `team_members` and active employees from the `employees` table.
  - Automatically merges organization employees (e.g. Event Managers, Operations Leads) with deduplication by email and user ID.
  - Employees now immediately populate CRM lead assignment dropdowns (`LeadModal.tsx`), Kanban cards (`KanbanBoard.tsx`), and team performance leaderboards (`TeamPerformanceView.tsx`) without requiring redundant manual invites.
- [ ] **Task 20.3: Event Metadata on Quotes & Invoices**
  - Support Event Name, Event Dates (Start/End), Venue/Destination, and Pax count in invoices and quotations via JSONB `business_metadata`.
- [ ] **Task 20.4: Staged Milestone Invoicing Presets**
  - Enable 1-click milestone payment schedules (e.g. 20% Booking Advance, 50% Pre-Event Vendor Lock, 30% Post-Event Settlement) for event contracts.
- [ ] **Task 20.5: Build Verification & Deployment**
  - Run full build verification and deploy Phase 20 to production.
