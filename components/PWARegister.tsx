'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean
}

export function PWARegister() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  const isStandalone = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as NavigatorWithStandalone).standalone === true
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent)

    if (!isStandalone && isIos && isSafari) {
      setShowIosHint(true)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    if (!('serviceWorker' in navigator)) {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    let isSubscribed = true

    const handleControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    const trackInstallingWorker = (registration: ServiceWorkerRegistration, worker: ServiceWorker | null) => {
      if (!worker) {
        return
      }

      worker.addEventListener('statechange', () => {
        if (!isSubscribed || worker.state !== 'installed' || !navigator.serviceWorker.controller) {
          return
        }

        setWaitingWorker(registration.waiting ?? worker)
        setShowUpdatePrompt(true)
      })
    }

    const registerServiceWorker = async () => {
      if (process.env.NODE_ENV !== 'production') {
        return
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

        if (!isSubscribed) {
          return
        }

        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowUpdatePrompt(true)
        }

        trackInstallingWorker(registration, registration.installing)
        registration.addEventListener('updatefound', () => {
          trackInstallingWorker(registration, registration.installing)
        })
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    if (document.readyState === 'complete') {
      registerServiceWorker()
    } else {
      window.addEventListener('load', registerServiceWorker)
    }

    return () => {
      isSubscribed = false
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('load', registerServiceWorker)
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  const installApp = async () => {
    if (!installPromptEvent) {
      return
    }

    await installPromptEvent.prompt()
    const choiceResult = await installPromptEvent.userChoice

    if (choiceResult.outcome === 'accepted') {
      setShowInstallPrompt(false)
      setInstallPromptEvent(null)
    }
  }

  const applyUpdate = () => {
    if (!waitingWorker) {
      return
    }

    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!showInstallPrompt && !showIosHint && !showUpdatePrompt) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-70 flex justify-center px-4 md:bottom-6 md:justify-end">
      <div className="pointer-events-auto w-full max-w-sm space-y-3">
        {showUpdatePrompt && (
          <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-blue-100 p-2 text-blue-600">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Update ready</p>
                <p className="mt-1 text-sm text-slate-600">A newer version of BillBooky is available.</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={applyUpdate}>
                    Refresh app
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowUpdatePrompt(false)}>
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInstallPrompt && installPromptEvent && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-700">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Install BillBooky</p>
                    <p className="mt-1 text-sm text-slate-600">Add it to your home screen for an app-like experience.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowInstallPrompt(false)}
                    aria-label="Dismiss install prompt"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={installApp}>
                    Install app
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowInstallPrompt(false)}>
                    Not now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showIosHint && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-700">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Install on iPhone</p>
                    <p className="mt-1 text-sm text-slate-600">Open Share in Safari, then choose Add to Home Screen.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowIosHint(false)}
                    aria-label="Dismiss iOS install hint"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}