import type { PlasmoCSConfig } from "plasmo"
import { parseHtmlToMarkdown } from "~/lib/parser"
import { PM_MESSAGES } from "~/lib/messages"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

const SPA_SETTLE_DEBOUNCE_MS = 450
const SPA_SETTLE_MAX_WAIT_MS = 2000

let lastObservedHref = typeof window !== "undefined" ? window.location.href : ""
let spaDebounceTimer: ReturnType<typeof setTimeout> | null = null
let spaMaxWaitTimer: ReturnType<typeof setTimeout> | null = null
let pendingSpaExtraction = false

function extractPageData() {
  const html = document.documentElement ? document.documentElement.outerHTML : ""
  const result = parseHtmlToMarkdown(html, { url: window.location.href })

  return {
    markdown: result.markdown,
    title: result.title || document.title || "",
    author: result.author,
    date: result.date,
    url: result.url || window.location.href || ""
  }
}

function convertPageToMarkdown() {
  const pageData = extractPageData()

  chrome.storage.local.set({ pageData }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to save page data:", chrome.runtime.lastError)
    }
    chrome.runtime.sendMessage({ action: PM_MESSAGES.PAGE_CONVERTED, pageData }).catch(() => {
      // Ignore errors when nobody is listening
    })
  })
}

function flushSpaConversion() {
  if (spaDebounceTimer) {
    clearTimeout(spaDebounceTimer)
    spaDebounceTimer = null
  }
  if (spaMaxWaitTimer) {
    clearTimeout(spaMaxWaitTimer)
    spaMaxWaitTimer = null
  }
  if (!pendingSpaExtraction) return
  pendingSpaExtraction = false
  lastObservedHref = window.location.href
  convertPageToMarkdown()
}

function scheduleSpaConversion(isRouteChange: boolean) {
  if (isRouteChange) {
    pendingSpaExtraction = true
    if (!spaMaxWaitTimer) {
      spaMaxWaitTimer = setTimeout(flushSpaConversion, SPA_SETTLE_MAX_WAIT_MS)
    }
  }

  if (!pendingSpaExtraction) return

  if (spaDebounceTimer) {
    clearTimeout(spaDebounceTimer)
  }
  spaDebounceTimer = setTimeout(flushSpaConversion, SPA_SETTLE_DEBOUNCE_MS)
}

function handlePossibleRouteChange() {
  const currentHref = window.location.href
  if (currentHref !== lastObservedHref) {
    lastObservedHref = currentHref
    scheduleSpaConversion(true)
  }
}

function setupSpaObserver() {
  if (typeof window === "undefined" || typeof document === "undefined") return

  window.addEventListener("popstate", () => scheduleSpaConversion(true))
  window.addEventListener("hashchange", () => scheduleSpaConversion(true))

  const attachObserver = () => {
    if (!document.documentElement) return
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastObservedHref) {
        lastObservedHref = window.location.href
        scheduleSpaConversion(true)
      } else if (pendingSpaExtraction) {
        scheduleSpaConversion(false)
      }
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
  }

  if (document.documentElement) {
    attachObserver()
  } else {
    document.addEventListener("DOMContentLoaded", attachObserver, { once: true })
  }
}

setupSpaObserver()

function execCopyFallback(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.top = "0"
      textArea.style.left = "0"
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)
      if (successful) {
        resolve()
      } else {
        reject(new Error("execCommand copy failed"))
      }
    } catch (err) {
      reject(err)
    }
  })
}

function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => {
      return execCopyFallback(text)
    })
  }
  return execCopyFallback(text)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === PM_MESSAGES.CONVERT) {
    if (request.returnOnly) {
      const pageData = extractPageData()
      sendResponse({ success: true, pageData })
      return false
    }

    if (request.waitForSettle) {
      lastObservedHref = window.location.href
      scheduleSpaConversion(true)
    } else if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          handlePossibleRouteChange()
          convertPageToMarkdown()
        },
        { once: true }
      )
    } else {
      convertPageToMarkdown()
    }
  } else if (request.action === PM_MESSAGES.COPY_TO_CLIPBOARD) {
    copyTextToClipboard(request.text)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((err) => {
        console.warn("Content script failed to copy:", err)
        sendResponse({ success: false, error: err?.message || "Unknown error" })
      })
    return true // keep channel open for async response
  }
})
