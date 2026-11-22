/**
 * Phase 5: AI Proposal Writing & RFP / RFQ Evaluation Engine Logic
 */

import type {
  RfpEvaluationInput,
  BidFeasibilityScore,
  ComplianceMatrixItem,
  ScopeDeliverable,
  MilestoneTranche,
  Proposal,
  FeasibilityRecommendation,
  CommissionCalculationInput,
  CommissionCalculationResult
} from './proposal-types'

/**
 * Intelligent RFP / Scope Parser and Feasibility Evaluator
 */
export function evaluateRfpScope(input: RfpEvaluationInput): {
  feasibilityScore: BidFeasibilityScore
  complianceMatrix: ComplianceMatrixItem[]
  parsedDeliverables: ScopeDeliverable[]
  recommendedTranches: MilestoneTranche[]
} {
  const scope = input.scopeText.trim()
  const scopeWords = scope.split(/\s+/).filter(Boolean).length
  const lines = scope.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  // 1. Parse Deliverables from bullet points, numbered lists, or sentences
  const parsedDeliverables: ScopeDeliverable[] = []
  let itemCounter = 1

  for (const line of lines) {
    const isBullet = /^[-*•\d+.]\s+/.test(line) || line.toLowerCase().includes('deliverable') || line.toLowerCase().includes('requirement')
    if (isBullet || (line.length > 20 && parsedDeliverables.length < 8)) {
      const cleanTitle = line.replace(/^[-*•\d+.]\s+/, '').trim()
      if (cleanTitle.length > 5) {
        // Estimate deliverable hours and rate based on keywords
        const isComplex = /(backend|ai|integration|database|architecture|security|cloud|pipeline|devops)/i.test(cleanTitle)
        const isDesign = /(ui|ux|figma|branding|creative|reel|video|copy|content)/i.test(cleanTitle)
        const estHours = isComplex ? 35 : isDesign ? 20 : 25
        const defaultRate = isComplex ? 2500 : isDesign ? 1800 : 2000
        const amount = estHours * defaultRate

        parsedDeliverables.push({
          id: `deliv-${itemCounter++}`,
          title: cleanTitle.length > 80 ? cleanTitle.substring(0, 77) + '...' : cleanTitle,
          description: cleanTitle,
          estimatedHours: estHours,
          costRate: Math.round(defaultRate * 0.45),
          billRate: defaultRate,
          amount,
          deliverableCategory: isComplex ? 'Engineering' : isDesign ? 'Design' : 'Standard'
        })
      }
    }
  }

  // Fallback deliverables if text was unstructured
  if (parsedDeliverables.length === 0) {
    parsedDeliverables.push(
      {
        id: 'deliv-1',
        title: 'System Discovery, Architecture & Technical Specification',
        description: 'Comprehensive requirements gathering, architecture blueprints, and milestone breakdown.',
        estimatedHours: 24,
        costRate: 1200,
        billRate: 2500,
        amount: 60000,
        deliverableCategory: 'Strategy'
      },
      {
        id: 'deliv-2',
        title: 'Core Implementation, Workflows & Feature Development',
        description: 'End-to-end engineering, API connections, responsive UI, and database schemas.',
        estimatedHours: 80,
        costRate: 1200,
        billRate: 2500,
        amount: 200000,
        deliverableCategory: 'Engineering'
      },
      {
        id: 'deliv-3',
        title: 'Quality Assurance, UAT Signoff & Cloud Deployment',
        description: 'Staging validation, automated test suites, production rollout, and handoff documentation.',
        estimatedHours: 30,
        costRate: 1200,
        billRate: 2500,
        amount: 75000,
        deliverableCategory: 'QA & DevOps'
      }
    )
  }

  const totalCalculated = parsedDeliverables.reduce((acc, d) => acc + d.amount, 0)
  const clientBudget = input.clientBudget && input.clientBudget > 0 ? input.clientBudget : totalCalculated

  // 2. Build Compliance Matrix
  const complianceMatrix: ComplianceMatrixItem[] = [
    {
      id: 'comp-1',
      requirement: 'Scope Completeness & Technical Clarity',
      compliant: scopeWords >= 30,
      riskLevel: scopeWords < 30 ? 'high' : scopeWords < 80 ? 'medium' : 'low',
      notes: scopeWords >= 30 
        ? 'Scope provides adequate functional clarity to construct deliverables.' 
        : 'Scope is too brief; recommend scheduling a 30-minute discovery call to prevent scope creep.',
      suggestedMitigation: 'Include a defined Change Order clause in Section 6.'
    },
    {
      id: 'comp-2',
      requirement: 'Budget Viability vs Market Engineering Rates',
      compliant: clientBudget >= totalCalculated * 0.75,
      riskLevel: clientBudget < totalCalculated * 0.7 ? 'high' : clientBudget < totalCalculated * 0.9 ? 'medium' : 'low',
      notes: clientBudget >= totalCalculated
        ? `Budget (₹${clientBudget.toLocaleString('en-IN')}) provides healthy gross margins (>55%).`
        : `Client budget is tighter than standard rate card by ~${Math.round((1 - clientBudget / totalCalculated) * 100)}%.`,
      suggestedMitigation: 'Offer phased milestone rollout or adjust initial scope to fit target budget.'
    },
    {
      id: 'comp-3',
      requirement: 'Timeline & Sprint Execution Feasibility',
      compliant: (input.timelineWeeks || 4) >= Math.ceil(parsedDeliverables.length / 2),
      riskLevel: (input.timelineWeeks || 4) < 3 ? 'high' : 'low',
      notes: `Estimated duration of ${input.timelineWeeks || 4} weeks allows standard 40-hour sprint cadence without team burnout.`,
      suggestedMitigation: 'Lock in weekly client review windows to avoid signoff bottlenecks.'
    },
    {
      id: 'comp-4',
      requirement: 'Payment Security & Milestone Tranche Protection',
      compliant: true,
      riskLevel: 'low',
      notes: 'Tranches structured with mandatory upfront deposit prior to codebase provisioning.',
      suggestedMitigation: 'Enforce digital e-signature before initiating sprint work.'
    }
  ]

  // 3. Compute Bid Feasibility Scoring (0 - 100)
  let techScore = 90
  let timeScore = 85
  let marginScore = 85

  if (scopeWords < 30) techScore -= 30
  else if (scopeWords < 60) techScore -= 10

  if (input.timelineWeeks && input.timelineWeeks < 3) timeScore -= 35
  else if (input.timelineWeeks && input.timelineWeeks < 6) timeScore -= 10

  const budgetRatio = clientBudget / totalCalculated
  if (budgetRatio < 0.6) marginScore = 40
  else if (budgetRatio < 0.85) marginScore = 65
  else if (budgetRatio >= 1.2) marginScore = 98

  const compositeScore = Math.round((techScore * 0.35) + (timeScore * 0.3) + (marginScore * 0.35))

  let recommendation: FeasibilityRecommendation = 'GO'
  if (compositeScore < 55) recommendation = 'NO_GO'
  else if (compositeScore < 75) recommendation = 'CAUTION'

  const feasibilityScore: BidFeasibilityScore = {
    score: compositeScore,
    recommendation,
    technicalFitScore: Math.max(20, Math.min(100, techScore)),
    timelineFeasibilityScore: Math.max(20, Math.min(100, timeScore)),
    marginFeasibilityScore: Math.max(20, Math.min(100, marginScore)),
    riskSummary: recommendation === 'GO' 
      ? 'Strong win probability. Requirements align with capacity and expected gross margins exceeding 50%.' 
      : recommendation === 'CAUTION'
      ? 'Moderate risk profile. Tighter margins or short delivery timelines require milestone protection.'
      : 'High financial or scope risk. Recommend submitting a revised Discovery SOW or passing.',
    pros: [
      'Scope aligns with core agency capabilities',
      'Clear milestone deliverables identifiable for progress invoicing',
      'Low regulatory or compliance hurdles'
    ],
    cons: [
      scopeWords < 50 ? 'Limited written specification in RFP' : 'Requires active stakeholder feedback',
      'Change Order protocol must be enforced to guard against unbilled scope expansion'
    ],
    suggestedBidRange: {
      min: Math.round(totalCalculated * 0.85),
      recommended: Math.round(totalCalculated),
      max: Math.round(totalCalculated * 1.25),
      currency: 'INR'
    }
  }

  // 4. Recommended Milestone Tranches (Standard 3-Stage Progress Billing)
  const finalTotal = clientBudget > 0 ? clientBudget : totalCalculated
  const tranche1Amt = Math.round(finalTotal * 0.4)
  const tranche2Amt = Math.round(finalTotal * 0.4)
  const tranche3Amt = finalTotal - tranche1Amt - tranche2Amt

  const recommendedTranches: MilestoneTranche[] = [
    {
      id: 'tranche-1',
      title: 'Milestone 1: Project Mobilization & Initial Architecture',
      percentage: 40,
      amount: tranche1Amt,
      dueTrigger: 'Payable upon proposal e-signing (Mobilization Advance)',
      deliverablesSummary: 'Sprint setup, technical specifications, and initial deliverables kick-off.'
    },
    {
      id: 'tranche-2',
      title: 'Milestone 2: Beta Prototype & Core Workflows Signoff',
      percentage: 40,
      amount: tranche2Amt,
      dueTrigger: 'Payable upon Mid-Point Staging Review & Deliverables Signoff',
      deliverablesSummary: 'Functional implementation and integration testing.'
    },
    {
      id: 'tranche-3',
      title: 'Milestone 3: Final Acceptance, Deployment & Handover',
      percentage: 20,
      amount: tranche3Amt,
      dueTrigger: 'Payable upon Final Production Release & Source Handoff',
      deliverablesSummary: 'UAT signoff, production go-live, and documentation delivery.'
    }
  ]

  return {
    feasibilityScore,
    complianceMatrix,
    parsedDeliverables,
    recommendedTranches
  }
}

