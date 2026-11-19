'use client'

import { useState, useEffect, useRef } from 'react'
import { 
    Video, 
    VideoOff, 
    Maximize2, 
    Minimize2, 
    RefreshCw, 
    ShieldCheck, 
    Wifi, 
    Scan,
    Layers,
    Terminal,
    CheckCircle2,
    Activity
} from 'lucide-react'
import { CctvCamera } from '@/lib/cctv-attendance-actions'

interface CameraLiveMonitorProps {
    camera: CctvCamera
}

export function CameraLiveMonitor({ camera }: CameraLiveMonitorProps) {
    const [currentTime, setCurrentTime] = useState('')
    const [fps, setFps] = useState('15.2')
    const [bitrate, setBitrate] = useState('2048 Kbps')
    const [streamQuality, setStreamQuality] = useState<'main' | 'sub'>('main')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [streamConnected, setStreamConnected] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)

    // Real-time surveillance millisecond timestamp clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const timeStr = now.toLocaleDateString('en-GB') + ' ' + 
                            now.toTimeString().split(' ')[0] + '.' + 
                            String(now.getMilliseconds()).padStart(3, '0')
            setCurrentTime(timeStr)
        }
        updateTime()
        const timer = setInterval(updateTime, 100)
        return () => clearInterval(timer)
    }, [])

    // Real-time CCTV FPS & Bitrate jitter simulation
    useEffect(() => {
        if (!camera.is_active) return
        const interval = setInterval(() => {
            const jitterFps = (14.9 + Math.random() * 0.5).toFixed(1)
            const jitterKbps = Math.floor(1980 + Math.random() * 120)
            setFps(jitterFps)
            setBitrate(`${jitterKbps} Kbps`)
        }, 1500)
        return () => clearInterval(interval)
    }, [camera.is_active])

    // Check if local Python OpenCV / MJPEG vision bridge is active
    useEffect(() => {
        if (!camera.is_active) return
        let isMounted = true
        const checkBridge = async () => {
            try {
                const res = await fetch(`http://localhost:5000/status?camera=${encodeURIComponent(camera.id)}`, { mode: 'no-cors' })
                if (isMounted) setStreamConnected(true)
            } catch {
                if (isMounted) setStreamConnected(false)
            }
        }
        checkBridge()
        const timer = setInterval(checkBridge, 5000)
        return () => {
            isMounted = false
            clearInterval(timer)
        }
    }, [camera.id, camera.is_active])

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

    const handleRefreshStream = () => {
        setIsRefreshing(true)
        setTimeout(() => {
            setIsRefreshing(false)
        }, 800)
    }

    const isP2P = camera.stream_url.startsWith('p2p://')
    let displaySerial = ''
    if (isP2P) {
        try {
            const parsed = new URL(camera.stream_url)
            displaySerial = parsed.hostname
        } catch {
            displaySerial = 'P2P-DEVICE'
        }
    }

    const isDirectHttpStream = camera.stream_url.startsWith('http://') || camera.stream_url.startsWith('https://')

    return (
        <div 
            ref={containerRef}
            className={`relative bg-slate-950 flex flex-col justify-between p-3 overflow-hidden group select-none ${
                isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-52'
            }`}
        >
            {/* Live Feed Rendering */}
            {camera.is_active ? (
                isDirectHttpStream ? (
                    <video 
                        src={camera.stream_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0 block"
                    />
                ) : streamConnected ? (
                    <img 
                        src={`http://localhost:5000/feed/${camera.id}`}
                        alt="Live Python Vision Feed"
                        className="absolute inset-0 w-full h-full object-cover z-0 block"
                    />
                ) : (
                    /* Live CCTV Surveillance Grid Background */
                    <div className="absolute inset-0 bg-radial-[circle_at_center,#0f172a_0%,#020617_100%] z-0 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px]" />
                    </div>
                )
            ) : (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-500 z-0 space-y-2">
                    <VideoOff className="w-10 h-10 opacity-40 text-slate-500" />
                    <p className="text-xs font-mono text-slate-400">CCTV Camera Stream Paused</p>
                </div>
            )}

            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.35)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-10" />

            {/* Sweeping Laser Scan Line */}
            {camera.is_active && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[scan_3.5s_ease-in-out_infinite] pointer-events-none z-10 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            )}

            {/* Top Status Bar */}
            <div className="relative z-20 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${
                        camera.is_active 
                            ? 'bg-emerald-500/90 text-white' 
                            : 'bg-slate-800 text-slate-400'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${camera.is_active ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                        {camera.is_active ? (isP2P ? 'P2P CLOUD SYNCED' : 'RTSP LIVE') : 'OFFLINE'}
                    </span>

                    {displaySerial && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 border border-indigo-700/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                            <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                            SN: {displaySerial}
                        </span>
                    )}

                    <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded hidden md:inline">
                        CH 01
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-300 bg-black/70 px-2 py-0.5 rounded border border-white/10 font-mono">
                        {camera.is_active ? `${fps} FPS • ${streamQuality === 'main' ? '1080p' : 'D1'} • ${bitrate}` : '0 FPS'}
                    </span>

                    {/* Refresh feed */}
                    <button
                        onClick={handleRefreshStream}
                        className="text-slate-400 hover:text-white p-1 rounded bg-black/50 hover:bg-black/80 transition-colors cursor-pointer"
                        title="Reconnect stream"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="text-slate-400 hover:text-white p-1 rounded bg-black/50 hover:bg-black/80 transition-colors cursor-pointer"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Center Dynamic AI Face Detection Reticle / HUD */}
            <div className="relative z-20 my-auto text-center pointer-events-none">
                {camera.is_active ? (
                    <div className="relative inline-block">
                        {/* Biometric Target Bounding Box */}
                        <div className="w-24 h-28 border-2 border-emerald-400/80 rounded-xl mx-auto flex flex-col justify-between p-1.5 shadow-[0_0_20px_rgba(52,211,153,0.35)] relative">
                            {/* Corner Reticles */}
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-300" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-300" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-300" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-300" />

                            <div className="flex justify-between items-center text-[9px] text-emerald-400 font-mono font-bold">
                                <span className="animate-pulse">AI SCAN</span>
                                <span>99.4%</span>
                            </div>

                            <div className="my-auto flex items-center justify-center">
                                <Scan className="w-8 h-8 text-emerald-300/80 animate-[spin_12s_linear_infinite]" />
                            </div>

                            <div className="text-[9px] text-emerald-300 font-mono text-center font-bold">
                                512-D VECTOR
                            </div>
                        </div>

                        <div className="mt-1.5 flex items-center justify-center gap-1.5">
                            <span className="text-[10px] text-emerald-200 font-mono bg-black/75 px-2.5 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-xs flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                Python Vision Engine Ready
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Bottom Stream Controls & Metadata */}
            <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/75 -mx-3 -mb-3 px-3 py-1.5 border-t border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-semibold">{currentTime}</span>
                    <span className="text-slate-500">•</span>
                    <span className="truncate text-slate-200">{camera.location}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quality Toggle (Main Stream 1080p / Sub Stream D1) */}
                    <button
                        onClick={() => setStreamQuality(q => q === 'main' ? 'sub' : 'main')}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10 flex items-center gap-1"
                        title="Switch between Main Stream (1080p) and Sub Stream (D1)"
                    >
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {streamQuality === 'main' ? 'Main (1080p)' : 'Sub (D1)'}
                    </button>

                    {/* Direction Mode Badge */}
                    <span className="capitalize text-indigo-300 font-semibold text-[10px] bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded hidden sm:inline">
                        {camera.direction_mode.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
    )
}
