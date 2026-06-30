# Contributing to Pagemark

Thank you for your interest in contributing to Pagemark! Below are guidelines and instructions to help you get started with local development.

## Project Architecture
Pagemark is built on the **Plasmo** extension framework, using React, TypeScript, and TailwindCSS.

* **`content.ts`**: The content script that parses webpage HTML into clean content using `defuddle-js` and `turndown`. It is configured declaratively to run on all URLs (`<all_urls>`) to enable automatic, zero-click parsing on tab switch.
* **`background.ts`**: Handles the extension's lifecycle, registers keyboard shortcuts, context menus, and controls the side panel toggle states.
* **`tabs/markdown.tsx`**: The main side panel UI workspace, containing the raw Markdown editor, preview components, layout preferences, and utility exporters.

## Local Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (used as the primary package manager)

### Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/rafifmsn/pagemark.git
cd pagemark
npm install
```

### Development Server
Run the development server. This will compile the code and watch for changes:
```bash
npm run dev
```
1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right).
4. Click **Load unpacked** and select the `build/chrome-mv3-dev` directory created by Plasmo.

### Production Build
To generate a production-ready zip package for the Chrome Web Store:
```bash
npm run build:chrome
```
The output zip will be placed in the `build/` directory.

## Contribution Guidelines

1. **Keep it 100% Local**: Pagemark is a strictly privacy-first tool. Do not introduce any third-party analytics, remote tracking scripts, telemetry, or remote API calls. All parsing must remain local.
2. **Broad Permissions Decided**: We explicitly choose broad host permissions (`matches: ["<all_urls>"]`) over programmatic injection to ensure the side panel workspace auto-updates seamlessly as the user navigates across tabs. Refer to [docs/activeTab-decision.md](./docs/activeTab-decision.md) for context.
3. **Clean Build**: Ensure your changes do not introduce any TypeScript compilation or linting errors. Always verify with `npm run build` before pushing.
