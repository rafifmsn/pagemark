export type CollectionItemStatus = "queued" | "clipping" | "ready" | "error"
export type CollectionItemSource = "history" | "queue"

export interface CollectionItem {
  id: string
  url: string
  title: string
  author?: string
  date?: string
  markdown: string
  savedAt: number
  status: CollectionItemStatus
  error?: string
  source: CollectionItemSource
}

export const COLLECTION_STORAGE_KEYS = {
  HISTORY: "pagemark_history",
  QUEUE: "pagemark_queue"
} as const

export const STORAGE_QUOTA_BYTES = 10 * 1024 * 1024
export const QUOTA_WARNING_RATIO = 0.8

const textEncoder = new TextEncoder()

export function createCollectionId(prefix = "pm"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function estimateCollectionBytes(items: CollectionItem[]): number {
  return textEncoder.encode(JSON.stringify(items)).length
}

export function getQuotaStatus(historyItems: CollectionItem[], queueItems: CollectionItem[]) {
  const bytes = estimateCollectionBytes(historyItems) + estimateCollectionBytes(queueItems)
  const ratio = bytes / STORAGE_QUOTA_BYTES
  return {
    bytes,
    megabytes: bytes / (1024 * 1024),
    ratio,
    isNearQuota: ratio >= QUOTA_WARNING_RATIO
  }
}

export function normalizeQueueUrl(
  rawInput: string,
  isRestricted: (url: string) => boolean = () => false
): { url: string | null; error?: string } {
  const trimmed = rawInput.trim()
  if (!trimmed) {
    return { url: null, error: "Enter a URL to queue." }
  }
  if (isRestricted(trimmed)) {
    return { url: null, error: "Restricted browser URLs cannot be clipped." }
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
  const candidate = hasScheme ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { url: null, error: "Only http and https URLs are supported." }
    }
    if (isRestricted(parsed.href)) {
      return { url: null, error: "Restricted browser URLs cannot be clipped." }
    }
    return { url: parsed.href }
  } catch {
    return { url: null, error: "Invalid URL format." }
  }
}

export function upsertHistoryItem(
  existing: CollectionItem[],
  pageData: {
    url: string
    title?: string
    author?: string
    date?: string
    markdown: string
  },
  isRestricted: (url: string) => boolean = () => false
): CollectionItem[] {
  if (!pageData.url || !pageData.markdown?.trim() || isRestricted(pageData.url)) {
    return existing
  }

  const now = Date.now()
  const nextItem: CollectionItem = {
    id: createCollectionId("hist"),
    url: pageData.url,
    title: pageData.title || pageData.url,
    author: pageData.author || "",
    date: pageData.date || "",
    markdown: pageData.markdown,
    savedAt: now,
    status: "ready",
    source: "history"
  }

  const existingIndex = existing.findIndex((item) => item.url === pageData.url)
  if (existingIndex !== -1) {
    const updated = {
      ...nextItem,
      id: existing[existingIndex].id
    }
    return [updated, ...existing.filter((_, idx) => idx !== existingIndex)]
  }

  return [nextItem, ...existing]
}

/**
 * Inserts or replaces queue items by URL, keeping the latest item first.
 */
export function upsertQueueItems(
  existing: CollectionItem[],
  incoming: CollectionItem[]
): CollectionItem[] {
  const incomingUrls = new Set(incoming.map((item) => item.url))
  const remaining = existing.filter((item) => !incomingUrls.has(item.url))
  return [...incoming, ...remaining]
}

/**
 * Merges queue and history lists without duplicate URLs, keeping the newest entry.
 */
export function mergeUniqueCollectionItems(
  queueItems: CollectionItem[],
  historyItems: CollectionItem[]
): CollectionItem[] {
  const byUrl = new Map<string, CollectionItem>()
  for (const item of [...queueItems, ...historyItems]) {
    const prev = byUrl.get(item.url)
    if (!prev || item.savedAt > prev.savedAt) {
      byUrl.set(item.url, item)
    }
  }
  return Array.from(byUrl.values()).sort((a, b) => b.savedAt - a.savedAt)
}
