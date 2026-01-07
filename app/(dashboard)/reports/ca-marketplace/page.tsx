'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

  const filteredCAs = cas.filter((ca) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      ca.full_name.toLowerCase().includes(query) ||
      ca.firm_name?.toLowerCase().includes(query) ||
      ca.city.toLowerCase().includes(query) ||
      ca.specializations.some((s) => s.toLowerCase().includes(query))
    )
  })

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Chartered Accountant</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our network of {cas.length} verified CAs and find the perfect match for your business
        </p>
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
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading CAs...</p>
        </div>
      ) : filteredCAs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No CAs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search query
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCAs.length} {filteredCAs.length === 1 ? 'CA' : 'CAs'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCAs.map((ca) => (
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

                <Link href={`/reports/ca-marketplace/${ca.id}`}>
                  <Button className="w-full">View Profile</Button>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
