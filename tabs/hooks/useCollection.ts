import { useCallback, useEffect, useMemo, useState } from "react"
import {
  COLLECTION_STORAGE_KEYS,
  getQuotaStatus,
  mergeUniqueCollectionItems,
  normalizeQueueUrl,
  upsertHistoryItem,
  type CollectionItem
} from "~/lib/collection"
import { PM_MESSAGES } from "~/lib/messages"
import { isRestrictedUrl } from "~/lib/url"

export function useCollection() {
  const [historyItems, setHistoryItems] = useState<CollectionItem[]>([])
  const [queueItems, setQueueItems] = useState<CollectionItem[]>([])

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return

    chrome.storage.local.get(
      [COLLECTION_STORAGE_KEYS.HISTORY, COLLECTION_STORAGE_KEYS.QUEUE],
      (result) => {
        if (Array.isArray(result?.[COLLECTION_STORAGE_KEYS.HISTORY])) {
          setHistoryItems(result[COLLECTION_STORAGE_KEYS.HISTORY])
        }
        if (Array.isArray(result?.[COLLECTION_STORAGE_KEYS.QUEUE])) {
          setQueueItems(result[COLLECTION_STORAGE_KEYS.QUEUE])
        }
      }
    )

    const onChanged = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== "local") return
      if (changes[COLLECTION_STORAGE_KEYS.HISTORY]?.newValue) {
        setHistoryItems(
          Array.isArray(changes[COLLECTION_STORAGE_KEYS.HISTORY].newValue)
            ? changes[COLLECTION_STORAGE_KEYS.HISTORY].newValue
            : []
        )
      }
      if (changes[COLLECTION_STORAGE_KEYS.QUEUE]?.newValue) {
        setQueueItems(
          Array.isArray(changes[COLLECTION_STORAGE_KEYS.QUEUE].newValue)
            ? changes[COLLECTION_STORAGE_KEYS.QUEUE].newValue
            : []
        )
      }
    }

    chrome.storage.onChanged.addListener(onChanged)
    return () => chrome.storage.onChanged.removeListener(onChanged)
  }, [])

  const saveToHistory = useCallback(
    (pageData: {
      url?: string
      title?: string
      author?: string
      date?: string
      markdown?: string
    }) => {
      if (!pageData?.url || !pageData?.markdown?.trim()) return
      setHistoryItems((prev) => {
        const next = upsertHistoryItem(
          prev,
          {
            url: pageData.url!,
            title: pageData.title,
            author: pageData.author,
            date: pageData.date,
            markdown: pageData.markdown!
          },
          isRestrictedUrl
        )
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.set({ [COLLECTION_STORAGE_KEYS.HISTORY]: next })
        }
        return next
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    setHistoryItems([])
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ [COLLECTION_STORAGE_KEYS.HISTORY]: [] })
    }
  }, [])

  const clearAll = useCallback(() => {
    setHistoryItems([])
    setQueueItems([])
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({
        [COLLECTION_STORAGE_KEYS.HISTORY]: [],
        [COLLECTION_STORAGE_KEYS.QUEUE]: []
      })
    }
  }, [])

  const removeItem = useCallback((id: string) => {
    setQueueItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      if (filtered.length !== prev.length && typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ [COLLECTION_STORAGE_KEYS.QUEUE]: filtered })
      }
      return filtered
    })
    setHistoryItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      if (filtered.length !== prev.length && typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({ [COLLECTION_STORAGE_KEYS.HISTORY]: filtered })
      }
      return filtered
    })
  }, [])

  const enqueueUrl = useCallback(
    (rawUrl: string): Promise<{ ok: boolean; error?: string }> => {
      const { url, error } = normalizeQueueUrl(rawUrl, isRestrictedUrl)
      if (!url) {
        return Promise.resolve({ ok: false, error })
      }
      if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
        return Promise.resolve({ ok: false, error: "Extension API unavailable." })
      }
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: PM_MESSAGES.QUEUE_URL, url },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve({ ok: false, error: chrome.runtime.lastError.message })
              return
            }
            if (!response?.success) {
              resolve({ ok: false, error: response?.error || "Failed to queue URL." })
              return
            }
            resolve({ ok: true })
          }
        )
      })
    },
    []
  )

  const clipAllTabs = useCallback((whitelist?: string): Promise<{
    ok: boolean
    total?: number
    error?: string
  }> => {
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      return Promise.resolve({ ok: false, error: "Extension API unavailable." })
    }
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: PM_MESSAGES.CLIP_ALL_TABS, whitelist },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message })
            return
          }
          if (!response?.success) {
            resolve({ ok: false, error: response?.error || "Failed to clip open tabs." })
            return
          }
          resolve({ ok: true, total: response.total })
        }
      )
    })
  }, [])

  const allItems = useMemo(
    () => mergeUniqueCollectionItems(queueItems, historyItems),
    [queueItems, historyItems]
  )

  const readyItems = useMemo(
    () => allItems.filter((item) => item.status === "ready" && item.markdown),
    [allItems]
  )

  const quotaStatus = useMemo(
    () => getQuotaStatus(historyItems, queueItems),
    [historyItems, queueItems]
  )

  return {
    historyItems,
    queueItems,
    allItems,
    readyItems,
    quotaStatus,
    saveToHistory,
    clearHistory,
    clearAll,
    removeItem,
    enqueueUrl,
    clipAllTabs
  }
}
