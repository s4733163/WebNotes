const applyStyle = (style) => {
    const fontMap = {
        'sans': 'Arial, Helvetica, sans-serif',
        'serif': 'Georgia, "Times New Roman", serif',
        'mono': '"Courier New", Courier, monospace',
        'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'dyslexic': 'OpenDyslexic, "Comic Sans MS", sans-serif'
    }
    
    let selected = document.querySelector("body")
    if (selected) {
        selected.style.fontFamily = fontMap[style] || style
        return true
    }
    return false
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "APPLY_FONT") {
        const success = applyStyle(req.fontStyle)
        sendResponse({ text: success ? "Font style applied" : "Failed to apply" })
    }
    return true // Keep message channel open for async response
})