import { Suspense } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  AlertCircle, 
  FileText, 
  Brain,
  MapPin,
  Shield,
  Activity,
  Zap
} from 'lucide-react'
import { 
  getCashFlowRealtime, 
  getCollectionEfficiency,
  getGSTLiabilityTracker,
  getBusinessHealthIndex,
  getAIInsights,
  getProfitabilityReport
} from '@/lib/enterprise-actions'

async function AnalyticsContent() {
  const [
    cashFlow,
    collectionEfficiency,
    gstLiability,
    businessHealth,
    insights,
    profitability
  ] = await Promise.all([
    getCashFlowRealtime(),
    getCollectionEfficiency(),
    getGSTLiabilityTracker(),
    getBusinessHealthIndex(),
    getAIInsights(),
    getProfitabilityReport('city')
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-linear-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Business Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive insights and real-time business intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Business Health Index */}
      {businessHealth && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Business Health Index
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overall performance score and indicators
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {businessHealth.overall_score}
                </div>
                <div className={`text-sm font-medium mt-1 px-3 py-1 rounded-full inline-block ${
                  businessHealth.category === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  businessHealth.category === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  businessHealth.category === 'fair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {businessHealth.category.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Liquidity', value: businessHealth.scores.liquidity_score, color: 'blue' },
                { label: 'Profitability', value: businessHealth.scores.profitability_score, color: 'green' },
                { label: 'Efficiency', value: businessHealth.scores.efficiency_score, color: 'purple' },
                { label: 'Growth', value: businessHealth.scores.growth_score, color: 'orange' },
                { label: 'Compliance', value: businessHealth.scores.compliance_score, color: 'indigo' }
              ].map((score) => (
                <div key={score.label} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`text-2xl font-bold text-${score.color}-600 dark:text-${score.color}-400`}>
                    {score.value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {score.label}
                  </div>
                </div>
              ))}
            </div>

            {businessHealth.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Recommendations
                </h3>
                {businessHealth.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${
                      rec.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      rec.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {rec.message}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rec.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Real-time Cash Flow & GST Liability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow */}
        {cashFlow && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Real-time Cash Flow
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current cash position
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Opening Balance</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{cashFlow.opening_cash_balance?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cash Inflow</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +₹{cashFlow.cash_inflow?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cash Outflow</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -₹{cashFlow.cash_outflow?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Closing Balance</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{cashFlow.closing_cash_balance?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* GST Liability */}
        {gstLiability && (
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    GST Liability Tracker
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current GST obligations
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">GST Collected</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{gstLiability.total_gst_collected.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ITC Available</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ₹{gstLiability.itc_available.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Net GST Payable</span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    ₹{gstLiability.net_gst_payable.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ₹{gstLiability.output_gst_breakdown.cgst.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">CGST</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      ₹{gstLiability.output_gst_breakdown.sgst.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">SGST</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      ₹{gstLiability.output_gst_breakdown.igst.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">IGST</div>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  gstLiability.filing_status === 'filed' ? 'bg-green-50 dark:bg-green-900/20' :
                  gstLiability.filing_status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' :
                  'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <span className="text-sm font-medium">Filing Status</span>
                  <span className={`text-sm font-semibold uppercase ${
                    gstLiability.filing_status === 'filed' ? 'text-green-600 dark:text-green-400' :
                    gstLiability.filing_status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {gstLiability.filing_status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  AI Insights in Plain English
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Intelligent business recommendations
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    insight.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                    insight.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Zap className={`h-5 w-5 mt-0.5 ${
                      insight.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                      insight.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                      insight.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {insight.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          insight.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                          insight.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {insight.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {insight.description}
                      </p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Impact:
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                          {insight.impact}
                        </div>
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Recommendation:
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {insight.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* City-wise Profitability */}
      {profitability && profitability.data.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    City-wise Profitability
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revenue and profit breakdown by location
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {profitability.overall_margin.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Overall Margin
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Revenue
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profit
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Margin
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Invoices
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Avg Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profitability.data.slice(0, 10).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {item.dimension}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">
                        ₹{item.gross_profit.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.gross_margin >= 30 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          item.gross_margin >= 15 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {item.gross_margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        {item.invoice_count}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                        ₹{item.average_invoice_value.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Collection Efficiency */}
      {collectionEfficiency && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Collection Efficiency Score
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment collection performance
                </p>
              </div>
            </div>

            <div className="text-center p-6 bg-linear-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                {collectionEfficiency.collection_efficiency_percentage?.toFixed(1) || '0'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Collection Efficiency Rate
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MIS Reports Access */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Export-Ready MIS Reports
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate comprehensive business reports
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { type: 'profit_loss', label: 'Profit & Loss', icon: '📊', color: 'blue' },
              { type: 'cash_flow', label: 'Cash Flow', icon: '💰', color: 'green' },
              { type: 'gst_summary', label: 'GST Summary', icon: '📋', color: 'orange' },
              { type: 'receivables', label: 'Receivables', icon: '💳', color: 'purple' },
              { type: 'payables', label: 'Payables', icon: '💸', color: 'red' },
              { type: 'inventory', label: 'Inventory', icon: '📦', color: 'indigo' }
            ].map((report) => (
              <button
                key={report.type}
                className={`p-4 text-left rounded-lg border-2 border-${report.color}-200 dark:border-${report.color}-800 hover:bg-${report.color}-50 dark:hover:bg-${report.color}-900/20 transition-all group`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{report.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-${report.color}-600">
                      {report.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Click to generate
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
}
