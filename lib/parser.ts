import { Defuddle } from "defuddle-js"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

export interface PagemarkOptions {
  url?: string
  includeImages?: boolean
  includeLinks?: boolean
  showTitle?: boolean
  showDate?: boolean
  showSourceUrl?: boolean
  includeCodeBlocks?: boolean
  includeTables?: boolean
  parseHtml?: (html: string) => any
}

export interface PagemarkResult {
  markdown: string
  title: string
  author: string
  date: string
  url: string
}

export interface FormatOptions {
  includeImages?: boolean
  includeLinks?: boolean
  includeCodeBlocks?: boolean
  includeTables?: boolean
  showTitle?: boolean
  showDate?: boolean
  showSourceUrl?: boolean
  showPageMap?: boolean
  pageMapExcludeH1?: boolean
  pageMapCollapseGaps?: boolean
  pageMapStyle?: "text" | "links"
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function generatePageMap(
  markdown: string,
  options?: {
    excludeH1?: boolean
    collapseGaps?: boolean
    style?: "text" | "links"
  }
): string {
  const excludeH1 = options?.excludeH1 ?? true
  const collapseGaps = options?.collapseGaps ?? true
  const style = options?.style ?? "text"

  const lines = markdown.split("\n")
  const headings: { level: number; text: string }[] = []
  let insideCodeBlock = false

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      insideCodeBlock = !insideCodeBlock
      return
    }
    if (insideCodeBlock) return

    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      if (excludeH1 && level === 1) return
      headings.push({ level, text: match[2].trim() })
    }
  })

  if (headings.length === 0) return ""

  let outlineStr = ""

  if (collapseGaps) {
    const lastLevelAtOriginal: Record<number, number> = {}
    let lastOriginalLevel = 0
    let lastNormalizedLevel = 0

    const normalizedHeadings = headings.map((h, index) => {
      let normalizedLevel = 1

      if (index === 0) {
        normalizedLevel = 1
      } else if (h.level === lastOriginalLevel) {
        normalizedLevel = lastNormalizedLevel
      } else if (h.level > lastOriginalLevel) {
        normalizedLevel = lastNormalizedLevel + 1
      } else {
        let found = false
        for (let L = h.level; L >= 1; L--) {
          if (lastLevelAtOriginal[L] !== undefined) {
            normalizedLevel = lastLevelAtOriginal[L]
            found = true
            break
          }
        }
        if (!found) {
          normalizedLevel = 1
        }
      }

      lastLevelAtOriginal[h.level] = normalizedLevel
      lastOriginalLevel = h.level
      lastNormalizedLevel = normalizedLevel

      return { level: normalizedLevel, text: h.text }
    })

    normalizedHeadings.forEach((h) => {
      const indent = "  ".repeat(h.level - 1)
      if (style === "links") {
        outlineStr += `${indent}- [${h.text}](#${slugify(h.text)})\n`
      } else {
        outlineStr += `${indent}- ${h.text}\n`
      }
    })
  } else {
    let lastLevel = 0
    headings.forEach((h) => {
      const current = h.level
      if (current > lastLevel + 1) {
        for (let L = lastLevel + 1; L < current; L++) {
          const indent2 = "  ".repeat(L - 1)
          if (style === "links") {
            outlineStr += `${indent2}- [Missing Heading ${L}](#)\n`
          } else {
            outlineStr += `${indent2}- [Missing Heading ${L}]\n`
          }
        }
      }

      const indent = "  ".repeat(current - 1)
      if (style === "links") {
        outlineStr += `${indent}- [${h.text}](#${slugify(h.text)})\n`
      } else {
        outlineStr += `${indent}- ${h.text}\n`
      }

      lastLevel = current
    })
  }

  if (style === "links") {
    return "# Page Structure Map\n" + outlineStr
  } else {
    return "# Page Structure Map\n```text\n" + outlineStr.trimEnd() + "\n```\n"
  }
}

export function formatLocalDateTime(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, "0")
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  const offsetMinutes = date.getTimezoneOffset()
  const offsetAbs = Math.abs(offsetMinutes)
  const offsetHours = pad(Math.floor(offsetAbs / 60))
  const offsetRemainingMinutes = pad(offsetAbs % 60)
  const sign = offsetMinutes <= 0 ? "+" : "-"

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainingMinutes}`
}

export function generateFrontMatter(options: {
  title?: string
  date?: Date
  url?: string
  showTitle?: boolean
  showDate?: boolean
  showSourceUrl?: boolean
}): string {
  const metaLines: string[] = []

  if (options.showTitle && options.title) {
    metaLines.push(`title: "${options.title.replace(/"/g, '\\"')}"`)
  }

  if (options.showDate) {
    const d = options.date || new Date()
    metaLines.push(`date: "${formatLocalDateTime(d)}"`)
  }

  if (options.showSourceUrl && options.url) {
    metaLines.push(`source: "${options.url}"`)
  }

  if (metaLines.length === 0) return ""

  return `---\n${metaLines.join("\n")}\n---\n\n`
}

export function stripImagesFromMarkdown(markdown: string): string {
  let clean = markdown.replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
  clean = clean.replace(/<img[^>]*>/gi, "")
  return clean
}

export function stripLinksFromMarkdown(markdown: string): string {
  let clean = markdown.replace(/(?<!\!)\[([^\]]+)\]\([^)]+\)/g, "$1")
  clean = clean.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
  return clean
}

export function stripCodeBlocksFromMarkdown(markdown: string): string {
  const lines = markdown.split("\n")
  const cleanLines: string[] = []
  let insideCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
      insideCodeBlock = !insideCodeBlock
      continue
    }
    if (!insideCodeBlock) {
      cleanLines.push(line)
    }
  }

  return cleanLines.join("\n")
}

