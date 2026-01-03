'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Star, Check, X, MoveUp, MoveDown } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  company: string | null
  role: string | null
  content: string
  rating: number
  image_url: string | null
  is_active: boolean
  display_order: number
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    content: '',
    rating: 5,
    image_url: '',
    is_active: true,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/admin/testimonials')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : '/api/admin/testimonials'
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchTestimonials()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to save testimonial:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setFormData({
      name: testimonial.name,
      company: testimonial.company || '',
      role: testimonial.role || '',
      content: testimonial.content,
      rating: testimonial.rating,
      image_url: testimonial.image_url || '',
      is_active: testimonial.is_active,
    })
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      })

      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Failed to reorder testimonial:', error)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      company: '',
      role: '',
      content: '',
      rating: 5,
      image_url: '',
      is_active: true,
    })
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Testimonials</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add and manage customer testimonials displayed on the landing page
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Active (Display on website)
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {editingId ? 'Update' : 'Add'} Testimonial
            </Button>
            {editingId && (
              <Button type="button" onClick={resetForm} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                  {testimonial.is_active ? (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full flex items-center gap-1">
                      <X className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </div>
                {(testimonial.role || testimonial.company) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {[testimonial.role, testimonial.company].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(testimonial)}
                    className="p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReorder(testimonial.id, 'up')}
                    disabled={index === 0}
                    className="p-2"
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReorder(testimonial.id, 'down')}
                    disabled={index === testimonials.length - 1}
                    className="p-2"
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No testimonials yet. Add your first testimonial above!
          </div>
        )}
      </div>
    </div>
  )
}
