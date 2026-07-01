import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

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
