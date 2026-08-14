import Markdown from "markdown-to-jsx/react"
import {
  formatMarkdown,
  isRestrictedUrl,
  isUrlWhitelisted
} from "pagemark-core"
import { useEffect, useRef, useState } from "react"
import { PM_MESSAGES } from "~/lib/messages"
import { usePagemarkSettings } from "./hooks/useSettings"
import { usePageData } from "./hooks/usePageData"

import {
  Calendar as CalendarIcon,
  Check as CheckIcon,
  Code as CodeIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  Heading as TitleIcon,
  Image as ImageIcon,
  Link as SourceUrlIcon,
  Link2 as LinkIcon,
  Map as MapIcon,
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

  const [markdown, setMarkdown] = useState("")
  const [hasAutoCopied, setHasAutoCopied] = useState(false)
  const [pendingAutoCopy, setPendingAutoCopy] = useState(false)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  const [showSettings, setShowSettings] = useState(false)
  const [copiedIcon, setCopiedIcon] = useState<
    "markdown" | "prompt" | "download" | null
  >(null)
  const [webhookSending, setWebhookSending] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<"success" | "error" | null>(null)

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
    }
  }, [pageData])

  useEffect(() => {
    if (!pageData || !pageData.markdown) return

    const finalMd = formatMarkdown(
      pageData.markdown,
      {
        title: pageData.title,
        url: pageData.url,
        date: pageData.date ? new Date(pageData.date) : undefined
      },
      toggles
    )

    setMarkdown(finalMd)
  }, [pageData, toggles])

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

    // Try local copy first
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
        .catch((localErr) => {
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
      toggles.autoCopy &&
      !isCurrentUrlWhitelisted &&
      markdown &&
      !hasAutoCopied
    ) {
      copyMarkdown(markdown, true)
    }
  }, [markdown, hasAutoCopied, toggles.autoCopy, isCurrentUrlWhitelisted])

  useEffect(() => {
    const handleFocus = () => {
      if (
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
    isCurrentUrlWhitelisted
  ])

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatus("Clipboard unavailable")
      setTimeout(() => setStatus(""), 2000)
      return
    }
    navigator.clipboard.writeText(markdown).then(() => {
      setStatus("Copied!")
      setCopiedIcon("markdown")
      setTimeout(() => {
        setStatus("")
        setCopiedIcon(null)
      }, 1500)
    })
  }

  const handleCopyPrompt = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatus("Clipboard unavailable")
      setTimeout(() => setStatus(""), 2000)
      return
    }
    const backtickMatches = markdown.match(/`+/g)
    const maxBackticks = backtickMatches
      ? backtickMatches.reduce((max, match) => Math.max(max, match.length), 0)
      : 0
    const backticks = "`".repeat(Math.max(3, maxBackticks + 1))
    const promptText = `${backticks}markdown\n${markdown}\n${backticks}`
    navigator.clipboard.writeText(promptText).then(() => {
      setStatus("Copied as Prompt!")
      setCopiedIcon("prompt")
      setTimeout(() => {
        setStatus("")
        setCopiedIcon(null)
      }, 1500)
    })
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pageData?.title ? pageData.title.replace(/\s+/g, "_") : "page"}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setStatus("Downloaded!")
    setCopiedIcon("download")
    setTimeout(() => {
      setStatus("")
      setCopiedIcon(null)
    }, 1500)
  }

  const handleSendWebhook = () => {
    if (!toggles.webhookUrl) return
    setWebhookSending(true)
    setWebhookStatus(null)
    setStatus("Sending webhook...")

    chrome.runtime.sendMessage(
      {
        action: PM_MESSAGES.TRIGGER_WEBHOOK,
        markdown,
        title: pageData?.title,
        url: pageData?.url,
        author: pageData?.author,
        date: pageData?.date,
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

  const tokenEstimate = Math.ceil(markdown.length / 4)

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      <header className="relative px-3 py-3 border-b border-zinc-900/30 bg-zinc-900/60 backdrop-blur-md flex flex-col z-10 shrink-0 shadow-sm select-none">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm tracking-tight bg-gradient-to-r from-slate-400 to-teal-500 bg-clip-text text-transparent truncate">
              Pagemark
            </span>
            {status && (
              <span className="text-[9px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-950/40 border border-slate-900/30 animate-pulse truncate">
                {status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Settings & Filters"
                className={`p-1.5 rounded-lg transition-colors outline-none ${showSettings ? "text-slate-400 bg-zinc-850" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"}`}>
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
                      <span className="flex items-center gap-2">
                        Format
                      </span>
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
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
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

        <div className="flex items-center gap-1.5 mt-2.5 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 group inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium shadow-[0_2px_8px_-3px_rgba(16,185,129,0.3)] transition-all duration-200 active:scale-[0.98] outline-none">
            {copiedIcon === "markdown" ? (
              <CheckIcon className="w-3.5 h-3.5" />
            ) : (
              <CopyIcon className="w-3.5 h-3.5 opacity-90" />
            )}
            Copy MD
          </button>
          {toggles.webhookUrl && (
            <button
              onClick={handleSendWebhook}
              disabled={webhookSending}
              className="flex-1 group inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all duration-200 active:scale-[0.98] outline-none disabled:opacity-50">
              {webhookSending ? (
                <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
            onClick={handleCopyPrompt}
            className="flex-1 group inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all duration-200 active:scale-[0.98] outline-none">
            {copiedIcon === "prompt" ? (
              <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <CopyIcon className="w-3.5 h-3.5 opacity-70" />
            )}
            Prompt
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 group inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all duration-200 active:scale-[0.98] outline-none">
            {copiedIcon === "download" ? (
              <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <DownloadIcon className="w-3.5 h-3.5 opacity-90" />
            )}
            Download
          </button>
        </div>

        <div className="flex items-center justify-between w-full mt-2.5 pt-2 border-t border-zinc-900/30">
          <div className="flex p-0.5 bg-zinc-950/60 border border-zinc-900/30 rounded-lg">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1 text-[10px] font-medium transition-all rounded-md flex items-center gap-1 ${viewMode === "edit" ? "bg-zinc-850 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
              Editor
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 text-[10px] font-medium transition-all rounded-md flex items-center gap-1 ${viewMode === "preview" ? "bg-zinc-850 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
              Preview
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <span>~{tokenEstimate.toLocaleString()} tokens</span>
            <span className="w-px h-2.5 bg-zinc-900/40" />
            <span>{markdown.length.toLocaleString()} chars</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="px-3 py-2 text-xs text-red-400 bg-red-950/40 border-b border-red-900/40 shrink-0">
          {error}
        </div>
      )}

      <main className="flex-1 min-h-0 bg-zinc-950 p-2 relative">
        {!hasHostPermission ? (
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
            <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 border-b border-zinc-900/40 bg-zinc-900/30 flex justify-between items-center select-none">
              <span>Markdown Editor</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMarkdown("")}
                  className="hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <TrashIcon className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
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
            <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 border-b border-zinc-900/40 bg-zinc-900/30 select-none">
              Live Preview
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5">
              <article className="md-preview prose prose-invert prose-xs text-[15px] leading-relaxed max-w-none prose-headings:text-zinc-200 prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:text-zinc-400 prose-a:text-slate-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-strong:text-zinc-200 prose-code:rounded prose-li:text-zinc-400 prose-ul:marker:text-zinc-600 prose-ol:marker:text-zinc-600 prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-400 prose-blockquote:font-normal prose-blockquote:not-italic prose-hr:border-zinc-800 prose-pre:leading-none prose-p:my-0 prose-hr:my-3">
                {" "}
                <Markdown>{markdown}</Markdown>
              </article>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
