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

*Last Updated: 2026-11-22*
