'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getCAMarketplace } from '@/lib/hire-ca-actions'
import type { CAMarketplaceItem, CASearchFilters, CASpecialization } from '@/lib/hire-ca-types'
import {
  Search,
  MapPin,
  Star,
  Users,
  Briefcase,
  IndianRupee,
  Filter,
  ArrowLeft,
  Award,
  Home,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const SPECIALIZATIONS: CASpecialization[] = [
  'GST',
  'Income Tax',
  'Audit',
  'Company Law',
  'Financial Planning',
  'Bookkeeping',
  'Payroll',
  'TDS',
  'International Taxation',
]

const STATES = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Telangana',
  'Punjab',
]

export default function CAMarketplacePage() {
  const router = useRouter()
  const [cas, setCAs] = useState<CAMarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPolicies, setShowPolicies] = useState(false)

  const [filters, setFilters] = useState<CASearchFilters>({
    city: undefined,
    state: undefined,
    specializations: undefined,
    min_rating: undefined,
    max_consultation_fee: undefined,
    max_retainer_fee: undefined,
    min_experience: undefined,
  })

  const loadCAs = useCallback(async () => {
    setLoading(true)
    const data = await getCAMarketplace(filters)
    setCAs(data)
    setLoading(false)
  }, [filters])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCAs()
  }, [loadCAs])

  // Apply search filter using useMemo
  const filteredCAsComputed = useMemo(() => {
    if (searchQuery.trim()) {
      return cas.filter(ca => 
        ca.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ca.firm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ca.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ca.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return cas
  }, [searchQuery, cas])

  const handleApplyFilters = () => {
    loadCAs()
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({
      city: undefined,
      state: undefined,
      specializations: undefined,
      min_rating: undefined,
      max_consultation_fee: undefined,
      max_retainer_fee: undefined,
      min_experience: undefined,
    })
  }

  const toggleSpecialization = (spec: CASpecialization) => {
    setFilters((prev) => {
      const current = prev.specializations || []
      const updated = current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec]
      return { ...prev, specializations: updated.length > 0 ? updated : undefined }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Rules & Policies Modal */}
      {showPolicies && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">CA Hiring Rules & Policies</h2>
                <Button variant="ghost" onClick={() => setShowPolicies(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6 text-sm">
                {/* For Clients */}
                <section>
                  <h3 className="text-lg font-bold mb-3 text-blue-600 dark:text-blue-400">For Clients</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Verification & Due Diligence</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>All CAs on our platform are ICAI (Institute of Chartered Accountants of India) verified</li>
                        <li>Review CA profiles, ratings, and client reviews before engaging</li>
                        <li>Request credentials and certificates if needed for compliance</li>
                        <li>Verify the CA&apos;s specialization matches your requirement (GST, Tax Filing, Audit, etc.)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2. Engagement Terms</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li><strong>Consultation:</strong> One-time advisory sessions with defined scope and deliverables</li>
                        <li><strong>Monthly Retainer:</strong> Ongoing support with monthly fee; minimum 3-month commitment recommended</li>
                        <li><strong>Project-Based:</strong> Fixed scope with milestone-based payments and timelines</li>
                        <li>All payment terms must be agreed upon before work commences</li>
                        <li>Use BillBooky&apos;s proposal system for transparent communication and documentation</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">3. GST Filing Requirements</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Provide accurate and complete financial records by the 5th of each month</li>
                        <li>Maintain proper invoice records in BillBooky or provide Excel/CSV exports</li>
                        <li>Share GST portal credentials securely or grant EVC access to your CA</li>
                        <li>Monthly filing: GSTR-1, GSTR-3B; Quarterly filing as per turnover eligibility</li>
                        <li>Annual returns: GSTR-9 and GSTR-9C (if applicable) must be filed by December 31st</li>
                        <li>Inform CA immediately of any notices or communications from GST authorities</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">4. Income Tax Filing Requirements</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Submit all financial documents (Form 16, Form 26AS, investment proofs) by June 15th</li>
                        <li>For businesses: Maintain books of accounts, bank statements, and expense records</li>
                        <li>Share ITR portal login or grant e-filing access to your CA</li>
                        <li>Individual ITR filing deadline: July 31st; Business/Audit cases: October 31st</li>
                        <li>Advance tax payments must be coordinated quarterly (June 15, Sept 15, Dec 15, Mar 15)</li>
                        <li>Respond promptly to CA queries to avoid last-minute delays</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">5. Payment & Refund Policy</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Consultation fees: Full payment upfront before scheduled session</li>
                        <li>Monthly retainers: Advance payment by 1st of each month</li>
                        <li>Project-based: 50% advance, remaining upon completion or milestone-based</li>
                        <li>Cancellation: 48-hour notice required; cancellations within 24 hours non-refundable</li>
                        <li>Refunds processed within 7-10 business days to original payment method</li>
                        <li>Dispute resolution available through BillBooky support team</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">6. Data Security & Confidentiality</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>CAs are bound by professional confidentiality under ICAI Code of Ethics</li>
                        <li>Share sensitive documents through BillBooky&apos;s secure document upload system</li>
                        <li>Never share bank passwords; use read-only access or bank statements</li>
                        <li>CAs must delete client data post-engagement unless legally required to retain</li>
                        <li>Report any data breach or security concerns immediately to BillBooky</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* For CAs */}
                <section className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-3 text-emerald-600 dark:text-emerald-400">For Chartered Accountants</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Professional Conduct</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Maintain ICAI Code of Ethics and professional standards at all times</li>
                        <li>Only accept engagements within your area of expertise and certification</li>
                        <li>Disclose any conflicts of interest or limitations before accepting work</li>
                        <li>Maintain professional indemnity insurance (recommended minimum ₹10 lakhs)</li>
                        <li>Provide realistic timelines and communicate proactively about delays</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2. Accepting Client Work</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Review client requirements thoroughly before submitting proposals</li>
                        <li>Clearly state deliverables, timelines, fees, and payment terms in proposals</li>
                        <li>Accept only the number of clients you can service with quality and attention</li>
                        <li>Perform KYC verification and collect necessary client documents before starting</li>
                        <li>Issue engagement letters outlining scope, fees, responsibilities, and terms</li>
                        <li>Maximum response time for client queries: 24 hours on business days</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">3. GST Filing Service Standards</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Request complete records from clients by 5th of each month for timely filing</li>
                        <li>File GSTR-1 and GSTR-3B by due dates (10th and 20th of following month)</li>
                        <li>Reconcile ITC (Input Tax Credit) and reverse if claimed incorrectly</li>
                        <li>Maintain GSTR-2B reconciliation records and resolve discrepancies</li>
                        <li>Advise clients on reverse charge, composition scheme, and compliance changes</li>
                        <li>Prepare and file annual returns (GSTR-9/9C) by December 31st deadline</li>
                        <li>Immediately inform clients of notices, demand orders, or portal updates</li>
                        <li>Assist with GST audits and respond to department queries within 7 days</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">4. Income Tax Filing Service Standards</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Collect all necessary documents from clients by June 15th for timely filing</li>
                        <li>File individual ITRs by July 31st; business returns by October 31st</li>
                        <li>Optimize tax liability within legal framework; claim all eligible deductions</li>
                        <li>Advise on advance tax payments quarterly to avoid interest under Sections 234B/234C</li>
                        <li>E-verify returns within 30 days using Aadhaar OTP, net banking, or DSC</li>
                        <li>Maintain computation sheets, tax calculation workings, and supporting documents</li>
                        <li>Respond to income tax notices within 15 days; seek extensions if needed</li>
                        <li>File revised returns if errors discovered; inform clients of implications</li>
                        <li>Provide tax planning advice for upcoming financial year by March</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">5. Pricing & Billing Guidelines</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Set fair and transparent pricing based on complexity and effort required</li>
                        <li>Clearly specify what&apos;s included and what attracts additional charges</li>
                        <li>Issue detailed invoices via BillBooky with service description and GST breakup</li>
                        <li>Additional charges (late submissions, revisions, urgent work) must be pre-approved</li>
                        <li>Offer volume discounts for multiple services or long-term retainers</li>
                        <li>Update pricing annually; inform existing clients 30 days before rate changes</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">6. Quality & Compliance Commitments</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Zero tolerance for filing incorrect or fraudulent returns</li>
                        <li>Double-check all calculations, figures, and statutory compliance before submission</li>
                        <li>Keep up-to-date with GST Council updates, Finance Act amendments, and circulars</li>
                        <li>Attend minimum 40 hours of CPE (Continuing Professional Education) annually</li>
                        <li>Maintain professional liability insurance covering client claims</li>
                        <li>Archive client data securely for statutory period (minimum 7 years for tax records)</li>
                        <li>Use licensed accounting software; never use pirated or unauthorized tools</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">7. Ethics & Restrictions</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Never request clients to create fake invoices or manipulate records</li>
                        <li>Do not accept cash payments exceeding ₹10,000 per transaction</li>
                        <li>Refuse work involving money laundering, tax evasion, or illegal activities</li>
                        <li>Report suspicious client activities to authorities as legally mandated</li>
                        <li>Maintain client confidentiality except where disclosure required by law</li>
                        <li>Avoid conflicts of interest; do not represent competing businesses in same domain</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* General Terms */}
                <section className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-3">General Terms</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                    <li>BillBooky acts as a facilitator connecting clients and CAs; we are not party to agreements</li>
                    <li>Both parties must comply with Income Tax Act, GST Act, and all applicable laws</li>
                    <li>Disputes should be resolved amicably; escalate to BillBooky support if needed</li>
                    <li>BillBooky reserves the right to suspend accounts violating platform policies</li>
                    <li>Force majeure events (IT system downtime, government portal issues) may affect timelines</li>
                    <li>These policies are subject to updates; users will be notified of material changes</li>
                  </ul>
                </section>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                  <p className="text-sm font-semibold mb-2">Need Help?</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For questions about these policies or to report violations, contact us at{' '}
                    <a href="mailto:support@billbooky.com" className="text-blue-600 hover:underline">
                      support@billbooky.com
                    </a>
                    {' '}or call our helpline at 1800-XXX-XXXX
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowPolicies(false)}>Close</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo-icon.svg" 
                  alt="BillBooky Logo" 
                  width={40} 
                  height={40}
                />
              </div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                BillBooky
              </h1>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setShowPolicies(true)} className="gap-2">
                Rules & Policies
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/reports/hire-ca">
                <Button>Post Requirements</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Chartered Accountant</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse our network of {cas.length} verified CAs and find the perfect match for your business
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/reports/hire-ca">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Post Your Requirements</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized proposals from CAs</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/reports/my-ca-requests">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">View My Requests</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check proposals and manage engagements</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, firm, city, or specialization..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(filters).filter(Boolean).length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  value={filters.state || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, state: e.target.value || undefined }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">All States</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, city: e.target.value || undefined }))
                  }
                  placeholder="Enter city name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                <select
                  value={filters.min_rating || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_rating: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={filters.max_consultation_fee || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      max_consultation_fee: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Monthly Retainer (₹)</label>
                <input
                  type="number"
                  value={filters.max_retainer_fee || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      max_retainer_fee: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="e.g., 15000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Experience (Years)</label>
                <input
                  type="number"
                  value={filters.min_experience || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_experience: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-3">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filters.specializations?.includes(spec)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </Card>
        )}

        {/* Results */}
        {loading ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading CA marketplace...</p>
              <p className="text-sm text-gray-500 mt-2">Finding the best chartered accountants for you</p>
            </div>
          </Card>
        ) : filteredCAsComputed.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No matching CAs found' : 'No CAs available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? `No CAs match "${searchQuery}". Try different search terms.`
                : 'Try adjusting your filters or check back later'}
            </p>
            <div className="flex gap-3 justify-center">
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button onClick={handleClearFilters}>Clear All Filters</Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredCAsComputed.length} {filteredCAsComputed.length === 1 ? 'CA' : 'CAs'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCAsComputed.map((ca) => (
                <Card key={ca.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{ca.full_name}</h3>
                        {ca.verification_status === 'verified' && (
                          <Award className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      {ca.firm_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ca.firm_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                        {ca.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {ca.city}, {ca.state}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {ca.years_of_experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-2" />
                      {ca.total_clients} clients • {ca.total_reviews} reviews
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {ca.specializations.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                      >
                        {spec}
                      </span>
                    ))}
                    {ca.specializations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                        +{ca.specializations.length - 3} more
                      </span>
                    )}
                  </div>

                  {ca.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {ca.bio}
                    </p>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      {ca.consultation_fee && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Consultation</span>
                          <div className="flex items-center font-semibold">
                            <IndianRupee className="w-3 h-3" />
                            {ca.consultation_fee.toLocaleString()}
                          </div>
                        </div>
                      )}
                      {ca.monthly_retainer_fee && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Monthly</span>
                          <div className="flex items-center font-semibold">
                            <IndianRupee className="w-3 h-3" />
                            {ca.monthly_retainer_fee.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link href={`/ca-marketplace/${ca.id}`}>
                    <Button className="w-full">View Profile</Button>
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 BillBooky. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="/help" className="hover:text-blue-600 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
