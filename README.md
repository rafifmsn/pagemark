# Pagemark

![GitHub Release](https://img.shields.io/github/v/release/rafifmsn/pagemark)
![Plasmo](https://img.shields.io/badge/built__with-Plasmo-blueviolet)
![License](https://img.shields.io/github/license/rafifmsn/pagemark)

[![Get it from the Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Download-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/dpnfgohhgehakmknbnpgojaalglhaeej)
[![Get it from Firefox Add-ons](https://img.shields.io/badge/Firefox_Add--ons-Download-FF7100?style=for-the-badge&logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/firefox/addon/pagemark)


![pagemark-1](./pagemark-thumb-1.jpg)

Pagemark is a modern web extension designed for researchers, developers, and AI engineers. It extracts the core content of any webpage and converts it into structured, optimized Markdown, perfect for feeding directly into LLMs (like GPT, Claude, Gemini) or storing in your personal knowledge base.

## How It Works

1. **Navigate** to any webpage you want to clip.
2. **Trigger**:
   - Right-click anywhere and select **"Pagemark this page"**, OR
   - Click the extension icon in your browser toolbar, OR
   - Press the hotkey **`Alt + K`** (or **`Option + K`** on macOS, configurable in `chrome://extensions/shortcuts` or `about:addons` on Firefox).
3. **Clip & Copy**: The side panel opens instantly, showing the live markdown, which is automatically copied to your clipboard (optional) or ready to download.

## Features

- **Smart Content Extraction**: Utilizes industry-standard readability extraction to isolate the main body content, ignoring distracting ads, popups, and nav bars.
- **Side Panel Workspace**: Runs inside a native browser Side Panel, letting you view, edit, and preview markdown side-by-side with your active webpage.
- **Live Markdown Preview**: Split tab view containing a raw **Markdown Editor** (with text area & char count) and a rendered **Live Preview** (with custom scrollable tables).
- **Persistent Preferences**: All toggles and preferences are stored in the browser's local storage and auto-save instantly:
  - **Include Images**: Toggle to keep/strip image tags (default: `false`).
  - **Include Links**: Toggle to preserve hyperlinks or keep just the anchor text (default: `true`).
  - **Include Info**: Adds page metadata (Title and timezone-aware Created timestamp).
  - **Include Source**: Appends the source page URL.
  - **Include Map**: Generates an hierarchical text tree outline of the document structure.
- **Export Options**:
  - **Copy MD**: Instantly copy raw markdown.
  - **Prompt**: Copies raw markdown with a code block wrapper.
  - **Download**: Saves as a `.md` file.

## Installation & Setup

Pagemark is built on the [Plasmo](https://docs.plasmo.com/) extension framework with React and Tailwind CSS.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A package manager: `npm` (default), `pnpm`, or `yarn`

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/rafifmsn/pagemark.git
cd pagemark

# Install dependencies
npm install
```

### 2. Run in Development Mode

```bash
# For Chrome / Chromium
npm run dev

# For Firefox
npm run dev:firefox
```

This runs the Plasmo dev server and generates an active development build folder at `build/chrome-mv3-dev` (or `build/firefox-mv3-dev`).

### 3. Load the Extension in Your Browser

#### Chrome / Chromium (Chrome, Brave, Edge, Opera)
1. Navigate to **`chrome://extensions/`** (or select Extensions -> Manage Extensions).
2. Toggle the **"Developer mode"** switch in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left.
4. Select the **`build/chrome-mv3-dev`** folder in this project directory.

#### Firefox
1. Navigate to **`about:debugging`** in your URL bar.
2. Click **"This Firefox"** in the left sidebar.
3. Click the **"Load Temporary Add-on..."** button.
4. Select the **`manifest.json`** inside the **`build/firefox-mv3-dev`** folder.

The Pagemark sidebar icon will now appear in your toolbar!

![pagemark-2](./pagemark-thumb-2.jpg)

## Building for Production

To compile a minified, production-ready build:

```bash
# Build for all targets (Chrome & Firefox)
npm run build:all

# Or build individually
npm run build:chrome
npm run build:firefox
```

The production output will be generated inside the **`build/chrome-mv3-prod`** and **`build/firefox-mv3-prod`** folders, ready to be packaged or loaded unpacked for daily use.

## Tech Stack

- **Framework**: [Plasmo](https://plasmo.com/) (MV3)
- **UI & Layout**: [React](https://reactjs.org/) & [Tailwind CSS](https://tailwindcss.com/)
- **Parsing Engine**: `@mozilla/readability` & `Turndown` (with GFM tables plugin)

## License & Attribution

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

This project is a continuation of [Adem Kouki's MD-This-Page](https://github.com/Ademking/MD-This-Page), which provided the foundational engine setup for readability extraction, turndown conversion, and core layout functionalities.

### Pagemark Enhancements
- Migrated the extension structure to run within a native Side Panel/Sidebar.
- Designed a side-by-side workspace that co-exists directly with your active webpage.
- Refactored parsing and rendering logic for cleaner, more accurate Markdown outputs.
- Enabled clipboard writing in Firefox sidebar contexts using a cross-context message delegation system.
- Added defensive guards for internal browser/system URLs, and more.
