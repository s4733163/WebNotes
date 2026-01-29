const applyStyle = (style) => {
    const fontMap = {
        'arial': 'Arial, Helvetica, sans-serif',
        'times': '"Times New Roman", Times, serif',
        'georgia': 'Georgia, serif',
        'consolas': 'Consolas, "Courier New", monospace',
        'calibri': 'Calibri, "Gill Sans", sans-serif',
        'monotype': '"Monotype Sorts", "Lucida Console", monospace',
        'verdana': 'Verdana, Geneva, sans-serif'
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