import React from "react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-confirm-title">
      <div className="w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
        <h3
          id="pm-confirm-title"
          className="text-xs font-semibold text-zinc-100 mb-1.5">
          {title}
        </h3>
        <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
          {message}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg text-white transition-colors ${
              destructive
                ? "bg-red-600 hover:bg-red-500"
                : "bg-slate-600 hover:bg-slate-500"
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
