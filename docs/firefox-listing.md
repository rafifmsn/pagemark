## 1. Describe Add-on

### Name

Pagemark

### Summary

Convert any webpage into clean, LLM-ready Markdown with one click. Strip the clutter, preserve the layout, and copy or download instantly.

### Description
```markdown
Turn any website into clean, structured Markdown context with a single click.

Pagemark instantly strips away tracking banners, ads, navigation menus, and cookie popups, leaving you with optimized Markdown that is perfectly formatted for Large Language Models (LLMs). Built specifically for developers, AI engineers, researchers, and writers, it serves as a lightweight bridge between the web and tools like Claude, ChatGPT, DeepSeek, and Gemini—helping you feed clean documentation into prompts without wasting API token limits.

**Key Features**

* **Local Readability Parser:** Automatically isolates the main body text, articles, and code blocks. Execution happens entirely in your browser with zero server wait times or tracking.
* **Native Sidebar Workspace:** The extension opens directly in the Firefox sidebar (Alt + K), allowing you to view, edit, and preview the Markdown output side-by-side with the live source page.
* **Editor & Live Token Counter:** Switch seamlessly between a raw Markdown editor and a fully rendered visual preview. Built-in character and token counters help you monitor size limits before pasting into AI interfaces.
* **Persistent Customization:** Tailor the extraction to your exact needs. Toggle images and hyperlinks on or off, automatically inject metadata headers (title, source URL, timestamps), or generate a hierarchical outline map of the page headers.

**Optimized Export Utilities**

* **Copy MD:** Copies raw, standardized Markdown directly to your clipboard.
* **Copy as Prompt:** Automatically wraps the text in a clean container to prevent nested triple-backticks from breaking LLM parsers.
* **Download File:** Saves the structured output natively as a standalone .md file.

**Privacy & Performance First**

* **100% Local Processing:** Your data never leaves your machine. No external servers, no logging, and total security for enterprise intranets or local development environments.
* **Works Offline:** Because the parser runs locally, it works completely offline and requires zero external network dependencies.
* **No Paywalls or Subscriptions:** Full functionality with no rate limits, daily credits, or premium tiers.

**Usage Shortcuts**

Open/Close Sidebar: Alt + K (Can be customized in Firefox Add-on settings)
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
