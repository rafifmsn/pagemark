import { useEffect, useState } from "react"
import { isRestrictedUrl } from "pagemark-core"
import { PM_MESSAGES } from "~/lib/messages"

export function usePageData() {
  const [pageData, setPageData] = useState<any>(null)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [hasHostPermission, setHasHostPermission] = useState(true)

  const checkHostPermission = () => {
    if (typeof chrome !== "undefined" && chrome.permissions) {
      chrome.permissions.contains({ origins: ["<all_urls>"] }, (result) => {
        setHasHostPermission(!!result)
      })
    }
  }

  const requestHostPermission = () => {
    if (typeof chrome !== "undefined" && chrome.permissions) {
      chrome.permissions.request({ origins: ["<all_urls>"] }, (granted) => {
        if (granted) {
          setHasHostPermission(true)
          triggerConversion()
        }
      })
    }
  }

  const triggerConversion = () => {
    setStatus("Clipping...")
    setError("")
    checkHostPermission()
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
          setError(chrome.runtime.lastError.message || "Failed to query tabs")
          setStatus("")
          return
        }
        const activeTab = tabs?.[0]
        if (activeTab?.url && isRestrictedUrl(activeTab.url)) {
          setError(
            "This page cannot be clipped (restricted browser system page)."
          )
          setStatus("")
          return
        }
        if (activeTab?.id) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: PM_MESSAGES.CONVERT },
            (response) => {
              if (chrome.runtime?.lastError) {
                setStatus("")
              }
            }
          )
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
    checkHostPermission()
    triggerConversion()

    let handleStorageChange: any = null
    let handleMessage: any = null
    let tabActivatedListener: any = null
    let tabUpdatedListener: any = null

    if (typeof chrome !== "undefined") {
      if (chrome.storage?.local) {
        chrome.storage.local.get(["pageData"], (result) => {
          if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
            setError(chrome.runtime.lastError.message || "Failed to load")
          } else if (result && result.pageData) {
            setPageData(result.pageData)
          }
        })

        handleStorageChange = (changes: any, areaName: string) => {
          if (areaName === "local" && changes && changes.pageData?.newValue) {
            setPageData(changes.pageData.newValue)
            setStatus("")
          }
        }
        chrome.storage.onChanged.addListener(handleStorageChange)

        handleMessage = (msg: any, sender: any, sendResponse: any) => {
          if (msg && msg.action === PM_MESSAGES.PAGE_CONVERTED && msg.pageData) {
            setPageData(msg.pageData)
            setStatus("")
          } else if (msg && msg.action === PM_MESSAGES.TOGGLE_SIDEPANEL) {
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

  return {
    pageData,
    status,
    setStatus,
    error,
    setError,
    hasHostPermission,
    requestHostPermission,
    triggerConversion
  }
}
