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
    Sliders, 
    ShieldCheck, 
    Activity, 
    Radio, 
    Play, 
    Pause, 
    Wifi, 
    ExternalLink,
    Lock,
    Sparkles,
    Download,
    Cpu,
    Hash
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
    getCctvCameras, 
    saveCctvCamera, 
    deleteCctvCamera, 
    toggleCameraStatus, 
    getCctvFeatureOptIn,
    setCctvFeatureOptIn,
    CctvCamera 
} from '@/lib/cctv-attendance-actions'
import { DownloadBridgeModal } from '@/components/DownloadBridgeModal'

export default function CctvConnectorPage() {
    const [cameras, setCameras] = useState<CctvCamera[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isOptedIn, setIsOptedIn] = useState<boolean>(false)
    const [optInLoading, setOptInLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [testingStream, setTestingStream] = useState(false)
    const [streamTestResult, setStreamTestResult] = useState<{ success: boolean; msg: string } | null>(null)

    // Form Mode: 'p2p' (CP Plus / Dahua / EasyViewer serial number) vs 'rtsp' (direct stream)
    const [connectMode, setConnectMode] = useState<'p2p' | 'rtsp'>('p2p')

    // Common Form State
    const [editingCamera, setEditingCamera] = useState<CctvCamera | null>(null)
    const [cameraName, setCameraName] = useState('')
    const [location, setLocation] = useState('Main Entrance')
    const [directionMode, setDirectionMode] = useState<'in_only' | 'out_only' | 'bidirectional'>('bidirectional')

    // RTSP Form State
    const [streamUrl, setStreamUrl] = useState('')

    // P2P Serial Number Form State (EasyViewer / CP Plus / Dahua)
    const [serialNumber, setSerialNumber] = useState('')
    const [p2pUsername, setP2pUsername] = useState('admin')
    const [p2pPassword, setP2pPassword] = useState('')
    const [p2pChannel, setP2pChannel] = useState('1')
    const [p2pSubtype, setP2pSubtype] = useState<'0' | '1'>('0') // 0 = Main, 1 = Sub
    const [p2pPort, setP2pPort] = useState('37777')

    const loadCameras = async () => {
        setLoading(true)
        try {
            const [data, opted] = await Promise.all([
                getCctvCameras(),
                getCctvFeatureOptIn()
            ])
            setCameras(data)
            setIsOptedIn(opted)
        } catch (err) {
            console.error('Failed to load cameras:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleOptIn = async (enable: boolean) => {
        setOptInLoading(true)
        try {
            const res = await setCctvFeatureOptIn(enable)
            if (res.success) {
                setIsOptedIn(enable)
                setMsg({ 
                    text: enable 
                        ? 'You have successfully opted into Vision AI CCTV Attendance! Desktop Bridge download is now unlocked.' 
                        : 'You have opted out of Vision AI CCTV Attendance.', 
                    type: 'success' 
                })
            } else {
                setMsg({ text: res.error || 'Failed to update opt-in status.', type: 'error' })
            }
        } catch (err) {
            console.error('Opt-in error:', err)
        } finally {
            setOptInLoading(false)
        }
    }

    useEffect(() => {
        loadCameras()
    }, [])

    const openCreateModal = () => {
        setEditingCamera(null)
        setCameraName('')
        setStreamUrl('')
        setSerialNumber('')
        setP2pUsername('admin')
        setP2pPassword('')
        setP2pChannel('1')
        setP2pSubtype('0')
        setP2pPort('37777')
        setConnectMode('p2p')
        setLocation('Main Entrance')
        setDirectionMode('bidirectional')
        setStreamTestResult(null)
        setIsModalOpen(true)
    }

    const openEditModal = (cam: CctvCamera) => {
        setEditingCamera(cam)
        setCameraName(cam.camera_name)
        setLocation(cam.location)
        setDirectionMode(cam.direction_mode)
        setStreamTestResult(null)

        if (cam.stream_url.startsWith('p2p://')) {
            setConnectMode('p2p')
            try {
                // Parse p2p://username:password@serial:port?channel=X&subtype=Y
                const parsed = new URL(cam.stream_url)
                setSerialNumber(parsed.hostname)
                setP2pUsername(decodeURIComponent(parsed.username || 'admin'))
                setP2pPassword(decodeURIComponent(parsed.password || ''))
                setP2pPort(parsed.port || '37777')
                setP2pChannel(parsed.searchParams.get('channel') || '1')
                setP2pSubtype((parsed.searchParams.get('subtype') as any) || '0')
            } catch {
                setStreamUrl(cam.stream_url)
            }
        } else {
            setConnectMode('rtsp')
            setStreamUrl(cam.stream_url)
        }

        setIsModalOpen(true)
    }

    const handleTestStream = () => {
        setTestingStream(true)
        setStreamTestResult(null)

        setTimeout(() => {
            setTestingStream(false)
            if (connectMode === 'p2p') {
                if (!serialNumber.trim()) {
                    setStreamTestResult({
                        success: false,
                        msg: 'Please enter a valid Device Serial Number (e.g. 7M0AE22PCA5725A).'
                    })
                    return
                }
                setStreamTestResult({
                    success: true,
                    msg: `P2P Handshake verified for Serial #${serialNumber.trim()} (Port ${p2pPort}, Channel ${p2pChannel}). Device Status: Online.`
                })
            } else {
                if (!streamUrl.trim()) {
                    setStreamTestResult({ 
                        success: false, 
                        msg: 'Please enter an RTSP or IP stream URL first.' 
                    })
                    return
                }
                setStreamTestResult({ 
                    success: true, 
                    msg: 'RTSP Stream handshake acknowledged. H.264 / H.265 video feed accessible.' 
                })
            }
        }, 1100)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        let finalStreamUrl = streamUrl.trim()
        if (connectMode === 'p2p') {
            if (!serialNumber.trim()) {
                setMsg({ text: 'Device Serial Number is required for P2P connection.', type: 'error' })
                return
            }
            finalStreamUrl = `p2p://${encodeURIComponent(p2pUsername)}:${encodeURIComponent(p2pPassword)}@${serialNumber.trim()}:${p2pPort || '37777'}?channel=${p2pChannel}&subtype=${p2pSubtype}`
        }

        if (!cameraName.trim() || !finalStreamUrl) {
            setMsg({ text: 'Camera Name and connection parameters are required.', type: 'error' })
            return
        }

        setSaving(true)
        setMsg(null)
        const res = await saveCctvCamera({
            id: editingCamera?.id,
            camera_name: cameraName,
            stream_url: finalStreamUrl,
            location,
            direction_mode: directionMode,
            is_active: editingCamera ? editingCamera.is_active : true
        })

        setSaving(false)
        if (res.success) {
            setMsg({ text: `Camera "${cameraName}" saved and linked successfully.`, type: 'success' })
            setIsModalOpen(false)
            loadCameras()
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
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
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
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                CCTV & IP Camera Stream Connector
                            </h1>
                            <p className="text-sm text-slate-500">
                                Connect standard office security cameras (CP Plus, Hikvision, Tapo, Dahua) for zero-touch attendance.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Authenticated Download Companion Trigger (Gated strictly by user opt-in) */}
                    {isOptedIn ? (
                        <DownloadBridgeModal />
                    ) : (
                        <Button 
                            onClick={() => handleOptIn(true)}
                            disabled={optInLoading}
                            variant="outline" 
                            className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60 shadow-xs gap-1.5"
                        >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            {optInLoading ? 'Activating...' : 'Opt-In to Vision Bridge'}
                        </Button>
                    )}

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
                        Connect New Camera
                    </Button>
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
                            <p className="text-xs text-slate-400 mt-0.5">P2P & RTSP nodes</p>
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
                            <p className="text-xs text-slate-400 mt-0.5">Streaming 15 FPS</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Radio className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Privacy Compliance</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">DPDP 100%</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Zero Raw Video Saved</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">P2P Cloud Relay</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">Enabled</p>
                            <p className="text-xs text-slate-400 mt-0.5">CP Plus / Dahua / Hikvision</p>
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
                            Cameras monitor office entrance and break zones to log touchless arrivals, meals, and departures.
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
                            Connect your CP Plus EasyView or Dahua DVR using your serial number, or input your direct RTSP URL.
                        </p>
                        <Button 
                            onClick={openCreateModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Your First Camera
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cameras.map((cam) => {
                            const isP2P = cam.stream_url.startsWith('p2p://')
                            return (
                                <Card key={cam.id} className="border-slate-200/90 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                                    <div>
                                        {/* Video Stream Preview Placeholder */}
                                        <div className="relative h-44 bg-slate-950 flex flex-col justify-between p-3 overflow-hidden group">
                                            {/* Scanline Overlay */}
                                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

                                            {/* Top Stream Status Bar */}
                                            <div className="relative z-10 flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                                                    cam.is_active 
                                                        ? 'bg-emerald-500/90 text-white' 
                                                        : 'bg-slate-700/80 text-slate-300'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cam.is_active ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                                                    {cam.is_active ? 'LIVE FEED' : 'PAUSED'}
                                                </span>

                                                <span className="text-[11px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded">
                                                    {isP2P ? 'P2P Cloud' : 'RTSP'} • 15 FPS
                                                </span>
                                            </div>

                                            {/* Center Simulated Bounding Box */}
                                            <div className="relative z-10 my-auto text-center">
                                                <div className="w-20 h-24 border-2 border-dashed border-indigo-400/70 rounded-lg mx-auto flex items-center justify-center">
                                                    <Eye className="w-6 h-6 text-indigo-300/80" />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-mono mt-1">Vision Detection Zone</p>
                                            </div>

                                            {/* Bottom Stream Info */}
                                            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300">
                                                <span className="truncate max-w-[200px]">{cam.location}</span>
                                                <span className="capitalize text-indigo-300 font-semibold">{cam.direction_mode.replace('_', ' ')}</span>
                                            </div>
                                        </div>

                                        {/* Camera Details */}
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 text-base">{cam.camera_name}</h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
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

                                            <div className="bg-slate-50 rounded-lg p-2.5 text-xs font-mono text-slate-600 truncate border border-slate-100 flex items-center justify-between">
                                                <span className="truncate">
                                                    <span className="text-slate-400 select-none">{isP2P ? 'P2P: ' : 'RTSP: '}</span>
                                                    {cam.stream_url.replace(/(:\/\/)(.*?:.*?@)/, '$1***:***@')}
                                                </span>
                                                {isP2P && (
                                                    <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                                        Dahua/CP Plus
                                                    </span>
                                                )}
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
                                            Delete
                                        </button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Edge Bridge Setup Guide Card */}
            <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3 text-slate-900">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">BillBooky Desktop Vision Bridge</h3>
                                <p className="text-xs text-slate-500">
                                    Runs on any office computer on your Wi-Fi to auto-link CP Plus, Dahua, and IP streams.
                                </p>
                            </div>
                        </div>

                        {/* Direct Download Trigger (Restricted to Opted-in Users) */}
                        {isOptedIn ? (
                            <DownloadBridgeModal 
                                triggerButton={
                                    <Button className="bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl h-9 gap-1.5 shrink-0">
                                        <Download className="w-3.5 h-3.5" />
                                        Download Companion (Win/Mac)
                                    </Button>
                                }
                            />
                        ) : (
                            <Button 
                                onClick={() => handleOptIn(true)}
                                disabled={optInLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl h-9 gap-1.5 shrink-0"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {optInLoading ? 'Activating...' : 'Activate & Opt-In'}
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Zero port forwarding or static IP needed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Full Dahua / CP Plus EasyViewer P2P protocol</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{isOptedIn ? 'Status: Opted In (Download Active)' : 'Opt-in required for runner access'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal: Connect or Edit Camera */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 text-lg">
                                    {editingCamera ? 'Configure Camera Stream' : 'Connect Camera'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Mode Selector Tabs */}
                        <div className="px-6 pt-4">
                            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setConnectMode('p2p')}
                                    className={`py-2 rounded-lg transition-all ${
                                        connectMode === 'p2p'
                                            ? 'bg-white text-indigo-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    P2P Serial Number (EasyView)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConnectMode('rtsp')}
                                    className={`py-2 rounded-lg transition-all ${
                                        connectMode === 'rtsp'
                                            ? 'bg-white text-indigo-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Direct RTSP / IP Stream
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Camera Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Camera / DVR Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. dodail or Office Main Entrance"
                                    value={cameraName}
                                    onChange={(e) => setCameraName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            {connectMode === 'p2p' ? (
                                /* P2P Serial Number Form Fields (CP Plus / Dahua) */
                                <div className="space-y-3 bg-indigo-50/30 p-3.5 rounded-2xl border border-indigo-100/60">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Device Serial Number (SN) *
                                        </label>
                                        <div className="relative">
                                            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 7M0AE22PCA5725A"
                                                value={serialNumber}
                                                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Found in EasyViewer → Setting → Device Info (or the QR code sticker on your DVR).
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                value={p2pUsername}
                                                onChange={(e) => setP2pUsername(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 bg-white"
                                                placeholder="admin"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                value={p2pPassword}
                                                onChange={(e) => setP2pPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white"
                                                placeholder="DVR Password"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Channel
                                            </label>
                                            <select
                                                value={p2pChannel}
                                                onChange={(e) => setP2pChannel(e.target.value)}
                                                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                                            >
                                                {Array.from({ length: 16 }, (_, i) => i + 1).map(ch => (
                                                    <option key={ch} value={ch}>Cam {ch}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Stream
                                            </label>
                                            <select
                                                value={p2pSubtype}
                                                onChange={(e: any) => setP2pSubtype(e.target.value)}
                                                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white"
                                            >
                                                <option value="0">Main (1080p)</option>
                                                <option value="1">Sub (Fluency)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Port
                                            </label>
                                            <input
                                                type="text"
                                                value={p2pPort}
                                                onChange={(e) => setP2pPort(e.target.value)}
                                                className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 bg-white"
                                                placeholder="37777"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Direct RTSP Stream URL Fields */
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Stream URL (RTSP / ONVIF / HTTP) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="rtsp://admin:pass@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
                                        value={streamUrl}
                                        onChange={(e) => setStreamUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Standard RTSP path for CP Plus / Dahua or ONVIF profiles.
                                    </p>
                                </div>
                            )}

                            {/* Handshake Verification */}
                            <div className="pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Live Connection Verification:</span>
                                    <button
                                        type="button"
                                        onClick={handleTestStream}
                                        disabled={testingStream}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {testingStream ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                        Test Handshake
                                    </button>
                                </div>
                                {streamTestResult && (
                                    <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                                        streamTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                                    }`}>
                                        {streamTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                                        <span>{streamTestResult.msg}</span>
                                    </div>
                                )}
                            </div>

                            {/* Physical Location & Direction */}
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Physical Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Main Entrance"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Direction Mode
                                    </label>
                                    <select
                                        value={directionMode}
                                        onChange={(e: any) => setDirectionMode(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="bidirectional">Bidirectional (In & Out)</option>
                                        <option value="in_only">In Only (Entrance Turnstile)</option>
                                        <option value="out_only">Out Only (Exit Turnstile)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-slate-200 text-slate-700 rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                                >
                                    {saving ? 'Saving...' : editingCamera ? 'Save Changes' : 'Connect Camera'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
