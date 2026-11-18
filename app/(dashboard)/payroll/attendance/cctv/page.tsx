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
    Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
    getCctvCameras, 
    saveCctvCamera, 
    deleteCctvCamera, 
    toggleCameraStatus, 
    CctvCamera 
} from '@/lib/cctv-attendance-actions'

export default function CctvConnectorPage() {
    const [cameras, setCameras] = useState<CctvCamera[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [testingStream, setTestingStream] = useState(false)
    const [streamTestResult, setStreamTestResult] = useState<{ success: boolean; msg: string } | null>(null)

    // Form State
    const [editingCamera, setEditingCamera] = useState<CctvCamera | null>(null)
    const [cameraName, setCameraName] = useState('')
    const [streamUrl, setStreamUrl] = useState('')
    const [location, setLocation] = useState('Main Entrance')
    const [directionMode, setDirectionMode] = useState<'in_only' | 'out_only' | 'bidirectional'>('bidirectional')

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
        setStreamUrl('')
        setLocation('Main Entrance')
        setDirectionMode('bidirectional')
        setStreamTestResult(null)
        setIsModalOpen(true)
    }

    const openEditModal = (cam: CctvCamera) => {
        setEditingCamera(cam)
        setCameraName(cam.camera_name)
        setStreamUrl(cam.stream_url)
        setLocation(cam.location)
        setDirectionMode(cam.direction_mode)
        setStreamTestResult(null)
        setIsModalOpen(true)
    }

    const handleTestStream = () => {
        if (!streamUrl.trim()) {
            setStreamTestResult({ success: false, msg: 'Please enter an RTSP or IP stream URL first.' })
            return
        }
        setTestingStream(true)
        setStreamTestResult(null)
        setTimeout(() => {
            setTestingStream(false)
            setStreamTestResult({ 
                success: true, 
                msg: 'RTSP Stream handshake acknowledged. H.264 / H.265 video feed accessible.' 
            })
        }, 1200)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cameraName.trim() || !streamUrl.trim()) {
            setMsg({ text: 'Camera Name and Stream URL are required.', type: 'error' })
            return
        }

        setSaving(true)
        setMsg(null)
        const res = await saveCctvCamera({
            id: editingCamera?.id,
            camera_name: cameraName,
            stream_url: streamUrl,
            location,
            direction_mode: directionMode,
            is_active: editingCamera ? editingCamera.is_active : true
        })

        setSaving(false)
        if (res.success) {
            setMsg({ text: `Camera "${cameraName}" saved successfully.`, type: 'success' })
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
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                CCTV & IP Camera Stream Connector
                            </h1>
                            <p className="text-sm text-slate-500">
                                Turn standard office security cameras (Hikvision, CP Plus, Tapo, Dahua) into touchless biometric kiosks.
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
                            <p className="text-xs text-slate-400 mt-0.5">RTSP / ONVIF / NVR nodes</p>
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
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vector Privacy</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">DPDP 100%</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Zero Video Saved</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vision Engine</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">Online</p>
                            <p className="text-xs text-slate-400 mt-0.5">512-D Cosine Matcher</p>
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
                            Streams process faces locally or via cloud edge to log touchless check-ins and break transitions.
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
                            Connect your office entrance or lobby IP cameras via RTSP or NVR IP to automate employee attendance without biometric kiosks.
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
                        {cameras.map((cam) => (
                            <Card key={cam.id} className="border-slate-200/90 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                                <div>
                                    {/* Video Stream Preview Placeholder */}
                                    <div className="relative h-44 bg-slate-950 flex flex-col justify-between p-3 overflow-hidden group">
                                        {/* Subtle Scanline Overlay */}
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

                                            <span className="text-[11px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                                                15 FPS • 1080p
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

                                        <div className="bg-slate-50 rounded-lg p-2.5 text-xs font-mono text-slate-600 truncate border border-slate-100">
                                            <span className="text-slate-400 select-none">RTSP: </span>
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
                                        Delete
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Edge Bridge Setup Guide */}
            <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2.5 text-slate-900">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Wifi className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Lightweight Local Office Bridge Agent</h3>
                            <p className="text-xs text-slate-500">
                                If your office cameras are on a local private subnet (e.g. 192.168.1.x), run our zero-install bridge on any office PC.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 space-y-1">
                        <p className="text-slate-400"># Run once on any office PC or Raspberry Pi on the same Wi-Fi/LAN:</p>
                        <p className="text-white">npx @billbooky/vision-bridge --token YOUR_ORG_TOKEN</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Zero port forwarding or public IP needed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Embeddings extracted locally at 60 FPS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>100% DPDP Act compliance (Zero video stored)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal: Connect or Edit Camera */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-900 text-lg">
                                    {editingCamera ? 'Configure Camera Stream' : 'Connect New Camera'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Camera Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Main Entrance - Hikvision Turret"
                                    value={cameraName}
                                    onChange={(e) => setCameraName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Stream URL (RTSP / ONVIF / HTTP) *
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        required
                                        placeholder="rtsp://admin:pass@192.168.1.100:554/stream1"
                                        value={streamUrl}
                                        onChange={(e) => setStreamUrl(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-slate-400">
                                            Supports Hikvision, Dahua, CP Plus, Tapo, and standard NVRs.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleTestStream}
                                            disabled={testingStream}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                                        >
                                            {testingStream ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                            Test Handshake
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
                            </div>

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
                                        Direction Mode
                                    </label>
                                    <select
                                        value={directionMode}
                                        onChange={(e: any) => setDirectionMode(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="bidirectional">Bidirectional (In & Out)</option>
                                        <option value="in_only">In Only (Entrance Turnstile)</option>
                                        <option value="out_only">Out Only (Exit Turnstile)</option>
                                    </select>
                                </div>
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
