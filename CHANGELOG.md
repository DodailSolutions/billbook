# BillBook Changelog

All notable changes to BillBook will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-XX

### 🎉 Major Release: Recurring Invoices & Reminders

This release introduces automated billing capabilities with recurring invoices and payment reminders, transforming BillBook into a complete subscription billing solution.

### Added

#### Recurring Invoices
- **Recurring Invoice Templates**: Create templates for automated invoice generation
- **Multiple Frequencies**: Support for monthly and yearly billing cycles
- **Flexible Scheduling**: Set start and end dates for recurring billing
- **Status Management**: Pause and resume recurring invoices without deletion
- **Manual Generation**: Generate invoices immediately with "Generate Now" button
- **Card-Based UI**: Modern grid layout showing all recurring invoices
- **Next Invoice Display**: Clear visibility of when next invoice will generate
- **Template Management**: Edit, pause, resume, or delete recurring templates

#### Payment Reminders
- **Automated Reminder Creation**: Reminders created automatically with invoice generation
- **Due Date Notifications**: 7-day advance notice before payments are due
- **Recurring Alerts**: Notifications for upcoming recurring invoice generation
- **30-Day Overview**: See all reminders for the next month
- **Date Grouping**: Reminders organized by date for easy scanning
- **Status Indicators**: Highlight today and overdue reminders
- **Reminder Actions**: Mark reminders as sent or dismiss them
- **Multiple Types**: Support for due_date, overdue, and recurring_upcoming reminders

#### Database
- **New Tables**: 
  - `recurring_invoices` - Stores recurring invoice templates
  - `recurring_invoice_items` - Line items for recurring templates
  - `reminders` - Payment and billing reminders
- **Database Functions**:
  - `generate_recurring_invoice()` - Automated invoice generation logic
  - `create_recurring_reminders()` - Automated reminder creation
- **RLS Policies**: Complete row-level security for all new tables
- **Indexes**: Optimized queries with proper indexing
- **Triggers**: Automatic timestamp updates

#### Navigation
- **New Sidebar Links**:
  - "Recurring" with RefreshCw icon
  - "Reminders" with Bell icon
- **Color-Coded Icons**: Distinct colors for each navigation item

#### Documentation
- **RECURRING_INVOICES.md**: Comprehensive 400+ line guide covering:
  - Setup instructions
  - Usage examples
  - Automation options (3 different approaches)
  - Best practices
  - Troubleshooting
  - API reference
  - Database schema reference
- **RECURRING_IMPLEMENTATION.md**: Technical implementation details
- **Updated README.md**: Added recurring features and automation setup
- **Updated FEATURES.md**: Added recurring invoices checklist
- **Updated SETUP.md**: Added recurring schema deployment steps
- **Updated QUICK_REFERENCE.md**: Added common tasks for recurring features

#### Type Safety
- **New TypeScript Interfaces**:
  - `RecurringInvoice`
  - `RecurringInvoiceItem`
  - `RecurringInvoiceWithDetails`
  - `Reminder`
  - `ReminderWithDetails`

#### Server Actions
- **Recurring Invoice Actions** (`app/(dashboard)/invoices/recurring/actions.ts`):
  - `getRecurringInvoices()` - Fetch all with customer details
  - `getRecurringInvoice(id)` - Fetch single recurring invoice
  - `createRecurringInvoice(data)` - Create new template
  - `updateRecurringInvoiceStatus(id, is_active)` - Pause/resume
  - `deleteRecurringInvoice(id)` - Delete template
  - `generateInvoiceFromRecurring(id)` - Manual generation
- **Reminder Actions** (`app/(dashboard)/reminders/actions.ts`):
  - `getReminders()` - Fetch all unsent reminders
  - `getUpcomingReminders(days)` - Fetch reminders for next N days
  - `markReminderAsSent(id)` - Mark as sent
  - `deleteReminder(id)` - Dismiss reminder
  - `createReminderForInvoice()` - Create custom reminder

### Changed
- **Sidebar**: Updated with new navigation links and icons
- **Documentation**: Comprehensive updates across all docs
- **Type Definitions**: Extended `lib/types.ts` with new interfaces

### Technical Details
- **Lines of Code**: ~2,500 new lines
- **New Files**: 15 files created
- **Updated Files**: 6 files modified
- **Database Tables**: +3 new tables (total: 7)
- **Database Functions**: +2 new functions
- **Server Actions**: +11 new actions
- **Pages**: +3 new pages
- **Components**: +3 new components

### Architecture
- **Pattern**: Server Components with Client Components for interactivity
- **Data Flow**: Server Actions for all mutations
- **Security**: Row Level Security on all tables
- **Performance**: Indexed columns for efficient queries
- **Type Safety**: Full TypeScript coverage

### Automation Options
1. **Manual**: Built-in "Generate Now" button (no setup required)
2. **Supabase Edge Function**: Scheduled daily function (requires Pro plan)
3. **External Cron**: API endpoint + external service (free tier compatible)

### Migration
- Run `supabase-recurring-schema.sql` in Supabase SQL Editor
- No breaking changes to existing features
- Backward compatible with existing invoices

---

## [1.0.0] - 2024-01-XX

### Initial Release

#### Core Features
- **User Authentication**: Signup, login, session management with Supabase Auth
- **Customer Management**: Full CRUD operations for customers
- **Invoice Management**: Create, edit, view, delete invoices
- **PDF Generation**: Download invoices as PDF with print support
- **GST Calculations**: Automatic tax calculations
- **Dashboard**: Revenue and invoice statistics
- **Auto Invoice Numbers**: Format: INV-YYYY-NNNN

#### Technical Stack
- Next.js 16 with App Router
- TypeScript for type safety
- Supabase for database and auth
- Tailwind CSS for styling
- Row Level Security (RLS)
- Server Actions for mutations

#### Security
- Protected routes via middleware
- User data isolation
- RLS policies on all tables
- Secure authentication

#### Documentation
- README.md with full feature list
- SETUP.md with step-by-step guide
- FEATURES.md with implementation checklist
- PROJECT_SUMMARY.md with overview
- QUICK_REFERENCE.md for common tasks

---

## Versioning

- **Major version** (X.0.0): Breaking changes or significant new features
- **Minor version** (1.X.0): New features, backward compatible
- **Patch version** (1.0.X): Bug fixes, backward compatible

## Upcoming

See [Future Enhancements](README.md#future-enhancements) in README for planned features.

### Under Consideration
- Email notifications for reminders
- SMS notifications via Twilio
- Payment gateway integration
- Multi-currency support
- Expense tracking
- Client portal
- Mobile app
- Advanced reporting

---

**Note**: BillBook is actively developed. Check back for updates!
