import Markdown from "markdown-to-jsx/react"
import { useEffect, useState } from "react"

import "./style.css"

const CheckIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-check-icon lucide-check"
        {...props}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
)

const SourceUrlIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-link-icon lucide-link"
        {...props}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
)

const MetaDataIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-file-user-icon lucide-file-user"
        {...props}>
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="M16 22a4 4 0 0 0-8 0" />
        <circle cx={12} cy={15} r={3} />
    </svg>
)

const LinkIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-link2-icon lucide-link-2"
        {...props}>
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
        <line x1={8} x2={16} y1={12} y2={12} />
    </svg>
)

const ImageIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-image-icon lucide-image"
        {...props}>
        <rect width={18} height={18} x={3} y={3} rx={2} ry={2} />
        <circle cx={9} cy={9} r={2} />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
)

const CopyIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-copy-icon lucide-copy"
        {...props}>
        <rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
)

const DownloadIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-download-icon lucide-download"
        {...props}>
        <path d="M12 15V3" />
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="m7 10 5 5 5-5" />
    </svg>
)

// PasteIcon removed

const TrashIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
)

const MapIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-map-icon lucide-map"
        {...props}
    >
        <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
        <path d="M15 5.764v15" />
        <path d="M9 3.236v15" />
    </svg>
)

const SettingsIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="2" x2="6" y1="14" y2="14" />
        <line x1="10" x2="14" y1="8" y2="8" />
        <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
)

const RefreshIcon = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
)

interface HeadingNode {
    text: string
    level: number
    children: HeadingNode[]
}

function generatePageMap(
    markdown: string,
    title: string = "Document Structure"
): string {
    const lines = markdown.split("\n")
    const headings: { level: number; text: string }[] = []

    lines.forEach((line) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/)
        if (match) {
            headings.push({ level: match[1].length, text: match[2].trim() })
        }
    })

    if (headings.length === 0) return ""

    const root: HeadingNode = { text: title, level: 0, children: [] }
    const stack: HeadingNode[] = [root]

    headings.forEach((h) => {
        const node: HeadingNode = { text: h.text, level: h.level, children: [] }
        while (stack.length > 1 && stack[stack.length - 1].level >= h.level) {
            stack.pop()
        }
        stack[stack.length - 1].children.push(node)
        stack.push(node)
    })

    let mapStr = `${title}\n`

    function renderNode(
        node: HeadingNode,
        prefix: string,
        isLast: boolean,
        isRoot: boolean
    ) {
        if (!isRoot) {
            const connector = isLast ? "└── " : "├── "
            mapStr += `${prefix}${connector}${node.text}\n`

            if (node.children.length > 0) {
                const childPrefix = prefix + (isLast ? "    " : "│   ")
                node.children.forEach((child, index) => {
                    renderNode(
                        child,
                        childPrefix,
                        index === node.children.length - 1,
                        false
                    )
                })
            }
        } else {
            node.children.forEach((child, index) => {
                renderNode(child, "", index === node.children.length - 1, false)
            })
        }
    }

    renderNode(root, "", true, true)
    mapStr = mapStr.replace(/│\n$/g, "").trimEnd()

    return "# Page Structure Map\n```text\n" + mapStr + "\n```\n"
}

