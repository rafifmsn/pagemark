# Architecture Decision: Retaining Broad Host Permissions over activeTab

This document records the decision to stick with broad host permissions (`matches: ["<all_urls>"]` / `<all_urls>` host permissions) rather than transitioning to the Manifest V3 `activeTab` permission model.

## Context
We investigated migrating the extension to the more restrictive `activeTab` permission model. Under this model, the extension would not have access to any webpage by default, and would programmatically inject the content parser script (`content.ts`) only when the user explicitly interacted with the extension (via the hotkey `Ctrl+Shift+K` or the context menu).

## Findings & Technical Limitations

### 1. Jarring Side Panel UX
Because the Pagemark side panel is a persistent workspace (it remains open as the user navigates across tabs), it is designed to dynamically update and display the markdown of the active tab.
However, under `activeTab`, switching tabs or opening a new page **does not automatically grant host permission** to the extension for that new tab. 
* As a result, the side panel cannot auto-parse page contents upon navigation.
* The user is forced to manually re-activate the extension on every new tab using a keyboard shortcut or the context menu to allow parsing. This breaks the seamless "browse and auto-clip" flow.

### 2. Side Panel Clicks Do Not Grant Permission
Chrome's security sandbox explicitly prevents user gestures inside a side panel (like clicking a button in the extension UI) from granting the `activeTab` permission for the current tab. Permissions can only be granted by actions on the browser chrome itself (hotkeys, context menus, or the extension action icon).

### 3. Codebase Bloat & Error Suppression
To handle on-demand injection, we had to introduce a ping/pong handshake, programmatic script path resolution, and complex `chrome.runtime.lastError` callbacks to prevent unchecked message port closures in Chrome. This added significant clutter and complexity to both `background.ts` and `tabs/markdown.tsx`.

## Final Decision
We decided to **retain broad host permissions** (`<all_urls>` matches). 
Although broad permissions prompt a longer initial review cycle (1-3 weeks) in the Chrome Web Store:
1. It is the only way to support automatic, zero-click parsing when switching tabs.
2. It keeps the codebase simple, declarative, and maintainable.
3. Since Pagemark runs **100% locally** and performs no remote tracking, data harvesting, or network calls, our data disclosures and privacy policies are fully compliant and ready to pass the security review.
