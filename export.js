// Get data from URL parameters
const params = new URLSearchParams(window.location.search)
const sourceUrl = params.get('url') || ''
const notesDataParam = params.get('notesData')
const viewMode = params.get('viewMode') || 'current'

// Helper function to escape HTML (prevents XSS)
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const sourceUrlElement = document.getElementById('source-url')
    const exportDateElement = document.getElementById('export-date')

    // Populate metadata
    if (sourceUrlElement) {
        sourceUrlElement.textContent = decodeURIComponent(sourceUrl)
    }
    if (exportDateElement) {
        exportDateElement.textContent = new Date().toLocaleString()
    }

    // Check if we have notes data
    if (notesDataParam) {
        const notesData = JSON.parse(decodeURIComponent(notesDataParam))

        // Hide the default single note sections
        const defaultSections = document.querySelectorAll('.section')
        defaultSections.forEach(section => {
            section.style.display = 'none'
        })

        const container = document.querySelector('body')

        if (viewMode === 'all') {
            // Group notes by URL for "all" mode export
            const notesByUrl = {}
            notesData.forEach(note => {
                if (!notesByUrl[note.url]) {
                    notesByUrl[note.url] = []
                }
                notesByUrl[note.url].push(note)
            })

            // Create sections for each URL group
            let globalIndex = 1
            Object.keys(notesByUrl).forEach((url, urlIndex) => {
                // URL group container
                const urlGroup = document.createElement('div')
                urlGroup.className = 'url-group-export'
                urlGroup.innerHTML = `
                    <div class="url-header-export">${escapeHtml(url)}</div>
                `
                container.appendChild(urlGroup)

                // Notes for this URL
                notesByUrl[url].forEach((note) => {
                    const noteSection = document.createElement('div')
                    noteSection.className = 'note-group'
                    noteSection.innerHTML = `
                        <h2 class="note-number">Note ${globalIndex}</h2>
                        <div class="section" style="display: block;">
                            <h3>Selected Text</h3>
                            <div class="content-box selected-text">${escapeHtml(note.selectedText)}</div>
                        </div>
                        <div class="section" style="display: block;">
                            <h3>Your Notes</h3>
                            <div class="content-box user-notes">${note.userNotes ? escapeHtml(note.userNotes) : '<span class="empty-note">(No notes added)</span>'}</div>
                        </div>
                    `
                    urlGroup.appendChild(noteSection)
                    globalIndex++
                })

                // Add separator between URL groups (except last one)
                if (urlIndex < Object.keys(notesByUrl).length - 1) {
                    const separator = document.createElement('hr')
                    separator.className = 'url-separator'
                    container.appendChild(separator)
                }
            })
        } else {
            // Single page export (current mode)
            notesData.forEach((note, index) => {
                const noteSection = document.createElement('div')
                noteSection.className = 'note-group'
                noteSection.innerHTML = `
                    <h2 class="note-number">Note ${index + 1}</h2>
                    <div class="section" style="display: block;">
                        <h3>Selected Text</h3>
                        <div class="content-box selected-text">${escapeHtml(note.selectedText)}</div>
                    </div>
                    <div class="section" style="display: block;">
                        <h3>Your Notes</h3>
                        <div class="content-box user-notes">${note.userNotes ? escapeHtml(note.userNotes) : '<span class="empty-note">(No notes added)</span>'}</div>
                    </div>
                    ${index < notesData.length - 1 ? '<hr class="note-separator">' : ''}
                `
                container.appendChild(noteSection)
            })
        }
    } else {
        // Single note export (backward compatibility)
        const selectedText = params.get('selectedText') || ''
        const userNotes = params.get('userNotes') || ''

        const selectedTextElement = document.getElementById('selected-text')
        if (selectedTextElement) {
            selectedTextElement.textContent = decodeURIComponent(selectedText)
        }

        const notesElement = document.getElementById('user-notes')
        if (notesElement) {
            if (userNotes) {
                notesElement.textContent = decodeURIComponent(userNotes)
            } else {
                notesElement.innerHTML = '<span class="empty-note">(No notes added)</span>'
            }
        }
    }

    // Add click event to print button
    const printBtn = document.getElementById('printBtn')
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print()
        })
    }
})
