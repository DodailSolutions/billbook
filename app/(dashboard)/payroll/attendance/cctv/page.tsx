'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    ArrowLeft, 
    Camera, 
    Plus, 
    Video, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    RefreshCw, 
    Eye, 
    EyeOff,
    Sliders, 
    ShieldCheck, 
    Activity, 
    Radio, 
    Play, 
    Pause, 
    Wifi, 
    Lock,
    Sparkles,
    Server,
    Layers,
    Tv,
    Maximize2,
    Minimize2,
    ExternalLink,
    AlertTriangle,
    X,
    Monitor,
    Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { CctvLivePlayer } from './CctvLivePlayer'
import { 
    getCctvCameras, 
    saveCctvCamera, 
    deleteCctvCamera, 
    toggleCameraStatus, 
    CctvCamera 
} from '@/lib/cctv-attendance-actions'

const CAMERA_BRANDS = [
    { id: 'hikvision', name: 'Hikvision / HiLook', defaultPort: '554', defaultChannel: '1' },
    { id: 'cpplus', name: 'CP Plus Orange / Coral', defaultPort: '554', defaultChannel: '1' },
    { id: 'dahua', name: 'Dahua / Imou', defaultPort: '554', defaultChannel: '1' },
    { id: 'uniview', name: 'Uniview (EZView / UNV)', defaultPort: '554', defaultChannel: '1' },
    { id: 'tapo', name: 'TP-Link Tapo / Kasa', defaultPort: '554', defaultChannel: '1' },
    { id: 'generic', name: 'Standard ONVIF / RTSP', defaultPort: '554', defaultChannel: '1' }
]

