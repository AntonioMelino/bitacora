import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const IOS_DISMISSED_KEY = 'bitacora-ios-install-dismissed'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosInstructions, setShowIosInstructions] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    function handler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (isIos() && !localStorage.getItem(IOS_DISMISSED_KEY)) {
      setShowIosInstructions(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  function dismissIos() {
    localStorage.setItem(IOS_DISMISSED_KEY, '1')
    setShowIosInstructions(false)
  }

  if (deferredPrompt) {
    return (
      <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 bg-white rounded-2xl shadow-lg border border-foreground/10 p-4 flex items-center gap-3">
        <span className="text-2xl">✈️</span>
        <div className="flex-1">
          <p className="font-heading font-bold text-sm text-foreground">Instalá Bitácora</p>
          <p className="text-xs text-foreground/50">Accedé más rápido, incluso sin conexión</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={() => setDeferredPrompt(null)}
          className="shrink-0 text-foreground/40 hover:text-foreground text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    )
  }

  if (showIosInstructions) {
    return (
      <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 bg-white rounded-2xl shadow-lg border border-foreground/10 p-4 flex items-center gap-3">
        <span className="text-2xl">✈️</span>
        <div className="flex-1">
          <p className="font-heading font-bold text-sm text-foreground">Instalá Bitácora</p>
          <p className="text-xs text-foreground/50">
            Tocá <span className="font-semibold">Compartir</span> ⬆️ y luego{' '}
            <span className="font-semibold">"Agregar a inicio"</span>
          </p>
        </div>
        <button
          onClick={dismissIos}
          className="shrink-0 text-foreground/40 hover:text-foreground text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    )
  }

  return null
}
