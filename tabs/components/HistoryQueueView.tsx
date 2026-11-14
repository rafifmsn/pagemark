import React, { useState } from "react"
import {
  Check as CheckIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  Filter as FilterIcon,
  Layers as LayersIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  X as CloseIcon
} from "lucide-react"
import type { CollectionItem } from "~/lib/collection"

interface HistoryQueueViewProps {
  clipWhitelist: string
  onChangeClipWhitelist: (val: string) => void
  items: CollectionItem[]
  quotaStatus: {
    megabytes: number
    ratio: number
    isNearQuota: boolean
  }
  onEnqueueUrl: (url: string) => Promise<{ ok: boolean; error?: string }>
  onClipAllTabs: (whitelist?: string) => Promise<{ ok: boolean; total?: number; error?: string }>
  onSelectItem: (item: CollectionItem) => void
  onCopyItem: (item: CollectionItem) => void
  onDownloadItem: (item: CollectionItem) => void
  onRemoveItem: (id: string) => void
}

const STATUS_BADGE_CLASS: Record<CollectionItem["status"], string> = {
  queued: "bg-zinc-800 text-zinc-300 border-zinc-700",
  clipping: "bg-slate-900/70 text-slate-300 border-slate-700 animate-pulse",
  ready: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
  error: "bg-red-950/60 text-red-400 border-red-800/60"
}

const STATUS_LABEL: Record<CollectionItem["status"], string> = {
  queued: "Queued",
  clipping: "Clipping",
  ready: "Ready",
  error: "Error"
}

export function HistoryQueueView({
  clipWhitelist,
  onChangeClipWhitelist,
  items,
  quotaStatus,
  onEnqueueUrl,
  onClipAllTabs,
  onSelectItem,
  onCopyItem,
  onDownloadItem,
  onRemoveItem
}: HistoryQueueViewProps) {
  const [urlInput, setUrlInput] = useState("")
  const [queueError, setQueueError] = useState("")
  const [adding, setAdding] = useState(false)
  const [clippingAll, setClippingAll] = useState(false)
  const [showWhitelist, setShowWhitelist] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim() || adding) return
    setAdding(true)
    setQueueError("")
    const res = await onEnqueueUrl(urlInput)
    setAdding(false)
    if (res.ok) {
      setUrlInput("")
    } else {
      setQueueError(res.error || "Failed to queue URL.")
    }
  }

  const handleClipAll = async () => {
    if (clippingAll) return
    setClippingAll(true)
    setQueueError("")
    const res = await onClipAllTabs(clipWhitelist)
    setClippingAll(false)
    if (!res.ok) {
      setQueueError(res.error || "Failed to clip open tabs.")
    } else if (res.total === 0) {
      setQueueError("No clippable tabs found in this window.")
    }
  }

  const handleCopyClick = (e: React.MouseEvent, item: CollectionItem) => {
    e.stopPropagation()
    onCopyItem(item)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 1500)
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="rounded-xl border border-zinc-900/60 bg-zinc-900/30 p-2.5 flex flex-col gap-2 shrink-0">
        {quotaStatus.isNearQuota && (
          <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/40 rounded-lg px-2 py-1">
            Storage is near the 10 MB browser limit. Clear old items to avoid save failures.
          </div>
        )}

        <form onSubmit={handleAddSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/article"
            aria-label="Queue URL"
            className="flex-1 min-w-0 text-[11px] px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-slate-500 font-mono"
          />
          <button
            type="submit"
            disabled={adding || !urlInput.trim()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white transition-colors shrink-0">
            <PlusIcon className="w-3.5 h-3.5" />
            Add
          </button>
        </form>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClipAll}
            disabled={clippingAll}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 disabled:opacity-50 transition-colors">
            <LayersIcon className="w-3.5 h-3.5 opacity-80" />
            {clippingAll ? "Queuing open tabs..." : "Clip All Open Tabs"}
          </button>
          <button
            type="button"
            onClick={() => setShowWhitelist((prev) => !prev)}
            title="Skip sites matching whitelist patterns"
            className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors shrink-0 ${
              showWhitelist || clipWhitelist.trim()
                ? "bg-slate-900/60 border-slate-700 text-slate-200"
                : "bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
            }`}>
            <FilterIcon className="w-3 h-3 opacity-80" />
            Whitelist
          </button>
        </div>

        {showWhitelist && (
          <textarea
            value={clipWhitelist}
            onChange={(e) => onChangeClipWhitelist(e.target.value)}
            placeholder="Skip sites: *.google.com, localhost:3000"
            rows={2}
            className="w-full text-[11px] p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-slate-500 resize-none font-mono"
          />
        )}

        {queueError && (
          <div className="text-[10px] text-red-400 px-1">{queueError}</div>
        )}
      </div>

      <div className="flex-1 min-h-0 rounded-xl border border-zinc-900/50 bg-zinc-900/10 overflow-y-auto p-1.5 flex flex-col gap-1.5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500 select-none">
            <p className="text-xs font-medium text-zinc-400 mb-1">
              No saved or queued pages yet
            </p>
            <p className="text-[11px] text-zinc-500 max-w-[230px] leading-relaxed">
              Add a URL above, right-click any link, or clip all open tabs.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isReady = item.status === "ready" && Boolean(item.markdown)
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isReady) onSelectItem(item)
                }}
                className={`group rounded-lg border border-zinc-800/70 bg-zinc-900/40 p-2 flex items-start justify-between gap-2 transition-colors ${
                  isReady
                    ? "cursor-pointer hover:bg-zinc-850/80 hover:border-zinc-700"
                    : "opacity-85"
                }`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {item.source === "queue" && item.status !== "ready" && (
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.2 rounded border shrink-0 ${
                          STATUS_BADGE_CLASS[item.status]
                        }`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    )}
                    <span className="text-xs font-medium text-zinc-200 truncate">
                      {item.title || item.url}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate">
                    {item.url}
                  </div>
                  {item.status === "error" && item.error && (
                    <div className="text-[10px] text-red-400 mt-0.5 truncate">
                      {item.error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {isReady && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleCopyClick(e, item)}
                        title="Copy item Markdown"
                        aria-label="Copy item Markdown"
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                        {copiedId === item.id ? (
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <CopyIcon className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadItem(item)
                        }}
                        title="Download item Markdown"
                        aria-label="Download item Markdown"
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                        <DownloadIcon className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveItem(item.id)
                    }}
                    title={item.source === "queue" ? "Remove from queue" : "Delete item"}
                    aria-label={item.source === "queue" ? "Remove from queue" : "Delete item"}
                    className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
                    {item.source === "queue" ? (
                      <CloseIcon className="w-3.5 h-3.5" />
                    ) : (
                      <TrashIcon className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
