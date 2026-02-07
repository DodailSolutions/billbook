import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/app/_components/Footer'
import { 
  Award, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  IndianRupee,
  Briefcase,
  FileText,
  Clock,
  Star,
  Building2,
  UserCheck
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'

const BENEFITS = [
  {
    icon: Users,
    title: 'Access to Quality Clients',
    description: 'Connect with verified businesses actively seeking CA services. No cold calling needed.',
    color: 'emerald'
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Practice',
    description: 'Expand your client base and increase your revenue with a steady stream of service requests.',
    color: 'blue'
  },
  {
    icon: Shield,
    title: 'Verified Platform',
    description: 'All businesses are verified. Work with genuine clients in a secure environment.',
    color: 'purple'
  },
  {
    icon: IndianRupee,
    title: 'Transparent Pricing',
    description: 'Set your own rates. Get paid fairly for your expertise with secure payment processing.',
    color: 'orange'
  },
  {
    icon: Clock,
    title: 'Flexible Working',
    description: 'Choose projects that fit your schedule. Work remotely or on-site as per your preference.',
    color: 'teal'
  },
  {
    icon: Star,
    title: 'Build Your Reputation',
    description: 'Earn reviews and ratings from satisfied clients. Showcase your expertise and success.',
    color: 'amber'
  }
]

const SERVICES_YOU_CAN_OFFER = [
  'GST Registration & Filing',
  'Income Tax Return Filing',
  'TDS Compliance',
  'Statutory Audits',
  'Company Incorporation',
  'Financial Planning & Advisory',
  'Bookkeeping & Accounting',
  'Payroll Management',
  'International Taxation',
  'Tax Planning & Optimization',
  'Company Law Matters',
  'Annual Compliance'
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Create Your Profile',
    description: 'Register and showcase your expertise, qualifications, and specializations.',
    icon: UserCheck
  },
  {
    step: '2',
    title: 'Receive Requests',
    description: 'Get notified when businesses post service requests matching your expertise.',
    icon: FileText
  },
  {
    step: '3',
    title: 'Send Proposals',
    description: 'Submit your proposals with your terms, timeline, and pricing.',
    icon: Briefcase
  },
  {
    step: '4',
    title: 'Get Hired & Earn',
    description: 'Once hired, deliver quality service and get paid securely through our platform.',
    icon: IndianRupee
  }
]

const STATS = [
  { value: '500+', label: 'Active Businesses', icon: Building2 },
  { value: '24-48h', label: 'Response Time', icon: Clock },
  { value: '100%', label: 'Secure Payments', icon: Shield },
  { value: '4.8/5', label: 'Avg Rating', icon: Star }
]

export default async function ForCAsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 ">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src="/logo-icon.svg" 
                alt="BillBooky Logo" 
                width={32} 
                height={32}
                className="transition-transform duration-200 hover:scale-110"
                priority
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 ">BillBooky</h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" className="bg-white dark:bg-gray-800 border-gray-300  text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/ca-registration">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base">
                    Register Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/50 opacity-30" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-6">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">For Chartered Accountants</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900  mb-6">
              Grow Your CA Practice
              <span className="block mt-2 text-blue-600">
                Connect with Clients
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Join India&apos;s leading platform connecting Chartered Accountants with businesses seeking expert financial services. 
              Expand your practice, work on your terms, and build lasting client relationships.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/ca-registration">
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Register as CA
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-2 border-gray-300  hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Already Registered? Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badge */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 ">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>ICAI Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>Fair Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-gray-50 /50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200  shadow-sm hover:shadow-md transition-all duration-200 text-center">
                  <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-4xl font-bold mb-2 text-gray-900 ">{stat.value}</div>
                  <div className="text-sm text-gray-600 ">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900  mb-4">
            Why Join BillBooky?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to grow your CA practice and connect with quality clients
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon
            const iconColorClasses = {
              emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600',
              blue: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600',
              purple: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600',
              orange: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600',
              teal: 'bg-teal-100 dark:bg-teal-500/10 text-teal-600',
              amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600',
            }
            return (
              <div 
                key={benefit.title}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200  shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
              >
                <div className={`inline-flex p-3 ${iconColorClasses[benefit.color as keyof typeof iconColorClasses]} rounded-xl mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 md:py-32 bg-linear-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900  mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple process to start connecting with clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="relative">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200  shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                        {step.step}
                      </div>
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900  mb-2">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {step.step !== '4' && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200 dark:bg-blue-800"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900  mb-4">
            Services You Can Offer
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Showcase your expertise across various CA services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES_YOU_CAN_OFFER.map((service) => (
            <div 
              key={service}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200  shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
            >
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-gray-900  font-medium">{service}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 md:py-32 max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
            <Award className="h-12 w-12" />
          </div>
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Expand Your Practice?
          </h3>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of CAs already growing their business through BillBooky. Start receiving client requests today.
          </p>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-10 shadow-xl"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ca-registration">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-10 shadow-xl"
                >
                  Register as CA →
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
          
          <p className="text-sm text-blue-100 mt-6">
            Free to register • No commission on first 5 clients • Verified businesses only
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900  mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 ">
            <h3 className="text-lg font-bold text-gray-900  mb-2">
              Is there any registration fee?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No, registration is completely free. We only charge a small service fee when you successfully complete a project.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 ">
            <h3 className="text-lg font-bold text-gray-900  mb-2">
              How do I get paid?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Payments are processed securely through our platform. Once you complete a project, the payment is released to your bank account within 3-5 business days.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 ">
            <h3 className="text-lg font-bold text-gray-900  mb-2">
              Can I set my own rates?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yes, you have complete control over your pricing. You can set different rates for different services based on your expertise and market rates.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 ">
            <h3 className="text-lg font-bold text-gray-900  mb-2">
              Do I need ICAI membership?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yes, you must be a registered member of ICAI (Institute of Chartered Accountants of India) with a valid membership number to register on our platform.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 ">
            <h3 className="text-lg font-bold text-gray-900  mb-2">
              How are disputes handled?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We have a dedicated support team to help resolve any disputes between CAs and clients. Our platform ensures fair treatment for both parties.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
