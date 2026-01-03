'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  company: string | null
  role: string | null
  content: string
  rating: number
  image_url: string | null
}

export function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials')
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(nextTestimonial, 5000)
      return () => clearInterval(interval)
    }
  }, [testimonials.length, nextTestimonial])

  if (isLoading || testimonials.length === 0) {
    return null
  }

  const current = testimonials[currentIndex]

  return (
    <section className="px-6 py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by Indian Businesses
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See what our customers have to say about BillBooky
          </p>
        </div>

        <div className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
            <Quote className="h-12 w-12 text-emerald-600 mb-6" />
            
            <div className="mb-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < current.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xl md:text-2xl text-gray-900 dark:text-white leading-relaxed mb-8">
                &ldquo;{current.content}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-4">
              {current.image_url && (
                <Image
                  src={current.image_url}
                  alt={current.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {current.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {current.role && current.company
                    ? `${current.role}, ${current.company}`
                    : current.role || current.company || 'Customer'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-emerald-600'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
