import { isRestrictedUrl, isUrlWhitelisted } from "~/lib/url"
import { PM_MESSAGES } from "~/lib/messages"
import {
  COLLECTION_STORAGE_KEYS,
  createCollectionId,
  upsertQueueItems,
  type CollectionItem
} from "~/lib/collection"

// Set sidepanel behavior on install/startup
if (typeof chrome !== "undefined" && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting panel behavior:", error))
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "convert-to-markdown",
      title: "Pagemark this page",
      contexts: ["page"]
    })
    chrome.contextMenus.create({
      id: "queue-link",
      title: "Queue link in Pagemark",
      contexts: ["link"]
    })
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

async function getQueueItems(): Promise<CollectionItem[]> {
  const result = await chrome.storage.local.get([COLLECTION_STORAGE_KEYS.QUEUE])
  return Array.isArray(result?.[COLLECTION_STORAGE_KEYS.QUEUE])
    ? result[COLLECTION_STORAGE_KEYS.QUEUE]
    : []
}

async function updateQueueItem(
  itemId: string,
  updater: (item: CollectionItem) => CollectionItem
): Promise<void> {
  const items = await getQueueItems()
  const next = items.map((item) => (item.id === itemId ? updater(item) : item))
  await chrome.storage.local.set({ [COLLECTION_STORAGE_KEYS.QUEUE]: next })
}

function waitForTabComplete(tabId: number, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const cleanup = () => {
      chrome.tabs.onUpdated.removeListener(onUpdated)
      chrome.tabs.onRemoved.removeListener(onRemoved)
      clearTimeout(timer)
    }

    const onUpdated = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete" && !settled) {
        settled = true
        cleanup()
        resolve()
      }
    }

    const onRemoved = (removedTabId: number) => {
      if (removedTabId === tabId && !settled) {
        settled = true
        cleanup()
        reject(new Error("Background tab was closed before finishing load."))
      }
    }

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        cleanup()
        reject(new Error("Timed out waiting for page to load."))
      }
    }, timeoutMs)

    chrome.tabs.onUpdated.addListener(onUpdated)
    chrome.tabs.onRemoved.addListener(onRemoved)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function requestTabExtraction(tabId: number): Promise<{
  markdown: string
  title: string
  author?: string
  date?: string
  url: string
}> {
  const response = await chrome.tabs.sendMessage(tabId, {
    action: PM_MESSAGES.CONVERT,
    returnOnly: true
  })
  if (!response?.success || !response?.pageData) {
    throw new Error("Failed to extract page content.")
  }
  return response.pageData
}

async function clipUrlInBackground(url: string) {
  if (isRestrictedUrl(url)) {
    throw new Error("Restricted browser URLs cannot be clipped.")
  }

  const createdTab = await chrome.tabs.create({ url, active: false })
  if (!createdTab?.id) {
    throw new Error("Failed to open background tab.")
  }

  const tabId = createdTab.id
  try {
    await waitForTabComplete(tabId)
    // Allow client-side frameworks a short settle window after load
    await delay(500)
    return await requestTabExtraction(tabId)
  } finally {
    chrome.tabs.remove(tabId).catch(() => {
      // Ignore if already closed
    })
  }
}

async function processQueueItem(itemId: string, url: string): Promise<void> {
  await updateQueueItem(itemId, (item) => ({
    ...item,
    status: "clipping",
    error: undefined
  }))

  try {
    const pageData = await clipUrlInBackground(url)
    await updateQueueItem(itemId, (item) => ({
      ...item,
      status: "ready",
      title: pageData.title || item.title || url,
      url: pageData.url || url,
      author: pageData.author || "",
      date: pageData.date || "",
      markdown: pageData.markdown || "",
      savedAt: Date.now(),
      error: undefined
    }))
  } catch (err: any) {
    await updateQueueItem(itemId, (item) => ({
      ...item,
      status: "error",
      error: err?.message || "Failed to clip URL."
    }))
  }
}

