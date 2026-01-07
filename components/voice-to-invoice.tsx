/**
 * Voice-to-Invoice Component
 * Interactive voice recording and invoice creation interface
 */

'use client'

// Browser Speech Recognition interface
interface BrowserSpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  onstart: ((ev: Event) => void) | null
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  isSpeechRecognitionSupported,
  initializeSpeechRecognition,
  defaultVoiceConfig,
  parseInvoiceFromTranscript,
  validateParsedInvoice,
  getVoiceCommandSuggestions,
  identifyCommandType,
  extractEntities
} from '@/lib/voice-invoice-utils'
import {
  createVoiceRecording,
  saveTranscription,
  parseAndSaveInvoiceData,
  createInvoiceFromVoice,
  logVoiceCommand
} from '@/lib/voice-invoice-actions'
import type { VoiceToInvoiceSession, VoiceParsedInvoiceData } from '@/lib/voice-invoice-types'

export function VoiceToInvoice() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [session, setSession] = useState<VoiceToInvoiceSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
  }, [])

  const startListening = async () => {
    try {
      setError(null)
      
      // Create voice recording session
      const recordingResult = await createVoiceRecording({
        mime_type: 'audio/webm'
      })

      if (!recordingResult.success || !recordingResult.recording) {
        throw new Error(recordingResult.error || 'Failed to create recording')
      }

      const recording = recordingResult.recording

      // Initialize session
      setSession({
        recording_id: recording.id,
        commands: [],
        status: 'recording'
      })

      // Setup speech recognition
      const recognition = initializeSpeechRecognition(defaultVoiceConfig)
      recognitionRef.current = recognition
      startTimeRef.current = Date.now()

      recognition.onstart = () => {
        setIsListening(true)
        console.log('Speech recognition started')
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript
          }
        }

        if (final) {
          setTranscript(prev => prev + final)
          setInterimTranscript('')
        } else {
          setInterimTranscript(interim)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setError(`Recognition error: ${event.error}`)
        stopListening()
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        if (isListening) {
          // Auto-restart if still listening
          recognition.start()
        }
      }

      recognition.start()
    } catch (err) {
      console.error('Error starting voice recognition:', err)
      setError(err instanceof Error ? err.message : 'Failed to start recognition')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimTranscript('')
  }

  const processTranscript = async () => {
    if (!transcript || !session) return

    try {
      setProcessing(true)
      setError(null)

      const processingTime = Date.now() - startTimeRef.current

      // Save transcription
      const transcriptionResult = await saveTranscription({
        voice_recording_id: session.recording_id,
        raw_transcript: transcript,
        confidence_score: 0.85,
        language: 'en-IN',
        transcription_service: 'web-speech-api',
        processing_time_ms: processingTime
      })

      if (!transcriptionResult.success || !transcriptionResult.transcription) {
        throw new Error('Failed to save transcription')
      }

      // Parse invoice data
      const parsedData = parseInvoiceFromTranscript(transcript)
      const validation = validateParsedInvoice(parsedData)

      // Log command
      const commandType = identifyCommandType(transcript)
      const entities = extractEntities(transcript)

      await logVoiceCommand({
        voice_recording_id: session.recording_id,
        command_type: commandType,
        command_text: transcript,
        extracted_entities: entities.reduce((acc, e) => ({ ...acc, [e.entity_type]: e.value }), {}),
        executed: true
      })

      // Save parsing result
      const parsingResult = await parseAndSaveInvoiceData({
        voice_recording_id: session.recording_id,
        transcription_id: transcriptionResult.transcription.id,
        parsed_data: parsedData as VoiceParsedInvoiceData,
        confidence_score: 0.8,
        parsing_service: 'custom-nlp'
      })

      if (!parsingResult.success) {
        throw new Error('Failed to parse invoice data')
      }

      // Update session
      setSession({
        ...session,
        transcription: transcriptionResult.transcription,
        parsing: parsingResult.parsing,
        current_draft: parsedData,
        status: validation.isValid ? 'reviewing' : 'error'
      })

      if (!validation.isValid) {
        setError(`Validation errors: ${validation.errors.join(', ')}`)
      }

    } catch (err) {
      console.error('Error processing transcript:', err)
      setError(err instanceof Error ? err.message : 'Failed to process transcript')
      if (session) {
        setSession({ ...session, status: 'error' })
      }
    } finally {
      setProcessing(false)
    }
  }

  const createInvoice = async () => {
    if (!session?.current_draft) return

    try {
      setProcessing(true)
      setError(null)

      const result = await createInvoiceFromVoice({
        voice_recording_id: session.recording_id,
        parsed_data: session.current_draft as VoiceParsedInvoiceData,
        auto_finalize: false
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create invoice')
      }

      setSession({ ...session, status: 'completed' })
      
      // Redirect to invoice page after a short delay
      setTimeout(() => {
        window.location.href = `/invoices/${result.invoice_id}`
      }, 2000)

    } catch (err) {
      console.error('Error creating invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setProcessing(false)
    }
  }

  const reset = () => {
    setTranscript('')
    setInterimTranscript('')
    setSession(null)
    setError(null)
    stopListening()
  }

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">
            Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    )
  }

  const suggestions = getVoiceCommandSuggestions()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice-to-Invoice
          </CardTitle>
          <CardDescription>
            Create invoices by speaking naturally. Just describe the invoice details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="flex gap-4 justify-center">
            {!isListening ? (
              <Button 
                onClick={startListening} 
                size="lg"
                disabled={processing}
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopListening} 
                variant="destructive" 
                size="lg"
              >
                <MicOff className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {transcript && !isListening && (
              <>
                <Button 
                  onClick={processTranscript}
                  disabled={processing}
                  variant="secondary"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Transcript'
                  )}
                </Button>
                <Button onClick={reset} variant="outline">
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Status Indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Listening...</span>
            </div>
          )}

          {/* Transcript Display */}
          {(transcript || interimTranscript) && (
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="text-sm space-y-2">
                  {transcript && (
                    <p className="text-slate-900">{transcript}</p>
                  )}
                  {interimTranscript && (
                    <p className="text-slate-500 italic">{interimTranscript}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parsed Data Preview */}
          {session?.current_draft && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Extracted Invoice Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {session.current_draft.customer_name && (
                  <div>
                    <span className="font-medium">Customer:</span> {session.current_draft.customer_name}
                  </div>
                )}
                {session.current_draft.invoice_date && (
                  <div>
                    <span className="font-medium">Date:</span> {session.current_draft.invoice_date}
                  </div>
                )}
                {session.current_draft.items && session.current_draft.items.length > 0 && (
                  <div>
                    <span className="font-medium">Items:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {session.current_draft.items.map((item, idx) => (
                        <li key={idx}>
                          {item.description} 
                          {item.quantity && ` (${item.quantity})`}
                          {item.unit_price && ` @ ₹${item.unit_price}`}
                          {item.amount && ` = ₹${item.amount}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {session.current_draft.total && (
                  <div>
                    <span className="font-medium">Total:</span> ₹{session.current_draft.total}
                  </div>
                )}
                {session.current_draft.gst_percentage && (
                  <div>
                    <span className="font-medium">GST:</span> {session.current_draft.gst_percentage}%
                  </div>
                )}

                <Button 
                  onClick={createInvoice} 
                  className="mt-4 w-full"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Invoice...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {session?.status === 'completed' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <p className="text-sm text-green-800">
                  Invoice created successfully! Redirecting...
                </p>
              </div>
            </div>
          )}

          {/* Voice Command Examples */}
          {!transcript && !isListening && (
            <div className="text-sm text-slate-600 space-y-2">
              <p className="font-medium">Try saying:</p>
              <ul className="list-disc ml-6 space-y-1">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <li key={idx}>&ldquo;{suggestion}&rdquo;</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
