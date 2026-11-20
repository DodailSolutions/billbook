'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'

interface CctvLivePlayerProps {
    bridgeHost: string
    cameraId: string
    cameraName?: string
    className?: string
    fallbackTimestamp?: number
    onError?: () => void
    token?: string
    enableAutoRecovery?: boolean
    recoveryIntervalMs?: number
}

export function CctvLivePlayer({
    bridgeHost,
    cameraId,
    cameraName,
    className,
    fallbackTimestamp,
    onError,
    token,
    enableAutoRecovery = true,
    recoveryIntervalMs = 30000
}: CctvLivePlayerProps) {
    const [frameSrc, setFrameSrc] = useState<string | null>(null)
    const [isWsActive, setIsWsActive] = useState(false)
    const [streamFailed, setStreamFailed] = useState(false)
    const [isRecovering, setIsRecovering] = useState(false)
    const activeUrlRef = useRef<string | null>(null)
    const recoveryTimerRef = useRef<NodeJS.Timeout | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const isCancelledRef = useRef(false)

    const buildWsUrl = useCallback(() => {
        const wsBase = bridgeHost
            .replace(/^https:\/\//i, 'wss://')
            .replace(/^http:\/\//i, 'ws://')
        const params = new URLSearchParams({ camera: cameraId })
        if (token) params.append('token', token)
        return `${wsBase}/ws/stream?${params.toString()}`
    }, [bridgeHost, cameraId, token])

    const buildMjpegUrl = useCallback(() => {
        const params = new URLSearchParams({ camera: cameraId, t: String(fallbackTimestamp || Date.now()) })
        if (token) params.append('token', token)
        return `${bridgeHost}/stream?${params.toString()}`
    }, [bridgeHost, cameraId, fallbackTimestamp, token])

    const clearRecoveryTimer = useCallback(() => {
        if (recoveryTimerRef.current) {
            clearTimeout(recoveryTimerRef.current)
            recoveryTimerRef.current = null
        }
    }, [])

    const attemptRecovery = useCallback(() => {
        if (isCancelledRef.current) return
        setIsRecovering(true)
        setStreamFailed(false)
        // Force remount by clearing frameSrc and timestamp
        setFrameSrc(null)
        // The effect will re-run and create new connections
    }, [])

    const scheduleRecovery = useCallback(() => {
        if (!enableAutoRecovery) return
        clearRecoveryTimer()
        recoveryTimerRef.current = setTimeout(() => {
            attemptRecovery()
        }, recoveryIntervalMs)
    }, [enableAutoRecovery, recoveryIntervalMs, attemptRecovery, clearRecoveryTimer])

    // WebSocket connection effect
    useEffect(() => {
        let ws: WebSocket | null = null
        isCancelledRef.current = false
        setStreamFailed(false)

        const connect = () => {
            try {
                const wsUrl = buildWsUrl()
                ws = new WebSocket(wsUrl)
                ws.binaryType = 'blob'
                wsRef.current = ws

                ws.onopen = () => {
                    if (!isCancelledRef.current) {
                        setIsWsActive(true)
                        setStreamFailed(false)
                        setIsRecovering(false)
                        clearRecoveryTimer()
                    }
                }

                ws.onmessage = (event) => {
                    if (isCancelledRef.current) return
                    if (event.data instanceof Blob) {
                        const objectUrl = URL.createObjectURL(event.data)
                        setFrameSrc(objectUrl)
                        if (activeUrlRef.current) {
                            URL.revokeObjectURL(activeUrlRef.current)
                        }
                        activeUrlRef.current = objectUrl
                        setStreamFailed(false)
                        setIsRecovering(false)
                        clearRecoveryTimer()
                    }
                }

                ws.onerror = () => {
                    if (!isCancelledRef.current) {
                        setIsWsActive(false)
                    }
                }

                ws.onclose = () => {
                    if (!isCancelledRef.current) {
                        setIsWsActive(false)
                        // Schedule recovery if not manually stopped
                        if (enableAutoRecovery && !streamFailed) {
                            scheduleRecovery()
                        }
                    }
                }
            } catch {
                setIsWsActive(false)
                if (enableAutoRecovery) {
                    scheduleRecovery()
                }
            }
        }

        connect()

        return () => {
            isCancelledRef.current = true
            clearRecoveryTimer()
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
            if (activeUrlRef.current) {
                URL.revokeObjectURL(activeUrlRef.current)
                activeUrlRef.current = null
            }
        }
    }, [buildWsUrl, enableAutoRecovery, streamFailed, scheduleRecovery, clearRecoveryTimer])

    // MJPEG fallback effect - updates URL when fallbackTimestamp changes
    const mjpegUrl = buildMjpegUrl()

    // If WebSocket is delivering frames, render the blob frame
    if (isWsActive && frameSrc && !streamFailed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={frameSrc}
                alt={cameraName || 'CCTV Live Feed'}
                className={className}
                onError={() => {
                    setStreamFailed(true)
                    onError?.()
                    if (enableAutoRecovery) scheduleRecovery()
                }}
            />
        )
    }

    // HTTP / MJPEG Fallback or Recovery/Error State
    return (
        <div className="relative w-full h-full">
            {/* MJPEG Image */}
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={mjpegUrl}
                alt={cameraName || 'CCTV Live Feed'}
                className={className}
                onError={() => {
                    setStreamFailed(true)
                    onError?.()
                    if (enableAutoRecovery) scheduleRecovery()
                }}
            />

            {/* Error/Recovery Overlay */}
            {(streamFailed || isRecovering) && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-white z-10">
                    {isRecovering && (
                        <div className="flex flex-col items-center gap-3 animate-pulse">
                            <RotateCcw className="w-10 h-10 text-indigo-400 animate-spin" />
                            <p className="text-sm font-medium">Reconnecting to camera...</p>
                            <p className="text-xs text-slate-300">Auto-recovery in progress</p>
                        </div>
                    )}
                    {streamFailed && !isRecovering && (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <AlertCircle className="w-10 h-10 text-rose-400" />
                            <p className="text-sm font-medium">Stream Unavailable</p>
                            <p className="text-xs text-slate-300 max-w-xs">
                                {enableAutoRecovery
                                    ? `Auto-retry in ${Math.round(recoveryIntervalMs / 1000)}s...`
                                    : 'Enable auto-recovery or click to retry'}
                            </p>
                            {enableAutoRecovery && (
                                <button
                                    onClick={attemptRecovery}
                                    className="mt-2 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                >
                                    Retry Now
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
