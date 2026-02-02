# Quick Notes - Chrome Extension

A lightweight Chrome extension for capturing selected text from any webpage, adding personal notes, and exporting them as PDF.

## Features

- **Text Selection Capture** - Automatically captures highlighted text from any webpage
- **Note Creation** - Add custom notes and comments to captured text
- **Multiple Notes Per Page** - Save multiple notes for the same webpage
- **Persistent Storage** - Notes are saved locally and reload when you revisit a page
- **PDF Export** - Export individual notes or all notes from a page as formatted PDF
- **Font Customization** - Choose your preferred font for the extension UI
- **Privacy-Focused** - All data stays local on your device

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the WebNotes folder
6. The extension icon will appear in your toolbar

On first install, you'll be prompted to select your preferred font.

## Usage

### Capturing Notes

1. Navigate to any webpage
2. Select/highlight the text you want to capture
3. Click the Quick Notes extension icon in your toolbar
4. Your selected text appears in the popup
5. Add your notes in the textarea below
6. Click **Save Note** to store it

### Managing Notes

| Button | Action |
|--------|--------|
| **Save Note** | Saves the current note to local storage |
| **Clear** | Clears the note text (unsaved changes lost) |
| **Delete** | Removes the entire note entry |

Previously saved notes automatically load when you reopen the popup on the same page.

### Exporting Notes

1. Click **Export All Notes from This Page** button in the popup
2. A new tab opens with your formatted notes
3. Click **Print / Save as PDF**
4. In the print dialog, select "Save as PDF" as the destination
5. Your notes are saved with source URL and timestamp

## Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Save notes and font preferences locally |
| `activeTab` | Access current page URL and selected text |
| `scripting` | Inject content script for text selection |
| `<all_urls>` | Enable extension on all websites |

All data remains on your device and is never transmitted externally.

## File Structure

```
WebNotes/
├── manifest.json    # Extension configuration
├── popup.html       # Main popup interface
├── popup.js         # Core functionality and note management
├── content.js       # Page script for text selection capture
├── background.js    # Service worker for initialization
├── options.html     # Settings page
├── options.js       # Font preference management
├── export.html      # Print-friendly export template
├── export.js        # Export rendering logic
├── style.css        # Popup styling
└── WebNotes.png     # Extension icon
```

## License

MIT License
