import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserPlanStatus } from '@/lib/plan-utils'
import { 
  fetchBusinessERPContext, 
  buildPersonalRAGPrompt, 
  executeLocalERPRAGReasoning 
} from '@/lib/ai-erp-rag'

// Use Node.js runtime for this API route
export const runtime = 'nodejs'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has access to AI Accountant
    const planStatus = await getUserPlanStatus()
    const hasAIAccess = planStatus && (
      planStatus.planSlug === 'professional' ||
      planStatus.planSlug === 'enterprise' ||
      planStatus.isLifetime
    )

    if (!hasAIAccess) {
      return NextResponse.json(
        { error: 'AI Accountant is only available for Professional, Lifetime, and Enterprise plans' },
        { status: 403 }
      )
    }

    const { message, history, customApiKey, customProvider } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // ==========================================
    // 1. Personal RAG: Retrieve Business Context
    // ==========================================
    const erpContext = await fetchBusinessERPContext(supabase, user.id)

    // Build the executive RAG system prompt with real ERP ledger context
    const systemPrompt = buildPersonalRAGPrompt(erpContext, message, history || [])

    // ==========================================
    // 2. Multi-Model LLM Dispatcher
    // ==========================================
    let aiResponse = ''
    let isLiveAI = false
    let usedProvider = ''

    // A. Check user-supplied custom key or server environment
    const geminiKey = customProvider === 'gemini' && customApiKey ? customApiKey : process.env.GEMINI_API_KEY
    const openaiKey = customProvider === 'openai' && customApiKey ? customApiKey : process.env.OPENAI_API_KEY
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3'

    // Priority 1: Google Gemini (Supported models: gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro)
    if (geminiKey) {
      const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']
      for (const model of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nRecent Conversation:\n${(history || []).map((m: Message) => `${m.role}: ${m.content}`).join('\n')}\n\nUser Question: ${message}` }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048
              }
            }),
            signal: AbortSignal.timeout(12000)
          })

          if (res.ok) {
            const data = await res.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              aiResponse = text
              isLiveAI = true
              usedProvider = `Gemini (${model})`
              break
            }
          } else {
            const errBody = await res.text()
            console.warn(`Gemini (${model}) failed (${res.status}):`, errBody)
          }
        } catch (err) {
          console.warn(`Gemini (${model}) error:`, err)
        }
      }
    }

    // Priority 2: OpenAI API
    if (!aiResponse && openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...(history || []).map((msg: Message) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
              })),
              { role: 'user', content: message }
            ],
            temperature: 0.2
          }),
          signal: AbortSignal.timeout(12000)
        })

        if (res.ok) {
          const data = await res.json()
          aiResponse = data.choices?.[0]?.message?.content || ''
          if (aiResponse) {
            isLiveAI = true
            usedProvider = 'OpenAI (GPT-4o-mini)'
          }
        }
      } catch (err) {
        console.warn('OpenAI API call failed:', err)
      }
    }

    // Priority 3: Local or Self-Hosted Ollama
    if (!aiResponse) {
      try {
        const messagesPayload = [
          { role: 'system', content: systemPrompt },
          ...(history || []).map((msg: Message) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })),
          { role: 'user', content: message }
        ]

        const res = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: messagesPayload,
            stream: false
          }),
          signal: AbortSignal.timeout(4000) // 4s timeout
        })

        if (res.ok) {
          const data = await res.json()
          aiResponse = data.message?.content || ''
          if (aiResponse) {
            isLiveAI = true
            usedProvider = `Ollama (${ollamaModel})`
          }
        }
      } catch {
        // Ollama not reachable, fall back to built-in local ERP RAG reasoning
      }
    }

    // Priority 4: Built-in Local ERP RAG Reasoning Engine
    // Computes deterministic, grounded, multi-module business insights directly from live database
    if (!aiResponse) {
      aiResponse = executeLocalERPRAGReasoning(erpContext, message)
      usedProvider = 'Personal ERP RAG Engine'
      isLiveAI = false
    }

    // ==========================================
    // 3. Persist Chat History (Non-blocking)
    // ==========================================
    try {
      await supabase
        .from('ai_chat_history')
        .insert({
          user_id: user.id,
          user_message: message,
          ai_response: aiResponse,
          created_at: new Date().toISOString()
        })
    } catch {
      // Ignore if table or columns not yet created
    }

    return NextResponse.json({
      message: aiResponse,
      isDemoMode: !isLiveAI,
      provider: usedProvider,
      businessName: erpContext.profile.businessName,
      metrics: erpContext.metrics,
      success: true
    })

  } catch (error) {
    console.error('AI Accountant error:', error)
    return NextResponse.json(
      { error: 'Failed to process ERP AI request' },
      { status: 500 }
    )
  }
}
