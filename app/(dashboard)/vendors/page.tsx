'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getVendors, createVendor, updateVendor } from '@/lib/customer-management-actions'
import { Vendor, CreateVendorData } from '@/lib/customer-management-types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Building2, Plus, Search, Edit, ToggleLeft, ToggleRight, Phone, Mail, MapPin, CreditCard } from 'lucide-react'

export default function VendorManagementPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Filters
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState('')

    // Form state
    const [vendorName, setVendorName] = useState('')
    const [vendorCode, setVendorCode] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [gstin, setGstin] = useState('')
    const [pan, setPan] = useState('')
    const [stateCode, setStateCode] = useState('')
    const [paymentTerms, setPaymentTerms] = useState('')
    const [defaultPaymentDays, setDefaultPaymentDays] = useState(30)
    const [bankName, setBankName] = useState('')
    const [bankAccountNumber, setBankAccountNumber] = useState('')
    const [ifscCode, setIfscCode] = useState('')
    const [bankBranch, setBankBranch] = useState('')
    const [vendorCategory, setVendorCategory] = useState('raw_material')
    const [notes, setNotes] = useState('')

    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchVendors = async () => {
        setLoading(true)
        const data = await getVendors()
        setVendors(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    const resetForm = () => {
        setVendorName('')
        setVendorCode('')
        setContactPerson('')
        setEmail('')
        setPhone('')
        setAddress('')
        setGstin('')
        setPan('')
        setStateCode('')
        setPaymentTerms('')
        setDefaultPaymentDays(30)
        setBankName('')
        setBankAccountNumber('')
        setIfscCode('')
        setBankBranch('')
        setVendorCategory('raw_material')
        setNotes('')
        setIsEditing(false)
        setEditId('')
        setError(null)
    }

    const handleOpenAdd = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const handleOpenEdit = (vendor: Vendor) => {
        resetForm()
        setIsEditing(true)
        setEditId(vendor.id)
        setVendorName(vendor.vendor_name || '')
        setVendorCode(vendor.vendor_code || '')
        setContactPerson(vendor.contact_person || '')
        setEmail(vendor.email || '')
        setPhone(vendor.phone || '')
        setAddress(vendor.address || '')
        setGstin(vendor.gstin || '')
        setPan(vendor.pan || '')
        setStateCode(vendor.state_code || '')
        setPaymentTerms(vendor.payment_terms || '')
        setDefaultPaymentDays(vendor.default_payment_days || 30)
        setBankName(vendor.bank_name || '')
        setBankAccountNumber(vendor.bank_account_number || '')
        setIfscCode(vendor.ifsc_code || '')
        setBankBranch(vendor.bank_branch || '')
        setVendorCategory(vendor.vendor_category || 'raw_material')
        setNotes(vendor.notes || '')
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!vendorName.trim()) {
            setError('Vendor Name is required.')
            return
        }

        setFormLoading(true)
        setError(null)

        const payload: CreateVendorData = {
            vendor_name: vendorName,
            vendor_code: vendorCode || undefined,
            contact_person: contactPerson || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: address || undefined,
            gstin: gstin || undefined,
            pan: pan || undefined,
            payment_terms: paymentTerms || undefined,
            default_payment_days: defaultPaymentDays,
            bank_name: bankName || undefined,
            bank_account_number: bankAccountNumber || undefined,
            ifsc_code: ifscCode || undefined,
            vendor_category: vendorCategory || undefined,
            notes: notes || undefined
        }

        let res
        if (isEditing) {
            res = await updateVendor(editId, payload)
        } else {
            res = await createVendor(payload)
        }

        setFormLoading(false)
        if (res.success) {
            setIsModalOpen(false)
            fetchVendors()
        } else {
            setError(res.error || 'Failed to save vendor.')
        }
    }

    const handleToggleStatus = async (vendor: Vendor) => {
        const res = await updateVendor(vendor.id, { is_active: !vendor.is_active })
        if (res.success) {
            fetchVendors()
        }
    }

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
                              (v.gstin && v.gstin.toLowerCase().includes(search.toLowerCase())) ||
                              (v.vendor_category && v.vendor_category.toLowerCase().includes(search.toLowerCase()))
        
        const matchesCategory = categoryFilter === 'all' || v.vendor_category === categoryFilter
        
        const matchesStatus = statusFilter === 'all' || 
                              (statusFilter === 'active' && v.is_active) || 
                              (statusFilter === 'inactive' && !v.is_active)

        return matchesSearch && matchesCategory && matchesStatus
    })

    const totalVendors = vendors.length
    const activeVendors = vendors.filter(v => v.is_active).length
    const withGstin = vendors.filter(v => v.gstin && v.gstin.trim() !== '').length

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Vendor Management
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage your suppliers, payment terms, and contact details.
                    </p>
                </div>
                <Button onClick={handleOpenAdd} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
                    <Plus className="h-4 w-4" /> Add Vendor
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Total Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
                        </div>
                        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Active Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">{activeVendors}</p>
                        </div>
                        <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">With GSTIN</p>
                            <p className="text-2xl font-bold text-gray-900">{withGstin}</p>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px]"
                    />
                </div>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px] bg-white"
                >
                    <option value="all">All Categories</option>
                    <option value="raw_material">Raw Material</option>
                    <option value="services">Services</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                </select>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2.5 text-xs border border-gray-200 rounded-xl min-h-[44px] bg-white"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : filteredVendors.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900 text-sm">No Vendors Found</h3>
                    <p className="text-xs text-gray-500 mt-1">Adjust filters or add a new vendor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVendors.map(vendor => (
                        <Card key={vendor.id} className="border-gray-100 shadow-sm hover:border-indigo-200 transition-all flex flex-col">
                            <CardContent className="p-4 space-y-4 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900 text-base truncate" title={vendor.vendor_name}>
                                                {vendor.vendor_name}
                                            </h4>
                                            {vendor.is_active ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Inactive</span>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600 uppercase">
                                                {vendor.vendor_category?.replace('_', ' ') || 'unspecified'}
                                            </span>
                                            {vendor.vendor_code && <span>{vendor.vendor_code}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleOpenEdit(vendor)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                <div className="space-y-2 text-xs text-gray-600">
                                    {vendor.contact_person && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="truncate">{vendor.contact_person}</span>
                                        </div>
                                    )}
                                    {vendor.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{vendor.phone}</span>
                                        </div>
                                    )}
                                    {vendor.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="truncate">{vendor.email}</span>
                                        </div>
                                    )}
                                    {vendor.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                            <span className="line-clamp-2">{vendor.address}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-3 border-t border-gray-100 space-y-2">
                                    {vendor.gstin ? (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">GSTIN</span>
                                            <span className="font-mono font-medium text-indigo-700 bg-indigo-50 px-1.5 rounded">{vendor.gstin}</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-amber-600 font-medium">No GSTIN recorded</div>
                                    )}
                                    
                                    {(vendor.payment_terms || vendor.default_payment_days) && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Payment Terms</span>
                                            <span className="font-medium text-gray-700">{vendor.payment_terms || `${vendor.default_payment_days} Days`}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-3 flex items-center justify-between">
                                    <div className="text-xs text-gray-500 font-medium">Status</div>
                                    <button 
                                        onClick={() => handleToggleStatus(vendor)}
                                        className={`flex items-center gap-1 text-xs font-medium ${vendor.is_active ? 'text-emerald-600' : 'text-gray-400'}`}
                                    >
                                        {vendor.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-100">
                        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shrink-0 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                <h3 className="font-bold text-base">{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="vendor-form" onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-xl font-medium">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Vendor Name *</label>
                                            <input type="text" required value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Vendor Code</label>
                                            <input type="text" value={vendorCode} onChange={e => setVendorCode(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Vendor Category</label>
                                            <select value={vendorCategory} onChange={e => setVendorCategory(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                                                <option value="raw_material">Raw Material</option>
                                                <option value="services">Services</option>
                                                <option value="utilities">Utilities</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Contact Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Contact Person</label>
                                            <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Email Address</label>
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Phone Number</label>
                                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block font-semibold text-gray-600 mb-1">Billing Address</label>
                                            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Tax & Finance</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">GSTIN</label>
                                            <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono uppercase" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">PAN</label>
                                            <input type="text" value={pan} onChange={e => setPan(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono uppercase" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">State Code</label>
                                            <input type="text" value={stateCode} onChange={e => setStateCode(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block font-semibold text-gray-600 mb-1">Payment Terms</label>
                                            <input type="text" placeholder="e.g. Net 30" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Default Payment Days</label>
                                            <input type="number" value={defaultPaymentDays} onChange={e => setDefaultPaymentDays(parseInt(e.target.value) || 0)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Bank Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Bank Name</label>
                                            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Account Number</label>
                                            <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">IFSC Code</label>
                                            <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono uppercase" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-gray-600 mb-1">Branch</label>
                                            <input type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-5">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Notes</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 rounded-b-2xl bg-gray-50">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="min-h-[44px]">Cancel</Button>
                            <Button form="vendor-form" type="submit" disabled={formLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
                                {formLoading ? 'Saving...' : 'Save Vendor'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
