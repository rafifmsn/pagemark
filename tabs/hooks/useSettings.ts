import { useEffect, useState } from "react"

export interface PagemarkSettings {
  includeImages: boolean
  includeLinks: boolean
  showMetadata: boolean
  showSourceUrl: boolean
  showPageMap: boolean
  autoCopy: boolean
  whitelist: string
}

const DEFAULT_SETTINGS: PagemarkSettings = {
  includeImages: false,
  includeLinks: true,
  showMetadata: true,
  showSourceUrl: true,
  showPageMap: true,
  autoCopy: false,
  whitelist: ""
}

export function usePagemarkSettings() {
  const [toggles, setToggles] = useState<PagemarkSettings>(DEFAULT_SETTINGS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["pagemark_settings"], (result) => {
        if (result && result.pagemark_settings) {
          setToggles((prev) => ({
            ...prev,
            ...result.pagemark_settings
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
