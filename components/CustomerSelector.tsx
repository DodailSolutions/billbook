'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Plus, ChevronDown, User } from 'lucide-react'
import type { Customer } from '@/lib/types'

interface CustomerSelectorProps {
  customers: Customer[]
  selectedCustomerId: string
  onCustomerSelect: (customerId: string) => void
  onAddNew: () => void
  label?: string
  required?: boolean
}

export function CustomerSelector({
  customers,
  selectedCustomerId,
  onCustomerSelect,
  onAddNew,
  label = 'Customer Name',
  required = true,
}: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCustomerSelect = (customerId: string) => {
    onCustomerSelect(customerId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Main Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-between w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:border-blue-500"
      >
        <span className={selectedCustomer ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
          {selectedCustomer ? selectedCustomer.name : 'Select or add a customer'}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-2">NO RESULTS FOUND</div>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    selectedCustomerId === customer.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </div>
                      {customer.email && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Customer Button */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => {
                setIsOpen(false)
                onAddNew()
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
