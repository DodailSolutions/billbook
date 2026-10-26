'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Key, 
  AlertCircle, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  X,
  RefreshCw
} from 'lucide-react'
import { FormattedMarkdown } from '@/components/FormattedMarkdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ERPMetrics {
  totalRevenue: number
  paidRevenue: number
  unpaidRevenue: number
  overdueRevenue: number
  totalExpenses: number
  netOperatingSurplus: number
  operatingMarginPct: number
  collectionEfficiencyPct: number
  invoiceCount: number
  lowStockCount: number
}

interface AIAccountantChatProps {
  userId: string
  businessName: string
  isDemoMode: boolean
}

const QUICK_ACTIONS = [
  { label: '📊 Cash Flow & P&L', prompt: 'Give me an executive cash flow analysis, net profit, and financial status for my business.' },
  { label: '⚠️ Overdue Debtors', prompt: 'Who owes me money? List all customers with unpaid and overdue invoices.' },
  { label: '📦 Low Stock Alerts', prompt: 'Which inventory items are low on stock and need reordering right now?' },
  { label: '🧾 GST Tax Liability', prompt: 'What is my current GST tax breakdown (CGST, SGST, IGST) and upcoming filing deadlines?' },
  { label: '🏢 Vendor POs & AP', prompt: 'What are my active vendor commitments, open purchase orders, and accounts payable?' },
  { label: '👥 Payroll & Headcount', prompt: 'Summarize my team headcount and payroll status.' }
]

export function AIAccountantChat({ businessName, isDemoMode }: AIAccountantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `### 💼 Welcome to your Personal ERP AI Controller for **${businessName}**

I am deeply synchronized with your real-time business ledgers, customer receivables, inventory warehouses, GST calculations, and operational expenses.

You can ask me any financial or accounting question, or tap one of the instant diagnostic actions below to begin.`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localDemoMode, setLocalDemoMode] = useState(isDemoMode)
  const [providerName, setProviderName] = useState(isDemoMode ? 'Personal ERP RAG Engine' : 'Checking...')
  const [metrics, setMetrics] = useState<ERPMetrics | null>(null)
  
  // Custom API Key Modal state
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [customProvider, setCustomProvider] = useState<'gemini' | 'openai'>('gemini')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [savedKeyExists, setSavedKeyExists] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load custom API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProvider = localStorage.getItem('billbook_custom_ai_provider') as 'gemini' | 'openai' | null
      const storedKey = localStorage.getItem('billbook_custom_ai_key')
      if (storedProvider) setCustomProvider(storedProvider)
      if (storedKey) {
        setApiKeyInput(storedKey)
        setSavedKeyExists(true)
        setLocalDemoMode(false)
        setProviderName(`Custom ${storedProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}`)
      }
    }
  }, [])

  const saveCustomKey = () => {
    if (typeof window !== 'undefined') {
      if (apiKeyInput.trim()) {
        localStorage.setItem('billbook_custom_ai_provider', customProvider)
        localStorage.setItem('billbook_custom_ai_key', apiKeyInput.trim())
        setSavedKeyExists(true)
        setLocalDemoMode(false)
        setProviderName(`Custom ${customProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}`)
      } else {
        localStorage.removeItem('billbook_custom_ai_provider')
        localStorage.removeItem('billbook_custom_ai_key')
        setSavedKeyExists(false)
        setLocalDemoMode(isDemoMode)
        setProviderName(isDemoMode ? 'Personal ERP RAG Engine' : 'AI Model')
      }
    }
    setShowKeyModal(false)
  }

  const removeCustomKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('billbook_custom_ai_provider')
      localStorage.removeItem('billbook_custom_ai_key')
      setApiKeyInput('')
      setSavedKeyExists(false)
      setLocalDemoMode(isDemoMode)
      setProviderName(isDemoMode ? 'Personal ERP RAG Engine' : 'AI Model')
    }
    setShowKeyModal(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Retrieve custom key if present
    let customKey = ''
    let activeCustomProvider = customProvider
    if (typeof window !== 'undefined') {
      customKey = localStorage.getItem('billbook_custom_ai_key') || ''
      activeCustomProvider = (localStorage.getItem('billbook_custom_ai_provider') as any) || customProvider
    }

    try {
      const response = await fetch('/api/ai-accountant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-8), // Send recent context
          customApiKey: customKey || undefined,
          customProvider: customKey ? activeCustomProvider : undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setLocalDemoMode(!!data.isDemoMode)
      if (data.provider) {
        setProviderName(data.provider)
      }
      if (data.metrics) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '### ⚠️ Communication Notice\nI encountered a temporary communication glitch with the ledger server. Please try submitting your question again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Top Controller Bar */}
      <div className="p-3 px-4 sm:px-6 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{businessName}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                ERP RAG
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className={`w-2 h-2 rounded-full ${localDemoMode ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
              <span>{localDemoMode ? 'Personal ERP RAG Engine (Deterministic & Secure)' : `Connected: ${providerName}`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowKeyModal(true)}
            className="text-xs h-8 px-2.5 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            <span>{savedKeyExists ? 'Cloud Key Configured' : 'Connect Cloud LLM'}</span>
          </Button>
        </div>
      </div>

      {/* Live ERP KPI Strip (if metrics received) */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 text-xs">
          <div className="flex items-center gap-2 p-1.5 px-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100/60 dark:border-gray-700">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Total Revenue</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatINR(metrics.totalRevenue)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 px-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100/60 dark:border-gray-700">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="truncate">
              <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Unpaid Receivables</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{formatINR(metrics.unpaidRevenue)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 px-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100/60 dark:border-gray-700">
            <Package className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="truncate">
              <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Low Stock SKUs</span>
              <span className="font-bold text-gray-900 dark:text-white">{metrics.lowStockCount} items</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 px-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-100/60 dark:border-gray-700">
            <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Operating Surplus</span>
              <span className="font-bold text-blue-700 dark:text-blue-300">{formatINR(metrics.netOperatingSurplus)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-xs ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-gray-100/90 dark:bg-gray-800/90 text-gray-900 dark:text-white border border-gray-200/80 dark:border-gray-700 rounded-bl-xs'
              }`}
            >
              {message.role === 'assistant' ? (
                <FormattedMarkdown content={message.content} />
              ) : (
                <p className="text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
              )}
              <p className={`text-[10px] mt-2 text-right ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Synthesizing real-time ERP ledgers & business data...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(action.prompt)}
            disabled={isLoading}
            className="text-xs shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask your ERP Assistant anything about ${businessName}'s financials, debtors, taxes, or stock...`}
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-11 max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-11 rounded-xl disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2 px-1">
          <span>Press Enter to send • Shift + Enter for new line</span>
          <span className="hidden sm:inline">100% tenant-isolated financial intelligence</span>
        </div>
      </form>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Connect Cloud LLM</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              By default, your AI assistant runs on our <strong>Personal ERP RAG Engine</strong> using your exact live numbers. If you want conversational natural language from Google Gemini or OpenAI, connect an API key below:
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomProvider('gemini')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center cursor-pointer transition-colors ${
                      customProvider === 'gemini'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Google Gemini (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomProvider('openai')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center cursor-pointer transition-colors ${
                      customProvider === 'openai'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    OpenAI (GPT-4o)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={customProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">
                  Stored securely in your local browser storage. Never shared.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {savedKeyExists && (
                <button
                  type="button"
                  onClick={removeCustomKey}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Disconnect Key
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveCustomKey}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save & Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
