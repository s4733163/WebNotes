document.addEventListener("DOMContentLoaded", () => {
    let element = document.querySelector(".message")

    // Get the preference that the user saved
    chrome.storage.sync.get(["stylePreference"], (result) => {
        if (result.stylePreference) {
            let preference = result.stylePreference
            const selected = document.querySelector("body")
            selected.style.fontFamily = preference
        } else {
            element.innerText = "No default font set. Select a font from the list."
            element.style.color = "#6b7280"
        }
    })

    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        if (!tab) {
            console.error("No active tab found")
            return
        }

        try {
            // First, ensure content script is injected
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }).catch(() => {
                // Content script might already be injected
            })

            const response = await chrome.tabs.sendMessage(tab.id, {
                type: "GET_SELECTION"
            })

            if (response?.text) {
                const created = document.createElement('p')
                created.innerText = response.text
                document.querySelector('body').appendChild(created)
            } else {
                element.innerText = "No text selected"
            }

        } catch (error) {
            console.error("Error:", error)
            element.innerText = "Error: " + error.message
        }
    })
})