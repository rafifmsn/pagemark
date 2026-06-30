export {}

// Set sidepanel behavior on install/startup
if (typeof chrome !== "undefined" && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting panel behavior:", error))
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-to-markdown",
    title: "Pagemark this page",
    contexts: ["page"]
  })
})

let sidePanelPort: chrome.runtime.Port | null = null

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "pagemark-sidepanel") {
    sidePanelPort = port
    port.onDisconnect.addListener(() => {
      sidePanelPort = null
    })
  }
})

const handleConvertToMarkdown = (tab: chrome.tabs.Tab, toggle = false) => {
  if (!tab?.id) return

  const sendMessage = () => {
    chrome.tabs
      .sendMessage(tab.id!, { action: "convert-to-markdown" })
      .catch((err) =>
        console.log("Content script not ready or an extension page.", err)
      )
  }

  if (toggle && sidePanelPort) {
    sidePanelPort.postMessage({ action: "close" })
    return
  }

  // Open side panel programmatically if supported
  if (typeof chrome !== "undefined" && chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel
      .open({ tabId: tab.id })
      .then(() => {
        sendMessage()
      })
      .catch((err) => {
        console.warn("Failed to open sidepanel, sending message directly:", err)
        sendMessage()
      })
  } else {
    sendMessage()
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-to-markdown" && tab) {
    handleConvertToMarkdown(tab, false)
  }
})

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "convert-to-markdown" && tab) {
    handleConvertToMarkdown(tab, true)
  }
})

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open-markdown-tab") {
    // Open the new tab page
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/markdown.html") })
  }
})
