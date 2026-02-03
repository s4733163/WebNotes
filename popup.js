// Global state
let currentViewMode = "current"
let currentTabUrl = ""

// Function to export all notes (for current page or all pages based on mode)
function exportAllNotes(url, viewMode) {
    chrome.storage.local.get(['savedNotes'], (result) => {
        const savedNotes = result.savedNotes || []

        let notesToExport
        if (viewMode === "all") {
            // Export all notes from all pages
            notesToExport = savedNotes
        } else {
            // Export notes from current page only
            notesToExport = savedNotes.filter(note => note.url === url)
        }

        if (notesToExport.length === 0) {
            alert('No notes found to export')
            return
        }

        // Create data structure for export
        const notesData = notesToExport.map(note => ({
            selectedText: note.selectedText,
            userNotes: note.userNotes,
            timestamp: note.timestamp,
            url: note.url
        }))

        // Encode as JSON in URL parameter
        const params = new URLSearchParams({
            url: encodeURIComponent(viewMode === "all" ? "All Pages" : url),
            notesData: encodeURIComponent(JSON.stringify(notesData)),
            viewMode: viewMode
        })

        // Open the export page
        const exportUrl = chrome.runtime.getURL('export.html') + '?' + params.toString()
        chrome.tabs.create({ url: exportUrl })
    })
}

