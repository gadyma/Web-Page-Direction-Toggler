let isRTL = false;

function toggleTextDirection() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error('No active tab found.');
      alert('No active tab found.');
      return;
    }

    const activeTab = tabs[0];
    let cssCode;

    // Check if the current tab is on the https://app.smartsuite.com site
    if (activeTab.url.includes('https://app.smartsuite.com')) {
      // Apply the CSS rule for .ProseMirror and .edit-record-field
      cssCode = isRTL
        ? '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell {direction: ltr;}'
        : '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell {direction: rtl;}';
    } else if (activeTab.url.includes('https://app.slack.com/')) {
        // Apply the CSS rule for .p-rich_text_block
        cssCode = isRTL
        ? '.p-rich_text_block {direction: ltr;}'
        : '.p-rich_text_block {direction: rtl;}';
    } else {
      // Apply the CSS rule for html
      cssCode = isRTL 
        ? 'html, h1, h2, h3, h4, h5, h6, div, p {direction: ltr;}' 
        : 'html, h1, h2, h3, h4, h5, h6, div, p {direction: rtl;}';
    }

    chrome.scripting.insertCSS({
      target: { tabId: activeTab.id },
      css: cssCode
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error inserting CSS: ${chrome.runtime.lastError.message}`);
        alert(`Error inserting CSS: ${chrome.runtime.lastError.message}`);
      } else {
        isRTL = !isRTL;
      }
    });
  });
}

chrome.action.onClicked.addListener(toggleTextDirection);

