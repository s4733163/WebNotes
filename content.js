chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "GET_SELECTION") {
        let content = window.getSelection().toString()
        sendResponse({ text: content })
    } 
    return true // Keep message channel open for async response
})