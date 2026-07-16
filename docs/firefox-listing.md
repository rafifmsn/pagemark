# Firefox Add-on Store Submission Guide

Here are the complete answers and listing descriptions for submitting Pagemark to the Firefox Add-on (AMO) Store.

---

## 1. Describe Add-on

### Name
```text
Pagemark
```

### Summary
```text
Convert any webpage into clean, LLM-ready Markdown with one click. Strip the clutter, preserve the layout, and copy or download instantly.
```

### Description
```markdown
The AI-Ready Markdown Web Clipper. Use Pagemark to turn any website into structured, clean Markdown context in just 1 click!

Pagemark turns complex webpages into clean, optimized Markdown instantly — no ads, no clutter, no broken layouts, and no server lags. Just click and copy.

Designed specifically for AI engineers, developers, writers, and researchers, Pagemark acts as the ultimate bridge between the web and Large Language Models (LLMs). It perfectly prepares web documentation, articles, and code blocks so ChatGPT, Claude, DeepSeek, and Gemini can read them seamlessly without wasting your API token limits.

Whether you need to feed clean documentation into an AI prompt, save tutorials to your personal knowledge base, or archive reference material offline, Pagemark handles it flawlessly.

100% Free local processing with zero data tracking. Export to Markdown file, clean plaintext, or LLM-optimized prompt wrappers instantly.

---------------------------------------------------------------------------------------

### Features

⚡ Smart Readability Parser
- Zero server wait times. Isolates the main body text, articles, and code blocks automatically, so you never copy-paste manually again.
- Strips away distracting navigation menus, tracking banners, popups, cookie consent forms, and footer boilerplate instantly.
- Local execution ensures maximum speed and total offline capability.

📁 Native Sidebar Workspace
- The conversion happens directly in your browser's native sidebar, letting you view, edit, and preview your Markdown side-by-side with the live source webpage.
- No context switching or flipping back and forth between tabs.

📝 Plaintext Editor & Live Preview Counter
- Switch fluidly between a raw Markdown code editor and a fully rendered, clean visual preview with responsive data tables.
- Real-time character and token counters help you gauge exact size limits before pasting into AI interfaces.

⚙️ Persistent Layout Preferences
- Customize and auto-save your extraction settings for a perfectly tailored workflow:
  • Toggle Images: Choose to preserve critical graphic tags or completely strip them out.
  • Toggle Links: Keep active hyperlinks for reference or instantly flatten them to plaintext.
  • Metadata Headers: Auto-inject page title, source URL, and timezone-aware timestamps.
  • Outline Map: Generate a hierarchical tree structure outline of page headers instantly.

📥 Versatile Prompt & Export Utilities
- Copy MD: Grab raw, standardized Markdown to your clipboard in milliseconds.
- Copy as Prompt: Automatically wraps the text in an error-free code block container, preventing nested triple-backticks from breaking ChatGPT/Claude parser interfaces.
- Download File: Save the structured output natively as a standalone .md file.

---------------------------------------------------------------------------------------

### 🛡️ Why Pagemark?

✅ 1-click simplicity — instant sidebar access via mouse or keyboard shortcuts (Alt + K)
✅ 100% Privacy First — processed entirely locally inside your browser; no server logs
✅ Smart LLM Wrapping — custom formatting to prevent nested markdown parsing syntax errors
✅ Zero Subscriptions — no rate limits, no daily credits, and no paywalls
✅ Works Offline — complete security for enterprise intranet pages and secure local environments
```

---

## 2. Options & Metadata

- **Is this add-on experimental?**: No
- **Requires payment / non-free services?**: No
- **Categories**: Select up to 3:
  1. **Web Development**
  2. **Search Tools**
  3. **Bookmarks**
- **Support email**: `rafif@rafifmsn.com`
- **Support website**: `https://github.com/rafifmsn/pagemark`
- **License**: `MIT License`

---

## 3. Privacy Policy
- **Does this add-on have a Privacy Policy?**: Yes
- **Privacy Policy Content**:
```text
Pagemark is committed to protecting your privacy. The extension does not collect, store, or transmit any user data, personal information, or browsing history to external servers.

- Website Content: The extension temporarily accesses the HTML text and hyperlink content of your active tab solely to perform local readability parsing and convert the webpage into Markdown.
- Local Scope: This data processing happens entirely on your local machine. No webpage content is ever transmitted over the network or shared with third-party services.
- Storage Permissions: The extension uses the local storage API to save your layout preferences (such as toggling image tags or links) and the last converted page content. All data remains isolated within your browser profile on your device and is never synced externally.
```

---

## 4. Notes to Reviewer

```text
This extension is built from open-source code using the Plasmo extension framework (React + TypeScript).

To build the extension from the source package and generate an exact copy of the submitted code:
1. Extract the source code archive.
2. Install the package dependencies using npm:
   npm install
3. Run the production build command for Firefox MV3:
   npm run build:firefox
4. The production build ZIP file and unpacked manifest will be generated in:
   build/firefox-mv3-prod/

The source code repository is public at: https://github.com/rafifmsn/pagemark
```
