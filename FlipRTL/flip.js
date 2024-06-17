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
        //grid-view-row__cell 
        : '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell {direction: rtl;}';
    } else {
      // Apply the CSS rule for html
      cssCode = isRTL ? 'html { direction: ltr; }' : 'html { direction: rtl; }';
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