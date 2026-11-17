import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '../../(superadmin)/admin/cms/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import { RegionSwitcher } from '@/components/RegionSwitcher'
import { ArrowLeft, Calendar, Clock, Share2, Sparkles, User, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const posts = await getBlogPosts().catch(() => [])
  const post = posts.find(p => p.slug === slug && p.isPublished)

  if (!post) {
    return {
      title: 'Article Not Found | BillBooky Blog',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: `${post.title} | BillBooky Blog`,
    description: post.excerpt,
    keywords: `${post.category}, BillBooky, business software, tax compliance, invoicing`
  }
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const posts = await getBlogPosts().catch(() => [])
  const post = posts.find(p => p.slug === slug && p.isPublished)

  if (!post) {
    notFound()
  }

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.isPublished)
    .slice(0, 2)

  // Robust line-by-line markdown content parser for safe native rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []

    let currentList: string[] = []

    const flushList = (keyPrefix: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${keyPrefix}`} className="my-5 space-y-2.5 pl-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ul>
        )
        currentList = []
      }
    }

    const renderInlineFormatting = (text: string) => {
      // Split on **bold** text
      const parts = text.split(/(\*\*.*?\*\*)/g)
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-extrabold text-slate-950 dark:text-white">{part.slice(2, -2)}</strong>
        }
        return part
      })
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()

      if (!trimmed) {
        flushList(idx)
        return
      }

      if (trimmed.startsWith('### ')) {
        flushList(idx)
        elements.push(
          <h3 key={idx} className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white mt-10 mb-4 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('#### ')) {
        flushList(idx)
        elements.push(
          <h4 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-7 mb-3 tracking-tight">
            {trimmed.replace('#### ', '')}
          </h4>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^([-*]|\d+\.)\s+/, '')
        currentList.push(itemText)
      } else {
        flushList(idx)
        elements.push(
          <p key={idx} className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed my-4 font-normal">
            {renderInlineFormatting(trimmed)}
          </p>
        )
      }
    })

    flushList(lines.length)
    return elements
  }

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
              <Link href="/blog">
                <Button size="sm" className="hidden sm:inline-flex bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs gap-1.5 border border-slate-200 dark:border-slate-700">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Articles
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Article Container */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Knowledge Hub
          </Link>

          {/* Meta Header */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 uppercase tracking-wide">
              {post.category || 'Guide'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime || '4 min read'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt || 'Recently Published'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt Lead */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium pb-8 border-b border-slate-200 dark:border-slate-800 mb-10">
            {post.excerpt}
          </p>

          {/* Author Byline */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-extrabold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950 dark:text-white">
                  {post.author || 'BillBooky Editorial Staff'}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Verified Compliance Advisory
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Article Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
            {renderContent(post.content)}
          </div>

          {/* Bottom Card - In-article conversion banner */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 text-center sm:text-left sm:flex items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-900/40 px-2.5 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Automate Your Operations
              </span>
              <h3 className="text-2xl font-black mb-2">Issue Compliant Invoices in Seconds</h3>
              <p className="text-blue-100 text-sm max-w-md">
                Pre-configured for Indian GST, UAE FTA VAT, and US Sales Tax. Get started with zero setup fees.
              </p>
            </div>
            <div className="mt-6 sm:mt-0 shrink-0">
              <Link href="/signup">
                <Button size="lg" className="bg-white hover:bg-slate-100 text-blue-700 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-black/10">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-6">More from the BillBooky Knowledge Hub</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map(rel => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="group block p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-xs"
                  >
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-1 mb-2 line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-xs border-t border-slate-800 mt-16">
        <p>© {new Date().getFullYear()} BillBooky. All rights reserved. Built with precision for growing enterprises worldwide.</p>
      </footer>
    </div>
  )
}
