/**
 * Pagemark Message Constants
 *
 * Defines namespaced action strings for message passing between
 * background worker, content script, and side panel/options page.
 */
export const PM_MESSAGES = {
  CONVERT: "pm:convert-to-markdown",
  CLOSE: "pm:close",
  OPEN_MARKDOWN_TAB: "pm:open-markdown-tab",
  PAGE_CONVERTED: "pm:page-converted",
  COPY_TO_CLIPBOARD: "pm:copy-to-clipboard",
  TOGGLE_SIDEPANEL: "pm:toggle-sidepanel"
} as const

export type PMMessageAction = typeof PM_MESSAGES[keyof typeof PM_MESSAGES]
