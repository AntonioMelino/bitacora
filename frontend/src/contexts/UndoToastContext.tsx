import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import UndoToast from '../components/ui/UndoToast'

const UNDO_WINDOW_MS = 5000

interface PendingDelete {
  execute: () => Promise<unknown>
  undo: () => void
  timeoutId: ReturnType<typeof setTimeout>
}

type ScheduleDelete = (message: string, execute: () => Promise<unknown>, undo: () => void) => void

const UndoToastContext = createContext<ScheduleDelete | null>(null)

export function useUndoDelete(): ScheduleDelete {
  const ctx = useContext(UndoToastContext)
  if (!ctx) throw new Error('useUndoDelete must be used within an UndoToastProvider')
  return ctx
}

export function UndoToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const pendingRef = useRef<PendingDelete | null>(null)

  function finalize() {
    const pending = pendingRef.current
    if (!pending) return
    clearTimeout(pending.timeoutId)
    pendingRef.current = null
    setMessage(null)
    pending.execute().catch(() => {})
  }

  function scheduleDelete(msg: string, execute: () => Promise<unknown>, undo: () => void) {
    finalize()
    const timeoutId = setTimeout(finalize, UNDO_WINDOW_MS)
    pendingRef.current = { execute, undo, timeoutId }
    setMessage(msg)
  }

  function handleUndo() {
    const pending = pendingRef.current
    if (!pending) return
    clearTimeout(pending.timeoutId)
    pendingRef.current = null
    setMessage(null)
    pending.undo()
  }

  useEffect(() => () => {
    if (pendingRef.current) clearTimeout(pendingRef.current.timeoutId)
  }, [])

  return (
    <UndoToastContext.Provider value={scheduleDelete}>
      {children}
      {message && <UndoToast message={message} onUndo={handleUndo} />}
    </UndoToastContext.Provider>
  )
}
