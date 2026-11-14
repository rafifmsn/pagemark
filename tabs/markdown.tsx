import Markdown from "markdown-to-jsx/react"
import { formatMarkdown, mergeMarkdownItems } from "~/lib/parser"
import { isRestrictedUrl, isUrlWhitelisted } from "~/lib/url"
import type { CollectionItem } from "~/lib/collection"
import { useEffect, useMemo, useRef, useState } from "react"
import { PM_MESSAGES } from "~/lib/messages"
import { usePagemarkSettings } from "./hooks/useSettings"
import { usePageData } from "./hooks/usePageData"
import { useCollection } from "./hooks/useCollection"
import { ConfirmDialog } from "./components/ConfirmDialog"
import { HistoryQueueView } from "./components/HistoryQueueView"

import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  Code as CodeIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  Heading as TitleIcon,
  History as HistoryIcon,
  Image as ImageIcon,
  Link as SourceUrlIcon,
  Link2 as LinkIcon,
  Map as MapIcon,
  RefreshCw as RefreshIcon,
  Send as SendIcon,
  SlidersVertical as SettingsIcon,
  Table as TableIcon,
  Trash2 as TrashIcon
} from "lucide-react"

import "./style.css"

export default function MarkdownPage() {
  const { toggles, setToggles, handleToggle, settingsLoaded } = usePagemarkSettings()
  const {
    pageData,
    status,
    setStatus,
    error,
    setError,
    hasHostPermission,
    requestHostPermission,
    triggerConversion
  } = usePageData()
  const {
    allItems,
    readyItems,
    quotaStatus,
    clearAll,
    removeItem,
    enqueueUrl,
    clipAllTabs
  } = useCollection()

  const [markdown, setMarkdown] = useState("")
  const [hasAutoCopied, setHasAutoCopied] = useState(false)
  const [pendingAutoCopy, setPendingAutoCopy] = useState(false)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  const [showHistory, setShowHistory] = useState(false)
  const [inspectedItem, setInspectedItem] = useState<CollectionItem | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [copiedIcon, setCopiedIcon] = useState<"markdown" | "download" | null>(
    null
  )
  const [webhookSending, setWebhookSending] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<"success" | "error" | null>(
    null
  )
  const [hasAutoSentWebhook, setHasAutoSentWebhook] = useState(false)

  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showSettings &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSettings])

  // Maintain port connection to background for synchronous toggling
  useEffect(() => {
    let port: any = null
    if (typeof chrome !== "undefined" && chrome.runtime?.connect) {
      port = chrome.runtime.connect({ name: "pagemark-sidepanel" })
      port.onMessage.addListener((msg: any) => {
        if (msg && msg.action === PM_MESSAGES.CLOSE) {
          window.close()
        }
      })
    }
    return () => {
      if (port) {
        port.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (pageData) {
      setHasAutoCopied(false)
      setHasAutoSentWebhook(false)
    }
  }, [pageData])

  // Format active source (either inspected history/queue item or live pageData)
  useEffect(() => {
    const activeSource = inspectedItem || pageData
    if (!activeSource || !activeSource.markdown) return

    const finalMd = formatMarkdown(
      activeSource.markdown,
      {
        title: activeSource.title,
        url: activeSource.url,
        date: activeSource.date ? new Date(activeSource.date) : undefined
      },
      toggles
    )

    setMarkdown(finalMd)
  }, [pageData, inspectedItem, toggles])

  const mergedCollectionMarkdown = useMemo(() => {
    if (!showHistory || readyItems.length === 0) return ""
    return mergeMarkdownItems(readyItems, toggles)
  }, [showHistory, readyItems, toggles])

  const delegateCopyToContentScript = (
    text: string,
    onSuccess: () => void,
    isAuto: boolean
  ) => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs?.[0]
        if (activeTab?.id && !isRestrictedUrl(activeTab.url || "")) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: PM_MESSAGES.COPY_TO_CLIPBOARD, text },
            (response) => {
              if (chrome.runtime?.lastError) {
                if (isAuto) setPendingAutoCopy(true)
                return
              }
              if (response && response.success) {
                onSuccess()
              } else {
                if (isAuto) setPendingAutoCopy(true)
              }
            }
          )
        } else {
          if (isAuto) setPendingAutoCopy(true)
        }
      })
    } else {
      if (isAuto) setPendingAutoCopy(true)
    }
  }

  const copyMarkdown = (text: string, isAuto: boolean) => {
    if (!text) return

    const showSuccessStatus = () => {
      setStatus(isAuto ? "Auto-copied!" : "Copied!")
      if (isAuto) {
        setHasAutoCopied(true)
        setPendingAutoCopy(false)
      }
      setTimeout(() => setStatus(""), 2000)
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      document.hasFocus()
    ) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showSuccessStatus()
        })
        .catch(() => {
          delegateCopyToContentScript(text, showSuccessStatus, isAuto)
        })
    } else {
      delegateCopyToContentScript(text, showSuccessStatus, isAuto)
    }
  }

  const isCurrentUrlWhitelisted =
    pageData?.url && toggles.whitelist
      ? isUrlWhitelisted(pageData.url, toggles.whitelist)
      : false

  useEffect(() => {
    if (
      !inspectedItem &&
      toggles.autoCopy &&
      !isCurrentUrlWhitelisted &&
      markdown &&
      !hasAutoCopied
    ) {
      copyMarkdown(markdown, true)
    }
  }, [
    markdown,
    hasAutoCopied,
    toggles.autoCopy,
    isCurrentUrlWhitelisted,
    inspectedItem
  ])

  useEffect(() => {
    const handleFocus = () => {
      if (
        !inspectedItem &&
        toggles.autoCopy &&
        !isCurrentUrlWhitelisted &&
        pendingAutoCopy &&
        markdown &&
        !hasAutoCopied
      ) {
        copyMarkdown(markdown, true)
      }
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [
    pendingAutoCopy,
    markdown,
    hasAutoCopied,
    toggles.autoCopy,
    isCurrentUrlWhitelisted,
    inspectedItem
  ])

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatus("Clipboard unavailable")
      setTimeout(() => setStatus(""), 2000)
      return
    }
    const textToCopy = showHistory ? mergedCollectionMarkdown : markdown
    if (!textToCopy) {
      setStatus(showHistory ? "No ready items" : "Nothing to copy")
      setTimeout(() => setStatus(""), 1500)
      return
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      setStatus("Copied!")
      setCopiedIcon("markdown")
      setTimeout(() => {
        setStatus("")
        setCopiedIcon(null)
      }, 1500)
    })
  }

  const handleDownload = () => {
    const content = showHistory ? mergedCollectionMarkdown : markdown
    if (!content) {
      setStatus(showHistory ? "No ready items" : "Nothing to download")
      setTimeout(() => setStatus(""), 1500)
      return
    }
    const activeTitle = showHistory
      ? "pagemark-collection"
      : (inspectedItem || pageData)?.title
    const filename = `${activeTitle ? activeTitle.replace(/\s+/g, "_") : "page"}.md`
    triggerDownload(content, filename)

    setStatus("Downloaded!")
    setCopiedIcon("download")
    setTimeout(() => {
      setStatus("")
      setCopiedIcon(null)
    }, 1500)
  }

  const handleCopyItem = (item: CollectionItem) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return
    const formatted = formatMarkdown(
      item.markdown,
      {
        title: item.title,
        url: item.url,
        date: item.date ? new Date(item.date) : undefined
      },
      toggles
    )
    navigator.clipboard.writeText(formatted).then(() => {
      setStatus("Copied item!")
      setTimeout(() => setStatus(""), 1500)
    })
  }

  const handleDownloadItem = (item: CollectionItem) => {
    const formatted = formatMarkdown(
      item.markdown,
      {
        title: item.title,
        url: item.url,
        date: item.date ? new Date(item.date) : undefined
      },
      toggles
    )
    const filename = `${item.title ? item.title.replace(/\s+/g, "_") : "page"}.md`
    triggerDownload(formatted, filename)
    setStatus("Downloaded!")
    setTimeout(() => setStatus(""), 1500)
  }

  const handleSendWebhook = () => {
    if (!toggles.webhookUrl) return
    const activeSource = inspectedItem || pageData
    setWebhookSending(true)
    setWebhookStatus(null)
    setStatus("Sending webhook...")
    setHasAutoSentWebhook(true)

    chrome.runtime.sendMessage(
      {
        action: PM_MESSAGES.TRIGGER_WEBHOOK,
        markdown: showHistory ? mergedCollectionMarkdown : markdown,
        title: showHistory ? "Merged Collection" : activeSource?.title,
        url: showHistory ? "" : activeSource?.url,
        author: showHistory ? "" : activeSource?.author,
        date: showHistory ? new Date().toISOString() : activeSource?.date,
        webhookUrl: toggles.webhookUrl,
        webhookHeaders: toggles.webhookHeaders
      },
      (response) => {
        setWebhookSending(false)
        if (response && response.success) {
          setWebhookStatus("success")
          setStatus("Webhook sent!")
          setTimeout(() => {
            setWebhookStatus(null)
            setStatus("")
          }, 2000)
        } else {
          setWebhookStatus("error")
          const errMsg = response?.error || "Connection failed"
          setStatus(`Webhook failed: ${errMsg}`)
          setTimeout(() => {
            setWebhookStatus(null)
            setStatus("")
          }, 3000)
        }
      }
    )
  }

  useEffect(() => {
    if (
      !inspectedItem &&
      toggles.autoWebhook &&
      toggles.webhookUrl &&
      markdown &&
      !hasAutoSentWebhook
    ) {
      handleSendWebhook()
    }
  }, [
    markdown,
    hasAutoSentWebhook,
    toggles.autoWebhook,
    toggles.webhookUrl,
    inspectedItem
  ])

  const handleHeaderChange = (
    index: number,
    field: "key" | "value",
    val: string
  ) => {
    setToggles((prev) => {
      const updatedHeaders = [...(prev.webhookHeaders || [])]
      if (updatedHeaders[index]) {
        updatedHeaders[index] = { ...updatedHeaders[index], [field]: val }
      }
      return { ...prev, webhookHeaders: updatedHeaders }
    })
  }

  const handleAddHeader = () => {
    setToggles((prev) => ({
      ...prev,
      webhookHeaders: [...(prev.webhookHeaders || []), { key: "", value: "" }]
    }))
  }

  const handleRemoveHeader = (index: number) => {
    setToggles((prev) => ({
      ...prev,
      webhookHeaders: (prev.webhookHeaders || []).filter((_, idx) => idx !== index)
    }))
  }

  const handleHistoryToggleButton = () => {
    if (inspectedItem) {
      setInspectedItem(null)
      setShowHistory(true)
      return
    }
    setShowHistory((prev) => !prev)
  }

  const handleClearAction = () => {
    if (showHistory) {
      if (allItems.length > 0) {
        setConfirmClearAll(true)
      }
      return
    }
    setMarkdown("")
  }

  const handleConfirmDialog = () => {
    clearAll()
    setConfirmClearAll(false)
  }

  const activeText = showHistory ? mergedCollectionMarkdown : markdown
  const tokenEstimate = Math.ceil(activeText.length / 4)
  const isShowingBack = showHistory || Boolean(inspectedItem)

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      <header className="relative px-3 py-2.5 border-b border-zinc-900/40 bg-zinc-900/60 backdrop-blur-md flex flex-col gap-2 z-10 shrink-0 shadow-sm select-none">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 group inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium shadow-[0_2px_8px_-3px_rgba(16,185,129,0.3)] transition-all duration-200 active:scale-[0.98] outline-none">
            {copiedIcon === "markdown" ? (
              <CheckIcon className="w-3.5 h-3.5" />
            ) : (
              <CopyIcon className="w-3.5 h-3.5 opacity-90" />
            )}
            Copy
          </button>

          <button
            onClick={handleHistoryToggleButton}
            className={`flex-1 group inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg border transition-all duration-200 active:scale-[0.98] outline-none ${
              isShowingBack
                ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                : "bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-zinc-200"
            }`}>
            {isShowingBack ? (
              <ArrowLeftIcon className="w-3.5 h-3.5 opacity-90" />
            ) : (
              <HistoryIcon className="w-3.5 h-3.5 opacity-80" />
            )}
            {isShowingBack ? "Back" : "History"}
          </button>

          {toggles.webhookUrl && (
            <button
              onClick={handleSendWebhook}
              disabled={webhookSending}
              className="flex-1 group inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all duration-200 active:scale-[0.98] outline-none disabled:opacity-50">
              {webhookSending ? (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : webhookStatus === "success" ? (
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              ) : webhookStatus === "error" ? (
                <span className="text-red-500 font-bold">!</span>
              ) : (
                <SendIcon className="w-3.5 h-3.5 opacity-90" />
              )}
              Webhook
            </button>
          )}

          <button
            onClick={handleDownload}
            aria-label="Download"
            title="Download"
            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all duration-200 active:scale-[0.98] outline-none shrink-0">
            {copiedIcon === "download" ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <DownloadIcon className="w-3.5 h-3.5 opacity-90" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between w-full">
          {showHistory ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-medium text-zinc-300 truncate">
                History & Queue
              </span>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                ({allItems.length})
              </span>
            </div>
          ) : (
            <div className="flex p-0.5 bg-zinc-950/70 border border-zinc-800/80 rounded-lg">
              <button
                onClick={() => setViewMode("edit")}
                className={`px-3 py-1 text-[10px] font-medium transition-all rounded-md ${
                  viewMode === "edit"
                    ? "bg-slate-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}>
                Editor
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1 text-[10px] font-medium transition-all rounded-md ${
                  viewMode === "preview"
                    ? "bg-slate-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}>
                Preview
              </button>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearAction}
              aria-label={showHistory ? "Clear All" : "Clear"}
              title={showHistory ? "Clear All" : "Clear"}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 transition-colors outline-none">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => triggerConversion()}
              aria-label="Refresh"
              title="Refresh"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors outline-none">
              <RefreshIcon className="w-3.5 h-3.5" />
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings & Filters"
                title="Settings & Filters"
                className={`p-1.5 rounded-lg transition-colors outline-none ${
                  showSettings
                    ? "text-slate-400 bg-zinc-850"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}>
                <SettingsIcon className="w-3.5 h-3.5" />
              </button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-2.5 z-50 flex flex-col gap-1.5 max-h-[75vh] overflow-y-auto">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                    Filters & Content
                  </div>
                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Images
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.includeImages}
                      onChange={() => handleToggle("includeImages")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <LinkIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Links
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.includeLinks}
                      onChange={() => handleToggle("includeLinks")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <CodeIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Code Blocks
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.includeCodeBlocks}
                      onChange={() => handleToggle("includeCodeBlocks")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Tables
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.includeTables}
                      onChange={() => handleToggle("includeTables")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                    Front Matter Headers
                  </div>
                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <TitleIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Title
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.showTitle}
                      onChange={() => handleToggle("showTitle")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Date
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.showDate}
                      onChange={() => handleToggle("showDate")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <SourceUrlIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Source URL
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.showSourceUrl}
                      onChange={() => handleToggle("showSourceUrl")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>

                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                    Page Map Options
                  </div>
                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <MapIcon className="w-3.5 h-3.5 opacity-70" />
                      Include Page Map
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.showPageMap}
                      onChange={() => handleToggle("showPageMap")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  {toggles.showPageMap && (
                    <div className="flex items-center justify-between text-xs text-zinc-400 pl-6 pr-1.5 py-1">
                      <span className="flex items-center gap-2">Format</span>
                      <select
                        value={toggles.pageMapStyle || "text"}
                        onChange={(e) =>
                          setToggles((p) => ({
                            ...p,
                            pageMapStyle: e.target.value as "text" | "links"
                          }))
                        }
                        className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] rounded p-1 outline-none focus:border-zinc-750">
                        <option value="text">Plain Text</option>
                        <option value="links">Clickable TOC</option>
                      </select>
                    </div>
                  )}

                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                    Automation
                  </div>
                  <div className="h-px bg-zinc-800/60 my-0.5" />
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-3.5 h-3.5 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Auto-copy on Tab Switch
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.autoCopy}
                      onChange={() => handleToggle("autoCopy")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                    <span className="flex items-center gap-2">
                      <SendIcon className="w-3.5 h-3.5 opacity-70" />
                      Auto-send Webhook
                    </span>
                    <input
                      type="checkbox"
                      checked={toggles.autoWebhook}
                      onChange={() => handleToggle("autoWebhook")}
                      className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                    />
                  </label>

                  <div className="flex flex-col gap-1 px-1 mt-1">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Whitelist URL Patterns
                    </span>
                    <textarea
                      value={toggles.whitelist}
                      onChange={(e) =>
                        setToggles((p) => ({ ...p, whitelist: e.target.value }))
                      }
                      placeholder="*.google.com, localhost:3000"
                      rows={2}
                      className="w-full text-[11px] p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-zinc-700 resize-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1 px-1 mt-1.5">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Webhook Target URL
                    </span>
                    <input
                      type="text"
                      value={toggles.webhookUrl || ""}
                      onChange={(e) =>
                        setToggles((p) => ({ ...p, webhookUrl: e.target.value }))
                      }
                      placeholder="https://your-api.com/webhook"
                      className="w-full text-[11px] p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-zinc-700 font-mono"
                    />
                  </div>
                  {toggles.webhookUrl && (
                    <div className="flex flex-col gap-1 px-1 mt-1.5">
                      <span className="text-[10px] text-zinc-400 font-medium flex justify-between items-center">
                        <span>Custom Headers</span>
                        <button
                          onClick={handleAddHeader}
                          className="text-[9px] text-slate-400 hover:text-slate-200">
                          + Add Header
                        </button>
                      </span>
                      <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-0.5">
                        {(toggles.webhookHeaders || []).map((header, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Name"
                              value={header.key}
                              onChange={(e) =>
                                handleHeaderChange(idx, "key", e.target.value)
                              }
                              className="flex-1 min-w-0 text-[10px] px-1 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-350 focus:outline-none font-mono"
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={header.value}
                              onChange={(e) =>
                                handleHeaderChange(idx, "value", e.target.value)
                              }
                              className="flex-1 min-w-0 text-[10px] px-1 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-350 focus:outline-none font-mono"
                            />
                            <button
                              onClick={() => handleRemoveHeader(idx)}
                              className="text-zinc-500 hover:text-red-400 text-[11px] px-0.5">
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {error && !showHistory && !inspectedItem && (
        <div className="px-3 py-2 text-xs text-red-400 bg-red-950/40 border-b border-red-900/40 shrink-0">
          {error}
        </div>
      )}

      {inspectedItem && !showHistory && (
        <div className="px-3 py-1.5 text-[10px] text-slate-300 bg-slate-900/40 border-b border-slate-800/40 flex items-center justify-between gap-2 shrink-0">
          <span className="truncate">
            Viewing saved item: {inspectedItem.title || inspectedItem.url}
          </span>
        </div>
      )}

      <main className="flex-1 min-h-0 bg-zinc-950 p-2 relative flex flex-col">
        {showHistory ? (
          <HistoryQueueView
            clipWhitelist={toggles.clipWhitelist || ""}
            onChangeClipWhitelist={(val) =>
              setToggles((prev) => ({ ...prev, clipWhitelist: val }))
            }
            items={allItems}
            quotaStatus={quotaStatus}
            onEnqueueUrl={enqueueUrl}
            onClipAllTabs={clipAllTabs}
            onSelectItem={(item) => {
              setInspectedItem(item)
              setShowHistory(false)
            }}
            onCopyItem={handleCopyItem}
            onDownloadItem={handleDownloadItem}
            onRemoveItem={removeItem}
          />
        ) : !hasHostPermission ? (
          <div className="h-full rounded-xl border border-zinc-900/50 bg-zinc-900/10 flex flex-col justify-center items-center p-6 text-center select-none shadow-sm">
            <svg
              className="w-10 h-10 text-slate-500 mb-3 opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-zinc-200 text-sm font-semibold mb-1">
              Access Permission Required
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-4">
              Pagemark needs host permissions to read and convert this web
              page's content.
            </p>
            <button
              onClick={requestHostPermission}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-[0.98] transition-all duration-200">
              Grant Access
            </button>
          </div>
        ) : viewMode === "edit" ? (
          <div className="h-full rounded-xl border border-zinc-900/50 bg-zinc-900/10 flex flex-col overflow-hidden shadow-sm">
            <textarea
              value={markdown}
              spellCheck={false}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full p-3 bg-transparent outline-none text-[12px] font-mono text-zinc-350 leading-relaxed resize-none selection:bg-slate-500/30 placeholder-zinc-700 overflow-y-auto"
              placeholder="Paste or write markdown here..."
            />
          </div>
        ) : (
          <div className="h-full rounded-xl border border-zinc-900/50 bg-zinc-900/10 flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5">
              <article className="md-preview prose prose-invert prose-xs text-[15px] leading-relaxed max-w-none prose-headings:text-zinc-200 prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:text-zinc-400 prose-a:text-slate-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-strong:text-zinc-200 prose-code:rounded prose-li:text-zinc-400 prose-ul:marker:text-zinc-600 prose-ol:marker:text-zinc-600 prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-400 prose-blockquote:font-normal prose-blockquote:not-italic prose-hr:border-zinc-800 prose-pre:leading-none prose-p:my-0 prose-hr:my-3">
                {" "}
                <Markdown>{markdown}</Markdown>
              </article>
            </div>
          </div>
        )}
      </main>

      <footer className="px-3 py-1.5 border-t border-zinc-900/40 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <span>
            {activeText.length.toLocaleString()} chars | ~
            {tokenEstimate.toLocaleString()} tokens
          </span>
          {status && (
            <span className="text-[9px] text-slate-300 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/60 truncate font-sans">
              {status}
            </span>
          )}
        </div>
        <div className="shrink-0">
          {showHistory ? (
            <span
              className={quotaStatus.isNearQuota ? "text-amber-400" : undefined}
              title="Local storage usage out of 10 MB quota">
              {quotaStatus.megabytes.toFixed(2)} / 10 MB
            </span>
          ) : null}
        </div>
      </footer>

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear All Saved & Queued Items?"
        message="This will permanently remove all saved history and queued items."
        confirmLabel="Clear All"
        onConfirm={handleConfirmDialog}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  )
}
