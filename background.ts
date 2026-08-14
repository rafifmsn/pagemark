import { isRestrictedUrl } from "pagemark-core"
import { PM_MESSAGES } from "~/lib/messages"

// Set sidepanel behavior on install/startup
if (typeof chrome !== "undefined" && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting panel behavior:", error))
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-to-markdown",
    title: "Pagemark this page",
    contexts: ["page"]
  })
})

let sidePanelPort: chrome.runtime.Port | null = null

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "pagemark-sidepanel") {
    sidePanelPort = port
    port.onDisconnect.addListener(() => {
      sidePanelPort = null
    })
  }
})

const handleConvertToMarkdown = (tab: chrome.tabs.Tab, toggle = false) => {
  if (!tab?.id) return

  // Guard against restricted/internal browser pages
  if (tab.url && isRestrictedUrl(tab.url)) {
    console.log("Pagemark cannot run on restricted or internal browser pages.")
    return
  }

  const sendMessage = () => {
    chrome.tabs
      .sendMessage(tab.id!, { action: PM_MESSAGES.CONVERT })
      .catch((err) =>
        console.log("Content script not ready or an extension page.", err)
      )
  }

  if (toggle && sidePanelPort) {
    sidePanelPort.postMessage({ action: PM_MESSAGES.CLOSE })
    return
  }

  const browserAPI = (globalThis as any).browser

  // Open side panel/sidebar programmatically if supported
  if (typeof chrome !== "undefined" && chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel
      .open({ tabId: tab.id })
      .then(() => {
        sendMessage()
      })
      .catch((err) => {
        console.warn("Failed to open sidepanel, sending message directly:", err)
        sendMessage()
      })
  } else if (browserAPI && browserAPI.sidebarAction && browserAPI.sidebarAction.open) {
    browserAPI.sidebarAction
      .open()
      .then(() => {
        sendMessage()
      })
      .catch((err) => {
        console.warn("Failed to open sidebar, sending message directly:", err)
        sendMessage()
      })
  } else {
    sendMessage()
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-to-markdown" && tab) {
    handleConvertToMarkdown(tab, false)
  }
})

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "convert-to-markdown" && tab) {
    handleConvertToMarkdown(tab, true)
  }
})

// Listen for action click to open sidebar on Firefox / other browsers without native sidePanel behavior
if (typeof chrome !== "undefined" && chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    handleConvertToMarkdown(tab, false)
  })
}

function isValidWebhookUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr)
    if (url.protocol === "https:") {
      return true
    }
    if (url.protocol === "http:") {
      const hostname = url.hostname.toLowerCase()
      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".localhost")
      )
    }
    return false
  } catch {
    return false
  }
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === PM_MESSAGES.OPEN_MARKDOWN_TAB) {
    // Open the new tab page
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/markdown.html") })
  } else if (request.action === PM_MESSAGES.TRIGGER_WEBHOOK) {
    if (!request.webhookUrl) {
      sendResponse({ success: false, error: "Webhook URL is not configured." })
      return false
    }

    if (!isValidWebhookUrl(request.webhookUrl)) {
      sendResponse({ success: false, error: "Only HTTPS endpoints are allowed (except localhost)." })
      return false
    }

    const headersObj: Record<string, string> = {}
    if (Array.isArray(request.webhookHeaders)) {
      for (const h of request.webhookHeaders) {
        if (h.key && h.key.trim()) {
          headersObj[h.key.trim()] = h.value || ""
        }
      }
    }

    fetch(request.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headersObj
      },
      body: JSON.stringify({
        markdown: request.markdown,
        title: request.title,
        url: request.url,
        author: request.author,
        date: request.date
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(`Server returned HTTP ${res.status}: ${text || res.statusText}`)
        }
        return res.text().catch(() => "")
      })
      .then((data) => {
        sendResponse({ success: true, data })
      })
      .catch((err) => {
        console.error("Webhook trigger failed:", err)
        sendResponse({ success: false, error: err.message })
      })

    return true // Keep channel open for async response
  }
})

