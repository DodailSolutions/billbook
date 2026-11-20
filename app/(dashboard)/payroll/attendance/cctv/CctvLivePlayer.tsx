'use client'

import { useEffect, useState, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

interface CctvLivePlayerProps {
    bridgeHost: string
    cameraId: string
    cameraName?: string
    className?: string
    fallbackTimestamp?: number
    onError?: () => void
}

export function CctvLivePlayer({
    bridgeHost,
    cameraId,
    cameraName,
    className,
    fallbackTimestamp,
    onError
}: CctvLivePlayerProps) {
    const [frameSrc, setFrameSrc] = useState<string | null>(null)
    const [isWsActive, setIsWsActive] = useState(false)
    const [streamFailed, setStreamFailed] = useState(false)
    const activeUrlRef = useRef<string | null>(null)

    useEffect(() => {
        let ws: WebSocket | null = null
        let isCancelled = false
        setStreamFailed(false)

        try {
            // Build WebSocket URL from bridgeHost
            const wsBase = bridgeHost
                .replace(/^https:\/\//i, 'wss://')
                .replace(/^http:\/\//i, 'ws://')
            const wsUrl = `${wsBase}/ws/stream?camera=${encodeURIComponent(cameraId)}`
            
            ws = new WebSocket(wsUrl)
            ws.binaryType = 'blob'

            ws.onopen = () => {
                if (!isCancelled) setIsWsActive(true)
            }

            ws.onmessage = (event) => {
                if (isCancelled) return
                if (event.data instanceof Blob) {
                    const objectUrl = URL.createObjectURL(event.data)
                    setFrameSrc(objectUrl)
                    if (activeUrlRef.current) {
                        URL.revokeObjectURL(activeUrlRef.current)
                    }
                    activeUrlRef.current = objectUrl
                    setStreamFailed(false)
                }
            }

            ws.onerror = () => {
                if (!isCancelled) {
                    setIsWsActive(false)
                }
            }

            ws.onclose = () => {
                if (!isCancelled) {
                    setIsWsActive(false)
                }
            }
        } catch {
            setIsWsActive(false)
        }

        return () => {
            isCancelled = true
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
            if (activeUrlRef.current) {
                URL.revokeObjectURL(activeUrlRef.current)
                activeUrlRef.current = null
            }
        }
    }, [bridgeHost, cameraId])

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
                }}
            />
        )
    }

    // HTTP / MJPEG Fallback
    const mjpegUrl = `${bridgeHost}/stream?camera=${encodeURIComponent(cameraId)}&t=${fallbackTimestamp || Date.now()}`

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={mjpegUrl}
            alt={cameraName || 'CCTV Live Feed'}
            className={className}
            onError={() => {
                setStreamFailed(true)
                onError?.()
            }}
        />
    )
}
