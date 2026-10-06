import test, { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parseHTML } from "linkedom"

// Shim browser DOM globals so Turndown and Defuddle can run in Node tests
const dom = parseHTML("<html><body></body></html>")
globalThis.window = dom.window as any
globalThis.document = dom.document as any
globalThis.HTMLElement = dom.HTMLElement as any
globalThis.Node = dom.Node as any
globalThis.NodeFilter = dom.NodeFilter as any

import { isRestrictedUrl, isUrlWhitelisted } from "./lib/url.ts"
import {
  parseHtmlToMarkdown,
  formatMarkdown,
  generatePageMap,
  slugify,
  stripImagesFromMarkdown,
  stripLinksFromMarkdown,
  stripCodeBlocksFromMarkdown,
  stripTablesFromMarkdown
} from "./lib/parser.ts"

describe("URL Guard - isRestrictedUrl", () => {
  it("should return true for internal browser schemes and web store", () => {
    assert.equal(isRestrictedUrl("about:blank"), true)
    assert.equal(isRestrictedUrl("chrome://extensions"), true)
    assert.equal(isRestrictedUrl("edge://settings"), true)
    assert.equal(isRestrictedUrl("brave://rewards"), true)
    assert.equal(isRestrictedUrl("moz-extension://some-uuid/popup.html"), true)
    assert.equal(isRestrictedUrl("chrome-extension://some-uuid/options.html"), true)
    assert.equal(isRestrictedUrl("https://chromewebstore.google.com/detail/pagemark"), true)
  })

  it("should return false for regular web URLs", () => {
    assert.equal(isRestrictedUrl("https://google.com"), false)
    assert.equal(isRestrictedUrl("https://github.com/rafifmsn/pagemark"), false)
    assert.equal(isRestrictedUrl("http://localhost:3000"), false)
  })

  it("should return false for empty string", () => {
    assert.equal(isRestrictedUrl(""), false)
  })
})

describe("URL Whitelist - isUrlWhitelisted", () => {
  it("should return false for empty input", () => {
    assert.equal(isUrlWhitelisted("", "google.com"), false)
    assert.equal(isUrlWhitelisted("https://google.com", ""), false)
  })

  it("should match simple domain names", () => {
    const list = "google.com, github.com"
    assert.equal(isUrlWhitelisted("https://google.com", list), true)
    assert.equal(isUrlWhitelisted("https://www.google.com", list), true)
    assert.equal(isUrlWhitelisted("https://github.com/rafifmsn", list), true)
    assert.equal(isUrlWhitelisted("https://otherdomain.com", list), false)
  })

  it("should support wildcard subdomains", () => {
    const list = "*.google.com"
    assert.equal(isUrlWhitelisted("https://mail.google.com", list), true)
    assert.equal(isUrlWhitelisted("https://docs.google.com", list), true)
    assert.equal(isUrlWhitelisted("https://google.com", list), true)
    assert.equal(isUrlWhitelisted("https://othergoogle.com", list), false)
  })

  it("should match URL paths with or without wildcards", () => {
    const list = "github.com/rafifmsn/pagemark*"
    assert.equal(isUrlWhitelisted("https://github.com/rafifmsn/pagemark", list), true)
    assert.equal(isUrlWhitelisted("https://github.com/rafifmsn/pagemark/pulls", list), true)
    assert.equal(isUrlWhitelisted("https://github.com/rafifmsn/another-repo", list), false)
  })
})

describe("Parser & Utilities - slugify and page maps", () => {
  it("should slugify heading text correctly", () => {
    assert.equal(slugify("Hello World!"), "hello-world")
    assert.equal(slugify("Feature 1: Quick & Easy"), "feature-1-quick-easy")
  })

  it("should return empty string when markdown has no headings", () => {
    assert.equal(generatePageMap("Just simple text without headings"), "")
  })

  it("should generate page structure outline correctly", () => {
    const md = "# Title\n## Section 1\n### Subsection 1.1\n## Section 2"
    const map = generatePageMap(md)
    assert.ok(map.includes("# Page Structure Map"))
    assert.ok(map.includes("Section 1"))
    assert.ok(map.includes("Subsection 1.1"))
    assert.ok(map.includes("Section 2"))
  })
})

describe("Markdown Strippers", () => {
  it("should strip markdown images", () => {
    const md = "Before ![alt text](https://example.com/img.png) After"
    assert.equal(stripImagesFromMarkdown(md).trim(), "Before  After")
  })

  it("should strip hyperlinks while keeping text", () => {
    const md = "Visit [Google](https://google.com) today."
    assert.equal(stripLinksFromMarkdown(md), "Visit Google today.")
  })

  it("should strip fenced code blocks", () => {
    const md = "Text before\n```ts\nconst x = 1\n```\nText after"
    assert.equal(stripCodeBlocksFromMarkdown(md), "Text before\nText after")
  })

  it("should strip markdown tables", () => {
    const md = "Header\n| A | B |\n|---|---|\n| 1 | 2 |\nFooter"
    assert.equal(stripTablesFromMarkdown(md), "Header\nFooter")
  })
})

describe("End-to-End Extraction - parseHtmlToMarkdown & formatMarkdown", () => {
  it("should extract article HTML to clean markdown", () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Article Title</title></head>
        <body>
          <article>
            <h1>Test Article Title</h1>
            <p>This is the first paragraph with a <a href="https://example.com">link</a>.</p>
          </article>
        </body>
      </html>
    `

    const result = parseHtmlToMarkdown(html, {
      url: "https://example.com/article",
      parseHtml: (h) => parseHTML(h).document
    })

    assert.equal(result.title, "Test Article Title")
    assert.ok(result.markdown.includes("This is the first paragraph with a [link](https://example.com)."))
  })

  it("should format markdown with front matter and options", () => {
    const raw = "## Section\nContent here."
    const formatted = formatMarkdown(
      raw,
      {
        title: "My Doc",
        url: "https://example.com/doc",
        date: new Date("2026-10-06T12:00:00Z")
      },
      {
        showTitle: true,
        showSourceUrl: true,
        showDate: true
      }
    )

    assert.ok(formatted.includes('title: "My Doc"'))
    assert.ok(formatted.includes('source: "https://example.com/doc"'))
    assert.ok(formatted.includes("date: "))
    assert.ok(formatted.includes("## Section\nContent here."))
  })
})

