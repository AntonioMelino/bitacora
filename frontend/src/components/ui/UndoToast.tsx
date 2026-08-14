interface UndoToastProps {
  message: string
  onUndo: () => void
}

export default function UndoToast({ message, onUndo }: UndoToastProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 flex items-center justify-between gap-4 bg-foreground text-white px-4 py-3 rounded-xl shadow-lg sm:min-w-80">
      <span className="text-sm">{message}</span>
      <button onClick={onUndo} className="text-sm font-bold text-accent hover:underline shrink-0">
        Deshacer
      </button>
    </div>
  )
}