export default function MarkdownPage() {
    const [markdown, setMarkdown] = useState("")
    const [status, setStatus] = useState("")
    const [error, setError] = useState("")
    const [pageData, setPageData] = useState<any>(null)
    const [hasAutoCopied, setHasAutoCopied] = useState(false)
    const [pendingAutoCopy, setPendingAutoCopy] = useState(false)
    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
    const [showSettings, setShowSettings] = useState(false)
    const [copiedIcon, setCopiedIcon] = useState<
        "markdown" | "prompt" | "download" | null
    >(null)
    const [toggles, setToggles] = useState({
        includeImages: false,
        includeLinks: true,
        showMetadata: true,
        showSourceUrl: true,
        showPageMap: true
    })
    const [settingsLoaded, setSettingsLoaded] = useState(false)

    // Load settings once on mount
    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.get(["pagemark_settings"], (result) => {
                if (result && result.pagemark_settings) {
                    setToggles(result.pagemark_settings)
                }
                setSettingsLoaded(true)
            })
        } else {
            setSettingsLoaded(true)
        }
    }, [])

    // Maintain port connection to background for synchronous toggling
    useEffect(() => {
        let port: any = null
        if (typeof chrome !== "undefined" && chrome.runtime?.connect) {
            port = chrome.runtime.connect({ name: "pagemark-sidepanel" })
            port.onMessage.addListener((msg: any) => {
                if (msg && msg.action === "close") {
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

    // Save settings when they change (only after they have been loaded)
    useEffect(() => {
        if (settingsLoaded && typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ pagemark_settings: toggles })
        }
    }, [toggles, settingsLoaded])

    const triggerConversion = () => {
        setStatus("Clipping...")
        setError("")
        if (typeof chrome !== "undefined" && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
                    setError(chrome.runtime.lastError.message || "Failed to query tabs")
                    setStatus("")
                    return
                }
                const activeTab = tabs?.[0]
                if (activeTab?.url && (
                    activeTab.url.startsWith("chrome://") ||
                    activeTab.url.startsWith("brave://") ||
                    activeTab.url.startsWith("about:") ||
                    activeTab.url.includes("chromewebstore.google.com")
                )) {
                    setError("This page cannot be clipped (restricted browser system page).")
                    setStatus("")
                    return
                }
                if (activeTab?.id) {
                    chrome.tabs.sendMessage(activeTab.id, { action: "convert-to-markdown" }, (response) => {
                        // Accessing lastError suppresses the browser console errors
                        if (chrome.runtime?.lastError) {
                            // Suppress logs and UI errors for expected background tab switch/loading port closures
                            setStatus("")
                        }
                    })
                } else {
                    setError("No active tab found.")
                    setStatus("")
                }
            })
        } else {
            setError("Extension API not available.")
            setStatus("")
        }
    }

    useEffect(() => {
        // Trigger conversion on initial load/mount
        triggerConversion()

        let handleStorageChange: any = null
        let handleMessage: any = null
        let tabActivatedListener: any = null
        let tabUpdatedListener: any = null

        if (typeof chrome !== "undefined") {
            if (chrome.storage?.local) {
                // Load initial data
                chrome.storage.local.get(["pageData"], (result) => {
                    if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
                        setError(chrome.runtime.lastError.message || "Failed to load")
                    } else if (result && result.pageData) {
                        setPageData(result.pageData)
                    }
                })

                // Listen for storage changes reactively
                handleStorageChange = (changes: any, areaName: string) => {
                    if (areaName === "local" && changes && changes.pageData?.newValue) {
                        setPageData(changes.pageData.newValue)
                        setStatus("")
                    }
                }
                chrome.storage.onChanged.addListener(handleStorageChange)

                // Listen for message channel from content.ts
                handleMessage = (msg: any, sender: any, sendResponse: any) => {
                    if (msg && msg.action === "page-converted" && msg.pageData) {
                        setPageData(msg.pageData)
                        setStatus("")
                    } else if (msg && msg.action === "toggle-sidepanel") {
                        sendResponse({ status: "closed" })
                        setTimeout(() => {
                            window.close()
                        }, 50)
                    }
                    return true
                }
                chrome.runtime.onMessage.addListener(handleMessage)
            }

            if (chrome.tabs) {
                tabActivatedListener = (activeInfo: any) => {
                    triggerConversion()
                }
                tabUpdatedListener = (tabId: number, changeInfo: any) => {
                    if (changeInfo.status === "complete") {
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            const activeTab = tabs?.[0]
                            if (activeTab?.id === tabId) {
                                triggerConversion()
                            }
                        })
                    }
                }
                chrome.tabs.onActivated.addListener(tabActivatedListener)
                chrome.tabs.onUpdated.addListener(tabUpdatedListener)
            }

            return () => {
                if (typeof chrome !== "undefined") {
                    if (chrome.storage?.onChanged && handleStorageChange) {
                        chrome.storage.onChanged.removeListener(handleStorageChange)
                    }
                    if (chrome.runtime?.onMessage && handleMessage) {
                        chrome.runtime.onMessage.removeListener(handleMessage)
                    }
                    if (chrome.tabs?.onActivated && tabActivatedListener) {
                        chrome.tabs.onActivated.removeListener(tabActivatedListener)
                    }
                    if (chrome.tabs?.onUpdated && tabUpdatedListener) {
                        chrome.tabs.onUpdated.removeListener(tabUpdatedListener)
                    }
                }
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

        let baseMd = pageData.markdown

        if (!toggles.includeImages) {
            baseMd = baseMd.replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
            baseMd = baseMd.replace(/<img[^>]*>/gi, "")
        }

        if (!toggles.includeLinks) {
            baseMd = baseMd.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            baseMd = baseMd.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
        }

        let finalMd = ""
        let meta = []

        if (toggles.showMetadata) {
            if (pageData.title) meta.push(`**Title:** ${pageData.title}`)

            // Format current timestamp with timezone
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, "0")
            const day = String(now.getDate()).padStart(2, "0")
            const hours = String(now.getHours()).padStart(2, "0")
            const minutes = String(now.getMinutes()).padStart(2, "0")
            const seconds = String(now.getSeconds()).padStart(2, "0")
            const offsetMinutes = now.getTimezoneOffset()
            const offsetAbs = Math.abs(offsetMinutes)
            const offsetHours = String(Math.floor(offsetAbs / 60)).padStart(2, "0")
            const offsetRemainingMinutes = String(offsetAbs % 60).padStart(2, "0")
            const sign = offsetMinutes <= 0 ? "+" : "-"
            const tzString = offsetMinutes === 0 ? "UTC" : `UTC ${sign}${offsetHours}:${offsetRemainingMinutes}`
            const createdStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds} (${tzString})`

            meta.push(`**Created:** ${createdStr}`)
        }
        if (toggles.showSourceUrl && pageData.url) {
            meta.push(`**Source:** [${pageData.url}](${pageData.url})`)
        }

        if (meta.length > 0) {
            finalMd += meta.join("\n\n") + "\n\n---\n\n"
        }

        if (toggles.showPageMap) {
            const pageMap = generatePageMap(
                baseMd,
                pageData.title || "Page structure map"
            )
            if (pageMap) {
                finalMd += pageMap + "\n---\n\n"
            }
        }

        finalMd += baseMd

        finalMd = finalMd.replace(/^[ \t]*[-·][ \t]*$/gm, "")
        finalMd = finalMd.replace(/^[ \t]+$/gm, "")
        finalMd = finalMd.replace(/\n{3,}/g, "\n\n").trim()

        setMarkdown(finalMd)
    }, [pageData, toggles])

    useEffect(() => {
        if (markdown && !hasAutoCopied && typeof navigator !== "undefined" && navigator.clipboard) {
            if (document.hasFocus()) {
                setHasAutoCopied(true)
                setPendingAutoCopy(false)
                navigator.clipboard
                    .writeText(markdown)
                    .then(() => {
                        setStatus("Auto-copied!")
                        setTimeout(() => setStatus(""), 2000)
                    })
                    .catch((err) => {
                        if (err?.name !== "NotAllowedError") {
                            console.warn("Auto-copy failed:", err)
                        }
                    })
            } else {
                setPendingAutoCopy(true)
            }
        }
    }, [markdown, hasAutoCopied])

    useEffect(() => {
        const handleFocus = () => {
            if (pendingAutoCopy && markdown && !hasAutoCopied && typeof navigator !== "undefined" && navigator.clipboard) {
                setHasAutoCopied(true)
                setPendingAutoCopy(false)
                navigator.clipboard
                    .writeText(markdown)
                    .then(() => {
                        setStatus("Auto-copied!")
                        setTimeout(() => setStatus(""), 2000)
                    })
                    .catch((err) => {
                        if (err?.name !== "NotAllowedError") {
                            console.warn("Auto-copy failed on focus:", err)
                        }
                    })
            }
        }
        window.addEventListener("focus", handleFocus)
        return () => window.removeEventListener("focus", handleFocus)
    }, [pendingAutoCopy, markdown, hasAutoCopied])

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

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles((p) => ({ ...p, [key]: !p[key] }))
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
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                title="Settings & Filters"
                                className={`p-1.5 rounded-lg transition-colors outline-none ${showSettings ? "text-slate-400 bg-zinc-850" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"}`}>
                                <SettingsIcon className="w-3.5 h-3.5" />
                            </button>
                            {showSettings && (
                                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-2.5 z-50 flex flex-col gap-1.5">
                                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                                        Filters & Options
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
                                            <MetaDataIcon className="w-3.5 h-3.5 opacity-70" />
                                            Include Info
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={toggles.showMetadata}
                                            onChange={() => handleToggle("showMetadata")}
                                            className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                                        <span className="flex items-center gap-2">
                                            <MapIcon className="w-3.5 h-3.5 opacity-70" />
                                            Include Map
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={toggles.showPageMap}
                                            onChange={() => handleToggle("showPageMap")}
                                            className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer hover:bg-zinc-850 p-1.5 rounded-lg transition-colors">
                                        <span className="flex items-center gap-2">
                                            <SourceUrlIcon className="w-3.5 h-3.5 opacity-70" />
                                            Include Source
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={toggles.showSourceUrl}
                                            onChange={() => handleToggle("showSourceUrl")}
                                            className="accent-slate-500 h-3.5 w-3.5 rounded border-zinc-850 bg-zinc-950 cursor-pointer"
                                        />
                                    </label>
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
                {viewMode === "edit" ? (
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
                            <article className="md-preview prose prose-invert prose-xs text-[15px] leading-relaxed max-w-none prose-headings:text-zinc-200 prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:text-zinc-400 prose-a:text-slate-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-strong:text-zinc-200 prose-code:rounded prose-li:text-zinc-400 prose-ul:marker:text-zinc-600 prose-ol:marker:text-zinc-600 prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-400 prose-blockquote:font-normal prose-blockquote:not-italic prose-hr:border-zinc-800 prose-pre:leading-none prose-p:my-0 prose-hr:my-3">                                <Markdown>{markdown}</Markdown>
                            </article>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
