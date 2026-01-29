document.addEventListener("DOMContentLoaded", () => {
    let element = document.querySelector(".message")

    // Get the preference that the user saved
    chrome.storage.sync.get(["stylePreference"], (result) => {
        if (result.stylePreference) {
            let preference = result.stylePreference

            // Query the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
                // Check if we can access this tab
                if (tab.url.startsWith('chrome://') ||
                    tab.url.startsWith('chrome-extension://') ||
                    tab.url.startsWith('about:')) {
                    element.innerText = "🔒 Chrome doesn't allow extensions to modify system pages"
                    element.style.color = "#6b7280"
                    element.style.fontSize = "11px"

                    // Disable buttons on protected pages
                    return
                }

                try {
                    // Try to send message to content script
                    const response = await chrome.tabs.sendMessage(tab.id, {
                        type: "APPLY_FONT",
                        fontStyle: preference
                    })

                    if (response?.text) {
                        element.innerText = "✓ Default font applied. Select another font if you wish."
                        element.style.color = "#059669"
                    }
                } catch (error) {
                    // Content script not ready - inject it and try again
                    console.log("Content script not ready, injecting...")

                    try {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        })

                        // Wait a bit for the script to initialize
                        setTimeout(async () => {
                            try {
                                await chrome.tabs.sendMessage(tab.id, {
                                    type: "APPLY_FONT",
                                    fontStyle: preference
                                })
                                element.innerText = "✓ Default font applied. Select another font if you wish."
                                element.style.color = "#059669"
                            } catch (retryError) {
                                element.innerText = "⚠️ Could not apply font. Please select a font and click Apply."
                                element.style.color = "#f59e0b"
                            }
                        }, 100)
                    } catch (injectError) {
                        element.innerText = "⚠️ Cannot access this page. Try refreshing or use Apply button."
                        element.style.color = "#f59e0b"
                    }
                }
            })
        } else {
            element.innerText = "No default font set. Select a font from the list."
            element.style.color = "#6b7280"
        }
    })
})