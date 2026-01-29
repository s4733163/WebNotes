document.addEventListener("DOMContentLoaded", () => {
    let element = document.querySelector(".message")

    // Get the preference that the user saved
    chrome.storage.sync.get(["stylePreference"], (result) => {
        if (result.stylePreference) {
            let preference = result.stylePreference
            try {
                // apply the font to popup.html
                const selected = document.querySelector("body")
                selected.style.fontFamily = preference
            } catch (error) {
                // log the error message
                console.log("Content script not ready, injecting...")
            }
        } else {
            element.innerText = "No default font set. Select a font from the list."
            element.style.color = "#6b7280"
        }
    })
})