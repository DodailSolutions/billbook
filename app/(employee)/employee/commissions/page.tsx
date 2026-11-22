'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  CheckCircle2,
  Clock,
  Calendar,
  Briefcase,
  UserCheck,
  Building2,
  FileText,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Download
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { calculatePartnerCommission } from '@/lib/proposal-engine'

interface DealCommissionRecord {
  id: string
  projectTitle: string
  clientName: string
  dealAmount: number
  commissionType: 'salary_only' | 'percentage_only' | 'hybrid'
  commissionPercentage: number
  frequency: 'monthly' | 'weekly'
  basis: 'per_project' | 'monthly_retainer' | 'deal_total'
  earnedCommission: number
  status: 'approved' | 'processing' | 'paid'
  closedDate: string
}

export default function EmployeeCommissionsPage() {
  // Calculator Interactive States
  const [calcModel, setCalcModel] = useState<'salary_only' | 'percentage_only' | 'hybrid'>('hybrid')
  const [calcBaseSalary, setCalcBaseSalary] = useState<number>(45000)
  const [calcDealAmount, setCalcDealAmount] = useState<number>(200000)
  const [calcPercentage, setCalcPercentage] = useState<number>(8)
  const [calcFrequency, setCalcFrequency] = useState<'monthly' | 'weekly'>('monthly')
  const [calcBasis, setCalcBasis] = useState<'per_project' | 'monthly_retainer' | 'deal_total'>('per_project')

  // Example ledger of closed deals for the logged-in representative
  const [deals, setDeals] = useState<DealCommissionRecord[]>([
    {
      id: 'deal-1',
      projectTitle: 'Enterprise Next.js E-Commerce Portal',
      clientName: 'Aura Lifestyle Pvt Ltd',
      dealAmount: 350000,
      commissionType: 'hybrid',
      commissionPercentage: 8,
      frequency: 'monthly',
      basis: 'per_project',
      earnedCommission: 28000,
      status: 'approved',
      closedDate: '2026-11-18'
    },
    {
      id: 'deal-2',
      projectTitle: '6-Month SEO & Performance Marketing Retainer',
      clientName: 'Zenith Health Diagnostics',
      dealAmount: 180000,
      commissionType: 'hybrid',
      commissionPercentage: 10,
      frequency: 'monthly',
      basis: 'monthly_retainer',
      earnedCommission: 18000,
      status: 'paid',
      closedDate: '2026-11-04'
    },
    {
      id: 'deal-3',
      projectTitle: 'Cloud Migration & DevSecOps Audit',
      clientName: 'Global Fintech Labs',
      dealAmount: 250000,
      commissionType: 'percentage_only',
      commissionPercentage: 12,
      frequency: 'weekly',
      basis: 'per_project',
      earnedCommission: 30000,
      status: 'processing',
      closedDate: '2026-11-20'
    }
  ])

  // Calculation Result
  const currentCalc = calculatePartnerCommission({
    baseSalary: calcBaseSalary,
    commissionType: calcModel,
    commissionPercentage: calcPercentage,
    dealOrProjectAmount: calcDealAmount,
    frequency: calcFrequency,
    basis: calcBasis
  })

  // Summary Metrics
  const totalCommissionEarned = deals.reduce((acc, d) => acc + d.earnedCommission, 0)
  const paidCommission = deals.filter(d => d.status === 'paid').reduce((acc, d) => acc + d.earnedCommission, 0)
  const upcomingCommission = deals.filter(d => d.status !== 'paid').reduce((acc, d) => acc + d.earnedCommission, 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Sales & Partner Portal
            </span>
            <span className="text-xs text-gray-400">• IT, Software & Marketing Commissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            <span>My Commissions & Compensation Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Calculate deals compensation, simulate salary + commission splits, and track upcoming payout cycles
          </p>
        </div>

        <Link href="/employee/dashboard">
          <Button variant="outline" size="sm" className="text-xs h-9">
            ← Return to Dashboard
          </Button>
        </Link>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-100 shadow-xs bg-emerald-50/60 border-emerald-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold uppercase">
              <span>Total Commission Earned</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-2">
              ₹{totalCommissionEarned.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-700 mt-1">Across {deals.length} closed deals</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xs bg-blue-50/60 border-blue-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-center text-xs text-blue-700 font-semibold uppercase">
              <span>Upcoming Approved Payout</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-950 mt-2">
              ₹{upcomingCommission.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-blue-700 mt-1">Scheduled for next disbursement cycle</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-xs bg-slate-50 border-slate-200">
          <CardContent className="p-5">
            <div className="flex justify-between items-center text-xs text-slate-600 font-semibold uppercase">
              <span>Total Paid to Date</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              ₹{paidCommission.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Direct bank transfer verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Simulator Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <span>Interactive Compensation & Deal Calculator</span>
              </h3>
              <p className="text-xs text-gray-500">
                Simulate your expected earnings for upcoming client pitches or retainer contracts
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setCalcModel('salary_only')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  calcModel === 'salary_only' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Salary Only
              </button>
              <button
                type="button"
                onClick={() => setCalcModel('percentage_only')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  calcModel === 'percentage_only' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Commission %
              </button>
              <button
                type="button"
                onClick={() => setCalcModel('hybrid')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  calcModel === 'hybrid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Hybrid (Salary + %)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Controls (2 cols) */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(calcModel === 'salary_only' || calcModel === 'hybrid') && (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Base Monthly Salary (₹)</label>
                    <Input
                      type="number"
                      value={calcBaseSalary}
                      onChange={(e) => setCalcBaseSalary(parseInt(e.target.value) || 0)}
                      className="text-xs h-9"
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Deal / Project Quoted Amount (₹)</label>
                  <Input
                    type="number"
                    value={calcDealAmount}
                    onChange={(e) => setCalcDealAmount(parseInt(e.target.value) || 0)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {calcModel !== 'salary_only' && (
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>Commission Percentage</span>
                    <span className="font-bold text-indigo-600">{calcPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={calcPercentage}
                    onChange={(e) => setCalcPercentage(parseInt(e.target.value) || 1)}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>1%</span>
                    <span>10% (Standard)</span>
                    <span>25% (High Margin)</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Disbursement Frequency</label>
                  <select
                    value={calcFrequency}
                    onChange={(e) => setCalcFrequency(e.target.value as any)}
                    className="w-full h-9 text-xs bg-white border border-gray-300 rounded-md px-3 font-medium"
                  >
                    <option value="monthly">Monthly Payout (With Payroll)</option>
                    <option value="weekly">Weekly Settlement</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Deal Earning Model</label>
                  <select
                    value={calcBasis}
                    onChange={(e) => setCalcBasis(e.target.value as any)}
                    className="w-full h-9 text-xs bg-white border border-gray-300 rounded-md px-3 font-medium"
                  >
                    <option value="per_project">One-Time Project Signoff</option>
                    <option value="monthly_retainer">Monthly Retainer Share</option>
                    <option value="deal_total">Total Deal Collection</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Output Box (1 col) */}
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Projected Take-Home Compensation
                </span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                  ₹{currentCalc.totalGrossPayout.toLocaleString('en-IN')}
                </p>
                <span className="text-xs text-slate-300 mt-0.5 block">
                  Cycle: {calcFrequency === 'weekly' ? 'Weekly Payout' : 'Monthly Payroll'}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                {(calcModel === 'salary_only' || calcModel === 'hybrid') && (
                  <div className="flex justify-between text-slate-300">
                    <span>Base Salary Component:</span>
                    <span className="font-semibold">₹{currentCalc.baseSalaryPayable.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {calcModel !== 'salary_only' && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Deal Commission ({calcPercentage}%):</span>
                    <span>₹{currentCalc.commissionEarned.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Effective Earning Rate:</span>
                  <span>{currentCalc.effectiveRate}% of deal</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg text-[11px] text-slate-300">
                💡 <b>Policy:</b> Commissions become eligible for release once the 40% mobilization advance invoice is paid by the client.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Closed Deals & Commission Ledger Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-gray-900">Assigned Deals & Commissions Ledger</h3>
              <p className="text-xs text-gray-500">Historical statements and verification of sales payouts</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Project & Client</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Deal Quoted</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Structure</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Commission %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Payout Earned</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{d.projectTitle}</div>
                      <div className="text-[11px] text-gray-500">{d.clientName} • Closed {d.closedDate}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-gray-800">
                      ₹{d.dealAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px]">
                        {d.commissionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-700">
                      {d.commissionPercentage}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-emerald-700 text-sm">
                      ₹{d.earnedCommission.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status === 'paid' ? '✓ Paid' : d.status === 'approved' ? 'Approved' : 'In Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
