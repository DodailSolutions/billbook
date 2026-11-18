import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  Calendar, 
  IndianRupee, 
  ShieldCheck, 
  Building2,
  Clock,
  ArrowLeft
} from 'lucide-react'

export default async function CAProfilePage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login?redirect=/ca-profile')
  }

  // Check in ca_professionals first (Marketplace registration)
  const { data: caProf } = await supabase
    .from('ca_professionals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fallback to ca_profiles (GST module)
  const { data: caGstProfile } = await supabase
    .from('ca_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const profile = caProf || caGstProfile

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-amber-900">
              <Building2 className="h-6 w-6 text-amber-600" />
              CA Profile Not Found
            </CardTitle>
            <CardDescription className="text-amber-800">
              You haven&apos;t registered your Chartered Accountant profile yet. Register to connect with clients on the CA Marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/ca-registration">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Register as a CA
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ca-dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              CA Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">CA Professional Profile</h1>
        </div>
        <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'} className="capitalize">
          {profile.verification_status || 'Under Review'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Overview Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl mb-2">
              {profile.full_name?.slice(0, 2).toUpperCase() || 'CA'}
            </div>
            <CardTitle className="text-lg font-semibold">{profile.full_name || 'Chartered Accountant'}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              ICAI: {profile.icai_membership_number || profile.membership_number || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-sm border-t mt-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">{profile.firm_name || 'Independent Practice'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">{profile.email || user.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{profile.city || profile.state ? `${profile.city || ''}, ${profile.state || ''}` : 'Location Not Set'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Credentials & Services */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Practice & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                <div>
                  <span className="text-xs text-gray-500 block">Experience</span>
                  <span className="font-medium text-gray-900">{profile.years_of_experience || 0} Years</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Total Clients</span>
                  <span className="font-medium text-gray-900">{profile.total_clients || 0} Connected</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 block mb-2 font-medium">Specializations</span>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.specializations || ['GST', 'Income Tax', 'Bookkeeping']).map((s: string) => (
                    <Badge key={s} variant="outline" className="bg-gray-50 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {profile.bio && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1 font-medium">About</span>
                  <p className="text-gray-700 text-xs leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                Pricing & Retainer Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50/60 rounded-lg border border-green-100">
                <span className="text-xs text-gray-600 block">Consultation Fee</span>
                <span className="text-lg font-bold text-green-700">
                  ₹{Number(profile.consultation_fee || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Per consultation session</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-600 block">Monthly Retainer</span>
                <span className="text-lg font-bold text-blue-700">
                  ₹{Number(profile.monthly_retainer_fee || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Ongoing compliance & filing</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
