document.addEventListener("DOMContentLoaded", () => {
    let element = document.getElementById("chosen-style")

    chrome.storage.sync.get(["stylePreference"], (result) => {
        // e.g. resullt = {stylePreference: Sans-serif}
        if (result.stylePreference) {
            // set the style if exists
            element.innerText = result.stylePreference
        }
    })

    document.getElementById("saveBtn").addEventListener("click", () => {
        const preference = document.getElementById("fontStyle").value

        if (preference) {
            chrome.storage.sync.set({ stylePreference: preference }, () => {
                const element = document.querySelector(".success")
                element.style.display = "block";

                // Close the tab after a short delay to show the success message
                setTimeout(() => {
                    window.close();
                    // For cases where window.close() doesn't work (like when opened programmatically)
                    chrome.tabs.getCurrent((tab) => {
                        if (tab) {
                            chrome.tabs.remove(tab.id);
                        }
                    });
                }, 1000);
            })
        }
    })
})