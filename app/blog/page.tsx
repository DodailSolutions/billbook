import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '../(superadmin)/admin/cms/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import { RegionSwitcher } from '@/components/RegionSwitcher'
import { ArrowRight, BookOpen, Calendar, Clock, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog & Tax Guides | BillBooky Business OS',
  description: 'Expert guides on GST invoicing, UAE FTA VAT, 50-state US sales tax, double-entry bookkeeping, and business growth.',
  keywords: 'business blog, GST invoicing guide, UAE VAT guide, US sales tax guide, bookkeeping guides, BillBooky blog'
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts().catch(() => [])
  const publishedPosts = posts.filter(p => p.isPublished)

  const categories = ['All', ...Array.from(new Set(publishedPosts.map(p => p.category || 'General')))]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 transition-transform group-hover:scale-105">
                <Image 
                  src="/logo-icon.svg" 
                  alt="BillBooky" 
                  width={40} 
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5">
                  BillBooky
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                    Blog
                  </span>
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <RegionSwitcher />
              <ThemeToggle />
              <Link href="/signup">
                <Button size="sm" className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-12 pb-14 sm:pt-18 sm:pb-20 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INSIGHTS, TAX COMPLIANCE & BEST PRACTICES</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-4 leading-tight">
              The BillBooky Knowledge Hub
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Actionable guides on Indian GST, UAE Federal Tax Authority VAT, US state sales taxes, double-entry bookkeeping, and scaling modern business operations.
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-slate-200 dark:border-slate-800">
            {categories.map((cat, idx) => (
              <span
                key={idx}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  idx === 0
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Articles Grid */}
          {publishedPosts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">No Articles Published Yet</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Check back shortly! Our editorial team is finalizing comprehensive regional guides and tutorials.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Article Card Body */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Pill */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 uppercase tracking-wide">
                          {post.category || 'Guide'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime || '4 min read'}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {post.author || 'Editorial Staff'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {post.publishedAt || 'Recent'}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform"
                      >
                        Read
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer CTA */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to Automate Your Business?</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Join thousands of businesses managing invoices, CRM, inventory, payroll, and regional tax compliance on BillBooky.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl border border-slate-700">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
