'use client'

import { useState } from 'react'
import { 
    Download, 
    Monitor, 
    Apple, 
    CheckCircle2, 
    Sparkles, 
    ShieldCheck, 
    ArrowRight, 
    Wifi, 
    HelpCircle,
    Info,
    Terminal,
    KeyRound,
    AlertCircle,
    Copy,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { logBridgeDownload } from '@/lib/bridge-download-actions'

interface DownloadBridgeModalProps {
    triggerButton?: React.ReactNode
}

export function DownloadBridgeModal({ triggerButton }: DownloadBridgeModalProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'download' | 'guide'>('download')
    const [downloading, setDownloading] = useState<'windows' | 'mac' | null>(null)
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
    const [downloadError, setDownloadError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCopyCli = () => {
        navigator.clipboard.writeText('npx @billbooky/vision-bridge')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = async (os: 'windows' | 'mac') => {
        setDownloading(os)
        setDownloadError(null)
        setDownloadSuccess(null)

        try {
            // Log download event in DB for Super Admin tracking
            const result = await logBridgeDownload(os)
            if (!result.success) {
                setDownloadError(result.error || 'Please log in to your BillBooky account to download.')
                setDownloading(null)
                return
            }

            // Trigger direct download of real installable package
            const a = document.createElement('a')
            a.href = os === 'windows' ? '/downloads/billbooky-vision-bridge-setup.exe' : '/downloads/billbooky-vision-bridge-mac.pkg'
            a.download = os === 'windows' ? 'billbooky-vision-bridge-setup.exe' : 'billbooky-vision-bridge-mac.pkg'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            setDownloadSuccess(`Successfully downloaded ${os === 'windows' ? 'Windows installer (.exe)' : 'macOS installer (.pkg)'}!`)
        } catch (err: any) {
            console.error('Download error:', err)
            setDownloadError('An unexpected error occurred. Please ensure you are logged in.')
        } finally {
            setDownloading(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60 shadow-xs gap-2">
                        <Download className="w-4 h-4 text-indigo-600" />
                        <span>Download Desktop Bridge</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border border-slate-100 shadow-2xl bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 p-6 text-white relative">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 text-[11px] font-semibold backdrop-blur-md mb-1 border border-white/10">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            BillBooky Vision AI Companion
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-white">
                            Desktop Vision Bridge & Setup Guide
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-300">
                            Connect your office CCTV cameras (CP Plus, Hikvision, Tapo, Dahua) without manual port forwarding or static IPs.
                        </DialogDescription>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
                        <button
                            onClick={() => setActiveTab('download')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                activeTab === 'download' 
                                    ? 'bg-white text-slate-900 shadow-xs' 
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            Download Installers
                        </button>
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                activeTab === 'guide' 
                                    ? 'bg-white text-slate-900 shadow-xs' 
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            Step-by-Step Setup Guide
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Status Alerts */}
                    {downloadSuccess && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{downloadSuccess}</span>
                        </div>
                    )}
                    {downloadError && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{downloadError}</span>
                        </div>
                    )}

                    {activeTab === 'download' ? (
                        <div className="space-y-5">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Run this companion service on any computer (Windows or Mac) connected to the same office Wi-Fi or router as your CCTV DVR / NVR. It runs in the background and bridges video streams directly to BillBooky.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Windows Card */}
                                <div className="p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500/50 bg-slate-50/50 hover:bg-indigo-50/20 transition-all flex flex-col justify-between space-y-3 group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Monitor className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">Windows</h4>
                                            <p className="text-[11px] text-slate-500">Windows 10 / 11 (64-bit)</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Standard Windows setup installer (.exe). Runs silently in system notification tray with automated loopback on port 8989.
                                    </p>
                                    <Button
                                        onClick={() => handleDownload('windows')}
                                        disabled={downloading === 'windows'}
                                        className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl h-9 gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {downloading === 'windows' ? 'Downloading...' : 'Download Windows Installer (.exe)'}
                                    </Button>
                                </div>

                                {/* Mac Card */}
                                <div className="p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500/50 bg-slate-50/50 hover:bg-indigo-50/20 transition-all flex flex-col justify-between space-y-3 group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                                            <Apple className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">macOS</h4>
                                            <p className="text-[11px] text-slate-500">Apple Silicon (M1–M4) & Intel</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Standard Apple Installer package (.pkg). Installs directly into Applications and runs as background menu bar service.
                                    </p>
                                    <Button
                                        onClick={() => handleDownload('mac')}
                                        disabled={downloading === 'mac'}
                                        className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl h-9 gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {downloading === 'mac' ? 'Downloading...' : 'Download macOS Installer (.pkg)'}
                                    </Button>
                                </div>
                            </div>

                            {/* CLI One-Liner Option (Bypasses Gatekeeper completely) */}
                            <div className="bg-slate-900 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-200">
                                        <Terminal className="w-4 h-4 text-indigo-400" /> Instant Terminal Runner (Zero Install & Zero Warnings)
                                    </span>
                                    <span className="text-slate-400">Port 8989</span>
                                </div>
                                <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-slate-800">
                                    <code className="text-emerald-400 font-semibold select-all">npx @billbooky/vision-bridge</code>
                                    <button 
                                        type="button" 
                                        onClick={handleCopyCli}
                                        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                                        title="Copy command"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400 font-sans">
                                    Paste this command in your Mac Terminal or Windows Command Prompt to launch immediately without any security dialogs.
                                </p>
                            </div>

                            {/* macOS Tip */}
                            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                                <p className="font-semibold flex items-center gap-1.5">
                                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                                    macOS First-Time Security Tip:
                                </p>
                                <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
                                    If macOS shows <em>"Apple could not verify..."</em>, simply <strong>Right-Click (or Control-Click)</strong> the downloaded <code>.pkg</code> in your Downloads folder, choose <strong>Open</strong>, and click <strong>Open</strong> in the dialog.
                                </p>
                            </div>

                            {/* Privacy Pill */}
                            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                    <strong>100% DPDP Act Compliant:</strong> Video feeds are processed locally in RAM on your PC. Only 512-D mathematical vectors and timestamps are transmitted.
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Step-by-Step User Guide */
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {/* Step 1 */}
                                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                        1
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xs text-slate-900">Download & Start the Companion</h5>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Download the installer package (.pkg for Mac or .exe for Windows) on the office PC connected to your camera Wi-Fi. Double-click to launch. It starts a secure local loopback service on <code>http://127.0.0.1:8989</code>.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                        2
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xs text-slate-900">Choose Connection Mode in BillBooky</h5>
                                        <div className="text-[11px] text-slate-500 mt-1 space-y-1">
                                            <p>• <strong>P2P Serial Number (Easiest):</strong> If using CP Plus / Dahua EasyViewer, simply enter your Device Serial Number (e.g. <code>7M0AE22PCA5725A</code>), username, and password.</p>
                                            <p>• <strong>Direct RTSP Stream:</strong> Enter your camera IP or RTSP address (e.g. <code>rtsp://admin:pass@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0</code>).</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                        3
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-xs text-slate-900">Test Handshake & Activate</h5>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Click <strong>"Test Handshake"</strong>. Once the green confirmation appears, click <strong>Save Camera</strong>. Your camera will immediately begin touchless employee arrival and break detection!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center gap-2 text-xs text-blue-900">
                                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Tip: Ensure your PC is connected to the same Wi-Fi router as your CCTV DVR for instant auto-discovery.</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
