'use client'

import { useEffect, useRef } from 'react'

interface UseBarcodeScannerOptions {
    onScan: (barcode: string) => void
    onError?: (err: string) => void
    enabled?: boolean
    minBarcodeLength?: number
    maxTimeBetweenKeysMs?: number
    enableInInputs?: boolean
    playAudioBeep?: boolean
}

/**
 * Global Keyboard Wedge Hardware Barcode Scanner Hook.
 * Listens for high-speed keystrokes transmitted by USB & Bluetooth handheld barcode readers.
 */
export function useBarcodeScanner({
    onScan,
    onError,
    enabled = true,
    minBarcodeLength = 3,
    maxTimeBetweenKeysMs = 50, // Barcode scanners transmit characters extremely quickly (<50ms)
    enableInInputs = false,
    playAudioBeep = true
}: UseBarcodeScannerOptions) {
    const bufferRef = useRef<string>('')
    const lastKeyTimeRef = useRef<number>(0)

    // Synthesize quick standard scanner audio beep via Web Audio API without needing external mp3 files
    const playBeep = () => {
        if (!playAudioBeep || typeof window === 'undefined') return
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
            if (!AudioCtx) return
            const ctx = new AudioCtx()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(1750, ctx.currentTime) // High-pitched scanner beep
            gain.gain.setValueAtTime(0.12, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            osc.stop(ctx.currentTime + 0.08)
        } catch {
            // Audio context silently blocked if not interacted
        }
    }

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null
            const isInput = target && (
                target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable
            )

            // If user is actively typing in a normal form input and enableInInputs is false, skip
            if (isInput && !enableInInputs) {
                // If the input explicitly has data-barcode-input="true", allow capturing
                if (!target.getAttribute('data-barcode-input')) {
                    return
                }
            }

            const now = Date.now()
            const diff = now - lastKeyTimeRef.current

            // If elapsed time between keystrokes exceeds threshold, reset buffer (it was manual human typing)
            if (diff > maxTimeBetweenKeysMs && bufferRef.current.length > 0) {
                bufferRef.current = ''
            }

            lastKeyTimeRef.current = now

            if (e.key === 'Enter') {
                if (bufferRef.current.length >= minBarcodeLength) {
                    const scannedBarcode = bufferRef.current.trim()
                    bufferRef.current = ''
                    playBeep()
                    onScan(scannedBarcode)
                    e.preventDefault()
                    e.stopPropagation()
                } else {
                    bufferRef.current = ''
                }
            } else if (e.key.length === 1) {
                // Collect printable characters
                bufferRef.current += e.key
            }
        }

        window.addEventListener('keydown', handleKeyDown, true)
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true)
        }
    }, [enabled, minBarcodeLength, maxTimeBetweenKeysMs, enableInInputs, playAudioBeep, onScan])
}