// Function to create notes UI
function createNotesUI(selectedText, noteUrl, text_value = "", container = null) {
    const element = document.querySelector(".message")

    // Create container if not provided (for URL grouping)
    const noteContainer = document.createElement('div')
    noteContainer.setAttribute('class', 'notes-container')

    // Append to provided container or body
    if (container) {
        container.appendChild(noteContainer)
    } else {
        document.querySelector('body').appendChild(noteContainer)
    }

    // Label for selected text
    const label = document.createElement('span')
    label.setAttribute('class', 'label')
    label.innerText = 'Selected Text'
    noteContainer.appendChild(label)

    // p element for selected text
    const created = document.createElement('p')
    created.innerText = selectedText
    created.setAttribute('class', 'notes-content')
    noteContainer.appendChild(created)

    // Label for notes
    const notesLabel = document.createElement('span')
    notesLabel.setAttribute('class', 'label')
    notesLabel.innerText = 'Your Notes'
    noteContainer.appendChild(notesLabel)

    // Textarea for user notes
    const created_textarea = document.createElement('textarea')
    created_textarea.setAttribute('class', 'user-content')
    created_textarea.setAttribute('rows', "4")
    created_textarea.setAttribute('placeholder', 'Add your notes here...')
    created_textarea.value = text_value
    noteContainer.appendChild(created_textarea)

    // Buttons container
    const buttonsDiv = document.createElement('div')
    buttonsDiv.setAttribute('class', 'buttons')
    noteContainer.appendChild(buttonsDiv)

    // Save button
    const saveBtn = document.createElement('button')
    saveBtn.setAttribute('id', 'saveBtn')
    saveBtn.innerText = 'Save Note'
    saveBtn.addEventListener('click', () => {
        const noteData = {
            selectedText: selectedText,
            userNotes: created_textarea.value,
            timestamp: new Date().toISOString(),
            url: noteUrl
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

    // Delete button
    const deleteBtn = document.createElement('button')
    deleteBtn.setAttribute('id', 'deleteBtn')
    deleteBtn.innerText = 'Delete'
    deleteBtn.addEventListener('click', () => {
        chrome.storage.local.get(['savedNotes'], (result) => {
            const savedNotes = result.savedNotes || []
            // Filter out the note that matches this container's text and url
            const updatedNotes = savedNotes.filter((note) => {
                return !(note.selectedText === selectedText && note.url === noteUrl)
            })
            chrome.storage.local.set({ savedNotes: updatedNotes }, () => {
                // Remove the note container from the DOM
                noteContainer.remove()

                // Check if we need to remove the URL group (in "all" mode)
                if (currentViewMode === "all" && container) {
                    const remainingNotes = container.querySelectorAll('.notes-container')
                    if (remainingNotes.length === 0) {
                        container.remove()
                    }
                }

                // Check if any notes remain
                const remainingContainers = document.querySelectorAll('.notes-container')
                if (remainingContainers.length === 0) {
                    element.style.display = 'block'
                    element.innerHTML = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p>No notes yet.</p></div>'
                    document.getElementById('exportAllBtn').style.display = 'none'
                }
            })
        })
    })
    buttonsDiv.appendChild(deleteBtn)

    // Update message
    element.style.display = 'none'
}

// Function to display notes grouped by URL (for "all" mode)
function displayNotesGroupedByUrl(savedNotes) {
    const element = document.querySelector(".message")

    // Group notes by URL
    const notesByUrl = {}
    savedNotes.forEach(note => {
        if (!notesByUrl[note.url]) {
            notesByUrl[note.url] = []
        }
        notesByUrl[note.url].push(note)
    })

    // Create UI for each URL group
    Object.keys(notesByUrl).forEach(url => {
        const urlGroup = document.createElement('div')
        urlGroup.setAttribute('class', 'url-group')
        document.querySelector('body').appendChild(urlGroup)

        // URL header
        const urlHeader = document.createElement('div')
        urlHeader.setAttribute('class', 'url-header')
        urlHeader.innerText = url
        urlGroup.appendChild(urlHeader)

        // Notes for this URL
        notesByUrl[url].forEach(note => {
            createNotesUI(note.selectedText, note.url, note.userNotes, urlGroup)
        })
    })

    element.style.display = 'none'
}

document.addEventListener("DOMContentLoaded", () => {
    const element = document.querySelector(".message")
    const viewModeLabel = document.getElementById("viewModeLabel")
    const changeViewModeBtn = document.getElementById("changeViewMode")
    const exportAllBtn = document.getElementById("exportAllBtn")

    // Handle "Change" link click - open options page
    changeViewModeBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage()
    })

    // Get font preference
    chrome.storage.sync.get(["stylePreference"], (result) => {
        if (result.stylePreference) {
            document.querySelector("body").style.fontFamily = result.stylePreference
        }
    })

    // Get view mode and then load notes
    chrome.storage.sync.get(["notesViewMode"], (syncResult) => {
        currentViewMode = syncResult.notesViewMode || "current"

        // Update the view mode label
        if (currentViewMode === "all") {
            viewModeLabel.innerText = "All pages"
            exportAllBtn.innerText = "📄 Export All Notes"
        } else {
            viewModeLabel.innerText = "This page"
            exportAllBtn.innerText = "📄 Export All Notes from This Page"
        }

        // Get active tab and load notes
        chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
            if (!tab) {
                console.error("No active tab found")
                return
            }

            currentTabUrl = tab.url

            try {
                // Inject content script
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }).catch(() => {
                    // Content script might already be injected
                })

                // Load saved notes based on view mode
                chrome.storage.local.get(['savedNotes'], (result) => {
                    const savedNotes = result.savedNotes || []

                    if (currentViewMode === "all") {
                        // Show all notes grouped by URL
                        if (savedNotes.length > 0) {
                            exportAllBtn.style.display = 'block'
                            exportAllBtn.addEventListener('click', () => {
                                exportAllNotes(currentTabUrl, "all")
                            })
                            displayNotesGroupedByUrl(savedNotes)
                        }
                    } else {
                        // Show notes for current page only
                        const urlNotes = savedNotes.filter(note => note.url === tab.url)

                        if (urlNotes.length > 0) {
                            exportAllBtn.style.display = 'block'
                            exportAllBtn.addEventListener('click', () => {
                                exportAllNotes(tab.url, "current")
                            })
                            urlNotes.forEach(note => {
                                createNotesUI(note.selectedText, note.url, note.userNotes)
                            })
                        }
                    }
                })

                // Get selected text from current page (works in both modes)
                const response = await chrome.tabs.sendMessage(tab.id, {
                    type: "GET_SELECTION"
                })

                if (response?.text) {
                    // Always show selected text at the top, regardless of mode
                    createNotesUI(response.text, tab.url, "")
                } else if (document.querySelectorAll('.notes-container').length === 0) {
                    // Show empty state only if no notes and no selection
                    element.innerHTML = '<div class="empty-state"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p>No text selected.<br>Highlight text on the page and open this popup.</p></div>'
                }

            } catch (error) {
                console.error("Error:", error)
                element.innerHTML = `<div class="empty-state"><p>Error: ${error.message}</p><p class="hint">Make sure you're on a regular webpage (not chrome:// or extension pages)</p></div>`
            }
        })
    })
})
