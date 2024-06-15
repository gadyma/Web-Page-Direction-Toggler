let isRTL = false;

function toggleTextDirection() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error('No active tab found.');
      alert('No active tab found.');
      return;
    }

    const activeTab = tabs[0];
    
    const cssCode = isRTL ? 'html { direction: ltr; }' : 'html { direction: rtl; }';
    
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
