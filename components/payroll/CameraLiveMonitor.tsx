'use client'

import { useState, useEffect, useRef } from 'react'
import { 
    Video, 
    VideoOff, 
    Maximize2, 
    Minimize2, 
    Camera, 
    RefreshCw, 
    ShieldCheck, 
    Wifi, 
    Eye,
    Scan,
    Sparkles
} from 'lucide-react'
import { CctvCamera } from '@/lib/cctv-attendance-actions'

interface CameraLiveMonitorProps {
    camera: CctvCamera
}

export function CameraLiveMonitor({ camera }: CameraLiveMonitorProps) {
    const [currentTime, setCurrentTime] = useState('')
    const [fps, setFps] = useState('15.0')
    const [isWebcamActive, setIsWebcamActive] = useState(false)
    const [webcamError, setWebcamError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    // Live Surveillance Timestamp clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const timeStr = now.toLocaleDateString('en-GB') + ' ' + now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
            setCurrentTime(timeStr)
        }
        updateTime()
        const timer = setInterval(updateTime, 100)
        return () => clearInterval(timer)
    }, [])

    // Fluctuating FPS simulation
    useEffect(() => {
        if (!camera.is_active) return
        const interval = setInterval(() => {
            const jitter = (14.8 + Math.random() * 0.5).toFixed(1)
            setFps(jitter)
        }, 1200)
        return () => clearInterval(interval)
    }, [camera.is_active])

    // Toggle live webcam test
    const toggleWebcam = async () => {
        if (isWebcamActive) {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
            }
            setIsWebcamActive(false)
            setWebcamError(null)
        } else {
            setWebcamError(null)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                }
                setIsWebcamActive(true)
            } catch (err: any) {
                console.error('Webcam error:', err)
                setWebcamError(err?.message || 'Camera permission denied or camera unavailable.')
            }
        }
    }

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!containerRef.current) return
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {})
            setIsFullscreen(true)
        } else {
            document.exitFullscreen().catch(() => {})
            setIsFullscreen(false)
        }
    }

    const isP2P = camera.stream_url.startsWith('p2p://')
    let displaySerial = ''
    if (isP2P) {
        try {
            const parsed = new URL(camera.stream_url)
            displaySerial = parsed.hostname
        } catch {
            displaySerial = 'P2P-ONLINE'
        }
    }

    return (
        <div 
            ref={containerRef}
            className={`relative bg-slate-950 flex flex-col justify-between p-3 overflow-hidden group select-none ${
                isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-48'
            }`}
        >
            {/* Live Video Element (When Webcam/Stream is active) */}
            <video 
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover z-0 ${isWebcamActive ? 'block' : 'hidden'}`}
            />

            {/* Scanline & Grid Effect Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-10" />

            {/* Sweeping Laser Scan Line (when stream is active) */}
            {camera.is_active && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-[scan_3s_ease-in-out_infinite] pointer-events-none z-10 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}

            {/* Top Status Bar */}
            <div className="relative z-20 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        camera.is_active 
                            ? 'bg-emerald-500/90 text-white shadow-xs' 
                            : 'bg-slate-800 text-slate-400'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${camera.is_active ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                        {camera.is_active ? (isWebcamActive ? 'LIVE WEBCAM' : 'LIVE FEED') : 'PAUSED'}
                    </span>

                    {displaySerial && (
                        <span className="hidden sm:inline text-[10px] text-indigo-300 font-semibold bg-indigo-950/70 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                            SN: {displaySerial.slice(0, 10)}...
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-white/5">
                        {camera.is_active ? `${fps} FPS • 1080p` : 'OFFLINE'}
                    </span>
                    <button
                        onClick={toggleFullscreen}
                        className="text-slate-400 hover:text-white p-1 rounded bg-black/40 hover:bg-black/80 transition-colors"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Center Dynamic AI Face Detection HUD */}
            <div className="relative z-20 my-auto text-center">
                {camera.is_active ? (
                    <div className="relative inline-block">
                        {/* Biometric Target Bounding Box */}
                        <div className="w-24 h-28 border-2 border-indigo-400/80 rounded-xl mx-auto flex flex-col justify-between p-1.5 shadow-[0_0_15px_rgba(99,102,241,0.25)] relative group">
                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />

                            <div className="flex justify-between items-center text-[9px] text-emerald-400 font-mono">
                                <span className="animate-pulse">TRACKING</span>
                                <span>99.2%</span>
                            </div>

                            <div className="my-auto flex items-center justify-center">
                                <Scan className="w-8 h-8 text-indigo-300/80 animate-[spin_10s_linear_infinite]" />
                            </div>

                            <div className="text-[9px] text-indigo-200 font-mono text-center">
                                512-D VECTOR
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-300 font-mono mt-1.5 bg-black/50 px-2 py-0.5 rounded inline-block backdrop-blur-xs">
                            {isWebcamActive ? 'Live Biometric Ingestion' : 'AI CCTV Recognition Active'}
                        </p>
                    </div>
                ) : (
                    <div className="text-slate-500 space-y-1">
                        <VideoOff className="w-8 h-8 mx-auto opacity-50" />
                        <p className="text-xs font-mono">Stream Paused</p>
                    </div>
                )}
            </div>

            {/* Bottom Stream Controls & Metadata */}
            <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/60 -mx-3 -mb-3 px-3 py-1.5 border-t border-white/10">
                <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-semibold">{currentTime}</span>
                    <span className="text-slate-500">•</span>
                    <span className="truncate text-slate-300">{camera.location}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live Webcam Toggle Button for immediate real camera preview */}
                    <button
                        onClick={toggleWebcam}
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isWebcamActive 
                                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        title="Test with your computer camera"
                    >
                        <Camera className="w-3 h-3" />
                        {isWebcamActive ? 'Stop Webcam' : 'Test Live Cam'}
                    </button>
                    <span className="capitalize text-indigo-300 font-semibold hidden sm:inline">
                        {camera.direction_mode.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {webcamError && (
                <div className="absolute bottom-10 left-3 right-3 bg-rose-950/90 border border-rose-500/50 p-2 rounded text-[11px] text-rose-200 z-30">
                    {webcamError}
                </div>
            )}
        </div>
    )
}