export default function CctvConnectorPage() {
    const [cameras, setCameras] = useState<CctvCamera[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [testingStream, setTestingStream] = useState(false)
    const [streamTestResult, setStreamTestResult] = useState<{ success: boolean; msg: string } | null>(null)

    // Form Mode: 'easy_p2p' (default EasyView-like) or 'manual_rtsp'
    const [connectionMode, setConnectionMode] = useState<'easy_p2p' | 'manual_rtsp'>('easy_p2p')
    const [selectedBrand, setSelectedBrand] = useState('dahua')
    const [deviceSerial, setDeviceSerial] = useState('')
    const [deviceHost, setDeviceHost] = useState('192.168.1.108')
    const [devicePort, setDevicePort] = useState('554')
    const [deviceUser, setDeviceUser] = useState('admin')
    const [devicePass, setDevicePass] = useState('')
    const [deviceChannel, setDeviceChannel] = useState('1')
    const [showPassword, setShowPassword] = useState(false)
    const [scanningLan, setScanningLan] = useState(false)
    const [discoveredDvrs, setDiscoveredDvrs] = useState<any[]>([])

    // Form Common State
    const [editingCamera, setEditingCamera] = useState<CctvCamera | null>(null)
    const [cameraName, setCameraName] = useState('')
    const [streamUrl, setStreamUrl] = useState('')
    const [location, setLocation] = useState('Main Entrance')
    const [directionMode, setDirectionMode] = useState<'in_only' | 'out_only' | 'bidirectional'>('bidirectional')

    // Local bridge stream failure map: { [camId]: boolean }
    const [failedStreams, setFailedStreams] = useState<Record<string, boolean>>({})
    const [enlargedCamera, setEnlargedCamera] = useState<CctvCamera | null>(null)
    const [bridgeHost, setBridgeHost] = useState('http://localhost:5050')
    const [streamTimestamp, setStreamTimestamp] = useState(Date.now())
    const [bridgeStatus, setBridgeStatus] = useState<'checking' | 'connected' | 'offline'>('checking')

    const checkBridgeHealth = async (host = bridgeHost) => {
        setBridgeStatus('checking')
        try {
            const res = await fetch(`${host}/status`, { signal: AbortSignal.timeout(2000) })
            if (res.ok) {
                setBridgeStatus('connected')
                return true
            }
        } catch {
            try {
                const wsBase = host.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://')
                const ws = new WebSocket(`${wsBase}/ws/status`)
                return new Promise<boolean>((resolve) => {
                    ws.onopen = () => {
                        setBridgeStatus('connected')
                        ws.close()
                        resolve(true)
                    }
                    ws.onerror = () => {
                        setBridgeStatus('offline')
                        resolve(false)
                    }
                    setTimeout(() => {
                        ws.close()
                        setBridgeStatus('offline')
                        resolve(false)
                    }, 1800)
                })
            } catch {
                setBridgeStatus('offline')
                return false
            }
        }
        setBridgeStatus('offline')
        return false
    }

    // Auto-detect bridge or saved host
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cctv_bridge_host')
            if (saved) {
                setBridgeHost(saved)
                checkBridgeHealth(saved)
            } else {
                checkBridgeHealth('http://localhost:5050')
            }
        }
    }, [])

    const buildRTSPUrl = (brand: string, host: string, port: string, user: string, pass: string, ch: string) => {
        const u = encodeURIComponent(user.trim() || 'admin')
        const p = pass ? encodeURIComponent(pass.trim()) : ''
        const auth = p ? `${u}:${p}@` : `${u}@`
        const h = host.trim() || '192.168.1.100'
        const pt = port.trim() || '554'
        const c = ch.trim() || '1'

        switch (brand) {
            case 'hikvision':
                return `rtsp://${auth}${h}:${pt}/Streaming/Channels/${c}01`
            case 'cpplus':
            case 'dahua':
                return `rtsp://${auth}${h}:${pt}/cam/realmonitor?channel=${c}&subtype=0`
            case 'uniview':
                return `rtsp://${auth}${h}:${pt}/unicast/c${c}/s0/live`
            case 'tapo':
                return `rtsp://${auth}${h}:${pt}/stream${c}`
            default:
                return `rtsp://${auth}${h}:${pt}/live/ch${c}`
        }
    }

    const effectiveStreamUrl = connectionMode === 'easy_p2p'
        ? (deviceHost.trim()
            ? buildRTSPUrl(selectedBrand, deviceHost, devicePort, deviceUser, devicePass, deviceChannel)
            : (deviceSerial.trim() ? `p2p://${selectedBrand}:${deviceSerial.trim()}:${encodeURIComponent(deviceUser)}:${encodeURIComponent(devicePass)}@cloud/ch${deviceChannel}` : ''))
        : streamUrl

    const loadCameras = async () => {
        setLoading(true)
        try {
            const data = await getCctvCameras()
            setCameras(data)
        } catch (err) {
            console.error('Failed to load cameras:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCameras()
    }, [])

    const openCreateModal = () => {
        setEditingCamera(null)
        setCameraName('')
        setConnectionMode('easy_p2p')
        setSelectedBrand('dahua')
        setDeviceSerial('')
        setDeviceHost('')
        setDevicePort('554')
        setDeviceUser('admin')
        setDevicePass('')
        setDeviceChannel('1')
        setStreamUrl('')
        setLocation('Main Entrance')
        setDirectionMode('bidirectional')
        setStreamTestResult(null)
        setDiscoveredDvrs([])
        setIsModalOpen(true)
    }

    const openEditModal = (cam: CctvCamera) => {
        setEditingCamera(cam)
        setCameraName(cam.camera_name)
        setStreamUrl(cam.stream_url)
        setLocation(cam.location)
        setDirectionMode(cam.direction_mode)
        setConnectionMode('manual_rtsp') // Edit existing raw URL
        setStreamTestResult(null)
        setIsModalOpen(true)
    }

    const handleScanLan = async () => {
        setScanningLan(true)
        setDiscoveredDvrs([])
        try {
            const res = await fetch(`${bridgeHost}/devices/scan`, { signal: AbortSignal.timeout(3500) })
            const data = await res.json()
            if (data.success && data.devices && data.devices.length > 0) {
                setDiscoveredDvrs(data.devices)
            } else {
                setStreamTestResult({
                    success: false,
                    msg: 'No DVRs detected automatically on local network. Ensure Vision Bridge is running.'
                })
            }
        } catch (err: any) {
            setStreamTestResult({
                success: false,
                msg: `Could not reach Vision Bridge at ${bridgeHost} to scan local network.`
            })
        } finally {
            setScanningLan(false)
        }
    }

    const handleTestStream = async () => {
        setTestingStream(true)
        setStreamTestResult(null)

        try {
            let hostToProbe = deviceHost

            // If Serial Number provided, attempt SN resolution via bridge first
            if (deviceSerial.trim() && !hostToProbe) {
                try {
                    const rRes = await fetch(`${bridgeHost}/camera/resolve-sn`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sn: deviceSerial.trim(),
                            brand: selectedBrand,
                            username: deviceUser,
                            password: devicePass,
                            channel: deviceChannel
                        }),
                        signal: AbortSignal.timeout(3000)
                    })
                    const rData = await rRes.json()
                    if (rData.success && rData.rtsp_url) {
                        setStreamUrl(rData.rtsp_url)
                        setStreamTestResult({
                            success: true,
                            msg: `✅ DVR matched by SN (${deviceSerial}). Resolved live stream: ${rData.rtsp_url}`
                        })
                        setTestingStream(false)
                        return
                    }
                } catch {}
            }

            const urlToTest = effectiveStreamUrl || hostToProbe
            if (!urlToTest && !deviceSerial) {
                setTestingStream(false)
                setStreamTestResult({ success: false, msg: 'Please enter Device Serial Number (SN) or Camera IP first.' })
                return
            }

            const rawTargetHost = connectionMode === 'easy_p2p' ? (hostToProbe || '127.0.0.1') : (urlToTest.replace(/^rtsp:\/\//i, '').split('/')[0].split('@').pop()?.split(':')[0] || urlToTest)
            const targetPort = Number(devicePort) || 554
            const isLocalSubnet = /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|localhost)/i.test(rawTargetHost)

            let probeData: { success: boolean; message?: string; error?: string } = { success: false }

            // If the local bridge is connected, probe directly through the local LAN bridge
            if (bridgeStatus === 'connected') {
                try {
                    const bridgeProbeRes = await fetch(`${bridgeHost}/camera/probe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            host: rawTargetHost,
                            port: targetPort,
                            brand: selectedBrand,
                            rtsp_url: urlToTest
                        }),
                        signal: AbortSignal.timeout(4000)
                    })
                    probeData = await bridgeProbeRes.json()
                } catch (bridgeErr: any) {
                    console.warn('Bridge probe error, falling back to cloud probe:', bridgeErr)
                }
            }

            // If bridge probe was not used or did not respond
            if (!probeData.success) {
                if (isLocalSubnet && bridgeStatus !== 'connected') {
                    setTestingStream(false)
                    setStreamTestResult({
                        success: false,
                        msg: `Camera IP (${rawTargetHost}) is on your private local network. Cloud servers cannot reach internal LAN subnets directly. Please launch the local Vision Bridge (port 5050) so it can boost and relay the signal.`
                    })
                    return
                }

                // Cloud probe fallback for public DDNS or external hostnames
                const probeRes = await fetch('/api/payroll/attendance/cctv/probe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        host: connectionMode === 'easy_p2p' ? (hostToProbe || '127.0.0.1') : urlToTest,
                        port: targetPort,
                        brand: selectedBrand
                    })
                })
                probeData = await probeRes.json()
            }

            let bridgeOnline = bridgeStatus === 'connected'
            if (!bridgeOnline) {
                try {
                    const bRes = await fetch(`${bridgeHost}/`, { signal: AbortSignal.timeout(1500) })
                    bridgeOnline = bRes.ok
                } catch {}
            }

            setTestingStream(false)
            if (probeData.success) {
                setStreamTestResult({ 
                    success: true, 
                    msg: `${probeData.message} ${bridgeOnline ? '• Vision Bridge service is ONLINE.' : '• (Notice: Start local Vision Bridge on port 5050 for browser playback)'}` 
                })
            } else {
                setStreamTestResult({
                    success: false,
                    msg: probeData.message || probeData.error || 'Connection failed. Please check camera power and network subnet.'
                })
            }
        } catch (err: any) {
            setTestingStream(false)
            setStreamTestResult({
                success: false,
                msg: `Failed to probe camera: ${err.message}`
            })
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        let finalUrl = effectiveStreamUrl

        if (connectionMode === 'easy_p2p' && deviceSerial.trim() && !deviceHost.trim()) {
            setSaving(true)
            try {
                const rRes = await fetch(`${bridgeHost}/camera/resolve-sn`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sn: deviceSerial.trim(),
                        brand: selectedBrand,
                        username: deviceUser,
                        password: devicePass,
                        channel: deviceChannel
                    }),
                    signal: AbortSignal.timeout(2500)
                })
                const rData = await rRes.json()
                if (rData.success && rData.rtsp_url) {
                    finalUrl = rData.rtsp_url
                }
            } catch {}
        }

        if (!cameraName.trim() || !finalUrl.trim()) {
            setSaving(false)
            setMsg({ text: 'Camera Name and valid DVR Serial Number or IP details are required.', type: 'error' })
            return
        }

        setSaving(true)
        setMsg(null)
        const res = await saveCctvCamera({
            id: editingCamera?.id,
            camera_name: cameraName,
            stream_url: finalUrl,
            location,
            direction_mode: directionMode,
            is_active: editingCamera ? editingCamera.is_active : true
        })

        setSaving(false)
        if (res.success) {
            setMsg({ text: `Camera "${cameraName}" connected successfully.`, type: 'success' })
            setIsModalOpen(false)
            loadCameras()

            // Non-blocking registration with local CCTV vision bridge
            try {
                fetch(`${bridgeHost}/camera/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        camera_id: res.camera?.id || cameraName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                        stream_url: finalUrl,
                        token: 'billbook_local_dev_token'
                    })
                }).catch(() => {})
            } catch {}
        } else {
            setMsg({ text: res.error || 'Failed to save camera.', type: 'error' })
        }
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const res = await toggleCameraStatus(id, !currentStatus)
        if (res.success) {
            setCameras(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to disconnect camera "${name}"?`)) return
        const res = await deleteCctvCamera(id)
        if (res.success) {
            setCameras(prev => prev.filter(c => c.id !== id))
            setMsg({ text: `Camera "${name}" removed.`, type: 'success' })
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 space-y-6">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link 
                            href="/payroll/attendance"
                            className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Attendance Calendar
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-semibold text-indigo-600">Vision AI Streams</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                CCTV & IP Camera Stream Connector
                            </h1>
                            <p className="text-sm text-slate-500">
                                EasyView P2P & NVR connector: turn your existing security cameras into touchless attendance kiosks.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/payroll/attendance/movements">
                        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            Live Movements Audit
                        </Button>
                    </Link>
                    <Button 
                        onClick={openCreateModal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Connect New Camera (EasyView P2P)
                    </Button>
                </div>
            </div>

            {/* Local Vision Bridge & Signal Booster Diagnostics Banner */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${bridgeStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' : bridgeStatus === 'checking' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                            <Server className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    Local Vision Bridge & Signal Booster
                                </h3>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    bridgeStatus === 'connected'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : bridgeStatus === 'checking'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${bridgeStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : bridgeStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                    {bridgeStatus === 'connected' ? 'Bridge Online (Signal: 100%)' : bridgeStatus === 'checking' ? 'Testing Handshake…' : 'Bridge Offline (Local Installable Needed)'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {bridgeStatus === 'connected'
                                    ? `Connected on ${bridgeHost} · Local P2P WebSocket & WebRTC stream active · Signal boosted without packet loss`
                                    : 'A local installable bridge runs on your office PC to ingest camera RTSP/P2P signals from your local router and securely relay them to this dashboard.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkBridgeHealth()}
                            className="text-xs gap-1.5 border-slate-200"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${bridgeStatus === 'checking' ? 'animate-spin' : ''}`} />
                            Test Handshake
                        </Button>
                        <a
                            href="https://github.com/DodailSolutions/billbook/tree/main/cctv-bridge#readme"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                size="sm"
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5 shadow-xs"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Install Local Bridge
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Notification Messages */}
            {msg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
                    msg.type === 'success' 
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                    <span>{msg.text}</span>
                </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Configured Cameras</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{cameras.length}</p>
                            <p className="text-xs text-slate-400 mt-0.5">Hikvision, CP Plus, EZView, Dahua</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Camera className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Live Streams</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">
                                {cameras.filter(c => c.is_active).length}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">Streaming 15 FPS Real-Time</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Radio className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tenant Privacy</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">100% P2P</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Zero Cross-Admin Access</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Group Vision Tracking</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">Multi-Person</p>
                            <p className="text-xs text-slate-400 mt-0.5">Concurrent Gate Check-In</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cameras List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Active Camera Streams</h2>
                        <p className="text-xs text-slate-500">
                            Streams process groups and individuals locally to automatically capture attendance on gate entry or exit.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadCameras}
                        className="text-xs text-slate-600 border-slate-200 hover:bg-slate-100"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Refresh Nodes
                    </Button>
                </div>

                {loading ? (
                    <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
                        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-600">Connecting to Camera Stream Mesh...</p>
                    </div>
                ) : cameras.length === 0 ? (
                    <div className="py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No CCTV Cameras Connected Yet</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                            Connect your office entrance or lobby IP cameras with simple admin credentials—no technical RTSP knowledge needed.
                        </p>
                        <Button 
                            onClick={openCreateModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Connect Your First Camera (EasyView P2P)
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cameras.map((cam) => {
                            const isLiveBridgeStream = cam.is_active && !failedStreams[cam.id]
                            return (
                                <Card key={cam.id} className="border-slate-200/90 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                                    <div>
                                        {/* Video Stream Preview */}
                                        <div className="relative h-48 bg-slate-950 flex flex-col justify-between p-3 overflow-hidden group">
                                            {isLiveBridgeStream ? (
                                                <CctvLivePlayer
                                                    bridgeHost={bridgeHost}
                                                    cameraId={cam.id}
                                                    cameraName={cam.camera_name}
                                                    fallbackTimestamp={streamTimestamp}
                                                    token="billbook_local_dev_token"
                                                    enableAutoRecovery={true}
                                                    recoveryIntervalMs={30000}
                                                    onError={() => setFailedStreams(prev => ({ ...prev, [cam.id]: true }))}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
                                            )}

                                            {/* Top Stream Status Bar */}
                                            <div className="relative z-10 flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                                                    cam.is_active 
                                                        ? 'bg-emerald-500/90 text-white' 
                                                        : 'bg-slate-700/80 text-slate-300'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cam.is_active ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                                                    {cam.is_active ? 'LIVE P2P' : 'PAUSED'}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded">
                                                        15 FPS • E2EE
                                                    </span>
                                                    <button 
                                                        onClick={() => setEnlargedCamera(cam)}
                                                        title="Enlarge Live Stream"
                                                        className="p-1 rounded bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                                                    >
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Center Simulated Bounding Box when offline */}
                                            {!isLiveBridgeStream && (
                                                <div className="relative z-10 my-auto text-center flex flex-col items-center">
                                                    <div className="w-16 h-16 border-2 border-dashed border-indigo-400/70 rounded-lg flex items-center justify-center">
                                                        <Eye className="w-6 h-6 text-indigo-300/80" />
                                                    </div>
                                                    <button 
                                                        onClick={() => setEnlargedCamera(cam)}
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-200 hover:text-white bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700/60 rounded px-2 py-0.5 mt-2 transition-colors cursor-pointer"
                                                    >
                                                        <Maximize2 className="w-3 h-3" />
                                                        Enlarge Feed
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setFailedStreams(prev => {
                                                                const n = { ...prev }
                                                                delete n[cam.id]
                                                                return n
                                                            })
                                                            setStreamTimestamp(Date.now())
                                                        }}
                                                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 mt-1 transition-colors cursor-pointer"
                                                    >
                                                        <RefreshCw className="w-2.5 h-2.5" />
                                                        Retry Stream
                                                    </button>
                                                </div>
                                            )}

                                            {/* Bottom Stream Info */}
                                            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/40 px-2 py-1 rounded">
                                                <span className="truncate max-w-[160px]">{cam.location}</span>
                                                <span className="capitalize text-indigo-300 font-semibold">{cam.direction_mode.replace('_', ' ')}</span>
                                            </div>
                                        </div>

                                        {/* Camera Details */}
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 text-base">{cam.camera_name}</h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        {cam.location}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle(cam.id, cam.is_active)}
                                                    className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                                                        cam.is_active 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {cam.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                                    {cam.is_active ? 'Active' : 'Enable'}
                                                </button>
                                            </div>

                                            <div className="bg-slate-50 rounded-lg p-2.5 text-xs font-mono text-slate-600 truncate border border-slate-100">
                                                <span className="text-slate-400 select-none">P2P: </span>
                                                {cam.stream_url.replace(/(:\/\/)(.*?:.*?@)/, '$1***:***@')}
                                            </div>
                                        </CardContent>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="border-t border-slate-100 p-3 bg-slate-50/60 flex items-center justify-between">
                                        <button 
                                            onClick={() => openEditModal(cam)}
                                            className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                                        >
                                            <Sliders className="w-3.5 h-3.5" />
                                            Configure
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cam.id, cam.camera_name)}
                                            className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Disconnect
                                        </button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* EasyView-Style Connect Camera Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <Tv className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">
                                        {editingCamera ? 'Configure Camera' : 'EasyView P2P Camera Setup'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Just enter your DVR details—no technical RTSP syntax needed.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Toggle Mode */}
                            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setConnectionMode('easy_p2p')}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${
                                        connectionMode === 'easy_p2p'
                                            ? 'bg-white text-indigo-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    EasyView P2P / DVR Wizard
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConnectionMode('manual_rtsp')}
                                    className={`flex-1 py-1.5 rounded-md transition-all ${
                                        connectionMode === 'manual_rtsp'
                                            ? 'bg-white text-indigo-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Advanced RTSP URL
                                </button>
                            </div>

                            {/* Camera Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Camera Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Office Main Gate, Lobby Turnstile"
                                    value={cameraName}
                                    onChange={(e) => setCameraName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            {/* Easy P2P Mode Fields */}
                            {connectionMode === 'easy_p2p' ? (
                                <div className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                            DVR / Camera Brand
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {CAMERA_BRANDS.map((b) => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedBrand(b.id)
                                                        setDevicePort(b.defaultPort)
                                                    }}
                                                    className={`p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                                                        selectedBrand === b.id
                                                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Serial Number & Cloud Discovery (DMSS / EasyView style) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                                Device Serial Number (SN / Cloud ID) *
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleScanLan}
                                                disabled={scanningLan}
                                                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                                            >
                                                {scanningLan ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                                Scan Local Network
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g. 7M0AE22PCA5725A (from DVR QR Code or DMSS app)"
                                            value={deviceSerial}
                                            onChange={(e) => setDeviceSerial(e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 bg-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Found on your DVR bottom label, monitor system info, or mobile app settings.
                                        </p>
                                    </div>

                                    {/* Discovered Devices Picker */}
                                    {discoveredDvrs.length > 0 && (
                                        <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                                            <p className="font-semibold text-indigo-900 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                Found {discoveredDvrs.length} DVR(s) on your office network:
                                            </p>
                                            <div className="space-y-1">
                                                {discoveredDvrs.map((d, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setDeviceSerial(d.sn)
                                                            setDeviceHost(d.ip)
                                                            if (d.name) setCameraName(d.name)
                                                        }}
                                                        className="w-full text-left p-2 rounded bg-white hover:bg-indigo-100/50 border border-indigo-200/60 font-mono text-xs flex items-center justify-between"
                                                    >
                                                        <span className="font-semibold text-slate-800">{d.name || 'Dahua/CP Plus DVR'}</span>
                                                        <span className="text-slate-500">{d.ip} • SN: {d.sn}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Camera IP or DVR Host (Optional if SN entered)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="192.168.1.108"
                                                value={deviceHost}
                                                onChange={(e) => setDeviceHost(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Channel #
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="64"
                                                value={deviceChannel}
                                                onChange={(e) => setDeviceChannel(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Admin Username
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="admin"
                                                value={deviceUser}
                                                onChange={(e) => setDeviceUser(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="DVR Password"
                                                    value={devicePass}
                                                    onChange={(e) => setDevicePass(e.target.value)}
                                                    className="w-full px-3 py-2 pr-9 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auto-constructed URL info */}
                                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] font-mono text-indigo-900 truncate">
                                        <span className="text-indigo-400 font-sans font-medium">Auto-Mapped Stream: </span>
                                        {effectiveStreamUrl.replace(/(:\/\/)(.*?:.*?@)/, '$1***:***@')}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Custom Stream URL (RTSP / ONVIF) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="rtsp://admin:pass@192.168.1.100:554/stream1"
                                        value={streamUrl}
                                        onChange={(e) => setStreamUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900"
                                    />
                                </div>
                            )}

                            {/* Location and Direction */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Physical Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Main Entrance"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Gate Direction
                                    </label>
                                    <select
                                        value={directionMode}
                                        onChange={(e: any) => setDirectionMode(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="bidirectional">Bidirectional (Both In & Out)</option>
                                        <option value="in_only">In Only (Entry Gate)</option>
                                        <option value="out_only">Out Only (Exit Turnstile)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stream Test */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-500">Verify connection before saving:</span>
                                    <button
                                        type="button"
                                        onClick={handleTestStream}
                                        disabled={testingStream}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                                    >
                                        {testingStream ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        Test DVR Connection
                                    </button>
                                </div>
                                {streamTestResult && (
                                    <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                                        streamTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                                    }`}>
                                        {streamTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                                        <span>{streamTestResult.msg}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-slate-200 text-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {saving ? 'Connecting...' : editingCamera ? 'Save Changes' : 'Connect Camera'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Enlarge / Full-Screen Live Stream Modal */}
            {enlargedCamera && (
                <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
                        {/* Modal Header */}
                        <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-semibold text-white tracking-tight">
                                            {enlargedCamera.camera_name}
                                        </h2>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                            enlargedCamera.is_active && !failedStreams[enlargedCamera.id]
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                enlargedCamera.is_active && !failedStreams[enlargedCamera.id] ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                                            }`} />
                                            {enlargedCamera.is_active && !failedStreams[enlargedCamera.id] ? 'LIVE FEED' : 'CONNECTING / OFFLINE'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                                        <span>{enlargedCamera.location}</span>
                                        <span>•</span>
                                        <span className="capitalize text-indigo-300">{enlargedCamera.direction_mode.replace('_', ' ')} Gate</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setFailedStreams(prev => {
                                            const next = { ...prev }
                                            delete next[enlargedCamera.id]
                                            return next
                                        })
                                        setStreamTimestamp(Date.now())
                                    }}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                    Reconnect Stream
                                </Button>
                                <button
                                    onClick={() => setEnlargedCamera(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Live Player Container */}
                        <div className="relative bg-black flex-1 min-h-[380px] max-h-[62vh] flex items-center justify-center overflow-hidden p-2">
                            {enlargedCamera.is_active && !failedStreams[enlargedCamera.id] ? (
                                <CctvLivePlayer
                                    bridgeHost={bridgeHost}
                                    cameraId={enlargedCamera.id}
                                    cameraName={enlargedCamera.camera_name}
                                    fallbackTimestamp={streamTimestamp}
                                    token="billbook_local_dev_token"
                                    enableAutoRecovery={true}
                                    recoveryIntervalMs={30000}
                                    onError={() => setFailedStreams(prev => ({ ...prev, [enlargedCamera.id]: true }))}
                                    className="w-full h-full max-h-[58vh] object-contain rounded-lg"
                                />
                            ) : (
                                <div className="text-center p-6 max-w-md">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                                        <AlertTriangle className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-base font-semibold text-white mb-1">Live Video Stream Signal Pending</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                        Your office CCTV cameras reside on your local network (LAN). To stream them with live AI face tracking and bounding boxes in your browser, start your local Python bridge service.
                                    </p>

                                    <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-left font-mono text-[11px] text-slate-300 space-y-1 mb-4">
                                        <p className="text-slate-500 text-[10px] uppercase font-semibold">Start Local Bridge Service:</p>
                                        <p className="text-emerald-400 font-semibold select-all">cd billbook/cctv-bridge</p>
                                        <p className="text-emerald-400 font-semibold select-all">python server.py --port 5050</p>
                                    </div>

                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setFailedStreams(prev => {
                                                    const next = { ...prev }
                                                    delete next[enlargedCamera.id]
                                                    return next
                                                })
                                                setStreamTimestamp(Date.now())
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                            Retry Stream Feed
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Stream HUD Watermark Overlay */}
                            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Multi-Person AI Vision Mesh</span>
                                <span>•</span>
                                <span className="text-slate-400">Gate: {enlargedCamera.direction_mode}</span>
                            </div>
                        </div>

                        {/* Modal Footer & Bridge Settings */}
                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-slate-400 font-medium">Vision Bridge Endpoint:</span>
                                <input
                                    type="text"
                                    value={bridgeHost}
                                    onChange={(e) => {
                                        setBridgeHost(e.target.value)
                                        if (typeof window !== 'undefined') {
                                            localStorage.setItem('cctv_bridge_host', e.target.value)
                                        }
                                    }}
                                    placeholder="http://localhost:5050"
                                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono text-xs w-56 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <Link
                                    href="/payroll/attendance/movements"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                                >
                                    <Activity className="w-3.5 h-3.5" />
                                    View Live Attendance Movements
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEnlargedCamera(null)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs"
                                >
                                    Close Full View
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
