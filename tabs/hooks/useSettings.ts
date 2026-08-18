import { useEffect, useState } from "react"

export interface PagemarkSettings {
  includeImages: boolean
  includeLinks: boolean
  includeCodeBlocks: boolean
  includeTables: boolean
  showTitle: boolean
  showDate: boolean
  showSourceUrl: boolean
  showPageMap: boolean
  pageMapStyle: "text" | "links"
  webhookUrl: string
  webhookHeaders: Array<{ key: string; value: string }>
  autoCopy: boolean
  autoWebhook: boolean
  whitelist: string
}

const DEFAULT_SETTINGS: PagemarkSettings = {
  includeImages: false,
  includeLinks: true,
  includeCodeBlocks: true,
  includeTables: true,
  showTitle: true,
  showDate: true,
  showSourceUrl: true,
  showPageMap: true,
  pageMapStyle: "text",
  webhookUrl: "",
  webhookHeaders: [],
  autoCopy: false,
  autoWebhook: false,
  whitelist: ""
}

export function usePagemarkSettings() {
  const [toggles, setToggles] = useState<PagemarkSettings>(DEFAULT_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["pagemark_settings"], (result) => {
        if (result && result.pagemark_settings) {
          const loaded = { ...result.pagemark_settings }
          // Migrate showMetadata to showTitle and showDate
          if (loaded.showMetadata !== undefined) {
            if (loaded.showTitle === undefined) {
              loaded.showTitle = loaded.showMetadata
            }
            if (loaded.showDate === undefined) {
              loaded.showDate = loaded.showMetadata
            }
            delete loaded.showMetadata
          }
          setToggles((prev) => ({
            ...prev,
            ...loaded
          }))
        }
        setSettingsLoaded(true)
      })
    } else {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (
      settingsLoaded &&
      typeof chrome !== "undefined" &&
      chrome.storage?.local
    ) {
      chrome.storage.local.set({ pagemark_settings: toggles })
    }
  }, [toggles, settingsLoaded])

  const handleToggle = (key: keyof PagemarkSettings) => {
    setToggles((p) => ({ ...p, [key]: !p[key] }))
  }

  const setWhitelist = (val: string) => {
    setToggles((p) => ({ ...p, whitelist: val }))
  }

  return {
    toggles,
    setToggles,
    handleToggle,
    setWhitelist,
    settingsLoaded
  }
}
