document.addEventListener("DOMContentLoaded", () => {
    const fontStatus = document.getElementById("chosen-style")
    const successMsg = document.getElementById("successMsg")
    const radioOptions = document.querySelectorAll(".radio-option")

    // Load saved settings
    chrome.storage.sync.get(["stylePreference", "notesViewMode"], (result) => {
        // Load font preference
        if (result.stylePreference) {
            fontStatus.innerText = "Current: " + result.stylePreference
            document.getElementById("fontStyle").value = result.stylePreference
        }

        // Load view mode preference 
        // default mode is current
        const viewMode = result.notesViewMode || "current"
        document.querySelector(`input[name="viewMode"][value="${viewMode}"]`).checked = true
        updateRadioStyles()
    })

    // add event listener for each radio button
    // Update radio button styles when clicked
    radioOptions.forEach(option => {
        option.addEventListener("click", () => {
            updateRadioStyles()
        })
    })

    // update the radio style buttons clicked
    function updateRadioStyles() {
        radioOptions.forEach(option => {
            const radio = option.querySelector("input[type='radio']")
            if (radio.checked) {
                option.classList.add("selected")
            } else {
                option.classList.remove("selected")
            }
        })
    }

    // Save settings
    document.getElementById("saveBtn").addEventListener("click", () => {
        const fontPreference = document.getElementById("fontStyle").value
        const viewMode = document.querySelector("input[name='viewMode']:checked").value

        // set the viewmode
        const settings = { notesViewMode: viewMode }

        // Only save font if selected
        if (fontPreference) {
            settings.stylePreference = fontPreference
        }

        // set the settings, display message and close
        chrome.storage.sync.set(settings, () => {
            successMsg.style.display = "block"

            if (fontPreference) {
                fontStatus.innerText = "Current: " + fontPreference
            }

            // Hide success message after 2 seconds
            setTimeout(() => {
                successMsg.style.display = "none"
                // For cases where window.close() doesn't work (like when opened programmatically)
                chrome.tabs.getCurrent((tab) => {
                    if (tab) {
                        chrome.tabs.remove(tab.id);
                    }
                });

            }, 2000)
        })
    })
})