async function enqueueUrlAndClip(url: string, title?: string): Promise<CollectionItem> {
  if (!url || isRestrictedUrl(url)) {
    throw new Error("Restricted or invalid URL.")
  }

  const newItem: CollectionItem = {
    id: createCollectionId("queue"),
    url,
    title: title || url,
    markdown: "",
    savedAt: Date.now(),
    status: "queued",
    source: "queue"
  }

  const existing = await getQueueItems()
  await chrome.storage.local.set({
    [COLLECTION_STORAGE_KEYS.QUEUE]: upsertQueueItems(existing, [newItem])
  })

  // Process asynchronously without blocking message response
  processQueueItem(newItem.id, url).catch((err) => {
    console.error("Background queue processing error:", err)
  })

  return newItem
}

async function clipAllOpenTabs(whitelist?: string): Promise<{ total: number }> {
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const targetTabs = tabs.filter(
    (tab) =>
      tab.url &&
      !isRestrictedUrl(tab.url) &&
      !(whitelist && isUrlWhitelisted(tab.url, whitelist))
  )

  if (targetTabs.length === 0) {
    return { total: 0 }
  }

  const now = Date.now()
  const newItems: CollectionItem[] = targetTabs.map((tab) => ({
    id: createCollectionId("queue"),
    url: tab.url!,
    title: tab.title || tab.url!,
    markdown: "",
    savedAt: now,
    status: "clipping",
    source: "queue"
  }))

  const existing = await getQueueItems()
  await chrome.storage.local.set({
    [COLLECTION_STORAGE_KEYS.QUEUE]: upsertQueueItems(existing, newItems)
  })

  const runBatch = async () => {
    for (let i = 0; i < targetTabs.length; i++) {
      const tab = targetTabs[i]
      const item = newItems[i]
      try {
        let pageData: Awaited<ReturnType<typeof requestTabExtraction>> | null = null
        if (!tab.discarded && tab.id) {
          try {
            pageData = await requestTabExtraction(tab.id)
          } catch {
            // Pre-install or unloaded tab: fall back to inactive background tab
            pageData = null
          }
        }

        if (!pageData) {
          pageData = await clipUrlInBackground(tab.url!)
        }

        await updateQueueItem(item.id, (prev) => ({
          ...prev,
          status: "ready",
          title: pageData!.title || prev.title || tab.url!,
          url: pageData!.url || tab.url!,
          author: pageData!.author || "",
          date: pageData!.date || "",
          markdown: pageData!.markdown || "",
          savedAt: Date.now(),
          error: undefined
        }))
      } catch (err: any) {
        await updateQueueItem(item.id, (prev) => ({
          ...prev,
          status: "error",
          error: err?.message || "Failed to clip tab."
        }))
      }
    }
  }

  runBatch().catch((err) => {
    console.error("Bulk tab clipping failed:", err)
  })

  return { total: targetTabs.length }
}

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
  } else if (info.menuItemId === "queue-link" && info.linkUrl) {
    enqueueUrlAndClip(info.linkUrl).catch((err) => {
      console.warn("Failed to queue link:", err)
    })
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

// Listen for messages from the content script and side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === PM_MESSAGES.OPEN_MARKDOWN_TAB) {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/markdown.html") })
  } else if (request.action === PM_MESSAGES.QUEUE_URL) {
    enqueueUrlAndClip(request.url, request.title)
      .then((item) => sendResponse({ success: true, item }))
      .catch((err) => sendResponse({ success: false, error: err?.message || "Failed to queue URL" }))
    return true
  } else if (request.action === PM_MESSAGES.CLIP_ALL_TABS) {
    clipAllOpenTabs(request.whitelist)
      .then((res) => sendResponse({ success: true, ...res }))
      .catch((err) => sendResponse({ success: false, error: err?.message || "Failed to clip open tabs" }))
    return true
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
