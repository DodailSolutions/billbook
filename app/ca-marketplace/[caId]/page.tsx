'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/app/_components/Footer'
import { getCAProfile, getCAReviews } from '@/lib/hire-ca-actions'
import type { CAProfessional, CAReview } from '@/lib/hire-ca-types'
import {
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Award,
  Users,
  IndianRupee,
  Building,
  Languages,
  GraduationCap,
  CheckCircle,
  Home,
} from 'lucide-react'

export default function CAProfilePage({ params }: { params: { caId: string } }) {
  const router = useRouter()
  const [ca, setCA] = useState<CAProfessional | null>(null)
  const [reviews, setReviews] = useState<CAReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showPolicies, setShowPolicies] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    const [caData, reviewsData] = await Promise.all([
      getCAProfile(params.caId),
      getCAReviews(params.caId),
    ])
    setCA(caData)
    setReviews(reviewsData)
    setLoading(false)
  }, [params.caId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile()
  }, [loadProfile])

  const ratingBreakdown = ca && reviews.length > 0 ? {
    communication: reviews.reduce((sum, r) => sum + (r.communication_rating || 0), 0) / reviews.length || 0,
    expertise: reviews.reduce((sum, r) => sum + (r.expertise_rating || 0), 0) / reviews.length || 0,
    timeliness: reviews.reduce((sum, r) => sum + (r.timeliness_rating || 0), 0) / reviews.length || 0,
    value: reviews.reduce((sum, r) => sum + (r.value_for_money_rating || 0), 0) / reviews.length || 0,
  } : null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-9 h-9">
                  <Image 
                    src="/logo-icon.svg" 
                    alt="BillBooky Logo" 
                    width={36} 
                    height={36}
                  />
                </div>
                <span className="text-2xl font-black text-slate-950 tracking-tight">
                  BillBooky<span className="text-emerald-600">.</span>
                </span>
              </Link>
            </div>
          </div>
        </header>
        <div className="container max-w-6xl mx-auto py-16 px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            <p className="text-lg text-gray-600">Loading CA profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!ca) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
              <Link href="/ca-marketplace">
                <Button>Browse CAs</Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="container max-w-6xl mx-auto py-16 px-4">
          <Card className="p-12 text-center">
            <h3 className="text-2xl font-semibold mb-2">CA not found</h3>
            <p className="text-gray-600 mb-6">
              The CA profile you&apos;re looking for doesn&apos;t exist
            </p>
            <Button onClick={() => router.push('/ca-marketplace')}>Browse All CAs</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rules & Policies Modal */}
      {showPolicies && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPolicies(false)}>
          <Card className="max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">CA Hiring Rules & Policies</h2>
                <Button variant="ghost" onClick={() => setShowPolicies(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6 text-sm">
                <section>
                  <h3 className="text-lg font-bold mb-3 text-blue-600">For Clients</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. GST Filing Requirements</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Provide accurate and complete financial records by the 5th of each month</li>
                        <li>Maintain proper invoice records in BillBooky or provide Excel/CSV exports</li>
                        <li>Monthly filing: GSTR-1, GSTR-3B; Quarterly filing as per turnover eligibility</li>
                        <li>Annual returns: GSTR-9 and GSTR-9C (if applicable) must be filed by December 31st</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2. Income Tax Filing Requirements</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Submit all financial documents (Form 16, Form 26AS, investment proofs) by June 15th</li>
                        <li>Individual ITR filing deadline: July 31st; Business/Audit cases: October 31st</li>
                        <li>Advance tax payments must be coordinated quarterly (June 15, Sept 15, Dec 15, Mar 15)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">3. Payment Terms</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Consultation fees: Full payment upfront before scheduled session</li>
                        <li>Monthly retainers: Advance payment by 1st of each month</li>
                        <li>Project-based: 50% advance, remaining upon completion or milestone-based</li>
                        <li>48-hour cancellation notice required; within 24 hours non-refundable</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-3 text-emerald-600 dark:text-emerald-400">For Chartered Accountants</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Professional Standards</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Maintain ICAI Code of Ethics at all times</li>
                        <li>Only accept engagements within your area of expertise</li>
                        <li>Respond to client queries within 24 hours on business days</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2. GST Filing Service Standards</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>File GSTR-1 and GSTR-3B by due dates (10th and 20th of following month)</li>
                        <li>Reconcile ITC (Input Tax Credit) and resolve discrepancies</li>
                        <li>Prepare and file annual returns (GSTR-9/9C) by December 31st deadline</li>
                        <li>Immediately inform clients of notices or portal updates</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">3. Income Tax Filing Service Standards</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>File individual ITRs by July 31st; business returns by October 31st</li>
                        <li>Optimize tax liability within legal framework</li>
                        <li>E-verify returns within 30 days using Aadhaar OTP, net banking, or DSC</li>
                        <li>Respond to income tax notices within 15 days</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">4. Ethics & Compliance</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li>Zero tolerance for filing incorrect or fraudulent returns</li>
                        <li>Maintain client confidentiality under ICAI Code of Ethics</li>
                        <li>Refuse work involving tax evasion or illegal activities</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Need Help?</p>
                  <p className="text-sm text-gray-600">
                    For questions, contact{' '}
                    <a href="mailto:support@billbooky.com" className="text-blue-600 hover:underline">
                      support@billbooky.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Link href="/ca-marketplace">
                  <Button variant="outline">View Full Policies</Button>
                </Link>
                <Button onClick={() => setShowPolicies(false)}>Close</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
                <Button>Request Proposal</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.push('/ca-marketplace')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{ca.full_name}</h1>
                    {ca.verification_status === 'verified' && (
                      <Award className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  {ca.firm_name && (
                    <p className="text-lg text-gray-600 mb-2">{ca.firm_name}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-semibold">{ca.average_rating.toFixed(1)}</span>
                      <span className="text-gray-600">
                        ({ca.total_reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {ca.total_clients} clients
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  {ca.city}, {ca.state}
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-5 h-5 mr-2" />
                  {ca.years_of_experience} years experience
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  {ca.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-2" />
                  {ca.phone}
                </div>
              </div>

              {ca.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{ca.bio}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {ca.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {ca.education && ca.education.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </h3>
                  <ul className="space-y-2">
                    {ca.education.map((edu, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        <span className="text-gray-600">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ca.certifications && ca.certifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Certifications
                  </h3>
                  <ul className="space-y-2">
                    {ca.certifications.map((cert, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                        <span className="text-gray-600">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ca.languages_spoken && ca.languages_spoken.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Languages className="w-5 h-5 mr-2" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ca.languages_spoken.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Client Reviews</h2>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{review.rating.toFixed(1)}</span>
                          </div>
                          {review.review_title && (
                            <span className="font-semibold">{review.review_title}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{review.review_text}</p>

                      {(review.communication_rating || review.expertise_rating || review.timeliness_rating || review.value_for_money_rating) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {review.communication_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Communication:</span>
                              <span className="font-semibold">{review.communication_rating}/5</span>
                            </div>
                          )}
                          {review.expertise_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Expertise:</span>
                              <span className="font-semibold">{review.expertise_rating}/5</span>
                            </div>
                          )}
                          {review.timeliness_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Timeliness:</span>
                              <span className="font-semibold">{review.timeliness_rating}/5</span>
                            </div>
                          )}
                          {review.value_for_money_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Value:</span>
                              <span className="font-semibold">{review.value_for_money_rating}/5</span>
                            </div>
                          )}
                        </div>
                      )}

                      {review.ca_response && (
                        <div className="mt-3 pl-4 border-l-2 border-blue-600">
                          <p className="text-sm font-semibold mb-1">CA Response:</p>
                          <p className="text-sm text-gray-600">{review.ca_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">
                    No reviews yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Be the first to work with {ca.full_name} and leave a review
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>

              {ca.consultation_fee && (
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 mb-1">
                    Consultation Fee
                  </div>
                  <div className="flex items-center text-2xl font-bold">
                    <IndianRupee className="w-5 h-5" />
                    {ca.consultation_fee.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">per consultation</div>
                </div>
              )}

              {ca.monthly_retainer_fee && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Monthly Retainer
                  </div>
                  <div className="flex items-center text-2xl font-bold">
                    <IndianRupee className="w-5 h-5" />
                    {ca.monthly_retainer_fee.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
              )}

              <Link href="/reports/hire-ca">
                <Button className="w-full">Request Proposal</Button>
              </Link>
            </Card>

            {/* Rating Breakdown */}
            {ratingBreakdown && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>

                <div className="space-y-3">
                  {[
                    { label: 'Communication', value: ratingBreakdown.communication },
                    { label: 'Expertise', value: ratingBreakdown.expertise },
                    { label: 'Timeliness', value: ratingBreakdown.timeliness },
                    { label: 'Value for Money', value: ratingBreakdown.value },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold">{item.value.toFixed(1)}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(item.value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Office Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Office Location
              </h3>
              <p className="text-gray-600 text-sm mb-2">{ca.office_address}</p>
              <p className="text-gray-600 text-sm">
                {ca.city}, {ca.state} {ca.pincode}
              </p>
            </Card>

            {/* ICAI Verification */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                ICAI Verification
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-600">
                  Member: {ca.icai_membership_number}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Verified by ICAI on {new Date(ca.verified_at || ca.created_at).toLocaleDateString()}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
