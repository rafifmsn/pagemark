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

interface HeadingNode {
  text: string
  level: number
  children: HeadingNode[]
}

export function generatePageMap(
  markdown: string,
  title: string = "Document Structure"
): string {
  const lines = markdown.split("\n")
  const headings: { level: number; text: string }[] = []

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim() })
    }
  })

  if (headings.length === 0) return ""

  const root: HeadingNode = { text: title, level: 0, children: [] }
  const stack: HeadingNode[] = [root]

  headings.forEach((h) => {
    const node: HeadingNode = { text: h.text, level: h.level, children: [] }
    while (stack.length > 1 && stack[stack.length - 1].level >= h.level) {
      stack.pop()
    }
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  })

  let mapStr = `${title}\n`

  function renderNode(
    node: HeadingNode,
    prefix: string,
    isLast: boolean,
    isRoot: boolean
  ) {
    if (!isRoot) {
      const connector = isLast ? "└── " : "├── "
      mapStr += `${prefix}${connector}${node.text}\n`

      if (node.children.length > 0) {
        const childPrefix = prefix + (isLast ? "    " : "│   ")
        node.children.forEach((child, index) => {
          renderNode(
            child,
            childPrefix,
            index === node.children.length - 1,
            false
          )
        })
      }
    } else {
      node.children.forEach((child, index) => {
        renderNode(child, "", index === node.children.length - 1, false)
      })
    }
  }

  renderNode(root, "", true, true)
  mapStr = mapStr.replace(/│\n$/g, "").trimEnd()

  return "# Page Structure Map\n```text\n" + mapStr + "\n```\n"
}

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

  const normalizeHost = (host: string) => host.replace(/^(www\.)?/, "")
  const cleanUrlHost = normalizeHost(hostname)

  for (const rule of rules) {
    let cleanRule = rule.toLowerCase()

    // Strip protocol and www
    cleanRule = cleanRule.replace(/^(https?:\/\/)?(www\.)?/, "")

    if (cleanRule.includes("/")) {
      const cleanFullUrl = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "")
      if (cleanRule.includes("*")) {
        const regexStr = "^" + cleanRule.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
        const regex = new RegExp(regexStr)
        if (regex.test(cleanFullUrl)) {
          return true
        }
      } else if (cleanFullUrl.startsWith(cleanRule) || url.toLowerCase().includes(rule.toLowerCase())) {
        return true
      }
      continue
    }

    if (cleanRule.startsWith("*.")) {
      const baseDomain = cleanRule.slice(2)
      if (cleanUrlHost === baseDomain || cleanUrlHost.endsWith("." + baseDomain)) {
        return true
      }
    } else {
      if (cleanUrlHost === cleanRule || hostname === cleanRule) {
        return true
      }
    }
  }

  return false
}
