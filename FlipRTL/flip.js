const States = {
  NOT_TOUCHED: 0,
  LTR: 1,
  RTL: 2
};

let tabStates = {};

function getNextState(currentState) {
  switch (currentState) {
    case States.NOT_TOUCHED:
      return States.RTL;
    case States.RTL:
      return States.LTR;
    case States.LTR:
      return States.NOT_TOUCHED;
    default:
      return States.NOT_TOUCHED;
  }
}

function updateIcon(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const state = tabStates[tabId] || States.NOT_TOUCHED;
    let iconPath;
    switch (state) {
      case States.RTL:
        iconPath = 'icon_rtl.png';
        break;
      case States.LTR:
        iconPath = 'icon_ltr.png';
        break;
      default:
        iconPath = 'icon.png';
    }
    chrome.action.setIcon({ path: iconPath, tabId: tabId });
  });
}

function toggleTextDirection(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(`Error getting tab: ${chrome.runtime.lastError.message}`);
      return;
    }

    // Check for chrome:// URLs
    if (tab.url.startsWith('chrome://')) {
      if (tab.url.startsWith('chrome://extensions')) {
        console.log('Cannot inject CSS into the extensions gallery.');
      } else {
        console.log('Cannot modify chrome:// pages');
      }
      return;
    }

    const currentState = tabStates[tabId] || States.NOT_TOUCHED;
    const newState = getNextState(currentState);
    tabStates[tabId] = newState;

    let cssCode;
    if (tab.url.includes('https://app.smartsuite.com')) {
      cssCode = getCSSForSmartSuite(newState);
    } else if (tab.url.includes('https://app.slack.com/')) {
      cssCode = getCSSForSlack(newState);
    } else {
      cssCode = getCSSForGeneral(newState);
    }

    if (newState === States.NOT_TOUCHED) {
      chrome.scripting.removeCSS({
        target: { tabId: tabId },
        css: cssCode
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error removing CSS: ${chrome.runtime.lastError.message}`);
        } else {
          updateIcon(tabId);
        }
      });
    } else {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        css: cssCode
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Error inserting CSS: ${chrome.runtime.lastError.message}`);
        } else {
          updateIcon(tabId);
        }
      });
    }
  });
}

function getCSSForSmartSuite(state) {
  switch (state) {
    case States.RTL:
      return '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell {direction: rtl;}';
    case States.LTR:
      return '.ProseMirror, .edit-record-field, .text-field-control, single-select-control, .grid-view-cell {direction: ltr;}';
    default:
      return '';
  }
}

function getCSSForSlack(state) {
  switch (state) {
    case States.RTL:
      return '.p-rich_text_block {direction: rtl;}';
    case States.LTR:
      return '.p-rich_text_block {direction: ltr;}';
    default:
      return '';
  }
}

function getCSSForGeneral(state) {
  switch (state) {
    case States.RTL:
      return 'html, h1, h2, h3, h4, h5, h6, div {direction: rtl; TEXT-ALIGN: RIGHT;}';
    case States.LTR:
      return 'html, h1, h2, h3, h4, h5, h6, div {direction: ltr;}';
    default:
      return '';
  }
}

chrome.action.onClicked.addListener((tab) => {
  toggleTextDirection(tab.id);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateIcon(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateIcon(tabId);
  }
});