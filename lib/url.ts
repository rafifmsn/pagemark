/**
 * Checks if a URL is restricted by the browser (internal pages, extensions, web store).
 */
export function isRestrictedUrl(url: string): boolean {
  if (!url) return false
  return (
    url.startsWith("about:") ||
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("brave://") ||
    url.startsWith("moz-extension://") ||
    url.startsWith("chrome-extension://") ||
    url.includes("chromewebstore.google.com")
  )
}

/**
 * Checks if a URL matches any rule in a comma-separated whitelist string.
 * Supports exact domains, wildcards (*.example.com), and path-based match rules.
 */
export function isUrlWhitelisted(url: string, whitelistString: string): boolean {
  if (!url || !whitelistString) return false

  const rules = whitelistString
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean)

  if (rules.length === 0) return false

  let hostname = ""
  try {
    const parsed = new URL(url)
    hostname = parsed.host.toLowerCase()
  } catch {
    hostname = url.toLowerCase()
  }

  const [domainOnly] = hostname.split(":")
  const normalizeHost = (host: string) => host.replace(/^(www\.)?/, "")
  const cleanUrlHost = normalizeHost(domainOnly)

  for (const rule of rules) {
    let cleanRule = rule.toLowerCase()
    cleanRule = cleanRule.replace(/^(https?:\/\/)?(www\.)?/, "")

    if (cleanRule.includes("/")) {
      const cleanFullUrl = url
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, "")

      if (cleanRule.includes("*")) {
        const regexStr =
          "^" +
          cleanRule.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
          "$"
        const regex = new RegExp(regexStr)
        if (regex.test(cleanFullUrl)) {
          return true
        }
      } else if (
        cleanFullUrl.startsWith(cleanRule) ||
        url.toLowerCase().includes(rule.toLowerCase())
      ) {
        return true
      }
      continue
    }

    if (cleanRule.startsWith("*.")) {
      const baseDomain = cleanRule.slice(2)
      if (domainOnly === baseDomain || domainOnly.endsWith("." + baseDomain)) {
        return true
      }
    } else {
      if (cleanRule.includes(":")) {
        if (hostname === cleanRule) {
          return true
        }
      } else {
        if (cleanUrlHost === cleanRule) {
          return true
        }
      }
    }
  }

  return false
}

