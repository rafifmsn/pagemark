import { describe, it, expect } from "vitest"
import { isRestrictedUrl, generatePageMap } from "./helpers"

describe("isRestrictedUrl", () => {
  it("should return true for restricted browser system/extension URLs", () => {
    expect(isRestrictedUrl("about:blank")).toBe(true)
    expect(isRestrictedUrl("chrome://extensions")).toBe(true)
    expect(isRestrictedUrl("edge://settings")).toBe(true)
    expect(isRestrictedUrl("brave://rewards")).toBe(true)
    expect(isRestrictedUrl("moz-extension://some-id/popup.html")).toBe(true)
    expect(isRestrictedUrl("chrome-extension://some-id/options.html")).toBe(true)
    expect(isRestrictedUrl("https://chromewebstore.google.com/detail/pagemark")).toBe(true)
  })

  it("should return false for regular web pages", () => {
    expect(isRestrictedUrl("https://google.com")).toBe(false)
    expect(isRestrictedUrl("https://github.com/rafifmsn/pagemark")).toBe(false)
    expect(isRestrictedUrl("http://localhost:3000")).toBe(false)
  })

  it("should return false for empty or undefined URLs", () => {
    expect(isRestrictedUrl("")).toBe(false)
  })
})

describe("generatePageMap", () => {
  it("should return empty string if no headings are present", () => {
    const md = "This is a simple paragraph without headings.\nAnother line of text."
    expect(generatePageMap(md)).toBe("")
  })

  it("should generate a simple page structure map for flat headings", () => {
    const md = "# Title\n## Section 1\n## Section 2"
    const expected = "# Page Structure Map\n```text\nDocument Structure\n└── Title\n    ├── Section 1\n    └── Section 2\n```\n"
    expect(generatePageMap(md)).toBe(expected)
  })

  it("should generate a hierarchical page structure map for nested headings", () => {
    const md = "# Heading 1\n## Heading 2\n### Heading 3\n## Heading 2.1"
    const expected = "# Page Structure Map\n```text\nDocument Structure\n└── Heading 1\n    ├── Heading 2\n    │   └── Heading 3\n    └── Heading 2.1\n```\n"
    expect(generatePageMap(md)).toBe(expected)
  })
})
