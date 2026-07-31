import { describe, it, expect } from "vitest"
import { isRestrictedUrl, generatePageMap, isUrlWhitelisted } from "./helpers"

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

describe("isUrlWhitelisted", () => {
  it("should return false for empty inputs", () => {
    expect(isUrlWhitelisted("", "google.com")).toBe(false)
    expect(isUrlWhitelisted("https://google.com", "")).toBe(false)
  })

  it("should match simple domain names", () => {
    const whitelist = "google.com, github.com"
    expect(isUrlWhitelisted("https://google.com", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://www.google.com", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://github.com/path", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://other.com", whitelist)).toBe(false)
  })

  it("should handle www and protocols in whitelist", () => {
    const whitelist = "https://www.google.com, http://localhost:3000"
    expect(isUrlWhitelisted("https://google.com", whitelist)).toBe(true)
    expect(isUrlWhitelisted("http://localhost:3000/test", whitelist)).toBe(true)
  })

  it("should support subdomain wildcard matches", () => {
    const whitelist = "*.google.com"
    expect(isUrlWhitelisted("https://sub.google.com", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://sub.sub.google.com", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://google.com", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://othergoogle.com", whitelist)).toBe(false)
  })

  it("should support paths or specific subpages", () => {
    const whitelist = "github.com/rafifmsn/pagemark"
    expect(isUrlWhitelisted("https://github.com/rafifmsn/pagemark", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://github.com/rafifmsn/pagemark/actions", whitelist)).toBe(true)
    expect(isUrlWhitelisted("https://github.com/rafifmsn/other", whitelist)).toBe(false)
  })
})

