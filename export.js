// Get data from URL parameters
const params = new URLSearchParams(window.location.search);
const sourceUrl = params.get('url') || '';
const notesDataParam = params.get('notesData');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Populate the metadata
    const sourceUrlElement = document.getElementById('source-url');
    const exportDateElement = document.getElementById('export-date');
    
    if (sourceUrlElement) {
        sourceUrlElement.textContent = decodeURIComponent(sourceUrl);
    }
    if (exportDateElement) {
        exportDateElement.textContent = new Date().toLocaleString();
    }

    // Check if we have multiple notes data
    if (notesDataParam) {
        // Multiple notes export
        const notesData = JSON.parse(decodeURIComponent(notesDataParam));
        
        // Hide the default single note sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Create sections for each note
        const container = document.querySelector('body');
        notesData.forEach((note, index) => {
            const noteSection = document.createElement('div');
            noteSection.className = 'note-group';
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
            `;
            container.appendChild(noteSection);
        });
    } else {
        // Single note export (backward compatibility)
        const selectedText = params.get('selectedText') || '';
        const userNotes = params.get('userNotes') || '';
        
        const selectedTextElement = document.getElementById('selected-text');
        if (selectedTextElement) {
            selectedTextElement.textContent = decodeURIComponent(selectedText);
        }
        
        const notesElement = document.getElementById('user-notes');
        if (notesElement) {
            if (userNotes) {
                notesElement.textContent = decodeURIComponent(userNotes);
            } else {
                notesElement.innerHTML = '<span class="empty-note">(No notes added)</span>';
            }
        }
    }

    // Add click event to print button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Optional: Auto-trigger print dialog after a short delay
    // Uncomment the line below if you want automatic print dialog
    // setTimeout(() => window.print(), 500);
});

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}