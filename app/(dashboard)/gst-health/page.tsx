import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getHealthScore, getHealthScoreHistory, calculateHealthScore } from '@/lib/gst-advanced-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, FileText, Shield, Clock, Target } from 'lucide-react'

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    if (score >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getBarColor(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default async function GSTHealthScorePage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  let healthScore = await getHealthScore()
  
  // If no health score exists, calculate it for the last 3 months
  if (!healthScore) {
    const today = new Date()
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
    await calculateHealthScore(
      threeMonthsAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    )
    healthScore = await getHealthScore()
  }

  const history = await getHealthScoreHistory()

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100 dark:bg-green-900/50'
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50'
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50'
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50'
    return 'text-red-600 bg-red-100 dark:bg-red-900/50'
  }

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-green-600 bg-green-100 dark:bg-green-900/50'
    if (risk === 'medium') return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50'
    return 'text-red-600 bg-red-100 dark:bg-red-900/50'
  }

  if (!healthScore) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>GST Health Score</CardTitle>
            <CardDescription>
              Unable to calculate health score. Make sure you have GST data available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Recalculate Score</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-emerald-600" />
            GST Health Score
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive compliance and performance analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
            <CardDescription>
              Period: {new Date(healthScore.calculation_period_from).toLocaleDateString()} to{' '}
              {new Date(healthScore.calculation_period_to).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="text-center">
                  <div className="text-7xl font-bold text-gray-900 dark:text-white mb-2">
                    {healthScore.overall_score.toFixed(1)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-lg">
                    out of 100
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Badge className={`text-2xl px-4 py-2 ${getGradeColor(healthScore.health_grade)}`}>
                      Grade: {healthScore.health_grade}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${getRiskColor(healthScore.risk_level).split(' ')[0]}`} />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Risk Level
                  </span>
                </div>
                <Badge className={`${getRiskColor(healthScore.risk_level)} text-lg px-3 py-1`}>
                  {healthScore.risk_level.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  On Time Filings
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {healthScore.returns_filed_on_time}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Late Filings
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {healthScore.returns_filed_late}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Returns
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {healthScore.total_returns_due}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compliance Rate
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {healthScore.total_returns_due > 0 
                  ? ((healthScore.returns_filed_on_time / healthScore.total_returns_due) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Component Scores</CardTitle>
          <CardDescription>
            Detailed breakdown of your GST compliance performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreBar 
            label="Filing Compliance" 
            score={healthScore.filing_compliance_score} 
          />
          <ScoreBar 
            label="Tax Calculation Accuracy" 
            score={healthScore.tax_calculation_accuracy_score} 
          />
          <ScoreBar 
            label="Documentation Quality" 
            score={healthScore.documentation_score} 
          />
          <ScoreBar 
            label="Timely Reconciliation" 
            score={healthScore.reconciliation_score} 
          />
          <ScoreBar 
            label="ITC Claim Efficiency" 
            score={healthScore.itc_claim_score} 
          />
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {healthScore.risk_factors.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5" />
              Risk Factors
            </CardTitle>
            <CardDescription>
              Areas that need attention to improve your health score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthScore.risk_factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-orange-600 font-bold mt-0.5">⚠</span>
                  {factor}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvement Suggestions */}
      {healthScore.improvement_suggestions.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <TrendingUp className="h-5 w-5" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>
              Recommended actions to boost your GST health score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {healthScore.improvement_suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Score History */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <CardDescription>
              Historical performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 6).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(record.calculation_period_to).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(record.calculation_period_from).toLocaleDateString()} -{' '}
                      {new Date(record.calculation_period_to).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {record.overall_score.toFixed(1)}
                      </div>
                      <Badge className={getGradeColor(record.health_grade)}>
                        {record.health_grade}
                      </Badge>
                    </div>
                    {history[history.indexOf(record) - 1] && (
                      <div>
                        {record.overall_score > history[history.indexOf(record) - 1].overall_score ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : record.overall_score < history[history.indexOf(record) - 1].overall_score ? (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