/**
 * Calculates sales representative or client partner commission
 */
export function calculatePartnerCommission(input: CommissionCalculationInput): CommissionCalculationResult {
  const {
    baseSalary = 0,
    commissionType,
    commissionPercentage,
    dealOrProjectAmount,
    frequency,
    basis
  } = input

  let commissionEarned = 0
  let baseSalaryPayable = 0

  // 1. Base salary calculation according to frequency
  if (commissionType === 'salary_only' || commissionType === 'hybrid') {
    baseSalaryPayable = frequency === 'weekly' ? Math.round(baseSalary / 4.33) : baseSalary
  }

  // 2. Commission calculation
  if (commissionType === 'percentage_only' || commissionType === 'hybrid') {
    commissionEarned = Math.round(dealOrProjectAmount * (commissionPercentage / 100))
  }

  const totalGrossPayout = baseSalaryPayable + commissionEarned
  const effectiveRate = dealOrProjectAmount > 0 ? (totalGrossPayout / dealOrProjectAmount) * 100 : 0

  let breakdown = ''
  if (commissionType === 'salary_only') {
    breakdown = `Fixed Salary: ₹${baseSalaryPayable.toLocaleString('en-IN')} (${frequency})`
  } else if (commissionType === 'percentage_only') {
    breakdown = `${commissionPercentage}% on ₹${dealOrProjectAmount.toLocaleString('en-IN')} (${basis.replace('_', ' ')}) = ₹${commissionEarned.toLocaleString('en-IN')}`
  } else {
    breakdown = `Base Salary: ₹${baseSalaryPayable.toLocaleString('en-IN')} + ${commissionPercentage}% Commission (₹${commissionEarned.toLocaleString('en-IN')}) = ₹${totalGrossPayout.toLocaleString('en-IN')}`
  }

  return {
    baseSalaryPayable,
    commissionEarned,
    totalGrossPayout,
    effectiveRate: Number(effectiveRate.toFixed(1)),
    breakdown
  }
}

