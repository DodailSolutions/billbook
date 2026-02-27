'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getMyCAProfile, updateCAProfile, getCAStats } from '@/lib/ca-profile-actions'
import type { CAProfessional, CASpecialization } from '@/lib/hire-ca-types'
import {
  User,
  Briefcase,
  MapPin,
  IndianRupee,
  Award,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  Edit,
  Save,
  X,
} from 'lucide-react'

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

export default function CAProfileManagementPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CAProfessional | null>(null)
  const [stats, setStats] = useState<{
    average_rating: number
    total_reviews: number
    total_clients: number
    proposals_sent: number
    active_engagements: number
    total_earnings: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    firm_name: '',
    years_of_experience: 0,
    specializations: [] as CASpecialization[],
    office_address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    consultation_fee: undefined as number | undefined,
    monthly_retainer_fee: undefined as number | undefined,
    available_for_hire: true,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [profileData, statsData] = await Promise.all([getMyCAProfile(), getCAStats()])

    if (!profileData) {
      router.push('/ca-registration')
      return
    }

    setProfile(profileData)
    setStats(statsData)
    setFormData({
      full_name: profileData.full_name,
      email: profileData.email,
      phone: profileData.phone,
      firm_name: profileData.firm_name || '',
      years_of_experience: profileData.years_of_experience,
      specializations: profileData.specializations,
      office_address: profileData.office_address,
      city: profileData.city,
      state: profileData.state,
      pincode: profileData.pincode,
      bio: profileData.bio || '',
      consultation_fee: profileData.consultation_fee,
      monthly_retainer_fee: profileData.monthly_retainer_fee,
      available_for_hire: profileData.available_for_hire,
    })
    setLoading(false)
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const handleSpecializationToggle = (spec: CASpecialization) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateCAProfile(formData)
    setSaving(false)

    if (result.success) {
      setProfile(result.data)
      setEditing(false)
      alert('Profile updated successfully!')
    } else {
      alert(result.error || 'Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">CA Profile Management</h1>
          <p className="text-gray-600">
            Manage your professional profile, services, and pricing
          </p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviews</p>
                <p className="text-2xl font-bold">{stats.total_reviews}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-bold">{stats.total_clients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Proposals</p>
                <p className="text-2xl font-bold">{stats.proposals_sent}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active_engagements}</p>
              </div>
              <Briefcase className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earnings</p>
                <p className="text-xl font-bold">₹{(stats.total_earnings / 1000).toFixed(0)}k</p>
              </div>
              <IndianRupee className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>

            {!editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="font-semibold">{profile.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Firm Name</label>
                    <p className="font-semibold">{profile.firm_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Experience</label>
                    <p className="font-semibold">{profile.years_of_experience} years</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Firm Name</label>
                    <input
                      type="text"
                      value={formData.firm_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, firm_name: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.years_of_experience}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          years_of_experience: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Specializations */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Specializations
            </h2>

            {!editing ? (
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => handleSpecializationToggle(spec)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.specializations.includes(spec)
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200  hover:border-blue-300'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Office Location
            </h2>

            {!editing ? (
              <div className="space-y-2">
                <p className="text-gray-600">{profile.office_address}</p>
                <p className="font-semibold">
                  {profile.city}, {profile.state} - {profile.pincode}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Office Address</label>
                  <input
                    type="text"
                    value={formData.office_address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, office_address: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, state: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pincode: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Bio */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Professional Bio</h2>

            {!editing ? (
              <p className="text-gray-600">
                {profile.bio || 'No bio added yet'}
              </p>
            ) : (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                placeholder="Tell clients about your expertise..."
              />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <IndianRupee className="w-5 h-5 mr-2" />
              Pricing
            </h2>

            {!editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">
                    Consultation Fee
                  </label>
                  <p className="text-2xl font-bold">
                    {profile.consultation_fee
                      ? `₹${profile.consultation_fee.toLocaleString()}`
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    Monthly Retainer
                  </label>
                  <p className="text-2xl font-bold">
                    {profile.monthly_retainer_fee
                      ? `₹${profile.monthly_retainer_fee.toLocaleString()}`
                      : 'Not set'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.consultation_fee || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        consultation_fee: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="e.g., 2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Retainer (₹)</label>
                  <input
                    type="number"
                    value={formData.monthly_retainer_fee || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        monthly_retainer_fee: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="e.g., 10000"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Verification Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Verification Status</h2>

            <div className="flex items-center gap-3">
              {profile.verification_status === 'verified' ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-600">Verified</p>
                    <p className="text-sm text-gray-600">
                      ICAI: {profile.icai_membership_number}
                    </p>
                  </div>
                </>
              ) : profile.verification_status === 'pending' ? (
                <>
                  <Award className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-600">Pending Verification</p>
                    <p className="text-sm text-gray-600">
                      Under review (24-48 hours)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <X className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-600">Verification Failed</p>
                    <p className="text-sm text-gray-600">
                      Please contact support
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Availability */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Availability</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Available for Hire</span>
              {!editing ? (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.available_for_hire
                      ? 'bg-green-100  text-green-700 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {profile.available_for_hire ? 'Yes' : 'No'}
                </span>
              ) : (
                <input
                  type="checkbox"
                  checked={formData.available_for_hire}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, available_for_hire: e.target.checked }))
                  }
                  className="w-6 h-6"
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
