
// checking if the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    // check if the style preference is set
    chrome.storage.sync.get(["stylePreference"], (result) => {
        // e.g. resullt = {stylePreference: Sans-serif}
        if (!result.stylePreference) {
            chrome.tabs.create({
                url: "options.html",
            })
        }
    })

})