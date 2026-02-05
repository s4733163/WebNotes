chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "GET_SELECTION") {
        // send the selected content when prompted for the request
        let content = window.getSelection().toString()
        sendResponse({ text: content })
    } 
    return true // Keep message channel open for async response
})