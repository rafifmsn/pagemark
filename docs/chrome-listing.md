# Chrome Web Store Description

```text
The AI-Ready Markdown Web Clipper. Use Pagemark to turn any website into structured, clean Markdown context in just 1 click!

Pagemark turns complex webpages into clean, optimized Markdown instantly — no ads, no clutter, no broken layouts, and no server lags. Just click and copy.

Designed specifically for AI engineers, developers, writers, and researchers, Pagemark acts as the ultimate bridge between the web and Large Language Models (LLMs). It perfectly prepares web documentation, articles, and code blocks so ChatGPT, Claude, DeepSeek, and Gemini can read them seamlessly without wasting your API token limits.

Whether you need to feed clean documentation into an AI prompt, save tutorials to your personal knowledge base, or archive reference material offline, Pagemark handles it flawlessly.

100% Free local processing with zero data tracking. Export to Markdown file, clean plaintext, or LLM-optimized prompt wrappers instantly.

---------------------------------------------------------------------------------------

Features

⚡ Smart Readability Parser
- Zero server wait times. Isolates the main body text, articles, and code blocks automatically, so you never copy-paste manually again.
- Strips away distracting navigation menus, tracking banners, popups, cookie consent forms, and footer boilerplate instantly.
- Local execution ensures maximum speed and total offline capability.

📁 Native Side Panel Workspace
- The conversion happens directly in your browser's side panel, letting you view, edit, and preview your Markdown side-by-side with the live source webpage.
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

Popular Use Cases

🤖 AI Context & Prompt Feeding
Clean up extensive API documentation and long-form essays before feeding them into LLMs like ChatGPT, Claude, and Gemini to drastically reduce token usage and prevent hallucinated answers.

📚 Personal Knowledge Management (PKM)
Clip web research, recipes, coding tutorials, or technical guides directly into your favorite second-brain applications like Obsidian, Notion, Logseq, or Bear.

💻 Developer Code Reference
Easily convert cluttered developer documentation, GitHub readmes, and blog posts into structured offline files with perfectly formatted syntax highlighting.

---------------------------------------------------------------------------------------

🛡️ Why Pagemark?

✅ 1-click simplicity — instant sidebar access via mouse or keyboard shortcuts
✅ 100% Privacy First — processed entirely locally inside your browser; no server logs
✅ Smart LLM Wrapping — custom formatting to prevent nested markdown parsing syntax errors
✅ Zero Subscriptions — no rate limits, no daily credits, and no paywalls
✅ Works Offline — complete security for enterprise intranet pages and secure local environments
```

# Chrome Web Store Publisher Answers

## 1. Permission Justifications

### sidePanel justification
```text
The sidePanel permission is used to host the extension's user interface within the native browser side panel. This allows the user to view, edit, and preview the generated Markdown right next to their active webpage context without disrupting their browsing flow.
```

### activeTab justification
```text
The activeTab permission is used to securely access the active browser tab when the user triggers the extension (via the hotkey, extension icon, or context menu). This allows the extension to extract and convert the current page's HTML structure to Markdown safely without needing broad permanent access to the user's browsing history.
```

### contextMenus justification
```text
The contextMenus permission is used to add a "Pagemark this page" option to the right-click context menu. This provides the user with a quick, native way to trigger the markdown conversion on any webpage they are currently viewing.
```

### storage justification
```text
The storage permission is used to persist the user's layout preferences (such as toggling image tags, keeping active links, or prepending headers) locally within the browser, ensuring their preferred configuration is maintained across browser restarts.
```

### Host permission justification
```text
The `<all_urls>` match pattern is required to inject the content script onto the active webpage when requested. This allows the extension to retrieve the HTML structure of the current webpage and perform local markdown conversion, regardless of the website's domain.
```

---

## 2. Remote Code Declaration

Are you using remote code?
* Select: **No, I am not using Remote code**

---

## 3. Data Usage & Disclosures

### What user data do you plan to collect from users now or in the future?
* **Website content** (e.g. text, images, sounds, videos, or hyperlinks): **Check this box**
* All other categories (Personally identifiable info, Health, Financial, Authentication, Personal communications, Location, Web history, User activity): **Leave Unchecked**

#### Website content justification:
```text
The extension accesses the HTML text and hyperlink content of the user's active tab to perform local readability parsing and convert the webpage into Markdown. All processing happens entirely locally on the user's machine. No website content is collected, stored remotely, or transmitted over the network.
```

### Certification Disclosures
Check the box to certify all three disclosures:
* [x] **I do not sell or transfer user data to third parties, outside of the approved use cases**
* [x] **I do not use or transfer user data for purposes that are unrelated to my item's single purpose**
* [x] **I do not use or transfer user data to determine creditworthiness or for lending purposes**