/**
 * Generates an editable Microsoft Word (.doc) formatted document from a Proposal
 */
export function generateProposalWordHtml(proposal: Proposal, isDraft: boolean = false): string {
  const branding = proposal.brandingSettings || {}
  const accentColor = branding.accentColor || '#1e3a8a'
  const watermarkText = isDraft ? 'DRAFT' : branding.watermarkType === 'confidential' ? 'CONFIDENTIAL' : branding.watermarkCustomText || ''
  const companyName = branding.companyName || 'BillBook Client Partner'
  const headerText = branding.headerText || `${companyName} • Confidential Statement of Work`
  const footerText = branding.footerText || `Generated via BillBook AI Proposal Engine • All rights reserved`

  const deliverablesRows = proposal.scopeDeliverables.map((d, i) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #d1d5db; font-size: 11pt;">${i + 1}. <b>${d.title}</b><br><span style="color: #6b7280; font-size: 9.5pt;">${d.description}</span></td>
      <td style="padding: 10px; border: 1px solid #d1d5db; text-align: center; font-size: 11pt;">${d.estimatedHours || '-'} hrs</td>
      <td style="padding: 10px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-size: 11pt;">₹${(d.amount || 0).toLocaleString('en-IN')}</td>
    </tr>
  `).join('')

  const tranchesRows = proposal.milestoneTranches.map((t, i) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #d1d5db; font-size: 11pt;"><b>${t.title}</b><br><span style="color: #6b7280; font-size: 9.5pt;">Trigger: ${t.dueTrigger}</span></td>
      <td style="padding: 10px; border: 1px solid #d1d5db; text-align: center; font-size: 11pt;">${t.percentage}%</td>
      <td style="padding: 10px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-size: 11pt;">₹${(t.amount || 0).toLocaleString('en-IN')}</td>
    </tr>
  `).join('')

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${proposal.projectTitle} - Proposal</title>
      <style>
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          color: #1f2937;
          line-height: 1.5;
          margin: 40px;
        }
        h1 { color: ${accentColor}; font-size: 24pt; margin-bottom: 4pt; }
        h2 { color: ${accentColor}; font-size: 16pt; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; margin-top: 24pt; }
        h3 { color: #374151; font-size: 13pt; margin-top: 14pt; }
        p { font-size: 11pt; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-top: 12pt; margin-bottom: 16pt; }
        th { background-color: #f3f4f6; color: #111827; padding: 10px; border: 1px solid #d1d5db; font-size: 11pt; text-align: left; }
        .watermark {
          color: #e5e7eb;
          font-size: 72pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          margin: 20px 0;
        }
        .header-box { border-bottom: 1px solid #9ca3af; padding-bottom: 8px; margin-bottom: 20px; font-size: 9pt; color: #6b7280; }
        .footer-box { border-top: 1px solid #9ca3af; padding-top: 8px; margin-top: 40px; font-size: 9pt; color: #6b7280; text-align: center; }
        .callout { background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; margin: 16pt 0; font-size: 11pt; }
      </style>
    </head>
    <body>
      <div class="header-box">
        <table style="border: none; margin: 0;">
          <tr>
            <td style="border: none; text-align: left; font-size: 9pt; color: #6b7280;">${headerText}</td>
            <td style="border: none; text-align: right; font-size: 9pt; color: #6b7280;">Ref: PROPOSAL-${proposal.id.substring(0, 8).toUpperCase()}</td>
          </tr>
        </table>
      </div>

      ${watermarkText ? `<div class="watermark">${watermarkText}</div>` : ''}

      <h1>${proposal.projectTitle}</h1>
      <p style="font-size: 13pt; color: #4b5563; margin-top: 0;">Statement of Work & Commercial Agreement</p>

      <table style="background-color: #f9fafb; border: 1px solid #e5e7eb; margin-top: 16pt;">
        <tr>
          <td style="padding: 12px; border: none; width: 50%;">
            <b>PREPARED FOR:</b><br>
            ${proposal.clientName}<br>
            ${proposal.clientCompany ? `${proposal.clientCompany}<br>` : ''}
            ${proposal.clientEmail} • ${proposal.clientPhone || ''}
          </td>
          <td style="padding: 12px; border: none; width: 50%;">
            <b>PROPOSAL DETAILS:</b><br>
            <b>Status:</b> ${isDraft ? 'DRAFT DOCUMENT' : proposal.status.toUpperCase()}<br>
            <b>Total Valuation:</b> ₹${proposal.totalAmount.toLocaleString('en-IN')}<br>
            <b>Advance Required:</b> ${proposal.advancePercentage}% (₹${proposal.advanceAmount.toLocaleString('en-IN')})<br>
            <b>Validity Date:</b> ${proposal.validUntil}
          </td>
        </tr>
      </table>

      <h2>1. Executive Summary</h2>
      <p>${proposal.executiveSummary}</p>

      <h2>2. Deliverables & Technical Scope</h2>
      <table>
        <thead>
          <tr>
            <th>Deliverable & Scope Specifications</th>
            <th style="width: 15%; text-align: center;">Hours</th>
            <th style="width: 25%; text-align: right;">Amount (${proposal.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${deliverablesRows}
        </tbody>
      </table>

      <h2>3. Milestone & Payment Tranches</h2>
      <table>
        <thead>
          <tr>
            <th>Tranche Milestone & Acceptance Criteria</th>
            <th style="width: 15%; text-align: center;">Split %</th>
            <th style="width: 25%; text-align: right;">Payable (${proposal.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${tranchesRows}
        </tbody>
      </table>

      <div class="callout">
        <b>Commercial Settlement Terms:</b><br>
        Mobilization advance of ₹${proposal.advanceAmount.toLocaleString('en-IN')} (${proposal.advancePercentage}%) is due upon contract execution prior to project kickoff.
      </div>

      <h2>4. Standard Terms & Governance</h2>
      <ol style="font-size: 10pt; color: #4b5563; padding-left: 20px;">
        ${proposal.termsAndConditions.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
      </ol>

      <h2>5. Formal Acceptance & Sign-off</h2>
      <table style="margin-top: 30px; border: none;">
        <tr>
          <td style="width: 50%; border: none; padding: 20px; vertical-align: top;">
            <b>Service Provider / Client Partner:</b><br><br><br>
            _______________________________<br>
            Authorized Signatory<br>
            Date: ________________________
          </td>
          <td style="width: 50%; border: none; padding: 20px; vertical-align: top;">
            <b>Client Acceptance:</b><br><br><br>
            _______________________________<br>
            ${proposal.clientName}<br>
            Date: ________________________
          </td>
        </tr>
      </table>

      <div class="footer-box">
        ${footerText}
      </div>
    </body>
    </html>
  `
}
