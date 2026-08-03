import type { PlasmoCSConfig } from "plasmo"
import { parseHtmlToMarkdown } from "pagemark-core"
import { PM_MESSAGES } from "~/lib/messages"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

function convertPageToMarkdown() {
  const html = document.documentElement.outerHTML
  const result = parseHtmlToMarkdown(html, { url: window.location.href })
  
  const pageData = {
    markdown: result.markdown,
    title: result.title || document.title || "",
    author: result.author,
    date: result.date,
    url: result.url || window.location.href || ""
  }

  chrome.storage.local.set({ pageData }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to save page data:", chrome.runtime.lastError)
    }
    chrome.runtime.sendMessage({ action: PM_MESSAGES.PAGE_CONVERTED, pageData }).catch(() => {
      // Ignore errors when nobody is listening
    })
  })
}

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
    convertPageToMarkdown()
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
