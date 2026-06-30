import { Defuddle } from "defuddle-js"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

export {}

function convertPageToMarkdown() {
  let article: any = null
  try {
    const html = document.documentElement.outerHTML
    article = Defuddle.parse(html, { url: window.location.href })
  } catch (error) {
    console.warn("Defuddle failed to parse this page:", error)
  }

  let htmlContent = ""
  if (article?.content) {
    htmlContent = article.content
  } else {
    htmlContent = document.body.innerHTML
  }

  // Initialize Turndown service
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

  // Use GFM
  try {
    turndownService.use(gfm)
  } catch (err) {
    console.error("Failed to load GFM plugin:", err)
  }

  // Add custom cleanLinks rule
  turndownService.addRule("cleanLinks", {
    filter: "a",
    replacement: function (content, node) {
      const element = node as HTMLAnchorElement
      const href = element.getAttribute("href")
      if (!href) return content

      // Clean link content: replace newlines with space, collapse multiple spaces, trim
      const cleanContent = content.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim()
      if (!cleanContent) return ""

      const title = element.getAttribute("title") || ""
      const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : ""

      return `[${cleanContent}](${href}${titlePart})`
    }
  })

  // Add custom cleanGFMTable rule
  turndownService.addRule("cleanGFMTable", {
    filter: "table",
    replacement: function (content, node) {
      const element = node as HTMLTableElement
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

      // Build alignment separators
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
    markdown = article?.textContent || document.body.innerText || ""
  }

  const pageData = {
    markdown: markdown,
    title: article?.title || document.title || "",
    author: article?.author || "",
    date: article?.datePublished || "",
    url: window.location.href || ""
  }

  chrome.storage.local.set({ pageData }, () => {
    if (chrome.runtime.lastError) {
      console.error("Failed to save page data:", chrome.runtime.lastError)
    }
    chrome.runtime.sendMessage({ action: "page-converted", pageData }).catch(() => {
      // Ignore errors when nobody is listening
    })
  })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convert-to-markdown") {
    convertPageToMarkdown()
  }
})