export function stripTablesFromMarkdown(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => !line.trim().startsWith("|"))
    .join("\n")
}

export function formatMarkdown(
  rawMarkdown: string,
  metadata: {
    title?: string
    url?: string
    date?: Date
  },
  options: FormatOptions
): string {
  let md = rawMarkdown

  if (options.includeImages === false) {
    md = stripImagesFromMarkdown(md)
  }
  if (options.includeLinks === false) {
    md = stripLinksFromMarkdown(md)
  }
  if (options.includeCodeBlocks === false) {
    md = stripCodeBlocksFromMarkdown(md)
  }
  if (options.includeTables === false) {
    md = stripTablesFromMarkdown(md)
  }

  let finalMd = ""

  if (options.showTitle || options.showDate || options.showSourceUrl) {
    finalMd += generateFrontMatter({
      title: metadata.title,
      url: metadata.url,
      date: metadata.date,
      showTitle: options.showTitle,
      showDate: options.showDate,
      showSourceUrl: options.showSourceUrl
    })
  }

  if (options.showPageMap) {
    const pageMap = generatePageMap(md, {
      excludeH1: options.pageMapExcludeH1,
      collapseGaps: options.pageMapCollapseGaps,
      style: options.pageMapStyle
    })
    if (pageMap) {
      finalMd += pageMap + "---\n\n"
    }
  }

  finalMd += md
  finalMd = finalMd.replace(/^[ \t]*[-·][ \t]*$/gm, "")
  finalMd = finalMd.replace(/^[ \t]+$/gm, "")
  finalMd = finalMd.replace(/\n{3,}/g, "\n\n").trim()

  return finalMd
}

export function parseHtmlToMarkdown(
  html: string,
  options?: PagemarkOptions
): PagemarkResult {
  let article: any = null
  try {
    article = Defuddle.parse(html, {
      url: options?.url || "",
      ...(options?.parseHtml ? { parseHtml: options.parseHtml } : {})
    })
  } catch (error) {
    console.warn("Defuddle failed to parse page:", error)
  }

  let htmlContent = ""
  if (article?.content) {
    htmlContent = article.content
  } else {
    htmlContent = html
  }

  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "referenced",
    linkReferenceStyle: "full"
  })

  try {
    turndownService.use(gfm)
  } catch (err) {
    console.error("Failed to load GFM plugin:", err)
  }

  if (options?.includeImages === false) {
    turndownService.remove("img")
  }

  if (options?.includeCodeBlocks === false) {
    turndownService.remove("pre")
  }

  if (options?.includeTables === false) {
    turndownService.remove("table")
  }

  if (options?.includeLinks === false) {
    turndownService.addRule("stripLinks", {
      filter: "a",
      replacement: function (content) {
        return content.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim()
      }
    })
  } else {
    turndownService.addRule("cleanLinks", {
      filter: "a",
      replacement: function (content, node) {
        const element = node as HTMLElement
        const href = element.getAttribute("href")
        if (!href) return content

        const cleanContent = content
          .replace(/\r?\n/g, " ")
          .replace(/\s+/g, " ")
          .trim()
        if (!cleanContent) return ""

        const title = element.getAttribute("title") || ""
        const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : ""
        return `[${cleanContent}](${href}${titlePart})`
      }
    })
  }

  turndownService.addRule("cleanGFMTable", {
    filter: "table",
    replacement: function (_content, node) {
      const element = node as HTMLElement
      const rows = Array.from(element.querySelectorAll("tr")).filter(
        (tr) => tr.closest("table") === element
      )

      const markdownRows: string[] = []
      let colCount = 0

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const cells = Array.from(row.querySelectorAll("th, td")).filter(
          (cell) => cell.closest("tr") === row
        )

        if (cells.length === 0) continue

        if (cells.length > colCount) {
          colCount = cells.length
        }

        const cellTexts = cells.map((cell) => {
          const cellClone = cell.cloneNode(true) as HTMLElement
          const imgs = Array.from(cellClone.querySelectorAll("img"))
          imgs.forEach((img) => img.remove())

          let cellText = turndownService.turndown(cellClone.innerHTML || "")
          cellText = cellText
            .replace(/\r?\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/\|/g, "\\|")
            .trim()
          return cellText
        })

        markdownRows.push("| " + cellTexts.join(" | ") + " |")
      }

      if (markdownRows.length === 0) return ""

      const firstRow = rows[0]
      const firstRowCells = Array.from(firstRow.querySelectorAll("th, td")).filter(
        (cell) => cell.closest("tr") === firstRow
      )

      const alignments = firstRowCells.map((cell) => {
        const align = cell.getAttribute("align") || ""
        if (align === "left") return ":---"
        if (align === "right") return "---:"
        if (align === "center") return ":---:"
        return "---"
      })

      while (alignments.length < colCount) {
        alignments.push("---")
      }

      const separatorRow = "| " + alignments.join(" | ") + " |"
      const finalRows = [markdownRows[0], separatorRow, ...markdownRows.slice(1)]

      return "\n\n" + finalRows.join("\n") + "\n\n"
    }
  })

  let markdown = ""
  try {
    markdown = turndownService.turndown(htmlContent)
  } catch (err) {
    console.error("Turndown conversion failed:", err)
    markdown = html
  }

  if (options?.showTitle || options?.showDate || options?.showSourceUrl) {
    const frontMatter = generateFrontMatter({
      title: article?.title || "",
      url: options?.url,
      showTitle: options?.showTitle,
      showDate: options?.showDate,
      showSourceUrl: options?.showSourceUrl
    })
    markdown = frontMatter + markdown
  }

  return {
    markdown,
    title: article?.title || "",
    author: article?.author || "",
    date: article?.datePublished || "",
    url: options?.url || ""
  }
}

