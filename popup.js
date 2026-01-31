// Function to create notes UI
function createNotesUI(selectedText, tabUrl, text_value = "") {
    const element = document.querySelector(".message")

    // div container that has the p element
    const container = document.createElement('div')
    container.setAttribute('class', 'notes-container')
    document.querySelector('body').appendChild(container)

    // Label for selected text
    const label = document.createElement('span')
    label.setAttribute('class', 'label')
    label.innerText = 'Selected Text'
    container.appendChild(label)

    // p element that is put in the div container
    const created = document.createElement('p')
    created.innerText = selectedText
    created.setAttribute('class', 'notes-content')
    container.appendChild(created)

    // Label for notes
    const notesLabel = document.createElement('span')
    notesLabel.setAttribute('class', 'label')
    notesLabel.innerText = 'Your Notes'
    container.appendChild(notesLabel)

    // Textarea for user notes
    const created_textarea = document.createElement('textarea')
    created_textarea.setAttribute('class', 'user-content')
    created_textarea.setAttribute('rows', "4")
    created_textarea.setAttribute('placeholder', 'Add your notes here...')
    created_textarea.value = text_value
    container.appendChild(created_textarea)


    // Buttons container
    const buttonsDiv = document.createElement('div')
    buttonsDiv.setAttribute('class', 'buttons')
    container.appendChild(buttonsDiv)

    // Save button
    const saveBtn = document.createElement('button')
    saveBtn.setAttribute('id', 'saveBtn')
    saveBtn.innerText = 'Save Note'
    saveBtn.addEventListener('click', () => {
        const noteData = {
            selectedText: selectedText,
            userNotes: created_textarea.value,
            timestamp: new Date().toISOString(),
            url: tabUrl
        }

        chrome.storage.local.get(['savedNotes'], (result) => {
            const savedNotes = result.savedNotes || []
            savedNotes.push(noteData)
            chrome.storage.local.set({ savedNotes }, () => {
                saveBtn.innerText = '✓ Saved!'
                setTimeout(() => {
                    saveBtn.innerText = 'Save Note'
                }, 2000)
            })
        })
    })
    buttonsDiv.appendChild(saveBtn)

    // Clear button
    const clearBtn = document.createElement('button')
    clearBtn.setAttribute('id', 'clearBtn')
    clearBtn.innerText = 'Clear'
    clearBtn.addEventListener('click', () => {
        created_textarea.value = ''
    })
    buttonsDiv.appendChild(clearBtn)

    // Update message
    element.style.display = 'none'
}

document.addEventListener("DOMContentLoaded", () => {
    let element = document.querySelector(".message")

    // Get the preference that the user saved
    chrome.storage.sync.get(["stylePreference"], (result) => {
        if (result.stylePreference) {
            let preference = result.stylePreference
            const selected = document.querySelector("body")
            selected.style.fontFamily = preference
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

            // Load previously saved notes for this URL
            chrome.storage.local.get(['savedNotes'], (result) => {
                const savedNotes = result.savedNotes || []  // FIX: Add || [] to prevent undefined
                if (savedNotes.length > 0) {
                    // get the notes corresponding to the page
                    const url_notes = savedNotes.filter((element) => {
                        return element.url === tab.url
                    })

                    url_notes.forEach((element) => {
                        createNotesUI(element.selectedText, element.url, element.userNotes)
                    })
                }
            })
            
            const response = await chrome.tabs.sendMessage(tab.id, {
                type: "GET_SELECTION"
            })

            if (response?.text) {
                createNotesUI(response.text, tab.url, "")
            } else {
                element.innerHTML = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p>No text selected.<br>Highlight text on the page and open this popup.</p></div>'
            }

        } catch (error) {
            console.error("Error:", error)
            element.innerHTML = `<div class="empty-state"><p>Error: ${error.message}</p><p class="hint">Make sure you're on a regular webpage (not chrome:// or extension pages)</p></div>`
        }
    })
})